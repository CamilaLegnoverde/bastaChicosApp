# Basta chicos 🎉

Organizá juntadas con amigos y dividí los gastos al toque, sin vueltas.

## Correr localmente

**Requisitos:** Node.js

1. Instalar dependencias: `npm install`
2. Correr la app: `npm run dev`
3. Verificar tipos: `npm run lint`

## Conexión a Supabase

La app persiste datos en Supabase si está configurado; si no, usa localStorage automáticamente (modo offline/demo).

1. Creá un proyecto en [supabase.com](https://supabase.com).
2. En el dashboard: **SQL Editor** → pegá el contenido de [`supabase/schema.sql`](supabase/schema.sql) → **Run**. Esto crea las tablas, índices y políticas RLS.
3. Copiá `.env.example` a `.env.local` y completá con los valores de **Settings → API**:

```
VITE_SUPABASE_URL="https://TU-PROYECTO.supabase.co"
VITE_SUPABASE_ANON_KEY="TU_ANON_KEY"
```

4. Reiniciá `npm run dev`.

> Nota: la app no usa Supabase Auth (la identidad es el perfil creado con tu nombre, guardado como `vaqui_user_id`). Las políticas RLS del esquema son abiertas para el rol `anon` — aptas para demo. Si sumás Auth, reemplazalas por políticas basadas en `auth.uid()`.

### Capa de datos

```
src/api/
├── contracts.ts             # IVaquiRepository (contrato) + DTOs de filas + mappers
├── supabaseClient.ts        # Cliente creado desde las env vars
├── supabaseRepository.ts    # Implementación sobre Supabase
├── localStorageRepository.ts # Implementación fallback sin backend
└── index.ts                 # getRepository(): elige la implementación
```

La UI sólo conoce `IVaquiRepository`. Las mutaciones son optimistas: el estado se actualiza al instante y se persiste en segundo plano (con toast de error si falla).

### Gastos en tiempo real

Con la juntada abierta, la app se suscribe por **websocket (Supabase Realtime)** a los INSERT/UPDATE de `expenses` de esa juntada y refresca los gastos automáticamente para todos los usuarios conectados. Requiere que la tabla esté en la publicación realtime — incluido en `schema.sql`, o para bases existentes: [`supabase/migrations/003_realtime_expenses.sql`](supabase/migrations/003_realtime_expenses.sql).

### Foto de perfil

- Cada persona puede tener una **foto de perfil**, guardada como **blob real** en la base (columna `avatar_blob bytea` + `avatar_mime` en `profiles`). Para bases existentes: [`supabase/migrations/005_profile_avatar.sql`](supabase/migrations/005_profile_avatar.sql).
- La foto se sube desde **Mi Perfil → Editar datos** (tocando el avatar). Antes de subir, la imagen se **recorta a un cuadrado y se reduce** a 256px (JPEG) con un canvas, así el blob queda liviano (`src/utils/image.ts`).
- El cliente reconstruye el blob como *data URL* y lo muestra. Todo el renderizado de avatares pasa por un único componente `src/components/ui/Avatar.tsx`, que muestra la foto o, si no hay, un círculo de color con la inicial del nombre.

### Ingreso y validaciones

- Al abrir la app sin usuario logueado se pide un **PIN de acceso** (teclado numérico en pantalla). El PIN se configura con la env var `VITE_APP_PIN` en `.env` (fallback: `1911`).

- Superado el PIN, la segunda pantalla muestra un **carrusel de usuarios existentes** (con su foto o su inicial). Tocar uno entra directo con ese perfil; la última opción, un **`+`**, abre el alta por nombre.
- Al ingresar un nombre, la app busca un usuario existente (case-insensitive). Si existe, entra con ese perfil y carga sus amigos y juntadas.
- Si el nombre es nuevo, un modal pide el **alias de pago**: si el alias ya está registrado, se entra con ese usuario existente; si no, se crea un usuario nuevo **en blanco** (sin amigos ni juntadas) con ese alias. El alias es único en la base (índice `uq_profiles_alias`; migración `002_unique_alias.sql` para bases existentes).
- El CBU/CVU (y el alias) se pueden editar desde **Mi Perfil → Editar datos**; al guardar se valida que el alias no pertenezca a otra persona.
- Agregar amigo requiere el código de un usuario **ya registrado** (se valida contra la tabla `profiles`); no se generan contactos falsos.
- **QR de invitación:** el perfil muestra un QR real (`qrcode.react`) que codifica un link a la app con tu código (`?add=CÓDIGO`, ver `src/utils/invite.ts`). Al escanearlo con cualquier cámara se abre la app; tras pasar el PIN e identificarse, aparece un modal («Te invitó X — ¿Agregar como amigo?») y al confirmar quedan conectados (amistad mutua). El link también se puede copiar desde el perfil. Para escanear desde **otro dispositivo**, la app debe estar publicada en una URL pública HTTPS (en `localhost` el QR solo sirve en el mismo equipo).
- La amistad es **mutua y se guarda una sola vez**: cuando A agrega a B, B ve a A automáticamente. Si tu base ya tenía la tabla vieja (`user_id`/`friend_id`), corré [`supabase/migrations/001_mutual_friendships.sql`](supabase/migrations/001_mutual_friendships.sql).

### Esquema de base de datos

| Tabla | Contenido |
|---|---|
| `profiles` | Personas (usuario y amigos comparten tabla). Incluye la foto de perfil como blob (`avatar_blob`/`avatar_mime`) — migración `005_profile_avatar.sql` |
| `friendships` | Amistad mutua: un solo registro por par (`user_a < user_b`) |
| `hangouts` | Juntadas (título, fecha, estado, creador) |
| `hangout_members` | Integrantes de cada juntada |
| `expenses` | Gastos (monto, quién pagó) |
| `expense_splits` | Entre quiénes se divide cada gasto |
| `settlements` | Transferencias marcadas como realizadas (descuentan del balance) — migración `004_settlements.sql` |

## Estructura del proyecto

```
src/
├── App.tsx              # Estado global y composición de vistas/modales
├── main.tsx             # Punto de entrada
├── index.css            # Paleta de colores y estilos globales
├── types.ts             # Tipos compartidos (Hangout, Friend, Expense...)
│
├── api/                 # Capa de datos (contratos + Supabase/localStorage)
│
├── views/               # Pantallas completas
│   ├── PinView.tsx          # PIN de acceso (teclado numérico)
│   ├── WelcomeView.tsx      # Primer ingreso (pide el nombre)
│   ├── HomeView.tsx         # Lista de juntadas (próximas / finalizadas)
│   ├── ProfileView.tsx      # Perfil, QR y lista de amigos
│   └── HangoutDetailView.tsx # Detalle: gastos, balances y transferencias
│
├── modals/              # Modales (cada uno maneja su propio formulario)
│   ├── NewHangoutModal.tsx      # Crear juntada (con calendario visual)
│   ├── EditHangoutModal.tsx     # Editar juntada (título, fecha, integrantes)
│   ├── EditExpenseModal.tsx     # Editar gastos propios
│   ├── AliasModal.tsx           # Alias de pago al registrarse
│   ├── AddExpenseModal.tsx      # Registrar gasto
│   ├── AddFriendModal.tsx       # Agregar amigo por código o QR
│   ├── EditProfileModal.tsx     # Editar datos de pago
│   ├── MemberExpensesModal.tsx  # Compras de un integrante
│   ├── CloseHangoutModal.tsx    # Confirmación de cierre
│   └── TransferDetailsModal.tsx # Datos para transferir
│
├── components/
│   ├── ui/              # Piezas reutilizables de interfaz
│   │   ├── Modal.tsx
│   │   ├── Header.tsx
│   │   ├── DatePicker.tsx   # Calendario con accesos rápidos (Hoy/Mañana/Sábado)
│   │   └── FloatingButton.tsx
│   └── cards/           # Tarjetas de datos
│       ├── MeetingCard.tsx
│       ├── ExpenseCard.tsx
│       ├── BalanceCard.tsx
│       ├── MemberCard.tsx
│       ├── TransferCard.tsx
│       ├── FriendCard.tsx
│       └── QRCard.tsx
│
└── utils/
    ├── expenses.ts      # Cálculo de balances y transferencias mínimas
    └── dates.ts         # Formateo y parseo de fechas ('Hoy', 'Mañana'...)
```

## Paleta de colores

Colores planos (sin gradientes), definidos en `src/index.css` con tokens semánticos — cambiá los valores ahí para re-tematizar toda la app:

| Token | Valor | Uso |
|---|---|---|
| `brand-primary` | `#6C5CE7` | Violeta principal (botones, links) |
| `brand-secondary` | `#4F7DF9` | Azul (acentos secundarios) |
| `brand-accent` | `#10B981` | Esmeralda (balances a favor, éxito) |
| `brand-accent-light` | `#ECFDF5` | Fondos de éxito |
| `brand-cream` | `#FDFDFF` | Superficies / tarjetas |
| `brand-warm-bg` | `#F5F4FA` | Fondo general |
