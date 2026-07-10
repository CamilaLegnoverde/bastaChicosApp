/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Copy, CheckCircle2 } from 'lucide-react';
import { UserProfile, Friend, Transfer } from '../types';
import Modal from '../components/ui/Modal';

interface TransferDetailsModalProps {
  transfer: Transfer;
  user: UserProfile;
  friends: Friend[];
  onClose: () => void;
  onCopyText: (text: string, label: string) => void;
  /** Marca la transferencia como realizada (se guarda en la base) */
  onMarkPaid: () => void;
}

export default function TransferDetailsModal({
  transfer,
  user,
  friends,
  onClose,
  onCopyText,
  onMarkPaid,
}: TransferDetailsModalProps) {
  const creditorId = transfer.toId;
  let name = '';
  let alias = '';
  let cbu = '';
  let cvu = '';

  if (creditorId === user.id) {
    name = user.name;
    alias = user.aliasMP;
    cbu = user.cbu || '';
    cvu = user.cvu || '';
  } else {
    const friend = friends.find((f) => f.id === creditorId);
    if (friend) {
      name = friend.name;
      alias = friend.aliasMP;
      cbu = friend.cbu || '';
      cvu = friend.cvu || '';
    }
  }

  return (
    <Modal isOpen={true} onClose={onClose} title="Datos para Transferir">
      <div className="flex flex-col gap-4">
        <div className="text-center pb-3 border-b border-gray-50">
          <span className="text-xs text-gray-400 block font-bold uppercase tracking-wider">Monto a enviar</span>
          <span className="font-display font-black text-brand-primary text-2xl">
            ${transfer.amount.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
          </span>
          <span className="text-xs text-gray-400 block mt-1">Destinatario: <span className="font-bold text-gray-700">{name}</span></span>
        </div>

        {/* Mercado Pago Alias block */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Alias Mercado Pago</span>
          <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
            <span className="text-sm font-semibold text-gray-700 font-mono">{alias || 'No especificado'}</span>
            {alias && (
              <button
                onClick={() => onCopyText(alias, 'Alias')}
                className="p-1.5 hover:bg-gray-200 text-gray-400 hover:text-gray-600 rounded-lg transition-all"
                title="Copiar Alias"
              >
                <Copy size={14} />
              </button>
            )}
          </div>
        </div>

        {/* CBU Bank account block */}
        {cbu && (
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">CBU</span>
            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
              <span className="text-xs font-mono text-gray-700 select-all tracking-wide">{cbu}</span>
              <button
                onClick={() => onCopyText(cbu, 'CBU')}
                className="p-1.5 hover:bg-gray-200 text-gray-400 hover:text-gray-600 rounded-lg transition-all"
                title="Copiar CBU"
              >
                <Copy size={14} />
              </button>
            </div>
          </div>
        )}

        {/* CVU account block */}
        {cvu && (
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">CVU</span>
            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
              <span className="text-xs font-mono text-gray-700 select-all tracking-wide">{cvu}</span>
              <button
                onClick={() => onCopyText(cvu, 'CVU')}
                className="p-1.5 hover:bg-gray-200 text-gray-400 hover:text-gray-600 rounded-lg transition-all"
                title="Copiar CVU"
              >
                <Copy size={14} />
              </button>
            </div>
          </div>
        )}

        <div className="text-[10px] text-center text-gray-400 leading-normal italic px-2">
          Enviá el dinero desde tu billetera digital o banco y avisale a tu amigo pasándole el comprobante de transferencia.
        </div>

        <div className="grid grid-cols-2 gap-3 mt-2">
          <button
            onClick={onClose}
            className="w-full bg-gray-50 hover:bg-gray-100 text-gray-500 font-bold text-xs py-3.5 rounded-xl transition-all cursor-pointer border border-gray-100"
          >
            Entendido
          </button>
          <button
            onClick={onMarkPaid}
            className="w-full bg-brand-accent hover:bg-brand-accent/90 text-white font-bold text-xs py-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
            id="mark-transfer-paid-btn"
          >
            <CheckCircle2 size={14} />
            <span>Ya transferí</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
