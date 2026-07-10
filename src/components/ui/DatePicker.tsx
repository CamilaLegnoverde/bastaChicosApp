/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import {
  toISODate,
  parseISODate,
  addDays,
  nextSaturday,
  isSameDay,
  formatFriendlyDate,
} from '../../utils/dates';

interface DatePickerProps {
  value: string; // 'YYYY-MM-DD' o ''
  onChange: (iso: string) => void;
}

const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export default function DatePicker({ value, onChange }: DatePickerProps) {
  const today = new Date();
  const selected = value ? parseISODate(value) : null;

  const [viewDate, setViewDate] = useState<Date>(selected || today);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const monthLabel = new Intl.DateTimeFormat('es-AR', {
    month: 'long',
    year: 'numeric',
  }).format(viewDate);

  // Grilla del mes (semanas empiezan lunes)
  const firstOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingBlanks = (firstOfMonth.getDay() + 6) % 7;

  const cells: (Date | null)[] = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];

  const quickOptions = [
    { label: 'Hoy', date: today },
    { label: 'Mañana', date: addDays(today, 1) },
    { label: 'Sábado', date: nextSaturday(today) },
  ];

  const selectDay = (d: Date) => {
    onChange(toISODate(d));
    setViewDate(d);
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-3 shadow-2xs flex flex-col gap-3">
      {/* Accesos rápidos */}
      <div className="grid grid-cols-3 gap-2">
        {quickOptions.map((opt) => {
          const isActive = selected ? isSameDay(selected, opt.date) : false;
          return (
            <button
              key={opt.label}
              type="button"
              onClick={() => selectDay(opt.date)}
              className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                isActive
                  ? 'bg-brand-primary text-white border-brand-primary shadow-xs'
                  : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-brand-primary/40 hover:text-brand-primary'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Navegación de mes */}
      <div className="flex items-center justify-between px-1">
        <button
          type="button"
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          aria-label="Mes anterior"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-xs font-bold text-gray-700 capitalize">{monthLabel}</span>
        <button
          type="button"
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          aria-label="Mes siguiente"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((d, i) => (
          <span
            key={`${d}-${i}`}
            className="text-center text-[10px] font-bold text-gray-300 uppercase"
          >
            {d}
          </span>
        ))}

        {/* Días del mes */}
        {cells.map((day, i) => {
          if (!day) return <span key={`blank-${i}`} />;

          const isSelected = selected ? isSameDay(day, selected) : false;
          const isToday = isSameDay(day, today);

          return (
            <button
              key={day.getDate()}
              type="button"
              onClick={() => selectDay(day)}
              className={`aspect-square rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center ${
                isSelected
                  ? 'bg-brand-primary text-white font-bold shadow-xs scale-105'
                  : isToday
                    ? 'text-brand-primary font-bold ring-1 ring-brand-primary/40 hover:bg-brand-primary/10'
                    : 'text-gray-600 hover:bg-brand-primary/10 hover:text-brand-primary'
              }`}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>

      {/* Fecha elegida */}
      <div className="flex items-center justify-center gap-1.5 text-xs font-bold border-t border-gray-50 pt-2.5 text-brand-primary">
        <CalendarDays size={14} />
        <span>{value ? formatFriendlyDate(value) : 'Elegí una fecha'}</span>
      </div>
    </div>
  );
}
