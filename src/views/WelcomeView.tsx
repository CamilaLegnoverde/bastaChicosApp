/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Segunda pantalla (ingreso). Muestra un carrusel con los usuarios que
 * ya existen en la app (foto de perfil o inicial) más una opción final
 * "+" para crear uno nuevo. Tocar un usuario entra directo con ese perfil;
 * el "+" abre el formulario de nombre (que sigue con el alias de pago).
 */

import React, { useState } from 'react';
import { Plus, ArrowLeft } from 'lucide-react';
import { UserProfile } from '../types';
import Logo from '../components/ui/Logo';
import Avatar from '../components/ui/Avatar';

interface WelcomeViewProps {
  profiles: UserProfile[];
  onSelectExisting: (profile: UserProfile) => void;
  onSubmit: (name: string) => void;
}

export default function WelcomeView({ profiles, onSelectExisting, onSubmit }: WelcomeViewProps) {
  // El alta por nombre se muestra cuando el usuario toca "+" (o si no hay
  // usuarios previos). No fijamos el modo al montar, porque los perfiles
  // pueden llegar de forma asíncrona después del primer render.
  const [wantsNewName, setWantsNewName] = useState(false);
  const [inputName, setInputName] = useState('');

  const mode: 'carousel' | 'newName' =
    !wantsNewName && profiles.length > 0 ? 'carousel' : 'newName';

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

      {mode === 'carousel' ? (
        /* ----- Carrusel de usuarios existentes ----- */
        <div className="flex flex-col gap-4 mb-8" id="welcome-carousel">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider text-center">
            ¿Quién sos?
          </p>

          <div
            className="flex gap-4 overflow-x-auto pb-2 px-1 snap-x snap-mandatory scrollbar-none"
            id="welcome-carousel-track"
          >
            {profiles.map((profile) => (
              <button
                key={profile.id}
                onClick={() => onSelectExisting(profile)}
                className="snap-start shrink-0 flex flex-col items-center gap-2 w-32 group cursor-pointer active:scale-95 transition-transform"
                id={`welcome-user-${profile.id}`}
              >
                <Avatar
                  name={profile.name}
                  avatarColor={profile.avatarColor}
                  avatarUrl={profile.avatarUrl}
                  className="w-32 h-44"
                  textClassName="text-5xl font-extrabold"
                  rounded="rounded-3xl"
                  frameClassName="border-2 border-white shadow-md group-hover:border-brand-primary transition-colors"
                />
                <span className="text-sm font-semibold text-gray-600 truncate max-w-full text-center">
                  {profile.name}
                </span>
              </button>
            ))}

            {/* Opción: agregar usuario nuevo */}
            <button
              onClick={() => setWantsNewName(true)}
              className="snap-start shrink-0 flex flex-col items-center gap-2 w-32 group cursor-pointer active:scale-95 transition-transform"
              id="welcome-add-user"
            >
              <div className="w-32 h-44 rounded-3xl border-2 border-dashed border-gray-300 group-hover:border-brand-primary bg-gray-50 group-hover:bg-brand-primary/5 flex items-center justify-center text-gray-400 group-hover:text-brand-primary transition-colors">
                <Plus size={44} strokeWidth={2.5} />
              </div>
              <span className="text-sm font-semibold text-gray-500 group-hover:text-brand-primary transition-colors text-center">
                Nuevo
              </span>
            </button>
          </div>

          <p className="text-[11px] text-gray-400 px-1 text-center">
            Tocá tu foto para entrar, o «Nuevo» para crear un usuario.
          </p>
        </div>
      ) : (
        /* ----- Alta por nombre (usuario nuevo) ----- */
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-8">
          {profiles.length > 0 && (
            <button
              type="button"
              onClick={() => setWantsNewName(false)}
              className="self-start flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-brand-primary transition-colors cursor-pointer"
              id="welcome-back-to-carousel"
            >
              <ArrowLeft size={14} />
              <span>Volver a los usuarios</span>
            </button>
          )}

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
              autoFocus
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
      )}
    </div>
  );
}
