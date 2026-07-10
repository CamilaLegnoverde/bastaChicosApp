/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Friend } from '../../types';
import { Check } from 'lucide-react';

interface FriendCardProps {
  key?: any;
  friend: Friend;
  isSelected?: boolean;
  onSelect?: () => void;
  showSelection?: boolean;
}

export default function FriendCard({
  friend,
  isSelected = false,
  onSelect,
  showSelection = false,
}: FriendCardProps) {
  const { name, aliasMP, code, avatarColor } = friend;
  const initial = name ? name.charAt(0).toUpperCase() : '?';

  return (
    <div
      onClick={onSelect}
      className={`bg-white rounded-2xl p-4 border transition-all flex items-center justify-between gap-3 ${
        onSelect ? 'cursor-pointer active:scale-98' : ''
      } ${
        isSelected
          ? 'border-brand-primary bg-violet-50/20 shadow-xs'
          : 'border-gray-100 hover:border-gray-200'
      }`}
      id={`friend-card-${friend.id}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Avatar badge */}
        <div
          className={`w-10 h-10 rounded-full ${avatarColor} flex items-center justify-center text-white font-bold text-sm shrink-0 border-2 border-white shadow-3xs`}
        >
          {initial}
        </div>

        <div className="min-w-0">
          <h4 className="font-bold text-gray-800 text-sm sm:text-base leading-none truncate">
            {name}
          </h4>

          {aliasMP && (
            <p className="text-xs text-gray-400 mt-1 font-medium truncate">
              Alias: <span className="text-gray-500 font-semibold">{aliasMP}</span>
            </p>
          )}

          <div className="text-[10px] text-gray-400 mt-0.5 font-medium">
            Código: <span className="font-mono bg-gray-50 px-1 py-0.5 rounded-sm text-gray-500">{code}</span>
          </div>
        </div>
      </div>

      {showSelection && onSelect && (
        <div
          className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all shrink-0 ${
            isSelected
              ? 'bg-brand-primary border-brand-primary text-white'
              : 'border-gray-200 bg-white'
          }`}
        >
          {isSelected && <Check size={14} strokeWidth={3} />}
        </div>
      )}
    </div>
  );
}
