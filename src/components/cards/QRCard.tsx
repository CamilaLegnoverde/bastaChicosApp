/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface QRCardProps {
  code: string;
  name: string;
}

export default function QRCard({ code, name }: QRCardProps) {
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
          Para que {name.split(' ')[0]} te agregue al toque
        </p>
      </div>

      {/* Styled Mock QR Box */}
      <div className="relative p-4 rounded-2xl bg-brand-primary/5 border border-gray-100/50 shadow-inner flex items-center justify-center">
        <svg
          width="160"
          height="160"
          viewBox="0 0 100 100"
          className="text-gray-800"
          aria-hidden="true"
        >
          {/* QR Corner Finder Pattern: Top Left */}
          <rect x="5" y="5" width="25" height="25" rx="4" fill="currentColor" />
          <rect x="9" y="9" width="17" height="17" rx="2" fill="white" />
          <rect x="13" y="13" width="9" height="9" rx="1" fill="currentColor" />

          {/* QR Corner Finder Pattern: Top Right */}
          <rect x="70" y="5" width="25" height="25" rx="4" fill="currentColor" />
          <rect x="74" y="9" width="17" height="17" rx="2" fill="white" />
          <rect x="78" y="13" width="9" height="9" rx="1" fill="currentColor" />

          {/* QR Corner Finder Pattern: Bottom Left */}
          <rect x="5" y="70" width="25" height="25" rx="4" fill="currentColor" />
          <rect x="9" y="74" width="17" height="17" rx="2" fill="white" />
          <rect x="13" y="78" width="9" height="9" rx="1" fill="currentColor" />

          {/* QR Alignment Block: Bottom Right */}
          <rect x="76" y="76" width="9" height="9" rx="1" fill="currentColor" />
          <rect x="79" y="79" width="3" height="3" rx="0.5" fill="white" />

          {/* Random QR Pixels (Mock Data) */}
          {/* Col 1 */}
          <rect x="35" y="5" width="6" height="6" rx="1.5" fill="currentColor" />
          <rect x="35" y="15" width="6" height="6" rx="1.5" fill="currentColor" />
          <rect x="45" y="10" width="6" height="6" rx="1.5" fill="currentColor" />
          <rect x="55" y="5" width="6" height="12" rx="1.5" fill="currentColor" />
          {/* Col 2 */}
          <rect x="5" y="35" width="6" height="6" rx="1.5" fill="currentColor" />
          <rect x="15" y="45" width="12" height="6" rx="1.5" fill="currentColor" />
          <rect x="10" y="55" width="6" height="12" rx="1.5" fill="currentColor" />
          {/* Col 3 */}
          <rect x="35" y="35" width="12" height="12" rx="2" fill="currentColor" />
          <rect x="55" y="30" width="12" height="6" rx="1.5" fill="currentColor" />
          <rect x="50" y="45" width="6" height="12" rx="1.5" fill="currentColor" />
          {/* Col 4 */}
          <rect x="75" y="35" width="6" height="12" rx="1.5" fill="currentColor" />
          <rect x="85" y="45" width="10" height="6" rx="1.5" fill="currentColor" />
          <rect x="75" y="55" width="12" height="6" rx="1.5" fill="currentColor" />
          {/* Col 5 */}
          <rect x="35" y="55" width="6" height="12" rx="1.5" fill="currentColor" />
          <rect x="45" y="75" width="12" height="6" rx="1.5" fill="currentColor" />
          <rect x="55" y="85" width="12" height="10" rx="2" fill="currentColor" />
          {/* Col 6 */}
          <rect x="35" y="85" width="12" height="6" rx="1.5" fill="currentColor" />
          <rect x="55" y="70" width="6" height="6" rx="1.5" fill="currentColor" />
          <rect x="85" y="65" width="10" height="6" rx="1.5" fill="currentColor" />
        </svg>

        {/* Small center logo decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 py-1 rounded-md border border-gray-100 shadow-xs">
          <span className="font-display font-black text-xs text-brand-primary">B</span>
        </div>
      </div>

      <div className="text-center font-mono mt-1">
        <span className="text-[10px] text-gray-400 block font-sans font-medium">CÓDIGO ÚNICO</span>
        <span className="text-sm font-bold text-gray-700 bg-gray-50 border border-gray-100 px-3 py-1 rounded-lg">
          {code}
        </span>
      </div>
    </div>
  );
}
