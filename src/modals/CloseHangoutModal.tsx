/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AlertTriangle } from 'lucide-react';
import Modal from '../components/ui/Modal';

interface CloseHangoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function CloseHangoutModal({ isOpen, onClose, onConfirm }: CloseHangoutModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="¿Cerrar Juntada?">
      <div className="flex flex-col gap-4 text-center">
        <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
          <AlertTriangle size={24} />
        </div>

        <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
          Al cerrar la juntada ya no se podrán agregar nuevos gastos. Calcularemos las transferencias finales exactas para saldar todas las deudas.
        </p>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-gray-50 hover:bg-gray-100 text-gray-500 font-bold text-xs py-3.5 rounded-xl transition-all cursor-pointer border border-gray-100"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold text-xs py-3.5 rounded-xl transition-all cursor-pointer shadow-xs"
          >
            Sí, Cerrar Juntada
          </button>
        </div>
      </div>
    </Modal>
  );
}
