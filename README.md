# Ozone Staff (اوزون | پنل کارکنان)

A mobile-first **PWA** for Ozone staff. It covers:

- **Presence**: who is in the office today and who is not.
- **Face check-in and coins**: the entrance gate's face recognition records your check-in, and the first check-in of each day earns **100 coins**.
- **Meeting rooms**: which rooms are free, in use or reserved soon. You can book a room from now, and release or cancel your own bookings.
- **Events**: meetings, celebrations, trainings, offsites and announcements, with RSVP.
- **Mood**: set your mood, availability and auto-clear time, and mirror them to **Mattermost** as your custom status and presence.
- **Coin store**: spend coins on food, merch, perks and learning, and see your wallet ledger and orders.

Next.js 16 · React 19 (React Compiler) · TypeScript 7 · TanStack Query 5 · Tailwind CSS 4 · HeroUI 3. Persian (`fa-IR`), right-to-left, Solar Hijri dates.

The structure, tooling and conventions mirror the `ai-agent` project: the vendored interceptor, the `AbstractAPI` services, the hooks over services, one folder per component, and the `@/components`, `@/hooks` and `@/services` barrels.

## Getting started

```bash
corepack enable          # once per machine — provides Yarn 4
yarn install
cp .env.example .env.local
yarn dev
```

Without `NEXT_PUBLIC_BASE_API` (or with `NEXT_PUBLIC_USE_MOCK_API=true`), the whole app runs against an **in-browser mock backend**. The mock persists to `localStorage` and enforces the same rules as the real one. In mock mode the check-in card also shows a **"simulate face check-in"** button, which stands in for the entrance gate.

| Script           | What it does                              |
| ---------------- | ----------------------------------------- |
| `yarn dev`       | Dev server (Turbopack)                    |
| `yarn build`     | Production build (type-checks with `tsc`) |
| `yarn start`     | Serve the production build                |
| `yarn typecheck` | `tsc --noEmit`                            |
| `yarn lint`      | oxlint (React, Next.js, a11y, import, TS) |
| `yarn format`    | Prettier + Tailwind class sorting         |

The service worker is only registered by **production builds** (`yarn build && yarn start`), because caching would fight hot reload in dev.

## Project layout

```
src/
├── app/                    routes (App Router), manifest, icons, API route
│   ├── (main)/             signed-in pages inside the app shell
│   ├── api/mattermost/     server-side Mattermost proxy
│   ├── login/ offline/     public pages
│   └── manifest.ts         Web App Manifest
├── proxy.ts                route guard (Next 16 "proxy", formerly middleware)
├── components/
│   ├── base/               neumorphic primitives (HeroUI adapted)
│   ├── layout/             shell, header, bottom tab bar, side rail
│   └── <feature>/          attendance, auth, events, home, mood, profile,
│                           pwa, rooms, store, team, wallet
├── config/                 env, site, navigation, session, Persian UI copy
├── hooks/                  TanStack Query hooks per feature + utility hooks
├── icons/                  icon registry, Ozone logo (mark + wordmark)
├── lib/                    framework-agnostic domain logic (no React)
│   ├── coins/              reward policy, purchase rules, ledger
│   ├── rooms/              room states, bookable durations
│   ├── presence/ events/ mood/ store/
│   ├── mattermost/         payload builder + server-side client
│   ├── clock/ theme/ pwa/  shared stores (clock, theme, install prompt)
│   └── query/ utils/       query client & keys, date/format/text helpers
├── services/
│   ├── interceptor/        vendored HTTP layer (unchanged from ai-agent)
│   ├── factory/            Abstract Factory: HTTP or mock service family
│   ├── mock/               mock database + seed data
│   └── <feature>/          interface · *.service.ts (HTTP) · *.mock.ts
└── styles/theme/           design tokens (Tailwind v4, CSS-first)
public/sw.js                service worker
```

## Design system — Ozone neumorphism

**Palette.** The three ring colours of the ozone.ir logo are expanded into 50–900 scales in `styles/theme/colors.css`:

| Colour | Hex       | Role                                       |
| ------ | --------- | ------------------------------------------ |
| Purple | `#732DF6` | `primary`: actions, focus, selection       |
| Blue   | `#386CFF` | `secondary`: info, links                   |
| Teal   | `#24C8B0` | `teal`: success, "in office", coins earned |
| Navy   | `#0B1424` | Dark theme base, app icon background       |

**Soft UI.** Surfaces share the page colour, and depth comes only from a highlight and shade shadow pair, defined in `neumorphism.css`:

| Utility                 | Use                                  |
| ----------------------- | ------------------------------------ |
| `bg-neu`                | Page and surface fill                |
| `shadow-neu-sm/-/-lg`   | Raised controls, cards, hero cards   |
| `shadow-neu-inset(-sm)` | Inputs, tracks, empty wells          |
| `shadow-neu-pressed`    | A pressed or selected raised control |
| `shadow-float`          | Sheets, dialogs and toasts           |

**Accessibility.** Soft UI's known weakness is low contrast, so:

- All text meets WCAG AA on the base in both themes. For example, teal is never used as text below step 800 on the light theme.
- State is never shown by shadow alone. Colour and labels change too.
- `prefers-contrast: more` turns on real borders (`border-neu-outline`).
- Focus rings are always visible, and motion respects `prefers-reduced-motion`.

**Mobile first.** Key mobile behaviours:

- Base styles target 360–430px phones. A bottom tab bar holds the five primary destinations, and a side rail replaces it from `lg` (1024px).
- Layouts pad with `env(safe-area-inset-*)` for notches and the home indicator.
- Inputs use 16px text so iOS Safari does not zoom on focus.
- Forms open in swipe-to-dismiss bottom sheets.

## Business rules (where they live)

| Rule                                                                                                          | Code                                  |
| ------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| 100 coins for the first face check-in of a local day                                                          | `lib/coins/reward.ts`                 |
| "In office" is set only by the gate; remote/leave are self-declared, and are rejected once checked in         | `lib/presence`, `attendance.mock.ts`  |
| Purchase checks: active → quantity → stock → per-person limit → balance                                       | `lib/coins/purchase.ts`               |
| Room state (available / upcoming ≤30 min / occupied), bookings 15–180 min, never across midnight, no overlaps | `lib/rooms/rooms.ts`, `rooms.mock.ts` |
| Only the organiser can release (end now) or cancel a booking                                                  | `rooms.mock.ts`                       |
| Mood note ≤ 100 characters (the Mattermost limit), expiry in the future                                       | `lib/mood`, API route                 |

The UI pre-validates with these rules, but **the server is authoritative**. The mock backend re-runs them against stored state, and the real backend must do the same.

## Backend API contract

Responses use the envelope `{ code, data, detail }` (`INetworkResponse`). Every path is relative to `NEXT_PUBLIC_BASE_API`, and the bearer token comes from the `token` cookie.

| Method & path                    | Body → `data`                                                                        |
| -------------------------------- | ------------------------------------------------------------------------------------ |
| `POST auth/login`                | `{ username, password }` → `{ token, refreshToken }`                                 |
| `POST auth/logout`               | —                                                                                    |
| `GET profile`                    | `IProfile`, including `mattermost: { userId, username } \| null`                     |
| `GET staff`                      | `IStaffMember[]` (presence, `checkedInAt`, mood)                                     |
| `GET attendance/today`           | `IAttendanceDay`                                                                     |
| `PUT attendance/today/work-mode` | `{ workMode: 'remote' \| 'on-leave' \| null }`, 409 once checked in                  |
| `GET wallet/summary`             | `{ balance, earnedToday, totalEarned, totalSpent }`                                  |
| `GET wallet/transactions`        | `ITransaction[]`, newest first                                                       |
| `GET store/products`             | `IProduct[]`, including `purchasedByMe`                                              |
| `GET store/orders`               | `IOrder[]`                                                                           |
| `POST store/orders`              | `{ productId, quantity }` → `{ order, balance }`; 409 with `code` = the failing rule |
| `GET rooms`                      | `IMeetingRoom[]` with today's bookings                                               |
| `POST rooms/:id/bookings`        | `{ title, startsAt, endsAt }` → `IRoomBooking`; 409 on conflict                      |
| `DELETE rooms/bookings/:id`      | Cancels a future booking, or ends an ongoing one now                                 |
| `GET events`                     | `ICompanyEvent[]`                                                                    |
| `PUT events/:id/rsvp`            | `{ rsvp }` → `ICompanyEvent`                                                         |
| `GET \| PUT \| DELETE mood`      | `IMood \| null` (expired moods come back as `null`)                                  |

**Face recognition.** The gate system calls the backend, never this app. On each recognition event, the backend should:

1. Record the first check-in of the day.
2. Clear any remote/leave declaration.
3. Credit the daily reward at most once per day (idempotent).

`FaceCheckInMockSimulator` shows exactly this behaviour. The app finds out by polling `attendance/today` every 30 s until a check-in arrives.

## Mattermost integration

`PUT /api/mattermost/status` and `DELETE /api/mattermost/status` are a Next.js route handler that acts as a protection proxy:

1. It reads the session's `token` cookie and calls `GET profile` with it. The browser never names whose status to change.
2. It builds the Mattermost payloads with `MattermostStatusBuilder`.
3. It calls Mattermost API v4 with a server-only token:
   - `PUT /api/v4/users/{id}/status/custom` with `{ emoji, text, duration: 'date_and_time', expires_at }`.
   - `PUT /api/v4/users/{id}/status` with `{ user_id, status: online|away|dnd, dnd_end_time }`.
   - On clear: `DELETE …/status/custom`, then set the status back to `online`.

Configure these in `.env.local`. Both are server-only:

```
MATTERMOST_URL=https://chat.example.com
MATTERMOST_TOKEN=<token of a system admin / bot with manage_system>
```

The mood is saved first, then mirrored. If Mattermost is down, the mood is still saved, and the UI says "saved, but not synced" instead of failing the whole action.

## PWA

- **Manifest**: `app/manifest.ts`. It is standalone and RTL, with home-screen shortcuts to rooms, team and store. The icons in `public/icons` are generated from the logo, including a maskable variant.
- **Service worker** (`public/sw.js`):

  | Requests         | Strategy                                  |
  | ---------------- | ----------------------------------------- |
  | Page navigations | Network-first, falling back to `/offline` |
  | `/_next/static`  | Cache-first                               |
  | Fonts and images | Stale-while-revalidate                    |
  | API calls        | Never cached (they are personal and live) |

- **Updates**: a new version waits until the user taps "Update" in the toast, so a reload never interrupts a task.
- **Install**: the profile page offers the browser's install dialog on Chromium, and "Add to Home Screen" instructions on iOS.

## Design patterns ([refactoring.guru](https://refactoring.guru/design-patterns))

Every catalogue pattern was considered. Each one is applied only where it solves a real problem here.

| Pattern                 | Where                                                                                                                                        |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Abstract Factory        | `services/factory`: the HTTP and mock service families can never be mixed                                                                    |
| Factory Method          | `createQueryClient()`, `createPurchaseValidator()`                                                                                           |
| Builder                 | `MattermostStatusBuilder`; `new HttpClient().use(…).boot()`                                                                                  |
| Prototype               | `clone()` (structured clone) in the mock backend: callers get copies, never live state                                                       |
| Singleton               | `themeStore`, `clockStore`, `installPromptStore`, `mockDb`, browser `QueryClient`, service instances                                         |
| Adapter                 | `HttpClient` over axios; `MattermostClient` over `fetch`; `heroui.css` over HeroUI tokens; `notify` options to HeroUI toast options          |
| Bridge                  | Base components (abstraction) over HeroUI and React Aria (implementation), so either side can change independently                           |
| Composite               | `CompositeStatusSync`: mood sync targets (Mattermost today) treated as one                                                                   |
| Decorator               | Interceptor middleware wraps every request (auth header, refresh, 5xx handling)                                                              |
| Facade                  | `config/env`, `notify`, the `@/components`, `@/hooks` and `@/services` barrels                                                               |
| Flyweight               | Icon registry, `Intl` formatters, mood, presence and event-category registries, avatar palette                                               |
| Proxy                   | `/api/mattermost/status` (protection proxy for the Mattermost token); `src/proxy.ts` route guard                                             |
| Chain of Responsibility | Purchase validation chain; interceptor middleware pipeline                                                                                   |
| Command                 | TanStack mutations: encapsulated, retry-able requests with optimistic apply and rollback (RSVP)                                              |
| Iterator                | Not hand-rolled: native iterables and array methods already cover traversal                                                                  |
| Mediator                | `mockDb`: features interact through it (check-in → wallet + presence; purchase → stock + ledger + orders)                                    |
| Memento                 | The optimistic RSVP snapshot (`onMutate` saves the previous list, `onError` restores it)                                                     |
| Observer                | `useSyncExternalStore` stores (theme, clock, install prompt, online status); TanStack Query observers; the mutation cache re-ticks the clock |
| State                   | `lib/rooms`: available / upcoming / occupied state objects decide tone and allowed actions                                                   |
| Strategy                | Reward policy, retry policy, presence and event filters, mood expiry, greeting table, service family selection                               |
| Template Method         | `AbstractAPI.request()` hooks; the `PurchaseRule` base class                                                                                 |
| Visitor                 | Not applied: there is no stable object structure with many operations, so it would only add indirection                                      |
# sonic-bridge
