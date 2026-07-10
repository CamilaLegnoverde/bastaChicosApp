/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Modal que aparece cuando se abre la app desde un QR/link de invitación.
 * Muestra quién invita (foto + nombre) y pide confirmación antes de
 * agregarlo como amigo.
 */

import { UserPlus } from 'lucide-react';
import { Friend } from '../types';
import Modal from '../components/ui/Modal';
import Avatar from '../components/ui/Avatar';

interface InviteConfirmModalProps {
  /** Perfil de quien invita. Si es null, el modal está cerrado. */
  profile: Friend | null;
  onConfirm: () => void;
  onClose: () => void;
}

export default function InviteConfirmModal({ profile, onConfirm, onClose }: InviteConfirmModalProps) {
  return (
    <Modal isOpen={profile !== null} onClose={onClose} title="Invitación de amigo">
      {profile && (
        <div className="flex flex-col items-center text-center gap-4">
          <Avatar
            name={profile.name}
            avatarColor={profile.avatarColor}
            avatarUrl={profile.avatarUrl}
            className="w-20 h-20"
            textClassName="text-3xl font-extrabold"
            frameClassName="border-4 border-white shadow-md"
          />

          <div>
            <p className="text-sm text-gray-500">Te invitó</p>
            <h3 className="font-display font-extrabold text-2xl text-gray-800">{profile.name}</h3>
            {profile.aliasMP && (
              <p className="text-xs text-gray-400 mt-1">
                Alias: <span className="font-semibold text-gray-500">{profile.aliasMP}</span>
              </p>
            )}
          </div>

          <p className="text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
            Al agregarlo quedan conectados los dos y van a poder sumarse a las mismas juntadas.
          </p>

          <div className="flex gap-3 w-full mt-1">
            <button
              onClick={onClose}
              className="flex-1 py-3.5 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 text-gray-600 font-bold text-sm transition-all active:scale-98 cursor-pointer touch-target"
              id="invite-cancel-btn"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-3.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white font-display font-extrabold text-sm shadow-xs transition-all active:scale-98 cursor-pointer touch-target flex items-center justify-center gap-1.5"
              id="invite-confirm-btn"
            >
              <UserPlus size={16} />
              <span>Agregar</span>
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
