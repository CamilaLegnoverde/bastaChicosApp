/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Hangout, MemberBalance } from '../types';
import Modal from '../components/ui/Modal';

interface MemberExpensesModalProps {
  member: MemberBalance;
  hangout: Hangout;
  onClose: () => void;
}

export default function MemberExpensesModal({ member, hangout, onClose }: MemberExpensesModalProps) {
  const memberExpenses = hangout.expenses.filter((e) => e.paidBy === member.id);

  return (
    <Modal isOpen={true} onClose={onClose} title={`Compras de ${member.name.split(' ')[0]}`}>
      <div className="flex flex-col gap-4">
        <div className="bg-brand-warm-bg rounded-2xl p-4 border border-gray-100/50 flex justify-between items-center text-sm">
          <span className="text-gray-400 font-medium">Gasto Total Realizado:</span>
          <span className="font-display font-extrabold text-brand-primary text-base">
            ${member.totalPaid.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="flex flex-col gap-2.5 max-h-60 overflow-y-auto pr-1">
          {memberExpenses.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-6 border border-dashed rounded-2xl">
              No registró compras de su propio bolsillo en esta juntada.
            </p>
          ) : (
            memberExpenses.map((exp) => (
              <div
                key={exp.id}
                className="bg-white p-3 rounded-xl border border-gray-100 flex justify-between items-center gap-3 shadow-3xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-lg shrink-0">{exp.emoji}</span>
                  <span className="font-semibold text-gray-700 text-xs sm:text-sm truncate">
                    {exp.description}
                  </span>
                </div>
                <span className="font-display font-extrabold text-gray-800 text-xs sm:text-sm shrink-0">
                  ${exp.amount.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                </span>
              </div>
            ))
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full bg-gray-100 text-gray-600 font-bold text-xs py-3 rounded-xl hover:bg-gray-200 transition-all cursor-pointer mt-2"
        >
          Cerrar listado
        </button>
      </div>
    </Modal>
  );
}
