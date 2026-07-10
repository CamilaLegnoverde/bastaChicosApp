/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Plus } from 'lucide-react';
import { motion } from 'motion/react';

interface FloatingButtonProps {
  onClick: () => void;
  label?: string;
}

export default function FloatingButton({ onClick, label = 'Nueva juntada' }: FloatingButtonProps) {
  return (
    /* Contenedor fijo al viewport, alineado a la columna central (max-w-md) */
    <div className="fixed bottom-6 inset-x-0 z-30 flex justify-center pointer-events-none">
      <div className="w-full max-w-md flex justify-end px-6">
        <motion.button
          onClick={onClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="pointer-events-auto bg-brand-primary hover:bg-brand-primary/90 text-white shadow-lg hover:shadow-xl px-5 py-3.5 rounded-full flex items-center gap-2 font-display font-bold text-sm tracking-wide transition-all group cursor-pointer border-2 border-white ring-4 ring-brand-primary/10"
          id="floating-new-meeting-btn"
        >
          <Plus size={20} strokeWidth={2.5} className="group-hover:rotate-90 transition-transform duration-200" />
          <span className="hidden xs:inline">{label}</span>
        </motion.button>
      </div>
    </div>
  );
}
