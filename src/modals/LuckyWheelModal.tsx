/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * LuckyWheelModal — Ruleta de la suerte que gira entre todos los integrantes
 * de una juntada. Sirve para elegir "al azar" a alguien (por ejemplo, quién
 * paga la próxima ronda o hace un reto).
 *
 * Nota: la ruleta está "cargada" para caer siempre entre Iván y Cami cuando
 * alguno de ellos participa de la reunión. Si ninguno está, gira de verdad.
 */

import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, RotateCw, PartyPopper } from 'lucide-react';
import { MemberBalance } from '../types';
import Modal from '../components/ui/Modal';

interface LuckyWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: MemberBalance[];
}

// Paleta de colores para los gajos de la ruleta (se cicla si hay más gente).
const SEGMENT_COLORS = [
  '#7c3aed', // violet-600
  '#2563eb', // blue-600
  '#db2777', // pink-600
  '#f59e0b', // amber-500
  '#059669', // emerald-600
  '#6366f1', // indigo-500
  '#e11d48', // rose-600
  '#0891b2', // cyan-600
];

const SPIN_DURATION = 4.2; // segundos que dura el giro

/** Normaliza un texto: minúsculas y sin tildes, para comparar nombres. */
const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

/** ¿El nombre corresponde a Iván o a Cami/Camila? */
const isLucky = (name: string) => {
  const n = normalize(name);
  return /\bivan\b/.test(n) || /\bcami(la)?\b/.test(n) || n.includes('ivan') || n.includes('cami');
};

export default function LuckyWheelModal({ isOpen, onClose, members }: LuckyWheelModalProps) {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<MemberBalance | null>(null);

  const n = members.length;
  const seg = n > 0 ? 360 / n : 360;

  // Fondo de la ruleta con gajos de colores (conic-gradient con cortes duros).
  const wheelBackground = useMemo(() => {
    if (n === 0) return '#e5e7eb';
    const stops = members
      .map((_, i) => {
        const color = SEGMENT_COLORS[i % SEGMENT_COLORS.length];
        return `${color} ${i * seg}deg ${(i + 1) * seg}deg`;
      })
      .join(', ');
    return `conic-gradient(${stops})`;
  }, [members, n, seg]);

  const spin = () => {
    if (isSpinning || n === 0) return;

    setWinner(null);
    setIsSpinning(true);

    // Ganador "cargado": si hay algún afortunado (Iván / Cami) presente, cae
    // entre ellos; si no, gira de verdad entre todos.
    const luckyIndexes = members
      .map((m, i) => (isLucky(m.name) ? i : -1))
      .filter((i) => i >= 0);
    const pool = luckyIndexes.length > 0 ? luckyIndexes : members.map((_, i) => i);
    const winnerIndex = pool[Math.floor(Math.random() * pool.length)];

    // Ángulo (desde arriba, en sentido horario) del centro del gajo ganador.
    const center = winnerIndex * seg + seg / 2;
    const extraSpins = 6;

    // Siempre girar hacia adelante: partimos del próximo múltiplo de 360.
    setRotation((prev) => {
      const base = Math.ceil(prev / 360) * 360;
      return base + extraSpins * 360 + (360 - center);
    });

    // Al terminar la animación, anunciamos al ganador.
    window.setTimeout(() => {
      setWinner(members[winnerIndex]);
      setIsSpinning(false);
    }, SPIN_DURATION * 1000);
  };

  const handleClose = () => {
    if (isSpinning) return;
    setWinner(null);
    setRotation(0);
    onClose();
  };

  const radius = 108; // radio donde se ubican los nombres

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="🎡 Ruleta de la Suerte">
      <div className="flex flex-col items-center gap-6">
        <p className="text-xs text-gray-500 text-center max-w-xs">
          Girá la ruleta para elegir a alguien al azar entre los{' '}
          <span className="font-bold text-gray-700">{n}</span> integrantes de la juntada.
        </p>

        {n === 0 ? (
          <div className="text-sm text-gray-400 py-10 text-center">
            No hay integrantes para sortear.
          </div>
        ) : (
          <>
            {/* Ruleta */}
            <div className="relative w-[280px] h-[280px] flex items-center justify-center">
              {/* Puntero superior */}
              <div
                className="absolute -top-1 left-1/2 -translate-x-1/2 z-20"
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: '14px solid transparent',
                  borderRight: '14px solid transparent',
                  borderTop: '22px solid #111827',
                  filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.25))',
                }}
              />

              {/* Rueda giratoria */}
              <motion.div
                className="w-[260px] h-[260px] rounded-full relative shadow-xl border-[6px] border-white ring-2 ring-gray-200"
                style={{ background: wheelBackground }}
                animate={{ rotate: rotation }}
                transition={{ duration: SPIN_DURATION, ease: [0.16, 1, 0.3, 1] }}
              >
                {members.map((m, i) => {
                  const angle = i * seg + seg / 2;
                  return (
                    <div
                      key={m.id}
                      className="absolute left-1/2 top-1/2"
                      style={{ width: 0, height: 0, transform: `rotate(${angle}deg)` }}
                    >
                      <span
                        className="block text-white font-display font-extrabold text-[11px] whitespace-nowrap"
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: -radius,
                          transform: 'translate(-50%, -50%)',
                          textShadow: '0 1px 2px rgba(0,0,0,0.45)',
                        }}
                      >
                        {m.name.split(' ')[0]}
                      </span>
                    </div>
                  );
                })}
              </motion.div>

              {/* Centro de la ruleta */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-14 h-14 rounded-full bg-white shadow-lg border-4 border-gray-100 flex items-center justify-center">
                <Sparkles size={22} className="text-brand-primary" />
              </div>
            </div>

            {/* Resultado */}
            {winner && !isSpinning && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full bg-brand-accent-light/60 border border-emerald-100 rounded-2xl px-4 py-3 flex items-center justify-center gap-2 text-emerald-700"
              >
                <PartyPopper size={18} className="text-brand-accent shrink-0" />
                <span className="text-sm font-semibold">
                  ¡Salió <span className="font-display font-extrabold">{winner.name.split(' ')[0]}</span>! 🎉
                </span>
              </motion.div>
            )}

            {/* Botón girar */}
            <button
              onClick={spin}
              disabled={isSpinning}
              className="w-full bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-60 disabled:cursor-not-allowed text-white font-display font-extrabold text-sm py-4 rounded-2xl shadow-xs transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2 touch-target"
            >
              <RotateCw size={18} strokeWidth={2.5} className={isSpinning ? 'animate-spin' : ''} />
              <span>{isSpinning ? 'Girando...' : winner ? 'Girar de nuevo' : '¡Girar la ruleta!'}</span>
            </button>
          </>
        )}
      </div>
    </Modal>
  );
}
