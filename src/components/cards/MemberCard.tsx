/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MemberBalance } from '../../types';

interface MemberCardProps {
  key?: any;
  memberBalance: MemberBalance;
  onClick: () => void;
}

export default function MemberCard({ memberBalance, onClick }: MemberCardProps) {
  const { name, avatarColor, totalPaid, totalOwed, balance } = memberBalance;

  const initial = name ? name.charAt(0).toUpperCase() : '?';

  const isOwed = balance > 0.01;
  const owes = balance < -0.01;
  const absBalance = Math.abs(balance);

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl p-4 border border-gray-100 shadow-3xs hover:shadow-xs hover:border-gray-200 transition-all cursor-pointer flex items-center justify-between gap-3 group"
      id={`member-card-${memberBalance.id}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Rounded Avatar Circle */}
        <div
          className={`w-10 h-10 rounded-full ${avatarColor} flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-3xs border-2 border-white`}
        >
          {initial}
        </div>
        <div className="min-w-0">
          <h4 className="font-bold text-gray-800 text-sm sm:text-base leading-snug group-hover:text-brand-primary transition-colors truncate">
            {name}
          </h4>
          <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium mt-0.5">
            <span>Pagó: ${totalPaid.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span>
            <span className="w-1 h-1 rounded-full bg-gray-200" />
            <span>Le correspondía: ${totalOwed.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span>
          </div>
        </div>
      </div>

      {/* Balance Column */}
      <div className="text-right shrink-0">
        {isOwed ? (
          <span className="text-xs font-bold text-brand-accent bg-brand-accent-light px-2.5 py-1 rounded-full">
            +${absBalance.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
          </span>
        ) : owes ? (
          <span className="text-xs font-bold text-brand-primary bg-violet-50 px-2.5 py-1 rounded-full">
            -${absBalance.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
          </span>
        ) : (
          <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">
            $0
          </span>
        )}
      </div>
    </div>
  );
}
