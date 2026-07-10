/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import Modal from '../components/ui/Modal';

export interface EditProfileData {
  name: string;
  aliasMP: string;
  cbu: string;
  cvu: string;
}

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onSave: (data: EditProfileData) => void;
}

export default function EditProfileModal({ isOpen, onClose, user, onSave }: EditProfileModalProps) {
  const [name, setName] = useState('');
  const [alias, setAlias] = useState('');
  const [cbu, setCbu] = useState('');
  const [cvu, setCvu] = useState('');

  // Cargar los datos actuales del usuario al abrir
  useEffect(() => {
    if (isOpen) {
      setName(user.name);
      setAlias(user.aliasMP);
      setCbu(user.cbu || '');
      setCvu(user.cvu || '');
    }
  }, [isOpen, user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name: name.trim(), aliasMP: alias.trim(), cbu: cbu.trim(), cvu: cvu.trim() });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar datos de pago">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <p className="text-xs text-gray-500 leading-relaxed bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
          Cargá tu alias y CBU/CVU para que tus amigos sepan a dónde transferirte.
        </p>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="p-name" className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Mi Nombre
          </label>
          <input
            type="text"
            id="p-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 outline-none focus:border-brand-primary shadow-2xs"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="p-alias" className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Alias de Mercado Pago
          </label>
          <input
            type="text"
            id="p-alias"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            placeholder="Ej: cami.legno.mp"
            className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 outline-none focus:border-brand-primary shadow-2xs"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="p-cbu" className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              CBU (opcional)
            </label>
            <input
              type="text"
              id="p-cbu"
              value={cbu}
              onChange={(e) => setCbu(e.target.value)}
              maxLength={22}
              className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-xs font-mono text-gray-700 outline-none focus:border-brand-primary shadow-2xs"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="p-cvu" className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              CVU (opcional)
            </label>
            <input
              type="text"
              id="p-cvu"
              value={cvu}
              onChange={(e) => setCvu(e.target.value)}
              maxLength={22}
              className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-xs font-mono text-gray-700 outline-none focus:border-brand-primary shadow-2xs"
            />
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
