/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Se abre al registrar un usuario nuevo: pide el alias de pago.
 * Si el alias ya existe en la base, la app entra con ese usuario;
 * si no, crea uno nuevo con este alias.
 */

import React, { useState, useEffect } from 'react';
import { AtSign } from 'lucide-react';
import Modal from '../components/ui/Modal';

interface AliasModalProps {
  isOpen: boolean;
  name: string;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (alias: string) => void;
}

export default function AliasModal({
  isOpen,
  name,
  isSubmitting,
  onClose,
  onSubmit,
}: AliasModalProps) {
  const [alias, setAlias] = useState('');

  useEffect(() => {
    if (isOpen) setAlias('');
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alias.trim() || isSubmitting) return;
    onSubmit(alias.trim());
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`¡Hola, ${name}!`}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex items-start gap-3 bg-gray-50 border border-gray-100 rounded-2xl p-4">
          <div className="w-9 h-9 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
            <AtSign size={18} />
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            Ingresá tu <span className="font-bold text-gray-700">alias de pago</span> (Mercado
            Pago, banco, etc.). Si ya está registrado en Basta chicos, entrás directo con ese usuario;
            si no, creamos uno nuevo.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="signup-alias" className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Tu alias
          </label>
          <input
            type="text"
            id="signup-alias"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            placeholder="Ej: ivan.martinez.mp"
            required
            autoFocus
            className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 shadow-2xs"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-60 disabled:cursor-wait text-white font-display font-extrabold text-sm py-4 rounded-xl shadow-xs transition-transform active:scale-98 cursor-pointer mt-1 touch-target"
        >
          {isSubmitting ? 'Verificando...' : 'Continuar'}
        </button>
      </form>
    </Modal>
  );
}
