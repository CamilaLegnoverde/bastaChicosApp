/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Logo de la app. Usa /logo.png (public/logo.png, imagen 1:1 con fondo
 * transparente). Si el archivo no existe todavía, cae a la letra "B".
 */

import { useState } from 'react';

interface LogoProps {
  /** Clases de tamaño/borde del contenedor (ej: "w-24 h-24 rounded-[32px]") */
  className?: string;
  /** Tamaño de la letra del fallback (ej: "text-5xl") */
  fallbackTextClass?: string;
}

export default function Logo({
  className = 'w-24 h-24 rounded-[32px]',
  fallbackTextClass = 'text-5xl',
}: LogoProps) {
  const [imageFailed, setImageFailed] = useState(false);

  if (imageFailed) {
    return (
      <div
        className={`${className} bg-brand-primary flex items-center justify-center text-white ${fallbackTextClass} font-extrabold shadow-md border-4 border-white overflow-hidden`}
      >
        B
      </div>
    );
  }

  return (
    <div
      className={`${className} bg-brand-primary/10 shadow-md border-4 border-white overflow-hidden flex items-center justify-center`}
    >
      <img
        src="/logo.png"
        alt="Basta chicos"
        className="w-full h-full object-contain"
        onError={() => setImageFailed(true)}
      />
    </div>
  );
}
