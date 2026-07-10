/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserSearch } from 'lucide-react';
import Modal from '../components/ui/Modal';

interface AddFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddByCode: (code: string) => void;
}

export default function AddFriendModal({ isOpen, onClose, onAddByCode }: AddFriendModalProps) {
  const [codeInput, setCodeInput] = useState('');

  useEffect(() => {
    if (isOpen) setCodeInput('');
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeInput.trim()) return;
    onAddByCode(codeInput.trim().toUpperCase());
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Agregar Amigo">
      <div className="flex flex-col gap-5">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="friend-code" className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Ingresar código de amigo
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="friend-code"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                placeholder="Ej: LUCAS-4819"
                className="flex-1 bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 uppercase outline-none focus:border-brand-primary shadow-2xs"
              />
              <button
                type="submit"
                className="bg-brand-primary hover:bg-brand-primary/90 text-white px-5 rounded-xl font-bold text-sm transition-all shadow-xs touch-target cursor-pointer"
              >
                Agregar
              </button>
            </div>
          </div>
        </form>

        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
            <UserSearch size={18} />
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            Pedile a tu amigo su <span className="font-bold text-gray-700">código único</span> (lo
            encuentra en su perfil, debajo del QR). Sólo se pueden agregar usuarios ya registrados
            en Basta chicos.
          </p>
        </div>
      </div>
    </Modal>
  );
}
