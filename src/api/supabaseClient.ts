/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Cliente de Supabase, configurado por variables de entorno:
 *   VITE_SUPABASE_URL      → URL del proyecto (Settings → API)
 *   VITE_SUPABASE_ANON_KEY → clave pública "anon"
 *
 * Si faltan las variables, la app cae automáticamente al
 * repositorio localStorage (ver src/api/index.ts).
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;
