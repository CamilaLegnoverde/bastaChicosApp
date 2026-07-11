/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * LuckyWheelModal — "Ruleta de la Suerte" en formato carrusel: las caras de
 * los integrantes de la juntada desfilan en loop infinito de derecha a
 * izquierda y, al tocar "Sortear", el carrusel desacelera hasta frenar con el
 * elegido centrado bajo el marco. Sirve para elegir "al azar" a alguien.
 *
 * Nota: el sorteo está "cargado" para caer siempre entre Iván y Cami cuando
 * alguno de ellos participa de la reunión. Si ninguno está, elige de verdad.
 */

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, useMotionValue, animate, type AnimationPlaybackControls } from 'motion/react';
import { Sparkles, PartyPopper } from 'lucide-react';
import { MemberBalance } from '../types';
import Modal from '../components/ui/Modal';
import Avatar from '../components/ui/Avatar';

interface LuckyWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: MemberBalance[];
}

const CARD_WIDTH = 96; // ancho fijo de cada tarjeta (px), clave para centrar bien
const REPEATS = 40; // repeticiones del strip: material para el loop y el recorrido
const RAFFLE_DURATION = 4.2; // segundos que dura el frenado del sorteo

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

type Phase = 'idle' | 'raffling' | 'result';

export default function LuckyWheelModal({ isOpen, onClose, members }: LuckyWheelModalProps) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [winner, setWinner] = useState<MemberBalance | null>(null);
  const [viewportW, setViewportW] = useState(300);

  const viewportRef = useRef<HTMLDivElement>(null);
  const idleControls = useRef<AnimationPlaybackControls | null>(null);
  const x = useMotionValue(0);

  const n = members.length;
  const loopWidth = n * CARD_WIDTH;

  // Strip repetido: da continuidad al loop y recorrido largo para el sorteo.
  const strip =
    n > 0
      ? Array.from({ length: REPEATS }, (_, rep) =>
          members.map((m, i) => ({ m, key: `${rep}-${m.id}`, index: rep * n + i }))
        ).flat()
      : [];

  // Mide el ancho real del viewport para centrar el elegido en cualquier pantalla.
  useLayoutEffect(() => {
    if (!isOpen) return;
    const measure = () => {
      if (viewportRef.current) setViewportW(viewportRef.current.offsetWidth);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [isOpen]);

  /** Arranca el loop infinito de derecha a izquierda desde la posición actual. */
  const startIdleLoop = () => {
    if (n === 0 || loopWidth === 0) return;
    idleControls.current?.stop();
    idleControls.current = animate(x, x.get() - loopWidth, {
      duration: Math.max(n, 3) * 0.8,
      ease: 'linear',
      repeat: Infinity,
      repeatType: 'loop',
    });
  };

  // Ciclo de vida del loop: activo mientras el modal está abierto y en 'idle'.
  useEffect(() => {
    if (!isOpen || phase !== 'idle' || n === 0) return;
    startIdleLoop();
    return () => idleControls.current?.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, phase, n, viewportW]);

  const spin = () => {
    if (phase === 'raffling' || n === 0) return;

    setWinner(null);
    setPhase('raffling');
    idleControls.current?.stop();

    // Ganador "cargado": si hay algún afortunado (Iván / Cami) presente, cae
    // entre ellos; si no, elige de verdad entre todos.
    const luckyIndexes = members
      .map((m, i) => (isLucky(m.name) ? i : -1))
      .filter((i) => i >= 0);
    const pool = luckyIndexes.length > 0 ? luckyIndexes : members.map((_, i) => i);
    const winnerIndex = pool[Math.floor(Math.random() * pool.length)];

    // Tarjeta objetivo en una repetición tardía → recorrido largo hacia la izq.
    const k = (REPEATS - 3) * n + winnerIndex;
    const targetX = viewportW / 2 - CARD_WIDTH / 2 - k * CARD_WIDTH;

    animate(x, targetX, {
      duration: RAFFLE_DURATION,
      ease: [0.16, 1, 0.3, 1], // easeOut: desacelera y frena suave
    }).then(() => {
      setWinner(members[winnerIndex]);
      setPhase('result');
    });
  };

  const spinAgain = () => {
    // Normaliza la posición para que x no crezca sin límite y retoma el loop.
    if (loopWidth > 0) x.set(x.get() % loopWidth);
    setWinner(null);
    setPhase('idle');
  };

  const handleClose = () => {
    if (phase === 'raffling') return;
    idleControls.current?.stop();
    setWinner(null);
    setPhase('idle');
    x.set(0);
    onClose();
  };

  const buttonLabel =
    phase === 'raffling' ? 'Sorteando...' : phase === 'result' ? 'Sortear de nuevo' : '¡Sortear!';

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="🎡 Ruleta de la Suerte">
      <div className="flex flex-col items-center gap-6">
        <p className="text-xs text-gray-500 text-center max-w-xs">
          Las caras de los{' '}
          <span className="font-bold text-gray-700">{n}</span> integrantes desfilan sin parar.
          Tocá <span className="font-bold text-gray-700">Sortear</span> y se van frenando en el
          elegido.
        </p>

        {n === 0 ? (
          <div className="text-sm text-gray-400 py-10 text-center">
            No hay integrantes para sortear.
          </div>
        ) : (
          <>
            {/* Carrusel */}
            <div className="relative w-full max-w-[300px]">
              {/* Puntero superior */}
              <div
                className="absolute -top-1 left-1/2 -translate-x-1/2 z-30"
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: '10px solid transparent',
                  borderRight: '10px solid transparent',
                  borderTop: '16px solid var(--color-brand-primary, #7c3aed)',
                  filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.2))',
                }}
              />

              {/* Viewport */}
              <div
                ref={viewportRef}
                className="relative h-40 overflow-hidden rounded-3xl bg-brand-warm-bg border border-gray-100"
              >
                {/* Marco central de selección */}
                <div
                  className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 rounded-2xl ring-2 pointer-events-none transition-all duration-300 ${
                    phase === 'result'
                      ? 'ring-brand-accent shadow-lg scale-105'
                      : 'ring-brand-primary/70'
                  }`}
                  style={{ width: CARD_WIDTH - 8, height: 132 }}
                />

                {/* Fades laterales */}
                <div className="absolute inset-y-0 left-0 w-10 z-10 bg-gradient-to-r from-brand-warm-bg to-transparent pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-10 z-10 bg-gradient-to-l from-brand-warm-bg to-transparent pointer-events-none" />

                {/* Strip de caras */}
                <motion.div className="flex h-full items-center" style={{ x }}>
                  {strip.map(({ m, key }) => (
                    <div
                      key={key}
                      className="shrink-0 flex flex-col items-center justify-center gap-2 px-2"
                      style={{ width: CARD_WIDTH }}
                    >
                      <Avatar
                        name={m.name}
                        avatarColor={m.avatarColor}
                        avatarUrl={m.avatarUrl}
                        className="w-16 h-16"
                        textClassName="text-xl"
                        rounded="rounded-2xl"
                        frameClassName="border-2 border-white shadow-3xs"
                      />
                      <span className="text-[11px] font-display font-extrabold text-gray-700 max-w-full truncate">
                        {m.name.split(' ')[0]}
                      </span>
                    </div>
                  ))}
                </motion.div>
              </div>
            </div>

            {/* Resultado */}
            {winner && phase === 'result' && (
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

            {/* Botón sortear */}
            <button
              onClick={phase === 'result' ? spinAgain : spin}
              disabled={phase === 'raffling'}
              className="w-full bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-60 disabled:cursor-not-allowed text-white font-display font-extrabold text-sm py-4 rounded-2xl shadow-xs transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2 touch-target"
            >
              <Sparkles size={18} strokeWidth={2.5} className={phase === 'raffling' ? 'animate-pulse' : ''} />
              <span>{buttonLabel}</span>
            </button>
          </>
        )}
      </div>
    </Modal>
  );
}
