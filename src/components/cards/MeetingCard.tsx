/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Hangout } from '../../types';
import { Users, CreditCard, Calendar } from 'lucide-react';
import { formatFriendlyDate } from '../../utils/dates';

interface MeetingCardProps {
  key?: any;
  hangout: Hangout;
  onClick: () => void;
}

export default function MeetingCard({ hangout, onClick }: MeetingCardProps) {
  const { emoji, title, date, description, members, expenses, status } = hangout;

  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  // Status Badge configurations
  const statusConfigs = {
    proxima: {
      label: 'Próxima',
      classes: 'bg-brand-accent-light text-brand-accent border border-emerald-100',
    },
    finalizada: {
      label: 'Finalizada',
      classes: 'bg-gray-100 text-gray-500 border border-gray-200',
    },
  };

  const currentStatus = statusConfigs[status] || statusConfigs.proxima;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs hover:shadow-md hover:translate-y-[-2px] transition-all duration-200 cursor-pointer flex flex-col gap-4 relative overflow-hidden group"
      id={`meeting-card-${hangout.id}`}
    >
      {/* Decorative background accent */}
      <div className="absolute top-0 left-0 w-2 h-full bg-brand-secondary/10 group-hover:bg-brand-secondary transition-colors" />

      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-4 items-center">
          {/* Large Emoji Circle */}
          <div className="w-12 h-12 rounded-2xl bg-brand-warm-bg flex items-center justify-center text-2xl shadow-xs border border-gray-100/50">
            {emoji || '✨'}
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-gray-800 leading-snug group-hover:text-brand-primary transition-colors">
              {title}
            </h3>
            {/* Date line */}
            <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
              <Calendar size={13} />
              <span>{formatFriendlyDate(date)}</span>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${currentStatus.classes}`}>
          {currentStatus.label}
        </span>
      </div>

      {description && (
        <p className="text-gray-500 text-sm line-clamp-2 px-1">
          {description}
        </p>
      )}

      {/* Metrics Row */}
      <div className="flex items-center justify-between border-t border-gray-50 pt-4 mt-auto">
        <div className="flex items-center gap-4">
          {/* Members Count */}
          <div className="flex items-center gap-1.5 text-gray-500">
            <Users size={16} className="text-gray-400" />
            <span className="text-sm font-medium">{members.length}</span>
          </div>

          {/* Expense Count */}
          <div className="flex items-center gap-1.5 text-gray-500">
            <CreditCard size={16} className="text-gray-400" />
            <span className="text-sm font-medium">
              {expenses.length} {expenses.length === 1 ? 'gasto' : 'gastos'}
            </span>
          </div>
        </div>

        {/* Total Money Spent */}
        <div className="text-right">
          <span className="text-xs text-gray-400 block font-medium">Total gastado</span>
          <span className="font-display font-extrabold text-brand-primary text-base">
            ${totalSpent.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );
}
