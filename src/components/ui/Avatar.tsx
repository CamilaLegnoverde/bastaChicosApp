/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Avatar de una persona. Muestra la foto de perfil (avatarUrl) si existe;
 * si no, cae a un círculo de color plano con la inicial del nombre.
 * Centraliza el patrón que antes estaba repetido en cada tarjeta.
 */

import { useState } from 'react';

interface AvatarProps {
  name: string;
  avatarColor: string;
  avatarUrl?: string;
  /** Clases de tamaño del contenedor (ej: 'w-10 h-10'). */
  className?: string;
  /** Tamaño de la inicial del fallback (ej: 'text-sm'). */
  textClassName?: string;
  /** Clases de borde/sombra (ej: 'border-2 border-white shadow-3xs'). */
  frameClassName?: string;
  /** Forma del avatar (ej: 'rounded-full' círculo, 'rounded-2xl' rectángulo). */
  rounded?: string;
  title?: string;
}

export default function Avatar({
  name,
  avatarColor,
  avatarUrl,
  className = 'w-10 h-10',
  textClassName = 'text-sm',
  frameClassName = 'border-2 border-white shadow-3xs',
  rounded = 'rounded-full',
  title,
}: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const initial = name ? name.charAt(0).toUpperCase() : '?';
  const base = `${className} ${frameClassName} ${rounded} overflow-hidden flex items-center justify-center shrink-0`;

  if (avatarUrl && !failed) {
    return (
      <div className={base} title={title ?? name}>
        <img
          src={avatarUrl}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setFailed(true)}
        />
      </div>
    );
  }

  return (
    <div className={`${base} ${avatarColor} text-white font-bold ${textClassName}`} title={title ?? name}>
      {initial}
    </div>
  );
}
