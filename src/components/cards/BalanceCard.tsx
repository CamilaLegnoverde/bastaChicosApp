/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Hangout, MemberBalance } from '../../types';
import { Calendar, Users, Receipt, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatFriendlyDate } from '../../utils/dates';

interface BalanceCardProps {
  hangout: Hangout;
  userBalance: MemberBalance;
}

export default function BalanceCard({ hangout, userBalance }: BalanceCardProps) {
  const { title, date, description, members, expenses } = hangout;
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const { totalPaid, totalOwed, balance } = userBalance;

  const isOwed = balance > 0.01;
  const owes = balance < -0.01;
  const netAmount = Math.abs(balance);

  return (
    <div
      className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col gap-6 relative overflow-hidden"
      id={`balance-card-${hangout.id}`}
    >
      {/* Background Accent glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-secondary/5 rounded-full blur-2xl pointer-events-none" />

      {/* Main Metadata Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <span className="text-3xl" id="balance-card-emoji">
            {hangout.emoji || '✨'}
          </span>
          <div>
            <h2 className="font-display font-extrabold text-2xl text-gray-800 leading-tight" id="balance-card-title">
              {title}
            </h2>
            <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
              <Calendar size={13} />
              <span>{formatFriendlyDate(date)}</span>
            </div>
          </div>
        </div>

        {description && (
          <p className="text-gray-500 text-sm mt-1 px-1">
            {description}
          </p>
        )}
      </div>

      {/* Inline Stats Row */}
      <div className="grid grid-cols-3 gap-2 py-3 px-4 bg-brand-warm-bg rounded-2xl border border-gray-100/50">
        <div className="text-center">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Integrantes</span>
          <div className="flex items-center justify-center gap-1 mt-0.5 text-gray-700 font-bold">
            <Users size={14} className="text-gray-400" />
            <span className="text-sm">{members.length}</span>
          </div>
        </div>
        <div className="text-center border-x border-gray-100">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Gastos</span>
          <div className="flex items-center justify-center gap-1 mt-0.5 text-gray-700 font-bold">
            <Receipt size={14} className="text-gray-400" />
            <span className="text-sm">{expenses.length}</span>
          </div>
        </div>
        <div className="text-center">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total gastado</span>
          <span className="text-sm font-extrabold text-brand-primary block mt-0.5">
            ${totalSpent.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
          </span>
        </div>
      </div>

      {/* "Mi balance" Section - Crucial Component */}
      <div className="border-t border-gray-100 pt-5 flex flex-col gap-4">
        <h3 className="font-display font-extrabold text-base text-gray-800 tracking-tight">
          Mi balance
        </h3>

        <div className="grid grid-cols-2 gap-4">
          {/* Pagué Block */}
          <div className="bg-gray-50/75 rounded-2xl p-4 border border-gray-100/30">
            <span className="text-xs text-gray-400 font-medium block mb-1">Pagué</span>
            <span className="font-display font-extrabold text-lg text-gray-700">
              ${totalPaid.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </span>
          </div>

          {/* Me correspondía Block */}
          <div className="bg-gray-50/75 rounded-2xl p-4 border border-gray-100/30">
            <span className="text-xs text-gray-400 font-medium block mb-1">Me correspondía</span>
            <span className="font-display font-extrabold text-lg text-gray-700">
              ${totalOwed.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Dynamic Balance Alert */}
        {isOwed ? (
          <div className="bg-brand-accent-light/60 border border-brand-accent/20 rounded-2xl p-4 flex items-center justify-between gap-3 text-brand-accent">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-accent/10 flex items-center justify-center shrink-0">
                <CheckCircle2 size={22} className="text-brand-accent" />
              </div>
              <div>
                <span className="text-xs text-emerald-600 font-semibold block">Balance a favor</span>
                <span className="font-display font-black text-xl text-brand-accent">
                  Me deben ${netAmount.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        ) : owes ? (
          <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex items-center justify-between gap-3 text-orange-600">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100/50 flex items-center justify-center shrink-0">
                <AlertCircle size={22} className="text-orange-500" />
              </div>
              <div>
                <span className="text-xs text-orange-500 font-semibold block">Debo pagar</span>
                <span className="font-display font-black text-xl text-orange-600">
                  Debo pagar ${netAmount.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex items-center gap-3 text-gray-500">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
              <CheckCircle2 size={22} className="text-gray-400" />
            </div>
            <div>
              <span className="text-xs text-gray-400 font-semibold block">Al día</span>
              <span className="font-display font-black text-base text-gray-600">
                Estás a mano con todos
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
