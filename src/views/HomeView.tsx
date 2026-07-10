/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Flame } from 'lucide-react';
import { motion } from 'motion/react';
import { UserProfile, Hangout } from '../types';
import Header from '../components/ui/Header';
import FloatingButton from '../components/ui/FloatingButton';
import MeetingCard from '../components/cards/MeetingCard';

interface HomeViewProps {
  user: UserProfile;
  proximas: Hangout[];
  finalizadas: Hangout[];
  onOpenHangout: (id: string) => void;
  onOpenProfile: () => void;
  onNewHangout: () => void;
}

export default function HomeView({
  user,
  proximas,
  finalizadas,
  onOpenHangout,
  onOpenProfile,
  onNewHangout,
}: HomeViewProps) {
  const isEmpty = proximas.length === 0 && finalizadas.length === 0;

  return (
    <div className="flex-1 flex flex-col relative" id="home-view">
      <Header
        title="Basta chicos"
        onAvatarClick={onOpenProfile}
        avatarColor={user.avatarColor}
        avatarName={user.name}
      />

      {/* List of Juntadas */}
      <div className="flex-1 p-4 flex flex-col gap-6 overflow-y-auto" id="hangouts-scroll-container">
        {/* If no hangouts */}
        {isEmpty && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-4 mt-12" id="no-hangouts-empty-state">
            <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center text-brand-primary text-2xl">
              <Flame size={32} />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-gray-800 text-lg">¿No hay juntadas todavía?</h3>
              <p className="text-gray-400 text-xs mt-1 max-w-[240px]">
                Hacé clic en el botón flotante de abajo para organizar tu primer asado, pizza o salida.
              </p>
            </div>
          </div>
        )}

        {/* SECTION: Próximas */}
        {proximas.length > 0 && (
          <div className="flex flex-col gap-3" id="section-proximas">
            <h2 className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5 px-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Próximas
            </h2>
            <div className="flex flex-col gap-3">
              {proximas.map((h, idx) => (
                <motion.div
                  key={h.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06, duration: 0.25, ease: 'easeOut' }}
                  whileTap={{ scale: 0.97 }}
                >
                  <MeetingCard hangout={h} onClick={() => onOpenHangout(h.id)} />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION: Finalizadas */}
        {finalizadas.length > 0 && (
          <div className="flex flex-col gap-3" id="section-finalizadas">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5 px-1">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
              Finalizadas
            </h2>
            <div className="flex flex-col gap-3">
              {finalizadas.map((h, idx) => (
                <motion.div
                  key={h.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + idx * 0.06, duration: 0.25, ease: 'easeOut' }}
                  whileTap={{ scale: 0.97 }}
                >
                  <MeetingCard hangout={h} onClick={() => onOpenHangout(h.id)} />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating Create Button */}
      <FloatingButton onClick={onNewHangout} />
    </div>
  );
}
