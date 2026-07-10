/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Punto de entrada de la capa de datos.
 * Devuelve el repositorio Supabase si las env vars están configuradas;
 * si no, cae al repositorio localStorage (modo offline/demo).
 */

import { IVaquiRepository } from './contracts';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { SupabaseRepository } from './supabaseRepository';
import { LocalStorageRepository } from './localStorageRepository';

let instance: IVaquiRepository | null = null;

export function getRepository(): IVaquiRepository {
  if (!instance) {
    instance =
      isSupabaseConfigured && supabase
        ? new SupabaseRepository(supabase)
        : new LocalStorageRepository();
  }
  return instance;
}

export { isSupabaseConfigured };
export type { IVaquiRepository };
