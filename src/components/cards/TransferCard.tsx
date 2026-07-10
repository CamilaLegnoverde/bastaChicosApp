/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowRight, ReceiptText } from 'lucide-react';
import Avatar from '../ui/Avatar';

interface TransferCardProps {
  key?: any;
  fromName: string;
  toName: string;
  amount: number;
  fromAvatarColor: string;
  toAvatarColor: string;
  fromAvatarUrl?: string;
  toAvatarUrl?: string;
  onShowPaymentDetails: () => void;
}

export default function TransferCard({
  fromName,
  toName,
  amount,
  fromAvatarColor,
  toAvatarColor,
  fromAvatarUrl,
  toAvatarUrl,
  onShowPaymentDetails,
}: TransferCardProps) {
  return (
    <div
      className="bg-white rounded-2xl p-4 border border-gray-100 shadow-3xs hover:shadow-xs transition-shadow flex flex-col gap-3"
      id="transfer-card"
    >
      {/* Fila 1: quién le paga a quién (grid de 3 columnas, sin solapamientos) */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        {/* Deudor */}
        <div className="flex items-center gap-2 min-w-0">
          <Avatar
            name={fromName}
            avatarColor={fromAvatarColor}
            avatarUrl={fromAvatarUrl}
            className="w-9 h-9"
            textClassName="text-xs"
            frameClassName="shadow-3xs border-2 border-white"
          />
          <div className="min-w-0">
            <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              Paga
            </span>
            <span className="block font-semibold text-gray-700 text-sm truncate">{fromName}</span>
          </div>
        </div>

        {/* Flecha */}
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 text-gray-400 shrink-0">
          <ArrowRight size={16} />
        </div>

        {/* Acreedor */}
        <div className="flex items-center gap-2 min-w-0 justify-end text-right">
          <div className="min-w-0">
            <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              Recibe
            </span>
            <span className="block font-semibold text-gray-700 text-sm truncate">{toName}</span>
          </div>
          <Avatar
            name={toName}
            avatarColor={toAvatarColor}
            avatarUrl={toAvatarUrl}
            className="w-9 h-9"
            textClassName="text-xs"
            frameClassName="shadow-3xs border-2 border-white"
          />
        </div>
      </div>

      {/* Fila 2: monto */}
      <div className="text-center bg-brand-primary/5 border border-brand-primary/10 rounded-xl py-2">
        <span className="font-display font-black text-brand-primary text-lg">
          ${amount.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
        </span>
      </div>

      {/* Fila 3: acción */}
      <button
        onClick={onShowPaymentDetails}
        className="w-full px-4 py-2.5 rounded-xl bg-brand-primary/5 hover:bg-brand-primary text-brand-primary hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 touch-target active:scale-95 border border-brand-primary/10 hover:border-transparent cursor-pointer"
        id="view-payment-details-btn"
      >
        <ReceiptText size={14} />
        <span>Ver datos para pagar</span>
      </button>
    </div>
  );
}
