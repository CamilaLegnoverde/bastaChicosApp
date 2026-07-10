/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Edit, Copy, UserPlus } from 'lucide-react';
import { UserProfile, Friend } from '../types';
import Header from '../components/ui/Header';
import QRCard from '../components/cards/QRCard';
import FriendCard from '../components/cards/FriendCard';

interface ProfileViewProps {
  user: UserProfile;
  friends: Friend[];
  onBack: () => void;
  onEditProfile: () => void;
  onAddFriend: () => void;
  onCopyText: (text: string, label: string) => void;
}

export default function ProfileView({
  user,
  friends,
  onBack,
  onEditProfile,
  onAddFriend,
  onCopyText,
}: ProfileViewProps) {
  return (
    <div className="flex-1 flex flex-col" id="profile-view">
      <Header title="Mi Perfil" onBackClick={onBack} />

      <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-6" id="profile-scroll-container">
        {/* Profile Card Summary */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs flex flex-col items-center text-center relative overflow-hidden" id="profile-summary-box">
          {/* Avatar circle */}
          <div className={`w-20 h-20 rounded-full ${user.avatarColor} flex items-center justify-center text-white text-3xl font-extrabold border-4 border-white shadow-md mb-3`}>
            {user.name.charAt(0).toUpperCase()}
          </div>

          <h2 className="font-display font-extrabold text-2xl text-gray-800" id="profile-user-name">
            {user.name}
          </h2>

          {user.aliasMP ? (
            <p className="text-xs font-bold text-brand-accent bg-brand-accent-light/60 px-3 py-1 rounded-full mt-1.5 border border-emerald-100">
              Alias MP: <span className="font-semibold">{user.aliasMP}</span>
            </p>
          ) : (
            <p className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full mt-1.5 border border-amber-100">
              Sin alias de pago — agregalo en «Editar datos»
            </p>
          )}

          {/* Optional bank accounts */}
          {(user.cbu || user.cvu) && (
            <div className="mt-3 flex flex-col gap-1 text-left w-full text-xs text-gray-500 border-t border-gray-50 pt-3">
              {user.cbu && (
                <div className="flex justify-between items-center bg-gray-50 p-2 rounded-xl border border-gray-100">
                  <span>CBU: <span className="font-mono text-gray-700 font-bold">{user.cbu}</span></span>
                  <button
                    onClick={() => onCopyText(user.cbu!, 'CBU')}
                    className="p-1 hover:bg-gray-200 text-gray-400 hover:text-gray-600 rounded-sm"
                  >
                    <Copy size={12} />
                  </button>
                </div>
              )}
              {user.cvu && (
                <div className="flex justify-between items-center bg-gray-50 p-2 rounded-xl border border-gray-100">
                  <span>CVU: <span className="font-mono text-gray-700 font-bold">{user.cvu}</span></span>
                  <button
                    onClick={() => onCopyText(user.cvu!, 'CVU')}
                    className="p-1 hover:bg-gray-200 text-gray-400 hover:text-gray-600 rounded-sm"
                  >
                    <Copy size={12} />
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            onClick={onEditProfile}
            className="mt-4 px-4 py-2 bg-gray-50 border border-gray-100 hover:bg-gray-100 text-gray-600 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer touch-target active:scale-95 transition-all"
            id="edit-profile-btn"
          >
            <Edit size={12} />
            <span>Editar datos</span>
          </button>
        </div>

        {/* QR and Invitation Code */}
        <QRCard code={user.code} name={user.name} />

        {/* Friends Section */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-display font-extrabold text-base text-gray-800">
              Mis amigos ({friends.length})
            </h3>
            <button
              onClick={onAddFriend}
              className="text-brand-primary hover:text-brand-primary/80 font-bold text-xs flex items-center gap-1 cursor-pointer touch-target"
              id="add-friend-trigger-btn"
            >
              <UserPlus size={14} />
              <span>Agregar amigo</span>
            </button>
          </div>

          <div className="flex flex-col gap-2.5" id="friends-list-box">
            {friends.map((friend) => (
              <FriendCard key={friend.id} friend={friend} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
