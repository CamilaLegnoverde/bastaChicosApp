/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Utilidades de fechas compartidas por el DatePicker y las tarjetas.

const ISO_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Convierte un Date a 'YYYY-MM-DD' en hora local. */
export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Parsea 'YYYY-MM-DD' como fecha local (mediodía para evitar problemas de zona horaria). */
export function parseISODate(s: string): Date | null {
  const match = s.trim().match(ISO_REGEX);
  if (!match) return null;
  return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]), 12);
}

export function addDays(d: Date, days: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
  return copy;
}

/** Próximo sábado (si hoy es sábado, devuelve hoy). */
export function nextSaturday(from: Date = new Date()): Date {
  const diff = (6 - from.getDay() + 7) % 7;
  return addDays(from, diff);
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * Muestra la fecha de forma amigable:
 * 'Hoy', 'Mañana', 'Sáb 11 jul' (con año si es distinto al actual).
 * Los textos legados que no son ISO ('Sábado Próximo', etc.) se devuelven tal cual.
 */
export function formatFriendlyDate(dateStr: string): string {
  const date = parseISODate(dateStr);
  if (!date) return dateStr;

  const today = new Date();
  if (isSameDay(date, today)) return 'Hoy';
  if (isSameDay(date, addDays(today, 1))) return 'Mañana';

  const opts: Intl.DateTimeFormatOptions =
    date.getFullYear() === today.getFullYear()
      ? { weekday: 'short', day: 'numeric', month: 'short' }
      : { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };

  const formatted = new Intl.DateTimeFormat('es-AR', opts).format(date);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

/** Timestamp para ordenar juntadas cronológicamente. */
export function parseMeetingDate(dateStr: string): number {
  if (!dateStr) return 0;
  const clean = dateStr.trim().toLowerCase();

  if (clean.includes('hoy')) {
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    return today.getTime();
  }
  if (clean.includes('sábado') || clean.includes('sabado')) {
    const sat = nextSaturday();
    sat.setHours(12, 0, 0, 0);
    return sat.getTime();
  }

  const iso = parseISODate(dateStr);
  if (iso) return iso.getTime();

  const parsed = Date.parse(dateStr);
  if (!isNaN(parsed)) return parsed;

  return 0;
}
