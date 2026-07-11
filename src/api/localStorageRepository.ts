/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Implementación de IVaquiRepository sobre localStorage.
 * Se usa como fallback cuando Supabase no está configurado,
 * manteniendo la app 100% funcional sin backend.
 * Usa las mismas claves que la versión original, así los datos
 * existentes de los usuarios se conservan.
 */

import { UserProfile, Friend, Hangout, Expense, Settlement } from '../types';
import { IVaquiRepository } from './contracts';

const USER_KEY = 'vaqui_user';
const FRIENDS_KEY = 'vaqui_friends';
const HANGOUTS_KEY = 'vaqui_hangouts';

function read<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  return raw ? (JSON.parse(raw) as T) : fallback;
}

function write(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export class LocalStorageRepository implements IVaquiRepository {
  async getCurrentUser(): Promise<UserProfile | null> {
    return read<UserProfile | null>(USER_KEY, null);
  }

  async findUserByName(name: string): Promise<UserProfile | null> {
    const user = read<UserProfile | null>(USER_KEY, null);
    if (user && user.name.trim().toLowerCase() === name.trim().toLowerCase()) {
      return user;
    }
    return null;
  }

  async findUserByAlias(alias: string): Promise<UserProfile | null> {
    const trimmed = alias.trim().toLowerCase();
    if (!trimmed) return null;
    const user = read<UserProfile | null>(USER_KEY, null);
    if (user && user.aliasMP.trim().toLowerCase() === trimmed) {
      return user;
    }
    return null;
  }

  async findProfileByCode(code: string): Promise<Friend | null> {
    const normalized = code.trim().toUpperCase();
    const friends = read<Friend[]>(FRIENDS_KEY, []);
    return friends.find((f) => f.code === normalized) ?? null;
  }

  async saveUser(user: UserProfile): Promise<void> {
    write(USER_KEY, user);
  }

  async getFriends(_userId: string): Promise<Friend[]> {
    return read<Friend[]>(FRIENDS_KEY, []);
  }

  async addFriend(_userId: string, friend: Friend): Promise<void> {
    const friends = read<Friend[]>(FRIENDS_KEY, []);
    if (!friends.some((f) => f.id === friend.id)) {
      write(FRIENDS_KEY, [...friends, friend]);
    }
  }

  async getHangouts(_userId: string): Promise<Hangout[]> {
    return read<Hangout[]>(HANGOUTS_KEY, []);
  }

  async getHangout(hangoutId: string): Promise<Hangout | null> {
    const hangouts = read<Hangout[]>(HANGOUTS_KEY, []);
    return hangouts.find((h) => h.id === hangoutId) ?? null;
  }

  subscribeToExpenses(_hangoutId: string, _onChange: () => void): () => void {
    // Sin backend no hay websockets: no-op
    return () => {};
  }

  subscribeToHangouts(_userId: string, _onChange: () => void): () => void {
    // Sin backend no hay websockets: no-op
    return () => {};
  }

  async createHangout(hangout: Hangout): Promise<void> {
    const hangouts = read<Hangout[]>(HANGOUTS_KEY, []);
    write(HANGOUTS_KEY, [hangout, ...hangouts]);
  }

  async updateHangout(hangout: Hangout): Promise<void> {
    const hangouts = read<Hangout[]>(HANGOUTS_KEY, []);
    write(
      HANGOUTS_KEY,
      hangouts.map((h) => (h.id === hangout.id ? hangout : h))
    );
  }

  async addExpense(hangoutId: string, expense: Expense): Promise<void> {
    const hangouts = read<Hangout[]>(HANGOUTS_KEY, []);
    write(
      HANGOUTS_KEY,
      hangouts.map((h) =>
        h.id === hangoutId ? { ...h, expenses: [...h.expenses, expense] } : h
      )
    );
  }

  async updateExpense(hangoutId: string, expense: Expense): Promise<void> {
    const hangouts = read<Hangout[]>(HANGOUTS_KEY, []);
    write(
      HANGOUTS_KEY,
      hangouts.map((h) =>
        h.id === hangoutId
          ? { ...h, expenses: h.expenses.map((e) => (e.id === expense.id ? expense : e)) }
          : h
      )
    );
  }

  async addSettlement(hangoutId: string, settlement: Settlement): Promise<void> {
    const hangouts = read<Hangout[]>(HANGOUTS_KEY, []);
    write(
      HANGOUTS_KEY,
      hangouts.map((h) =>
        h.id === hangoutId
          ? { ...h, settlements: [...(h.settlements ?? []), settlement] }
          : h
      )
    );
  }

  async getAllProfiles(): Promise<UserProfile[]> {
    const result: UserProfile[] = [];
    const user = read<UserProfile | null>(USER_KEY, null);
    if (user) result.push(user);
    const friends = read<Friend[]>(FRIENDS_KEY, []);
    for (const f of friends) {
      result.push({ ...f, qr: f.code });
    }
    return result.sort((a, b) => a.name.localeCompare(b.name));
  }

  async updateAvatar(userId: string, dataUrl: string): Promise<string> {
    const user = read<UserProfile | null>(USER_KEY, null);
    if (user && user.id === userId) {
      write(USER_KEY, { ...user, avatarUrl: dataUrl });
    }
    // También lo reflejamos si el id corresponde a un amigo guardado
    const friends = read<Friend[]>(FRIENDS_KEY, []);
    if (friends.some((f) => f.id === userId)) {
      write(
        FRIENDS_KEY,
        friends.map((f) => (f.id === userId ? { ...f, avatarUrl: dataUrl } : f))
      );
    }
    return dataUrl;
  }

  async getProfilesByIds(ids: string[]): Promise<Friend[]> {
    const wanted = new Set(ids);
    const friends = read<Friend[]>(FRIENDS_KEY, []);
    const result = friends.filter((f) => wanted.has(f.id));

    // El propio usuario también puede ser buscado como perfil
    const user = read<UserProfile | null>(USER_KEY, null);
    if (user && wanted.has(user.id) && !result.some((f) => f.id === user.id)) {
      result.push({
        id: user.id,
        name: user.name,
        aliasMP: user.aliasMP,
        cbu: user.cbu,
        cvu: user.cvu,
        code: user.code,
        avatarColor: user.avatarColor,
        avatarUrl: user.avatarUrl,
      });
    }
    return result;
  }
}
