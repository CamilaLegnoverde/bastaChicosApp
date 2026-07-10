/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Pantalla de PIN de acceso. Se muestra al abrir la app cuando no hay
 * ningún usuario logueado. El valor se ingresa sólo con el teclado
 * numérico en pantalla; el input que lo muestra está deshabilitado.
 */

import { useState } from 'react';
import { Delete, Lock } from 'lucide-react';

// PIN configurable por env var (VITE_APP_PIN en .env); '1911' como fallback
const APP_PIN = import.meta.env.VITE_APP_PIN || '1911';
const PIN_LENGTH = APP_PIN.length;

interface PinViewProps {
  onSuccess: () => void;
}

export default function PinView({ onSuccess }: PinViewProps) {
  const [pin, setPin] = useState('');
  const [hasError, setHasError] = useState(false);

  const pressDigit = (digit: string) => {
    if (hasError || pin.length >= PIN_LENGTH) return;

    const next = pin + digit;
    setPin(next);

    if (next.length === PIN_LENGTH) {
      if (next === APP_PIN) {
        onSuccess();
      } else {
        setHasError(true);
        setTimeout(() => {
          setPin('');
          setHasError(false);
        }, 700);
      }
    }
  };

  const pressBackspace = () => {
    if (hasError) return;
    setPin((prev) => prev.slice(0, -1));
  };

  const keypadDigits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-8 p-8" id="pin-view">
      {/* Encabezado */}
      <div className="flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-3xl bg-brand-primary flex items-center justify-center text-white shadow-md">
          <Lock size={28} />
        </div>
        <div className="text-center">
          <h1 className="font-display font-extrabold text-2xl text-gray-800">Basta chicos</h1>
          <p className="text-xs text-gray-400 font-medium mt-1">
            Ingresá el PIN para continuar
          </p>
        </div>
      </div>

      {/* Input deshabilitado que muestra el valor ingresado */}
      <div className="flex flex-col items-center gap-2 w-full max-w-[220px]">
        <input
          type="password"
          value={pin}
          disabled
          placeholder={'·'.repeat(PIN_LENGTH)}
          aria-label="PIN ingresado"
          className={`w-full text-center text-3xl tracking-[0.5em] font-display font-extrabold rounded-2xl border-2 py-3 bg-white shadow-2xs outline-none transition-colors ${
            hasError
              ? 'border-red-400 text-red-500 animate-pulse'
              : 'border-gray-200 text-gray-700'
          }`}
          id="pin-display-input"
        />
        <span
          className={`text-[11px] font-bold h-4 ${hasError ? 'text-red-500' : 'text-transparent'}`}
        >
          PIN incorrecto, probá de nuevo
        </span>
      </div>

      {/* Teclado numérico */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-[260px]" id="pin-keypad">
        {keypadDigits.map((digit) => (
          <button
            key={digit}
            type="button"
            onClick={() => pressDigit(digit)}
            className="aspect-square rounded-2xl bg-white border border-gray-100 shadow-2xs text-2xl font-display font-bold text-gray-700 hover:border-brand-primary hover:text-brand-primary active:scale-95 transition-all cursor-pointer touch-target"
          >
            {digit}
          </button>
        ))}

        {/* Celda vacía para alinear el 0 al centro */}
        <span />

        <button
          type="button"
          onClick={() => pressDigit('0')}
          className="aspect-square rounded-2xl bg-white border border-gray-100 shadow-2xs text-2xl font-display font-bold text-gray-700 hover:border-brand-primary hover:text-brand-primary active:scale-95 transition-all cursor-pointer touch-target"
        >
          0
        </button>

        <button
          type="button"
          onClick={pressBackspace}
          aria-label="Borrar"
          className="aspect-square rounded-2xl bg-gray-50 border border-gray-100 shadow-2xs flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 active:scale-95 transition-all cursor-pointer touch-target"
        >
          <Delete size={24} />
        </button>
      </div>
    </div>
  );
}
