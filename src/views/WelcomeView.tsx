/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import Logo from '../components/ui/Logo';

interface WelcomeViewProps {
  onSubmit: (name: string) => void;
}

export default function WelcomeView({ onSubmit }: WelcomeViewProps) {
  const [inputName, setInputName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputName.trim()) return;
    onSubmit(inputName.trim());
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-8" id="welcome-view">
      {/* Logo and Greeting */}
      <div className="flex-1 flex flex-col justify-center items-center gap-6 mt-8">
        <div className="animate-bounce">
          <Logo className="w-24 h-24 rounded-[32px]" fallbackTextClass="text-5xl" />
        </div>
        <div className="text-center">
          <h1 className="font-display font-extrabold text-4xl text-gray-800 tracking-tight leading-none">
            Basta chicos
          </h1>
          <p className="text-gray-400 font-medium text-sm mt-2 max-w-xs">
            Organizá juntadas con amigos y dividí los gastos al toque, sin vueltas.
          </p>
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-8">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="nickname" className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            ¿Cómo te llamás?
          </label>
          <input
            type="text"
            id="nickname"
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
            placeholder="Ej: Camila, Lucas, Flor"
            required
            maxLength={25}
            className="w-full bg-white border border-gray-200 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 rounded-2xl px-5 py-4 font-semibold text-gray-700 outline-none transition-all placeholder:text-gray-300 text-lg shadow-2xs"
          />
          <p className="text-[11px] text-gray-400 px-1">
            Si ya usaste Basta chicos con este nombre o tu alias de pago, entrás directo con tu
            usuario existente.
          </p>
        </div>

        <button
          type="submit"
          className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-display font-extrabold text-base py-4 rounded-2xl shadow-md transition-transform active:scale-98 cursor-pointer touch-target"
          id="welcome-continue-btn"
        >
          Continuar
        </button>
      </form>
    </div>
  );
}
