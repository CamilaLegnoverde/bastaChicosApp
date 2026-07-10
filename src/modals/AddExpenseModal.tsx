/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserProfile, Friend, Hangout } from '../types';
import Modal from '../components/ui/Modal';

export interface NewExpenseData {
  emoji: string;
  description: string;
  amount: string;
  payerId: string;
  divideEqually: boolean;
  splitSelectedIds: string[];
}

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  hangout: Hangout;
  user: UserProfile;
  friends: Friend[];
  onAdd: (data: NewExpenseData) => void;
}

const EMOJIS = ['🍕', '🥤', '🥩', '🍰', '🍻', '🚗', '🍿', '💡', '🍔', '🛒', '⚡', '🎉', '🥐', '🧊'];

export default function AddExpenseModal({
  isOpen,
  onClose,
  hangout,
  user,
  friends,
  onAdd,
}: AddExpenseModalProps) {
  const [emoji, setEmoji] = useState('🍕');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [payerId, setPayerId] = useState('');
  const [divideEqually, setDivideEqually] = useState(true);
  const [splitSelectedIds, setSplitSelectedIds] = useState<string[]>([]);

  // Resetear el formulario cada vez que se abre
  useEffect(() => {
    if (isOpen) {
      setEmoji('🍕');
      setDescription('');
      setAmount('');
      setPayerId(user.id);
      setDivideEqually(true);
      setSplitSelectedIds(hangout.members);
    }
  }, [isOpen, user.id, hangout.members]);

  const getMemberName = (memberId: string) =>
    memberId === user.id
      ? `${user.name} (Vos)`
      : friends.find((f) => f.id === memberId)?.name || 'Integrante';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ emoji, description, amount, payerId, divideEqually, splitSelectedIds });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Agregar Gasto">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-4 gap-3">
          {/* Emoji Selector */}
          <div className="col-span-1 flex flex-col gap-1.5">
            <label htmlFor="exp-emoji" className="text-xs font-bold text-gray-400 uppercase tracking-wider block text-center">
              Emoji
            </label>
            <select
              id="exp-emoji"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              className="w-full bg-white border border-gray-100 rounded-xl p-3 text-lg text-center outline-none focus:border-brand-primary shadow-2xs appearance-none"
            >
              {EMOJIS.map((em) => (
                <option key={em} value={em}>
                  {em}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="col-span-3 flex flex-col gap-1.5">
            <label htmlFor="exp-desc" className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              ¿Qué se compró?
            </label>
            <input
              type="text"
              id="exp-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Pizza Muzzarella, Gaseosas"
              required
              className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 outline-none focus:border-brand-primary shadow-2xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Amount */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="exp-amount" className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Monto total ($)
            </label>
            <input
              type="number"
              id="exp-amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Ej: 18500"
              required
              min="1"
              step="any"
              className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 outline-none focus:border-brand-primary shadow-2xs"
            />
          </div>

          {/* Who paid */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="exp-payer" className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              ¿Quién pagó?
            </label>
            <select
              id="exp-payer"
              value={payerId}
              onChange={(e) => setPayerId(e.target.value)}
              className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 outline-none focus:border-brand-primary shadow-2xs h-[46px] cursor-pointer"
            >
              {hangout.members.map((memberId) => (
                <option key={memberId} value={memberId}>
                  {getMemberName(memberId)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Division Type Selection */}
        <div className="border-t border-gray-50 pt-3 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="exp-split-all"
              checked={divideEqually}
              onChange={(e) => setDivideEqually(e.target.checked)}
              className="w-4 h-4 text-brand-primary border-gray-300 rounded-sm focus:ring-brand-primary focus:ring-2"
            />
            <label htmlFor="exp-split-all" className="text-xs font-bold text-gray-500 cursor-pointer">
              Dividir en partes iguales entre TODOS
            </label>
          </div>

          {/* Manual division checkboxes */}
          {!divideEqually && (
            <div className="flex flex-col gap-2 bg-gray-50 p-3 rounded-2xl border border-gray-100">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">
                Dividir únicamente entre:
              </span>
              <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto pr-1">
                {hangout.members.map((memberId) => {
                  const isChecked = splitSelectedIds.includes(memberId);

                  return (
                    <div key={memberId} className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-600">{getMemberName(memberId)}</span>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          setSplitSelectedIds((prev) =>
                            isChecked
                              ? prev.filter((id) => id !== memberId)
                              : [...prev, memberId]
                          );
                        }}
                        className="w-4 h-4 text-brand-primary border-gray-300 rounded-sm"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-display font-extrabold text-sm py-4 rounded-xl shadow-xs transition-transform active:scale-98 cursor-pointer mt-2 touch-target"
        >
          Registrar Gasto
        </button>
      </form>
    </Modal>
  );
}
