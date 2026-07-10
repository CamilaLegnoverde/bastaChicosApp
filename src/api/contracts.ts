/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Contratos de la capa de datos.
 *
 * - IVaquiRepository: interfaz que consume la app (App.tsx). Cualquier
 *   backend (Supabase, localStorage, REST propio) debe implementarla.
 * - *Row: DTOs con la forma exacta de las filas en la base de datos
 *   (snake_case, como las columnas de supabase/schema.sql).
 */

import { UserProfile, Friend, Hangout, Expense, Settlement } from '../types';
import { byteaToDataUrl } from '../utils/image';

// ============================================================
// Interfaz del repositorio (contrato que consume la UI)
// ============================================================

export interface IVaquiRepository {
  /** Perfil del usuario de la sesión actual, o null si no se registró. */
  getCurrentUser(): Promise<UserProfile | null>;

  /** Busca un usuario existente por nombre (case-insensitive), o null. */
  findUserByName(name: string): Promise<UserProfile | null>;

  /** Busca un usuario existente por alias de pago (case-insensitive), o null. */
  findUserByAlias(alias: string): Promise<UserProfile | null>;

  /** Busca un perfil por su código de invitación (ej: 'LUCAS-4819'), o null. */
  findProfileByCode(code: string): Promise<Friend | null>;

  /** Crea o actualiza el perfil del usuario y lo fija como sesión actual. */
  saveUser(user: UserProfile): Promise<void>;

  /** Amigos del usuario (la amistad es mutua: un solo registro por par). */
  getFriends(userId: string): Promise<Friend[]>;

  /**
   * Registra la amistad con un perfil existente. Es mutua: al agregarla,
   * ambas personas quedan conectadas automáticamente.
   */
  addFriend(userId: string, friend: Friend): Promise<void>;

  /** Juntadas donde el usuario es integrante, con gastos incluidos. */
  getHangouts(userId: string): Promise<Hangout[]>;

  /** Una juntada puntual con sus gastos al día (para refrescos en tiempo real). */
  getHangout(hangoutId: string): Promise<Hangout | null>;

  /** Crea una juntada con sus integrantes. */
  createHangout(hangout: Hangout): Promise<void>;

  /** Actualiza título/fecha/descripción/estado/integrantes de una juntada. */
  updateHangout(hangout: Hangout): Promise<void>;

  /** Registra un gasto (con su división) en una juntada. */
  addExpense(hangoutId: string, expense: Expense): Promise<void>;

  /** Actualiza un gasto existente (datos y división). */
  updateExpense(hangoutId: string, expense: Expense): Promise<void>;

  /** Registra que una transferencia se realizó (pago entre integrantes). */
  addSettlement(hangoutId: string, settlement: Settlement): Promise<void>;

  /**
   * Perfiles por id. Permite mostrar los nombres de integrantes de una
   * juntada aunque no sean amigos del usuario actual.
   */
  getProfilesByIds(ids: string[]): Promise<Friend[]>;

  /**
   * Todos los perfiles registrados (para el carrusel de ingreso).
   * Ordenados por nombre. Puede limitarse para no traer demasiados.
   */
  getAllProfiles(): Promise<UserProfile[]>;

  /**
   * Guarda la foto de perfil (blob) de un usuario y devuelve el data URL
   * listo para mostrar. `dataUrl` es un JPEG ya reducido en el cliente.
   */
  updateAvatar(userId: string, dataUrl: string): Promise<string>;

  /**
   * Suscripción en tiempo real a los gastos de una juntada (INSERT/UPDATE).
   * Devuelve una función para desuscribirse. En backends sin websockets
   * (localStorage) es un no-op.
   */
  subscribeToExpenses(hangoutId: string, onChange: () => void): () => void;
}

// ============================================================
// DTOs: filas de la base de datos (snake_case)
// ============================================================

export interface ProfileRow {
  id: string;
  name: string;
  alias_mp: string;
  cbu: string | null;
  cvu: string | null;
  code: string;
  avatar_color: string;
  // Foto de perfil como blob. PostgREST devuelve bytea como texto hex ('\x...').
  avatar_blob?: string | null;
  avatar_mime?: string | null;
}

/**
 * Amistad mutua: UN solo registro por par de personas.
 * El par se guarda normalizado: user_a < user_b (orden alfabético de ids).
 */
export interface FriendshipRow {
  user_a: string;
  user_b: string;
}

/** Normaliza un par de ids al formato de la tabla (user_a < user_b). */
export function toFriendshipRow(idA: string, idB: string): FriendshipRow {
  return idA < idB ? { user_a: idA, user_b: idB } : { user_a: idB, user_b: idA };
}

export interface HangoutRow {
  id: string;
  emoji: string;
  title: string;
  date: string;
  description: string;
  status: 'proxima' | 'finalizada';
  created_by: string;
}

export interface HangoutMemberRow {
  hangout_id: string;
  profile_id: string;
}

export interface ExpenseRow {
  id: string;
  hangout_id: string;
  emoji: string;
  description: string;
  amount: number;
  paid_by: string;
  date: string;
}

export interface ExpenseSplitRow {
  expense_id: string;
  profile_id: string;
}

export interface SettlementRow {
  id: string;
  hangout_id: string;
  from_id: string;
  to_id: string;
  amount: number;
}

/** Forma anidada que devuelve el select con relaciones de Supabase. */
export interface HangoutWithRelationsRow extends HangoutRow {
  hangout_members: Pick<HangoutMemberRow, 'profile_id'>[];
  expenses: (ExpenseRow & {
    expense_splits: Pick<ExpenseSplitRow, 'profile_id'>[];
  })[];
  settlements: SettlementRow[];
}

// ============================================================
// Mappers DB ↔ dominio
// ============================================================

export function profileRowToUser(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    name: row.name,
    aliasMP: row.alias_mp,
    cbu: row.cbu ?? undefined,
    cvu: row.cvu ?? undefined,
    code: row.code,
    qr: row.code,
    avatarColor: row.avatar_color,
    avatarUrl: byteaToDataUrl(row.avatar_blob, row.avatar_mime),
  };
}

export function profileRowToFriend(row: ProfileRow): Friend {
  return {
    id: row.id,
    name: row.name,
    aliasMP: row.alias_mp,
    cbu: row.cbu ?? undefined,
    cvu: row.cvu ?? undefined,
    code: row.code,
    avatarColor: row.avatar_color,
    avatarUrl: byteaToDataUrl(row.avatar_blob, row.avatar_mime),
  };
}

export function userToProfileRow(user: UserProfile | Friend): ProfileRow {
  return {
    id: user.id,
    name: user.name,
    alias_mp: user.aliasMP,
    cbu: user.cbu ?? null,
    cvu: user.cvu ?? null,
    code: user.code,
    avatar_color: user.avatarColor,
  };
}

export function hangoutToRow(hangout: Hangout): HangoutRow & { created_by: string } {
  return {
    id: hangout.id,
    emoji: hangout.emoji,
    title: hangout.title,
    date: hangout.date,
    description: hangout.description,
    status: hangout.status,
    // El creador es el primer integrante (la app lo agrega siempre primero)
    created_by: hangout.members[0],
  };
}

export function expenseToRow(hangoutId: string, expense: Expense): ExpenseRow {
  return {
    id: expense.id,
    hangout_id: hangoutId,
    emoji: expense.emoji,
    description: expense.description,
    amount: expense.amount,
    paid_by: expense.paidBy,
    date: expense.date,
  };
}

export function settlementToRow(hangoutId: string, settlement: Settlement): SettlementRow {
  return {
    id: settlement.id,
    hangout_id: hangoutId,
    from_id: settlement.fromId,
    to_id: settlement.toId,
    amount: settlement.amount,
  };
}

export function hangoutWithRelationsToDomain(row: HangoutWithRelationsRow): Hangout {
  return {
    id: row.id,
    emoji: row.emoji,
    title: row.title,
    date: row.date,
    description: row.description,
    status: row.status,
    members: row.hangout_members.map((m) => m.profile_id),
    expenses: row.expenses.map((e) => ({
      id: e.id,
      emoji: e.emoji,
      description: e.description,
      amount: Number(e.amount),
      paidBy: e.paid_by,
      splitAmong: e.expense_splits.map((s) => s.profile_id),
      date: e.date,
    })),
    settlements: (row.settlements ?? []).map((s) => ({
      id: s.id,
      fromId: s.from_id,
      toId: s.to_id,
      amount: Number(s.amount),
    })),
  };
}
