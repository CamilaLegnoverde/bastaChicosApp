/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Implementación de IVaquiRepository sobre Supabase.
 * La identidad de sesión (qué perfil soy) se guarda en localStorage
 * bajo 'vaqui_user_id'; los datos viven en la base.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { UserProfile, Friend, Hangout, Expense, Settlement } from '../types';
import {
  IVaquiRepository,
  ProfileRow,
  HangoutWithRelationsRow,
  profileRowToUser,
  profileRowToFriend,
  userToProfileRow,
  hangoutToRow,
  expenseToRow,
  hangoutWithRelationsToDomain,
  toFriendshipRow,
  settlementToRow,
} from './contracts';
import { dataUrlToParts, base64ToByteaHex, byteaToDataUrl } from '../utils/image';

const SESSION_KEY = 'vaqui_user_id';

const HANGOUT_SELECT = `
  id, emoji, title, date, description, status, created_by,
  hangout_members ( profile_id ),
  expenses ( id, hangout_id, emoji, description, amount, paid_by, date,
    expense_splits ( profile_id )
  ),
  settlements ( id, hangout_id, from_id, to_id, amount )
`;

export class SupabaseRepository implements IVaquiRepository {
  constructor(private db: SupabaseClient) {}

  async getCurrentUser(): Promise<UserProfile | null> {
    const userId = localStorage.getItem(SESSION_KEY);
    if (!userId) return null;

    const { data, error } = await this.db
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle<ProfileRow>();

    if (error) throw error;
    return data ? profileRowToUser(data) : null;
  }

  async findUserByName(name: string): Promise<UserProfile | null> {
    // ilike sin comodines = igualdad case-insensitive
    const { data, error } = await this.db
      .from('profiles')
      .select('*')
      .ilike('name', name.trim())
      .limit(1)
      .maybeSingle<ProfileRow>();

    if (error) throw error;
    return data ? profileRowToUser(data) : null;
  }

  async findUserByAlias(alias: string): Promise<UserProfile | null> {
    const trimmed = alias.trim();
    if (!trimmed) return null;

    const { data, error } = await this.db
      .from('profiles')
      .select('*')
      .ilike('alias_mp', trimmed)
      .limit(1)
      .maybeSingle<ProfileRow>();

    if (error) throw error;
    return data ? profileRowToUser(data) : null;
  }

  async findProfileByCode(code: string): Promise<Friend | null> {
    const { data, error } = await this.db
      .from('profiles')
      .select('*')
      .eq('code', code.trim().toUpperCase())
      .maybeSingle<ProfileRow>();

    if (error) throw error;
    return data ? profileRowToFriend(data) : null;
  }

  async saveUser(user: UserProfile): Promise<void> {
    const { error } = await this.db.from('profiles').upsert(userToProfileRow(user));
    if (error) throw error;
    localStorage.setItem(SESSION_KEY, user.id);
  }

  async getFriends(userId: string): Promise<Friend[]> {
    // La amistad es mutua y se guarda una sola vez (par normalizado),
    // así que el usuario puede estar en cualquiera de las dos columnas.
    const { data: pairs, error } = await this.db
      .from('friendships')
      .select('user_a, user_b')
      .or(`user_a.eq.${userId},user_b.eq.${userId}`);
    if (error) throw error;

    const otherIds = (pairs ?? []).map((p) =>
      p.user_a === userId ? p.user_b : p.user_a
    );
    if (otherIds.length === 0) return [];

    const { data: profiles, error: pErr } = await this.db
      .from('profiles')
      .select('*')
      .in('id', otherIds);
    if (pErr) throw pErr;

    return ((profiles ?? []) as ProfileRow[]).map(profileRowToFriend);
  }

  async addFriend(userId: string, friend: Friend): Promise<void> {
    // Un único registro simétrico: ambos quedan agregados automáticamente
    const { error } = await this.db
      .from('friendships')
      .upsert(toFriendshipRow(userId, friend.id));
    if (error) throw error;
  }

  async getHangouts(userId: string): Promise<Hangout[]> {
    // Juntadas donde el usuario es integrante
    const { data: memberships, error: mErr } = await this.db
      .from('hangout_members')
      .select('hangout_id')
      .eq('profile_id', userId);
    if (mErr) throw mErr;

    const ids = (memberships ?? []).map((m) => m.hangout_id);
    if (ids.length === 0) return [];

    const { data, error } = await this.db
      .from('hangouts')
      .select(HANGOUT_SELECT)
      .in('id', ids);
    if (error) throw error;

    return ((data ?? []) as unknown as HangoutWithRelationsRow[]).map(
      hangoutWithRelationsToDomain
    );
  }

  async getHangout(hangoutId: string): Promise<Hangout | null> {
    const { data, error } = await this.db
      .from('hangouts')
      .select(HANGOUT_SELECT)
      .eq('id', hangoutId)
      .maybeSingle();
    if (error) throw error;
    return data ? hangoutWithRelationsToDomain(data as unknown as HangoutWithRelationsRow) : null;
  }

  subscribeToExpenses(hangoutId: string, onChange: () => void): () => void {
    // Websocket de Supabase Realtime: escucha INSERT y UPDATE en expenses
    // de esta juntada. Requiere la tabla en la publicación supabase_realtime
    // (ver supabase/migrations/003_realtime_expenses.sql).
    const channel = this.db
      .channel(`expenses-${hangoutId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'expenses',
          filter: `hangout_id=eq.${hangoutId}`,
        },
        onChange
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'expenses',
          filter: `hangout_id=eq.${hangoutId}`,
        },
        onChange
      )
      .subscribe();

    return () => {
      this.db.removeChannel(channel);
    };
  }

  async createHangout(hangout: Hangout): Promise<void> {
    const { error } = await this.db.from('hangouts').insert(hangoutToRow(hangout));
    if (error) throw error;

    await this.replaceMembers(hangout.id, hangout.members);

    for (const expense of hangout.expenses) {
      await this.addExpense(hangout.id, expense);
    }
  }

  async updateHangout(hangout: Hangout): Promise<void> {
    const row = hangoutToRow(hangout);
    const { error } = await this.db
      .from('hangouts')
      .update({
        title: row.title,
        date: row.date,
        description: row.description,
        status: row.status,
        emoji: row.emoji,
      })
      .eq('id', hangout.id);
    if (error) throw error;

    await this.replaceMembers(hangout.id, hangout.members);
  }

  async addExpense(hangoutId: string, expense: Expense): Promise<void> {
    const { error } = await this.db.from('expenses').insert(expenseToRow(hangoutId, expense));
    if (error) throw error;
    await this.replaceSplits(expense);
  }

  async updateExpense(hangoutId: string, expense: Expense): Promise<void> {
    const row = expenseToRow(hangoutId, expense);
    const { error } = await this.db
      .from('expenses')
      .update({
        emoji: row.emoji,
        description: row.description,
        amount: row.amount,
        paid_by: row.paid_by,
        date: row.date,
      })
      .eq('id', expense.id);
    if (error) throw error;
    await this.replaceSplits(expense);
  }

  async addSettlement(hangoutId: string, settlement: Settlement): Promise<void> {
    const { error } = await this.db
      .from('settlements')
      .insert(settlementToRow(hangoutId, settlement));
    if (error) throw error;
  }

  async getProfilesByIds(ids: string[]): Promise<Friend[]> {
    if (ids.length === 0) return [];
    const { data, error } = await this.db.from('profiles').select('*').in('id', ids);
    if (error) throw error;
    return ((data ?? []) as ProfileRow[]).map(profileRowToFriend);
  }

  async getAllProfiles(): Promise<UserProfile[]> {
    const { data, error } = await this.db
      .from('profiles')
      .select('*')
      .order('name', { ascending: true })
      .limit(100);
    if (error) throw error;
    return ((data ?? []) as ProfileRow[]).map(profileRowToUser);
  }

  async updateAvatar(userId: string, dataUrl: string): Promise<string> {
    const { mime, base64 } = dataUrlToParts(dataUrl);
    const { error } = await this.db
      .from('profiles')
      .update({ avatar_blob: base64ToByteaHex(base64), avatar_mime: mime })
      .eq('id', userId);
    if (error) throw error;
    // Devolvemos el mismo data URL (equivale a lo que reconstruye byteaToDataUrl)
    return byteaToDataUrl(base64ToByteaHex(base64), mime) ?? dataUrl;
  }

  /** Reemplaza la división completa de un gasto. */
  private async replaceSplits(expense: Expense): Promise<void> {
    const { error: delError } = await this.db
      .from('expense_splits')
      .delete()
      .eq('expense_id', expense.id);
    if (delError) throw delError;

    const splits = expense.splitAmong.map((profileId) => ({
      expense_id: expense.id,
      profile_id: profileId,
    }));
    const { error } = await this.db.from('expense_splits').insert(splits);
    if (error) throw error;
  }

  /** Reemplaza el listado completo de integrantes de una juntada. */
  private async replaceMembers(hangoutId: string, memberIds: string[]): Promise<void> {
    const { error: delError } = await this.db
      .from('hangout_members')
      .delete()
      .eq('hangout_id', hangoutId);
    if (delError) throw delError;

    const rows = memberIds.map((profileId) => ({
      hangout_id: hangoutId,
      profile_id: profileId,
    }));
    const { error } = await this.db.from('hangout_members').insert(rows);
    if (error) throw error;
  }
}
