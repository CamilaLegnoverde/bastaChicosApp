/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Friend } from '../types';
import Modal from '../components/ui/Modal';
import DatePicker from '../components/ui/DatePicker';
import FriendCard from '../components/cards/FriendCard';
import { toISODate } from '../utils/dates';

export interface NewHangoutData {
  title: string;
  date: string;
  description: string;
  friendIds: string[];
}

interface NewHangoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  friends: Friend[];
  onCreate: (data: NewHangoutData) => void;
  onAddFriend: () => void;
}

export default function NewHangoutModal({
  isOpen,
  onClose,
  friends,
  onCreate,
  onAddFriend,
}: NewHangoutModalProps) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => toISODate(new Date()));
  const [description, setDescription] = useState('');
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);

  // Resetear el formulario cada vez que se abre
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDate(toISODate(new Date()));
      setDescription('');
      setSelectedFriendIds([]);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      title: title.trim(),
      date,
      description: description.trim(),
      friendIds: selectedFriendIds,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nueva Juntada">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="h-title" className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            ¿Qué organizamos?
          </label>
          <input
            type="text"
            id="h-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Asado del sábado, Pizza & Birras"
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
          <label htmlFor="h-desc" className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Descripción corta (opcional)
          </label>
          <textarea
            id="h-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ej: Traer carbón y bebidas espirituosas."
            rows={2}
            className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 shadow-2xs resize-none"
          />
        </div>

        {/* Selecting Friends */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Seleccionar amigos ({selectedFriendIds.length})
            </span>
            <button
              type="button"
              onClick={onAddFriend}
              className="text-brand-primary text-xs font-bold flex items-center gap-0.5 cursor-pointer"
            >
              <Plus size={12} />
              <span>Agregar amigo</span>
            </button>
          </div>

          {friends.length === 0 ? (
            <div className="bg-gray-50 border rounded-2xl p-4 text-center text-gray-400 text-xs">
              Aún no tenés amigos registrados. ¡Agregalos primero para incluirlos!
            </div>
          ) : (
            <div className="max-h-48 overflow-y-auto flex flex-col gap-2 pr-1 scrollbar-thin">
              {friends.map((friend) => {
                const isSel = selectedFriendIds.includes(friend.id);
                return (
                  <FriendCard
                    key={friend.id}
                    friend={friend}
                    isSelected={isSel}
                    showSelection={true}
                    onSelect={() => {
                      setSelectedFriendIds((prev) =>
                        isSel ? prev.filter((id) => id !== friend.id) : [...prev, friend.id]
                      );
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-display font-extrabold text-sm py-4 rounded-xl shadow-xs transition-transform active:scale-98 cursor-pointer mt-2 touch-target"
        >
          Comenzar juntada
        </button>
      </form>
    </Modal>
  );
}
