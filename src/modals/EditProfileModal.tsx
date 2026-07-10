/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Camera } from 'lucide-react';
import { UserProfile } from '../types';
import Modal from '../components/ui/Modal';
import Avatar from '../components/ui/Avatar';

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
  onPickAvatar: (file: File) => void;
  isUploadingAvatar?: boolean;
}

export default function EditProfileModal({
  isOpen,
  onClose,
  user,
  onSave,
  onPickAvatar,
  isUploadingAvatar = false,
}: EditProfileModalProps) {
  const [name, setName] = useState('');
  const [alias, setAlias] = useState('');
  const [cbu, setCbu] = useState('');
  const [cvu, setCvu] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onPickAvatar(file);
    e.target.value = ''; // permite volver a elegir el mismo archivo
  };

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
        {/* Foto de perfil */}
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative group cursor-pointer active:scale-95 transition-transform"
            aria-label="Cambiar foto de perfil"
          >
            <Avatar
              name={user.name}
              avatarColor={user.avatarColor}
              avatarUrl={user.avatarUrl}
              className="w-20 h-20"
              textClassName="text-3xl font-extrabold"
              frameClassName="border-4 border-white shadow-md"
            />
            <span className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-brand-primary text-white flex items-center justify-center border-2 border-white shadow-sm">
              <Camera size={13} />
            </span>
          </button>
          <span className="text-[11px] font-semibold text-gray-400">
            {isUploadingAvatar ? 'Subiendo foto…' : 'Tocá para cambiar tu foto'}
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

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
