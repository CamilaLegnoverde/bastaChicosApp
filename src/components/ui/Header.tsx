/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ArrowLeft } from 'lucide-react';

interface HeaderProps {
  title: string;
  onBackClick?: () => void;
  onAvatarClick?: () => void;
  avatarColor?: string;
  avatarName?: string;
}

export default function Header({
  title,
  onBackClick,
  onAvatarClick,
  avatarColor = 'bg-brand-primary',
  avatarName = 'Usuario',
}: HeaderProps) {
  const initial = avatarName ? avatarName.charAt(0).toUpperCase() : '?';

  return (
    <header
      className="sticky top-0 z-40 bg-brand-cream/80 backdrop-blur-md border-b border-gray-100 px-4 py-4 flex items-center justify-between"
      id="app-header"
    >
      <div className="flex items-center gap-3">
        {onBackClick ? (
          <button
            onClick={onBackClick}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors touch-target flex items-center justify-center"
            aria-label="Volver"
            id="header-back-btn"
          >
            <ArrowLeft size={22} />
          </button>
        ) : null}

        <h1
          className="font-display text-2xl font-extrabold tracking-tight text-brand-primary"
          id="header-title"
        >
          {title}
        </h1>
      </div>

      {onAvatarClick && (
        <button
          onClick={onAvatarClick}
          className="relative group transition-transform active:scale-95 touch-target flex items-center justify-center"
          aria-label="Ver Perfil"
          id="header-avatar-btn"
        >
          <div
            className={`w-10 h-10 rounded-full ${avatarColor} flex items-center justify-center text-white font-bold text-base shadow-sm group-hover:shadow-md transition-all border-2 border-white`}
          >
            {initial}
          </div>
        </button>
      )}
    </header>
  );
}
