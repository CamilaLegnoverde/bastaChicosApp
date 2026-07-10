/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Expense, Friend, UserProfile } from '../../types';
import { Calendar, Pencil } from 'lucide-react';
import { formatFriendlyDate } from '../../utils/dates';
import Avatar from '../ui/Avatar';

interface ExpenseCardProps {
  key?: any;
  expense: Expense;
  friendsList: Friend[];
  currentUser: UserProfile;
  /** Si está presente, muestra el botón de edición (gastos propios) */
  onEdit?: () => void;
}

export default function ExpenseCard({ expense, friendsList, currentUser, onEdit }: ExpenseCardProps) {
  const { emoji, description, amount, paidBy, splitAmong, date } = expense;

  // Resolve payer name
  const getMemberName = (id: string) => {
    if (id === currentUser.id) return `${currentUser.name} (Vos)`;
    const friend = friendsList.find((f) => f.id === id);
    return friend ? friend.name : 'Integrante';
  };

  const getMemberAvatarColor = (id: string) => {
    if (id === currentUser.id) return currentUser.avatarColor;
    const friend = friendsList.find((f) => f.id === id);
    return friend ? friend.avatarColor : 'bg-gray-400';
  };

  const getMemberAvatarUrl = (id: string) => {
    if (id === currentUser.id) return currentUser.avatarUrl;
    const friend = friendsList.find((f) => f.id === id);
    return friend ? friend.avatarUrl : undefined;
  };

  const payerName = getMemberName(paidBy);

  return (
    <div
      className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs hover:shadow-xs transition-shadow flex items-start gap-4 relative"
      id={`expense-card-${expense.id}`}
    >
      {/* Emoji Bubble */}
      <div className="w-10 h-10 rounded-xl bg-brand-warm-bg flex items-center justify-center text-xl shadow-3xs shrink-0 border border-gray-100/30">
        {emoji || '💸'}
      </div>

      {/* Details column */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className="font-bold text-gray-800 text-sm sm:text-base leading-snug truncate">
            {description}
          </h4>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="font-display font-extrabold text-gray-800 text-base">
              ${amount.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </span>
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-1.5 rounded-lg text-gray-300 hover:text-brand-primary hover:bg-brand-primary/10 transition-all cursor-pointer"
                title="Editar gasto"
                aria-label="Editar gasto"
              >
                <Pencil size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Paid by info */}
        <p className="text-xs text-gray-500 mb-2">
          Pagó <span className="font-semibold text-gray-700">{payerName}</span>
        </p>

        {/* Division Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-50">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Dividido entre:</span>
            <div className="flex -space-x-1.5 overflow-hidden">
              {splitAmong.map((memberId) => (
                <Avatar
                  key={memberId}
                  name={getMemberName(memberId)}
                  avatarColor={getMemberAvatarColor(memberId)}
                  avatarUrl={getMemberAvatarUrl(memberId)}
                  className="w-6 h-6"
                  textClassName="text-[10px]"
                  frameClassName="border-2 border-white ring-1 ring-gray-100"
                />
              ))}
            </div>
          </div>

          {/* Date */}
          <span className="text-[10px] text-gray-400 flex items-center gap-1">
            <Calendar size={10} />
            {formatFriendlyDate(date)}
          </span>
        </div>
      </div>
    </div>
  );
}
