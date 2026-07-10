/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserProfile {
  id: string;
  name: string;
  aliasMP: string;
  cbu?: string;
  cvu?: string;
  code: string;
  qr: string; // Base64 or mock SVG
  avatarColor: string; // Color plano de fallback (ej: 'bg-violet-500')
  avatarUrl?: string; // Foto de perfil lista para <img src> (data URL derivado del blob)
}

export interface Friend {
  id: string;
  name: string;
  aliasMP: string;
  cbu?: string;
  cvu?: string;
  code: string;
  avatarColor: string;
  avatarUrl?: string; // Foto de perfil lista para <img src> (data URL derivado del blob)
}

export type HangoutStatus = 'proxima' | 'finalizada';

export interface Expense {
  id: string;
  emoji: string;
  description: string;
  amount: number;
  paidBy: string; // ID of the member who paid
  splitAmong: string[]; // List of member IDs this expense is split between
  date: string;
}

/** Transferencia marcada como realizada (pago registrado). */
export interface Settlement {
  id: string;
  fromId: string; // quién pagó
  toId: string; // quién recibió
  amount: number;
}

export interface Hangout {
  id: string;
  emoji: string;
  title: string;
  date: string;
  description: string;
  members: string[]; // List of Friend / User IDs
  expenses: Expense[];
  settlements: Settlement[]; // pagos registrados entre integrantes
  status: HangoutStatus;
}

export interface Transfer {
  fromId: string;
  toId: string;
  amount: number;
}

export interface MemberBalance {
  id: string;
  name: string;
  avatarColor: string;
  avatarUrl?: string;
  aliasMP: string;
  totalPaid: number;
  totalOwed: number;
  balance: number;
}
