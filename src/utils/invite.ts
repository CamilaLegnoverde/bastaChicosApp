/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Invitaciones por QR / link.
 *
 * El QR de un usuario codifica una URL a la propia app con su código en el
 * parámetro `add`. Al abrir esa URL, la app detecta el código y ofrece
 * agregar a esa persona como amigo. La URL se arma desde el origen actual,
 * así funciona en cualquier entorno donde esté servida la app.
 */

/** Nombre del parámetro de query que lleva el código de invitación. */
export const INVITE_PARAM = 'add';

/** URL completa que codifica el QR de un usuario (ej: https://app/?add=LUCAS-4819). */
export function buildInviteUrl(code: string): string {
  const base =
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}`
      : '';
  return `${base}?${INVITE_PARAM}=${encodeURIComponent(code)}`;
}

/** Devuelve el código de invitación presente en la URL actual, o null. */
export function readInviteCodeFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const value = new URLSearchParams(window.location.search).get(INVITE_PARAM);
  return value ? value.trim().toUpperCase() : null;
}

/** Quita el parámetro de invitación de la URL sin recargar la página. */
export function stripInviteParamFromUrl(): void {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  url.searchParams.delete(INVITE_PARAM);
  window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
}
