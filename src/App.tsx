/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * App.tsx — Estado global y composición de vistas/modales.
 *
 * Estructura del proyecto:
 *   src/views/       → Pantallas completas (Welcome, Home, Profile, Detail)
 *   src/modals/      → Modales (cada uno maneja su propio formulario)
 *   src/components/  → ui/ (Modal, Header, DatePicker...) y cards/ (tarjetas)
 *   src/api/         → Capa de datos: contratos + Supabase / localStorage
 *   src/utils/       → Lógica de gastos y fechas
 *   src/mock/        → Datos de ejemplo
 *
 * Persistencia: la app consume IVaquiRepository (src/api/contracts.ts).
 * Con VITE_SUPABASE_URL/ANON_KEY configuradas usa Supabase; si no,
 * cae a localStorage. Las mutaciones son optimistas: se actualiza el
 * estado local y se persiste en segundo plano.
 */

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';

import {
  UserProfile,
  Friend,
  Hangout,
  Expense,
  HangoutStatus,
  MemberBalance,
  Transfer,
  Settlement,
} from './types';

import { calculateBalances, calculateTransfers } from './utils/expenses';
import { parseMeetingDate } from './utils/dates';
import { getRepository } from './api';

import Logo from './components/ui/Logo';
import PinView from './views/PinView';
import WelcomeView from './views/WelcomeView';
import HomeView from './views/HomeView';
import ProfileView from './views/ProfileView';
import HangoutDetailView from './views/HangoutDetailView';

import NewHangoutModal, { NewHangoutData } from './modals/NewHangoutModal';
import AliasModal from './modals/AliasModal';
import EditHangoutModal, { EditHangoutData } from './modals/EditHangoutModal';
import AddExpenseModal, { NewExpenseData } from './modals/AddExpenseModal';
import EditExpenseModal from './modals/EditExpenseModal';
import AddFriendModal from './modals/AddFriendModal';
import EditProfileModal, { EditProfileData } from './modals/EditProfileModal';
import MemberExpensesModal from './modals/MemberExpensesModal';
import CloseHangoutModal from './modals/CloseHangoutModal';
import TransferDetailsModal from './modals/TransferDetailsModal';

type ActiveView = 'pin' | 'welcome' | 'home' | 'profile' | 'detail';

const repo = getRepository();

// Migración: avatares guardados con gradientes viejos → colores planos violeta/azul
const LEGACY_AVATAR_COLORS: Record<string, string> = {
  'from-brand-rose to-brand-coral': 'bg-brand-primary',
  'from-brand-coral to-brand-rose': 'bg-brand-primary',
  'from-brand-primary to-brand-secondary': 'bg-brand-primary',
  'from-emerald-400 to-teal-600': 'bg-blue-500',
  'from-violet-500 to-fuchsia-600': 'bg-violet-500',
  'from-amber-400 to-orange-500': 'bg-indigo-500',
  'from-sky-400 to-blue-600': 'bg-sky-500',
  'from-sky-400 to-indigo-600': 'bg-sky-500',
  'from-pink-400 to-rose-500': 'bg-purple-500',
  'from-purple-400 to-fuchsia-600': 'bg-purple-500',
};

const migrateAvatarColor = (color: string): string => {
  if (LEGACY_AVATAR_COLORS[color]) return LEGACY_AVATAR_COLORS[color];
  if (color.startsWith('from-')) return 'bg-violet-500'; // gradiente desconocido
  return color;
};

// Migración: estado 'en_curso' → 'proxima', y settlements para datos viejos
const migrateHangout = (h: Hangout): Hangout => ({
  ...h,
  status: ((h.status as string) === 'en_curso' ? 'proxima' : h.status) as HangoutStatus,
  settlements: h.settlements ?? [],
});

const AVATAR_COLORS = [
  'bg-brand-primary',
  'bg-blue-500',
  'bg-violet-500',
  'bg-indigo-500',
];

export default function App() {
  // --- Data States (cargados desde la API) ---
  const [user, setUser] = useState<UserProfile | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [hangouts, setHangouts] = useState<Hangout[]>([]);
  // Perfiles de integrantes de juntadas que no son amigos del usuario
  const [extraProfiles, setExtraProfiles] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- UI Control States ---
  // Sin usuario logueado, la app arranca pidiendo el PIN
  const [activeView, setActiveView] = useState<ActiveView>('pin');
  const [selectedHangoutId, setSelectedHangoutId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Registro: nombre pendiente de confirmar alias (abre el AliasModal)
  const [pendingName, setPendingName] = useState<string | null>(null);
  const [isAliasSubmitting, setIsAliasSubmitting] = useState(false);

  // --- Modal Open States ---
  const [isNewHangoutOpen, setIsNewHangoutOpen] = useState(false);
  const [isEditHangoutOpen, setIsEditHangoutOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isCloseHangoutConfirmOpen, setIsCloseHangoutConfirmOpen] = useState(false);
  const [selectedMemberBalance, setSelectedMemberBalance] = useState<MemberBalance | null>(null);
  const [selectedTransferDetails, setSelectedTransferDetails] = useState<Transfer | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // --- Toast Helper ---
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  /** Persiste una mutación en segundo plano (UI optimista). */
  const persist = (operation: Promise<unknown>) => {
    operation.catch((err) => {
      console.error('[vaqui] Error al persistir:', err);
      showToast('⚠️ No se pudo guardar en el servidor');
    });
  };

  // --- Carga inicial desde la API ---
  useEffect(() => {
    (async () => {
      try {
        const currentUser = await repo.getCurrentUser();
        if (currentUser) {
          currentUser.avatarColor = migrateAvatarColor(currentUser.avatarColor);
          const [friendList, hangoutList] = await Promise.all([
            repo.getFriends(currentUser.id),
            repo.getHangouts(currentUser.id),
          ]);
          setUser(currentUser);
          setFriends(
            friendList.map((f) => ({ ...f, avatarColor: migrateAvatarColor(f.avatarColor) }))
          );
          setHangouts(hangoutList.map(migrateHangout));
          setActiveView('home');
        }
      } catch (err) {
        console.error('[vaqui] Error al cargar datos:', err);
        showToast('⚠️ No se pudo conectar con el servidor');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // --- Directorio de personas: amigos + integrantes no-amigos ---
  // Permite mostrar el nombre real de cualquier integrante de una juntada.
  const peopleDirectory = useMemo(() => {
    const map = new Map<string, Friend>();
    for (const f of friends) map.set(f.id, f);
    for (const p of extraProfiles) if (!map.has(p.id)) map.set(p.id, p);
    return [...map.values()];
  }, [friends, extraProfiles]);

  // Carga desde la API los perfiles de integrantes que no son amigos
  useEffect(() => {
    if (!user) return;
    const known = new Set<string>([
      user.id,
      ...friends.map((f) => f.id),
      ...extraProfiles.map((p) => p.id),
    ]);
    const missing: string[] = [];
    for (const h of hangouts) {
      for (const memberId of h.members) {
        if (!known.has(memberId)) {
          known.add(memberId);
          missing.push(memberId);
        }
      }
    }
    if (missing.length === 0) return;

    repo
      .getProfilesByIds(missing)
      .then((list) => {
        if (list.length > 0) {
          setExtraProfiles((prev) => [
            ...prev,
            ...list.map((p) => ({ ...p, avatarColor: migrateAvatarColor(p.avatarColor) })),
          ]);
        }
      })
      .catch((err) => console.error('[vaqui] Error al cargar perfiles de integrantes:', err));
  }, [hangouts, friends, user, extraProfiles]);

  // --- Tiempo real: gastos de la juntada abierta ---
  // Se suscribe por websocket a INSERT/UPDATE en expenses y refresca la
  // juntada desde la API, así todos los usuarios ven los gastos al instante.
  useEffect(() => {
    if (!selectedHangoutId || activeView !== 'detail') return;

    const hangoutId = selectedHangoutId;
    let refreshTimer: ReturnType<typeof setTimeout> | undefined;

    const refresh = async () => {
      try {
        const fresh = await repo.getHangout(hangoutId);
        if (fresh) {
          setHangouts((prev) =>
            prev.map((h) => (h.id === fresh.id ? migrateHangout(fresh) : h))
          );
        }
      } catch (err) {
        console.error('[vaqui] Error al refrescar la juntada:', err);
      }
    };

    // Pequeño debounce: los splits se insertan justo después del gasto,
    // así el refresco trae la división completa en una sola pasada.
    const onChange = () => {
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(refresh, 350);
    };

    const unsubscribe = repo.subscribeToExpenses(hangoutId, onChange);

    return () => {
      clearTimeout(refreshTimer);
      unsubscribe();
    };
  }, [selectedHangoutId, activeView]);

  // --- Handlers ---

  /** Fija la sesión de un perfil existente y carga sus datos. */
  const enterAsUser = async (profile: UserProfile) => {
    profile.avatarColor = migrateAvatarColor(profile.avatarColor);
    await repo.saveUser(profile); // fija la sesión actual
    const [friendList, hangoutList] = await Promise.all([
      repo.getFriends(profile.id),
      repo.getHangouts(profile.id),
    ]);
    setUser(profile);
    setFriends(
      friendList.map((f) => ({ ...f, avatarColor: migrateAvatarColor(f.avatarColor) }))
    );
    setHangouts(hangoutList.map(migrateHangout));
    setActiveView('home');
  };

  const handleWelcomeSubmit = async (name: string) => {
    try {
      // Validación 1: si el nombre ya existe en la base, se usa ese perfil
      const existing = await repo.findUserByName(name);
      if (existing) {
        await enterAsUser(existing);
        showToast(`¡Bienvenido de nuevo, ${existing.name}!`);
        return;
      }

      // Usuario nuevo: pedimos el alias antes de crear nada
      setPendingName(name);
    } catch (err) {
      console.error('[vaqui] Error al ingresar:', err);
      showToast('⚠️ No se pudo ingresar. Revisá la conexión.');
    }
  };

  const handleAliasSubmit = async (alias: string) => {
    if (!pendingName) return;
    setIsAliasSubmitting(true);

    try {
      // Validación 2: si el alias ya está registrado, se entra con ese usuario
      const byAlias = await repo.findUserByAlias(alias);
      if (byAlias) {
        await enterAsUser(byAlias);
        setPendingName(null);
        showToast(`Ese alias ya estaba registrado. ¡Bienvenido de nuevo, ${byAlias.name}!`);
        return;
      }

      // Alias libre: se crea el usuario nuevo, sin amigos ni juntadas
      const id = `user-${Math.random().toString(36).substring(2, 9)}`;
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const initials = pendingName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 4);
      const code = `${initials || 'VQ'}-${randomNum}`;
      const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

      const profile: UserProfile = {
        id,
        name: pendingName,
        aliasMP: alias,
        code,
        qr: code,
        avatarColor,
      };

      await repo.saveUser(profile);
      setUser(profile);
      setFriends([]);
      setHangouts([]);
      setPendingName(null);
      setActiveView('home');
      showToast(`¡Bienvenido ${profile.name}!`);
    } catch (err) {
      console.error('[vaqui] Error al registrar:', err);
      showToast('⚠️ No se pudo completar el registro. Revisá la conexión.');
    } finally {
      setIsAliasSubmitting(false);
    }
  };

  const handleCreateHangout = (data: NewHangoutData) => {
    if (!user) return;
    if (!data.title) {
      showToast('Por favor, ingresá un título');
      return;
    }

    const emojis = ['🍕', '🥩', '🍔', '🎉', '🚗', '🥂', '🍻', '🍿', '🎬', '🏞️', '🔥', '🍰'];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

    const newHangout: Hangout = {
      id: `hangout-${Math.random().toString(36).substring(2, 9)}`,
      emoji: randomEmoji,
      title: data.title,
      date: data.date || 'Hoy',
      description: data.description,
      members: [user.id, ...data.friendIds],
      expenses: [],
      settlements: [],
      status: 'proxima',
    };

    setHangouts((prev) => [newHangout, ...prev]);
    persist(repo.createHangout(newHangout));

    setIsNewHangoutOpen(false);
    setSelectedHangoutId(newHangout.id);
    setActiveView('detail');
    showToast('¡Juntada creada!');
  };

  const handleEditHangout = (data: EditHangoutData) => {
    if (!user || !selectedHangoutId) return;
    if (!data.title) {
      showToast('Por favor, ingresá un título');
      return;
    }

    const current = hangouts.find((h) => h.id === selectedHangoutId);
    if (!current) return;

    const updated: Hangout = {
      ...current,
      title: data.title,
      date: data.date,
      description: data.description,
      members: [user.id, ...data.friendIds],
    };

    setHangouts((prev) => prev.map((h) => (h.id === updated.id ? updated : h)));
    persist(repo.updateHangout(updated));

    setIsEditHangoutOpen(false);
    showToast('¡Juntada actualizada!');
  };

  const handleEditProfile = async (data: EditProfileData) => {
    if (!user) return;
    if (!data.name) {
      showToast('El nombre no puede estar vacío');
      return;
    }

    // El alias identifica al usuario: no puede pertenecer a otra persona
    if (data.aliasMP) {
      try {
        const owner = await repo.findUserByAlias(data.aliasMP);
        if (owner && owner.id !== user.id) {
          showToast(`Ese alias ya pertenece a ${owner.name}`);
          return;
        }
      } catch (err) {
        console.error('[vaqui] Error al validar el alias:', err);
        showToast('⚠️ No se pudo validar el alias. Revisá la conexión.');
        return;
      }
    }

    const updated: UserProfile = {
      ...user,
      name: data.name,
      aliasMP: data.aliasMP,
      cbu: data.cbu || undefined,
      cvu: data.cvu || undefined,
    };

    setUser(updated);
    persist(repo.saveUser(updated));

    setIsEditProfileOpen(false);
    showToast('Perfil actualizado');
  };

  const handleAddFriend = async (code: string) => {
    if (!user) return;
    const normalized = code.trim().toUpperCase();

    if (normalized === user.code) {
      showToast('Ese es tu propio código 😅');
      return;
    }

    const alreadyFriend = friends.find((f) => f.code === normalized);
    if (alreadyFriend) {
      showToast(`${alreadyFriend.name} ya está en tu lista de amigos`);
      return;
    }

    try {
      // Validación: el código tiene que pertenecer a un usuario real
      const profile = await repo.findProfileByCode(normalized);
      if (!profile) {
        showToast('No existe ningún usuario con ese código');
        return;
      }

      await repo.addFriend(user.id, profile);
      setFriends((prev) => [
        ...prev,
        { ...profile, avatarColor: migrateAvatarColor(profile.avatarColor) },
      ]);
      setIsAddFriendOpen(false);
      showToast(`¡Agregaste a ${profile.name}!`);
    } catch (err) {
      console.error('[vaqui] Error al agregar amigo:', err);
      showToast('⚠️ No se pudo agregar el amigo. Revisá la conexión.');
    }
  };

  const handleAddExpense = (data: NewExpenseData) => {
    if (!selectedHangoutId) return;
    if (!data.description.trim()) {
      showToast('Ingresá una descripción del gasto');
      return;
    }
    const amount = parseFloat(data.amount);
    if (isNaN(amount) || amount <= 0) {
      showToast('Ingresá un monto válido');
      return;
    }
    if (!data.payerId) {
      showToast('Seleccioná quién pagó');
      return;
    }

    const hangout = hangouts.find((h) => h.id === selectedHangoutId);
    if (!hangout) return;

    const splitAmong = data.divideEqually ? hangout.members : data.splitSelectedIds;
    if (splitAmong.length === 0) {
      showToast('Seleccioná al menos un integrante para dividir');
      return;
    }

    const newExpense: Expense = {
      id: `exp-${Math.random().toString(36).substring(2, 9)}`,
      emoji: data.emoji,
      description: data.description.trim(),
      amount,
      paidBy: data.payerId,
      splitAmong,
      date: 'Hace unos instantes',
    };

    setHangouts((prev) =>
      prev.map((h) =>
        h.id === selectedHangoutId ? { ...h, expenses: [...h.expenses, newExpense] } : h
      )
    );
    persist(repo.addExpense(selectedHangoutId, newExpense));

    setIsAddExpenseOpen(false);
    showToast('Gasto agregado con éxito');
  };

  const handleEditExpense = (data: NewExpenseData) => {
    if (!selectedHangoutId || !editingExpense) return;
    if (!data.description.trim()) {
      showToast('Ingresá una descripción del gasto');
      return;
    }
    const amount = parseFloat(data.amount);
    if (isNaN(amount) || amount <= 0) {
      showToast('Ingresá un monto válido');
      return;
    }

    const hangout = hangouts.find((h) => h.id === selectedHangoutId);
    if (!hangout) return;

    const splitAmong = data.divideEqually ? hangout.members : data.splitSelectedIds;
    if (splitAmong.length === 0) {
      showToast('Seleccioná al menos un integrante para dividir');
      return;
    }

    const updated: Expense = {
      ...editingExpense,
      emoji: data.emoji,
      description: data.description.trim(),
      amount,
      paidBy: data.payerId,
      splitAmong,
    };

    setHangouts((prev) =>
      prev.map((h) =>
        h.id === selectedHangoutId
          ? { ...h, expenses: h.expenses.map((e) => (e.id === updated.id ? updated : e)) }
          : h
      )
    );
    persist(repo.updateExpense(selectedHangoutId, updated));

    setEditingExpense(null);
    showToast('Gasto actualizado');
  };

  // Marca una transferencia como realizada y la guarda en la base
  const handleMarkTransferPaid = (transfer: Transfer) => {
    if (!selectedHangoutId) return;

    const settlement: Settlement = {
      id: `stl-${Math.random().toString(36).substring(2, 9)}`,
      fromId: transfer.fromId,
      toId: transfer.toId,
      amount: transfer.amount,
    };

    setHangouts((prev) =>
      prev.map((h) =>
        h.id === selectedHangoutId
          ? { ...h, settlements: [...h.settlements, settlement] }
          : h
      )
    );
    persist(repo.addSettlement(selectedHangoutId, settlement));

    setSelectedTransferDetails(null);
    showToast('¡Transferencia registrada! 💸');
  };

  const handleCloseHangout = () => {
    if (!selectedHangoutId) return;

    const current = hangouts.find((h) => h.id === selectedHangoutId);
    if (!current) return;

    const updated: Hangout = { ...current, status: 'finalizada' };
    setHangouts((prev) => prev.map((h) => (h.id === updated.id ? updated : h)));
    persist(repo.updateHangout(updated));

    setIsCloseHangoutConfirmOpen(false);
    showToast('¡Juntada finalizada y balance calculado!');
  };

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`¡${label} copiado al portapapeles!`);
  };

  // --- Computations ---
  const currentHangout = hangouts.find((h) => h.id === selectedHangoutId);

  const currentBalances: MemberBalance[] =
    currentHangout && user
      ? calculateBalances(
          currentHangout.members,
          currentHangout.expenses,
          peopleDirectory,
          user,
          currentHangout.settlements
        )
      : [];

  // Lista para editar integrantes: amigos + integrantes actuales no-amigos
  const editHangoutPeople = useMemo(() => {
    if (!currentHangout) return friends;
    const map = new Map(friends.map((f) => [f.id, f] as const));
    for (const memberId of currentHangout.members) {
      if (memberId === user?.id || map.has(memberId)) continue;
      const profile = peopleDirectory.find((p) => p.id === memberId);
      if (profile) map.set(memberId, profile);
    }
    return [...map.values()];
  }, [friends, currentHangout, peopleDirectory, user]);

  const currentTransfers: Transfer[] =
    currentBalances.length > 0 ? calculateTransfers(currentBalances) : [];

  const currentUserBalance = currentBalances.find((b) => b.id === user?.id) || {
    id: user?.id || '',
    name: user?.name || '',
    avatarColor: user?.avatarColor || '',
    aliasMP: user?.aliasMP || '',
    totalPaid: 0,
    totalOwed: 0,
    balance: 0,
  };

  const proximasHangouts = hangouts
    .filter((h) => h.status === 'proxima')
    .sort((a, b) => parseMeetingDate(b.date) - parseMeetingDate(a.date));

  const finalizadasHangouts = hangouts
    .filter((h) => h.status === 'finalizada')
    .sort((a, b) => parseMeetingDate(b.date) - parseMeetingDate(a.date));

  return (
    <div className="min-h-screen bg-brand-warm-bg flex justify-center" id="app-root-container">
      <div className="w-full max-w-md bg-brand-cream min-h-screen flex flex-col shadow-xl border-x border-gray-100 relative">

        {/* Toast Alert — fijo al viewport, siempre visible aunque se scrollee */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 16 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-0 left-0 right-0 mx-auto w-[calc(100%-2rem)] max-w-sm z-[60] bg-gray-900/95 backdrop-blur-xs text-white px-4 py-3 rounded-2xl flex items-center gap-2.5 shadow-lg border border-gray-800 text-sm font-semibold"
              id="toast-notification"
            >
              <Sparkles size={16} className="text-brand-secondary animate-pulse" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===================== SPLASH DE CARGA ===================== */}
        {isLoading && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4" id="loading-view">
            <div className="animate-pulse">
              <Logo className="w-16 h-16 rounded-3xl" fallbackTextClass="text-3xl" />
            </div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Cargando...
            </span>
          </div>
        )}

        {/* ===================== VISTAS ===================== */}
        {!isLoading && activeView === 'pin' && (
          <PinView onSuccess={() => setActiveView('welcome')} />
        )}

        {!isLoading && activeView === 'welcome' && <WelcomeView onSubmit={handleWelcomeSubmit} />}

        {!isLoading && activeView === 'home' && user && (
          <HomeView
            user={user}
            proximas={proximasHangouts}
            finalizadas={finalizadasHangouts}
            onOpenHangout={(id) => {
              setSelectedHangoutId(id);
              setActiveView('detail');
            }}
            onOpenProfile={() => setActiveView('profile')}
            onNewHangout={() => setIsNewHangoutOpen(true)}
          />
        )}

        {!isLoading && activeView === 'profile' && user && (
          <ProfileView
            user={user}
            friends={friends}
            onBack={() => setActiveView('home')}
            onEditProfile={() => setIsEditProfileOpen(true)}
            onAddFriend={() => setIsAddFriendOpen(true)}
            onCopyText={handleCopyText}
          />
        )}

        {!isLoading && activeView === 'detail' && currentHangout && user && (
          <HangoutDetailView
            hangout={currentHangout}
            user={user}
            friends={peopleDirectory}
            balances={currentBalances}
            transfers={currentTransfers}
            userBalance={currentUserBalance}
            onBack={() => setActiveView('home')}
            onAddExpense={() => setIsAddExpenseOpen(true)}
            onEditExpense={setEditingExpense}
            onEdit={() => setIsEditHangoutOpen(true)}
            onRequestClose={() => setIsCloseHangoutConfirmOpen(true)}
            onSelectMember={setSelectedMemberBalance}
            onSelectTransfer={setSelectedTransferDetails}
          />
        )}

        {/* ===================== MODALES ===================== */}
        <AliasModal
          isOpen={pendingName !== null}
          name={pendingName ?? ''}
          isSubmitting={isAliasSubmitting}
          onClose={() => setPendingName(null)}
          onSubmit={handleAliasSubmit}
        />

        <NewHangoutModal
          isOpen={isNewHangoutOpen}
          onClose={() => setIsNewHangoutOpen(false)}
          friends={friends}
          onCreate={handleCreateHangout}
          onAddFriend={() => setIsAddFriendOpen(true)}
        />

        {currentHangout && user && (
          <EditHangoutModal
            isOpen={isEditHangoutOpen}
            onClose={() => setIsEditHangoutOpen(false)}
            hangout={currentHangout}
            user={user}
            friends={editHangoutPeople}
            onSave={handleEditHangout}
          />
        )}

        {user && (
          <EditProfileModal
            isOpen={isEditProfileOpen}
            onClose={() => setIsEditProfileOpen(false)}
            user={user}
            onSave={handleEditProfile}
          />
        )}

        <AddFriendModal
          isOpen={isAddFriendOpen}
          onClose={() => setIsAddFriendOpen(false)}
          onAddByCode={handleAddFriend}
        />

        {currentHangout && user && (
          <AddExpenseModal
            isOpen={isAddExpenseOpen}
            onClose={() => setIsAddExpenseOpen(false)}
            hangout={currentHangout}
            user={user}
            friends={peopleDirectory}
            onAdd={handleAddExpense}
          />
        )}

        {editingExpense && currentHangout && user && (
          <EditExpenseModal
            expense={editingExpense}
            hangout={currentHangout}
            user={user}
            friends={peopleDirectory}
            onClose={() => setEditingExpense(null)}
            onSave={handleEditExpense}
          />
        )}

        {selectedMemberBalance && currentHangout && (
          <MemberExpensesModal
            member={selectedMemberBalance}
            hangout={currentHangout}
            onClose={() => setSelectedMemberBalance(null)}
          />
        )}

        <CloseHangoutModal
          isOpen={isCloseHangoutConfirmOpen}
          onClose={() => setIsCloseHangoutConfirmOpen(false)}
          onConfirm={handleCloseHangout}
        />

        {selectedTransferDetails && user && (
          <TransferDetailsModal
            transfer={selectedTransferDetails}
            user={user}
            friends={peopleDirectory}
            onClose={() => setSelectedTransferDetails(null)}
            onCopyText={handleCopyText}
            onMarkPaid={() => handleMarkTransferPaid(selectedTransferDetails)}
          />
        )}
      </div>
    </div>
  );
}
