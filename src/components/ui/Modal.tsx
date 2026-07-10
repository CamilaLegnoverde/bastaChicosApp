/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            id="modal-backdrop"
          />

          {/* Modal Content Container */}
          <motion.div
            initial={{ y: '100%', opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0.5 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative z-10 w-full sm:max-w-lg bg-brand-cream rounded-t-3xl sm:rounded-3xl shadow-2xl border border-gray-100 flex flex-col max-h-[90vh] overflow-hidden"
            id="modal-content"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h3 className="text-xl font-bold font-display text-gray-800" id="modal-title">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="p-2 -mr-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors touch-target"
                aria-label="Close modal"
                id="modal-close-btn"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6" id="modal-body">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
