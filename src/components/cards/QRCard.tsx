/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Tarjeta con el QR de invitación real. Codifica una URL a la app con el
 * código del usuario (?add=CÓDIGO); al escanearla desde cualquier cámara
 * se abre la app y se ofrece agregar a esa persona como amigo.
 */

import { QRCodeSVG } from 'qrcode.react';
import { Copy } from 'lucide-react';
import { buildInviteUrl } from '../../utils/invite';

interface QRCardProps {
  code: string;
  name: string;
  /** Copia texto al portapapeles (para el botón «Copiar link»). */
  onCopyText?: (text: string, label: string) => void;
}

export default function QRCard({ code, name, onCopyText }: QRCardProps) {
  const inviteUrl = buildInviteUrl(code);

  return (
    <div
      className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-4 w-full max-w-xs mx-auto"
      id="qr-card"
    >
      <div className="text-center">
        <h4 className="font-display font-extrabold text-gray-800 text-sm">
          QR de Invitación
        </h4>
        <p className="text-xs text-gray-400 mt-0.5">
          Escaneándolo, {name.split(' ')[0]} te agrega al toque
        </p>
      </div>

      {/* QR real */}
      <div className="relative p-4 rounded-2xl bg-white border border-gray-100 shadow-inner flex items-center justify-center">
        <QRCodeSVG
          value={inviteUrl}
          size={176}
          bgColor="#ffffff"
          fgColor="#6C5CE7"
          level="H"
          marginSize={1}
          imageSettings={{
            src: '/logo.png',
            height: 36,
            width: 36,
            excavate: true,
          }}
        />
      </div>

      <div className="text-center font-mono mt-1">
        <span className="text-[10px] text-gray-400 block font-sans font-medium">CÓDIGO ÚNICO</span>
        <span className="text-sm font-bold text-gray-700 bg-gray-50 border border-gray-100 px-3 py-1 rounded-lg">
          {code}
        </span>
      </div>

      {onCopyText && (
        <button
          onClick={() => onCopyText(inviteUrl, 'Link de invitación')}
          className="flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:text-brand-primary/80 transition-colors cursor-pointer touch-target"
          id="copy-invite-link-btn"
        >
          <Copy size={13} />
          <span>Copiar link de invitación</span>
        </button>
      )}
    </div>
  );
}
