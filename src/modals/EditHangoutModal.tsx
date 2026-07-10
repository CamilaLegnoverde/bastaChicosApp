/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, Friend, Hangout } from '../types';
import Modal from '../components/ui/Modal';
import DatePicker from '../components/ui/DatePicker';
import FriendCard from '../components/cards/FriendCard';
import { toISODate, parseISODate } from '../utils/dates';

export interface EditHangoutData {
  title: string;
  date: string;
  description: string;
  friendIds: string[];
}

interface EditHangoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  hangout: Hangout;
  user: UserProfile;
  friends: Friend[];
  onSave: (data: EditHangoutData) => void;
}

export default function EditHangoutModal({
  isOpen,
  onClose,
  hangout,
  user,
  friends,
  onSave,
}: EditHangoutModalProps) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);

  // Integrantes que ya participan de algún gasto: no se pueden quitar
  const lockedMemberIds = useMemo(() => {
    const ids = new Set<string>();
    for (const exp of hangout.expenses) {
      ids.add(exp.paidBy);
      exp.splitAmong.forEach((id) => ids.add(id));
    }
    return ids;
  }, [hangout.expenses]);

  // Cargar los datos actuales al abrir
  useEffect(() => {
    if (isOpen) {
      setTitle(hangout.title);
      // Fechas legadas no-ISO ('Hoy', 'Sábado Próximo') caen en hoy
      setDate(parseISODate(hangout.date) ? hangout.date : toISODate(new Date()));
      setDescription(hangout.description);
      setSelectedFriendIds(hangout.members.filter((id) => id !== user.id));
    }
  }, [isOpen, hangout, user.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title: title.trim(),
      date,
      description: description.trim(),
      friendIds: selectedFriendIds,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Juntada">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="eh-title" className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            ¿Qué organizamos?
          </label>
          <input
            type="text"
            id="eh-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 shadow-2xs"
          />
        </div>

        {/* Calendario amigable */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            ¿Cuándo es?
          </label>
          <DatePicker value={date} onChange={setDate} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="eh-desc" className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Descripción corta (opcional)
          </label>
          <textarea
            id="eh-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 shadow-2xs resize-none"
          />
        </div>

        {/* Integrantes */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Integrantes ({selectedFriendIds.length + 1})
          </span>

          {lockedMemberIds.size > 0 && (
            <p className="text-[10px] text-amber-600 bg-amber-50 rounded-xl py-2 px-3 border border-amber-100/50 font-medium">
              Los integrantes que ya participan de un gasto no se pueden quitar.
            </p>
          )}

          <div className="max-h-48 overflow-y-auto flex flex-col gap-2 pr-1 scrollbar-thin">
            {friends.map((friend) => {
              const isSel = selectedFriendIds.includes(friend.id);
              const isLocked = lockedMemberIds.has(friend.id);
              return (
                <FriendCard
                  key={friend.id}
                  friend={friend}
                  isSelected={isSel}
                  showSelection={true}
                  onSelect={() => {
                    // No permitir quitar a quien ya tiene gastos asociados
                    if (isSel && isLocked) return;
                    setSelectedFriendIds((prev) =>
                      isSel ? prev.filter((id) => id !== friend.id) : [...prev, friend.id]
                    );
                  }}
                />
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-display font-extrabold text-sm py-4 rounded-xl shadow-xs transition-transform active:scale-98 cursor-pointer mt-2 touch-target"
        >
          Guardar Cambios
        </button>
      </form>
    </Modal>
  );
}
