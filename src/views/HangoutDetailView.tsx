/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Plus, Users, Receipt, TrendingUp, X, Pencil, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { UserProfile, Friend, Hangout, Expense, MemberBalance, Transfer } from '../types';
import Header from '../components/ui/Header';
import BalanceCard from '../components/cards/BalanceCard';
import ExpenseCard from '../components/cards/ExpenseCard';
import MemberCard from '../components/cards/MemberCard';
import TransferCard from '../components/cards/TransferCard';

interface HangoutDetailViewProps {
  hangout: Hangout;
  user: UserProfile;
  friends: Friend[];
  balances: MemberBalance[];
  transfers: Transfer[];
  userBalance: MemberBalance;
  onBack: () => void;
  onAddExpense: () => void;
  onEditExpense: (expense: Expense) => void;
  onEdit: () => void;
  onRequestClose: () => void;
  onSelectMember: (member: MemberBalance) => void;
  onSelectTransfer: (transfer: Transfer) => void;
}

export default function HangoutDetailView({
  hangout,
  user,
  friends,
  balances,
  transfers,
  userBalance,
  onBack,
  onAddExpense,
  onEditExpense,
  onEdit,
  onRequestClose,
  onSelectMember,
  onSelectTransfer,
}: HangoutDetailViewProps) {
  const isFinished = hangout.status === 'finalizada';

  return (
    <div className="flex-1 flex flex-col" id="detail-view">
      <Header title="Detalle" onBackClick={onBack} />

      <motion.div
        initial={{ opacity: 0, x: 32 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: 'spring', damping: 26, stiffness: 300 }}
        className="flex-1 p-5 overflow-y-auto flex flex-col gap-6"
        id="detail-scroll-container"
      >
        {/* Summary and Personal Balance */}
        <BalanceCard hangout={hangout} userBalance={userBalance} />

        {/* Status controls: Editar / Cerrar Juntada */}
        {!isFinished && (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onEdit}
              className="w-full bg-white border-2 border-brand-primary/20 hover:border-brand-primary text-brand-primary font-display font-extrabold text-sm py-4 rounded-2xl shadow-xs transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2 touch-target"
              id="edit-meeting-btn"
            >
              <Pencil size={16} strokeWidth={2.5} />
              <span>Editar Juntada</span>
            </button>
            <button
              onClick={onRequestClose}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-display font-extrabold text-sm py-4 rounded-2xl shadow-xs transition-transform active:scale-98 cursor-pointer flex items-center justify-center gap-2 touch-target"
              id="close-meeting-btn"
            >
              <X size={18} strokeWidth={2.5} />
              <span>Cerrar Juntada</span>
            </button>
          </div>
        )}

        {/* SECTION: Gastos Timeline */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-display font-extrabold text-base text-gray-800 flex items-center gap-2">
              <Receipt size={18} className="text-gray-400" />
              Gastos ({hangout.expenses.length})
            </h3>

            {!isFinished ? (
              <button
                onClick={onAddExpense}
                className="text-brand-primary hover:text-brand-primary/80 font-bold text-xs flex items-center gap-1.5 cursor-pointer touch-target"
                id="add-expense-trigger-btn"
              >
                <Plus size={16} strokeWidth={2.5} />
                <span>Agregar gasto</span>
              </button>
            ) : (
              <span className="text-[10px] bg-gray-100 text-gray-500 font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-gray-200">
                Gastos Cerrados
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2.5" id="expenses-timeline-list">
            {hangout.expenses.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 border border-dashed border-gray-200 text-center text-gray-400 text-xs">
                No hay gastos registrados en esta juntada.
              </div>
            ) : (
              hangout.expenses
                .slice()
                .reverse() // Most recent first
                .map((exp) => (
                  <ExpenseCard
                    key={exp.id}
                    expense={exp}
                    friendsList={friends}
                    currentUser={user}
                    // Sólo se pueden editar los gastos propios en juntadas activas
                    onEdit={
                      !isFinished && exp.paidBy === user.id
                        ? () => onEditExpense(exp)
                        : undefined
                    }
                  />
                ))
            )}
          </div>
        </div>

        {/* SECTION: Integrantes */}
        <div className="flex flex-col gap-3">
          <h3 className="font-display font-extrabold text-base text-gray-800 flex items-center gap-2 px-1">
            <Users size={18} className="text-gray-400" />
            Integrantes ({hangout.members.length})
          </h3>

          <div className="flex flex-col gap-2.5" id="members-list-box">
            {balances.map((mBal) => (
              <MemberCard
                key={mBal.id}
                memberBalance={mBal}
                onClick={() => onSelectMember(mBal)}
              />
            ))}
          </div>
        </div>

        {/* SECTION: Settle Transfers (Transferencias necesarias) */}
        <div className="flex flex-col gap-3 border-t border-gray-100 pt-5">
          <h3 className="font-display font-extrabold text-base text-gray-800 flex items-center gap-2 px-1">
            <TrendingUp size={18} className="text-gray-400" />
            Liquidación de Cuentas
          </h3>

          {/* Pagos ya registrados */}
          {hangout.settlements.length > 0 && (
            <div className="flex flex-col gap-1.5" id="settlements-done-list">
              {hangout.settlements.map((s) => {
                // Siempre el nombre real, también para el usuario actual
                const resolveName = (id: string) =>
                  id === user.id
                    ? user.name.split(' ')[0]
                    : friends.find((f) => f.id === id)?.name.split(' ')[0] || 'Integrante';
                const fromName = resolveName(s.fromId);
                const toName = resolveName(s.toId);

                return (
                  <div
                    key={s.id}
                    className="flex items-center gap-2 bg-brand-accent-light/50 border border-emerald-100 rounded-xl px-3 py-2 text-xs text-emerald-700"
                  >
                    <CheckCircle2 size={14} className="text-brand-accent shrink-0" />
                    <span className="min-w-0 truncate">
                      <span className="font-bold">{fromName}</span> le transfirió{' '}
                      <span className="font-bold">
                        ${s.amount.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                      </span>{' '}
                      a <span className="font-bold">{toName}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex flex-col gap-2.5" id="transfers-settlements-box">
            {hangout.expenses.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 border border-dashed border-gray-200 text-center text-gray-400 text-xs">
                Registrá gastos para calcular las transferencias automáticas.
              </div>
            ) : transfers.length === 0 ? (
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 text-center text-brand-accent text-xs font-semibold">
                😎 ¡Las cuentas están perfectamente equilibradas! Nadie le debe a nadie.
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {!isFinished && (
                  <p className="text-[10px] text-amber-600 bg-amber-50 rounded-xl py-2 px-3 border border-amber-100/50 font-medium">
                    ⚠️ Estas transferencias son provisionales. Podés finalizarlas cerrando la juntada.
                  </p>
                )}

                {transfers.map((trans, idx) => {
                  const fromMember = balances.find((b) => b.id === trans.fromId);
                  const toMember = balances.find((b) => b.id === trans.toId);

                  return (
                    <TransferCard
                      key={idx}
                      fromName={fromMember?.name || 'Amigo'}
                      toName={toMember?.name || 'Amigo'}
                      amount={trans.amount}
                      fromAvatarColor={fromMember?.avatarColor || 'bg-gray-400'}
                      toAvatarColor={toMember?.avatarColor || 'bg-gray-400'}
                      onShowPaymentDetails={() => onSelectTransfer(trans)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
