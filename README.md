# Temino Web

A modern bus booking platform for Tanzania (with future expansion to flights and beyond), built with Next.js 16, TypeScript, Tailwind v4, Tanstack Query, Zustand, and shadcn/ui.

## Quick start

```bash
npm install
npm run dev
```

App runs at [http://localhost:3000](http://localhost:3000).

### Environment

Copy `.env.local.example` (or create `.env.local`) with:

```
NEXT_PUBLIC_API_BASE_URL=https://api.temino.co.tz
NEXT_PUBLIC_APP_NAME=Temino
```

## Scripts

| Command                | What it does                     |
| ---------------------- | -------------------------------- |
| `npm run dev`          | Start the dev server (Turbopack) |
| `npm run build`        | Production build                 |
| `npm run start`        | Start production server          |
| `npm run lint`         | ESLint                           |
| `npm run format`       | Prettier write                   |
| `npm run format:check` | Prettier check                   |

## Tech stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** + `tw-animate-css` + **shadcn/ui** (`new-york` style)
- **Tanstack Query v5** for server state
- **Axios** for HTTP, with auth + error normalization interceptors
- **Zustand** + `persist` for client state (preferences, booking flow, mocked auth)
- **Zod** + **react-hook-form** + `@hookform/resolvers` for validation
- **Day.js** for dates
- **react-hot-toast** for notifications
- **lucide-react** + **motion** for UI

## Project structure

```
app/                           Next.js App Router
  layout.tsx                   Root layout (fonts, FOUC script, providers)
  globals.css                  Tailwind + theme tokens (oklch)
  (landing)/                   Public marketing pages (NavBar + Footer)
    page.tsx                   Landing (hero, popular routes, how-it-works, CTA)
    about-us|support|terms|privacy/page.tsx
  (auth)/                      Auth flow (login → verify-otp, sign-up → verify-otp)
  (dashboard)/                 Authenticated area (auth gate + sidebar)
    dashboard/
      page.tsx                 Overview
      trips/page.tsx           My trips
      history/page.tsx         Past + cancelled
      profile/page.tsx         Profile mgmt
      settings/page.tsx        Theme/lang/logout
  trips/                       Booking flow
    page.tsx                   Search results
    [id]/
      seat/page.tsx            Seat selection
      passenger/page.tsx       Passenger info (zod + RHF)
      payment/page.tsx         Mocked payment
      confirmation/page.tsx    Ticket confirmation

components/
  ui/                          shadcn primitives
  shared/                      App-specific composed components
config/
  query-client.ts              QueryClient factory + retry/offline policy
  toast.ts                     ToastAlert wrapper around react-hot-toast
constants/
  values.ts                    APP_NAME, storage keys, popular routes, TZ cities
contexts/
  theme-context.tsx            Applies dark class to <html>
helpers/
  helpers.ts                   Date, currency, phone, route helpers
hooks/
  use-trips.ts                 Search + fetch trips
  use-bookings.ts              Create + list bookings
  use-routes.ts                Routes + cities
  use-auth.ts                  Mocked phone-OTP flow
  use-translation.ts           t() wrapper bound to language store
  use-mobile.ts                Responsive helper
  use-otp-countdown.ts         Resend timer
lib/
  api.ts                       Axios instance with interceptors
  utils.ts                     cn()
  i18n/translations.ts         EN/SW dictionary
  stores/
    preferences-store.ts       theme + language (persisted)
    booking-store.ts           Multi-step booking state (persisted)
    auth-store.ts              user + token (persisted, mocked)
providers/
  providers.tsx                QueryClient + Theme + Toaster
index.d.ts                     Global types: Trip, Bus, Route, Booking, ...
HANDOFF.md                     Backend contract / endpoint reference
```

## Routing & route groups

We use App Router **route groups** to share layouts without affecting the URL:

- `(landing)` → public pages, NavBar + Footer
- `(auth)` → login / sign-up / verify-otp, gradient-only layout
- `(dashboard)` → authenticated, sidebar + auth check

`app/trips/*` is intentionally _not_ in a group so it's accessible to both guests (booking flow) and signed-in users.

## Booking flow

```
Landing → (search) → /trips?origin=&destination=&date=
       → /trips/[id]/seat → /trips/[id]/passenger
       → /trips/[id]/payment → /trips/[id]/confirmation
```

State across these pages lives in `lib/stores/booking-store.ts` (persisted to `localStorage`), so a refresh mid-flow won't lose progress. The store is `reset()` after confirmation.

## Authentication (mocked)

The backend phone-OTP endpoints are not finalised, so `hooks/use-auth.ts` simulates them client-side:

- `useSendOtp({ phone })` — succeeds after a short delay
- `useVerifyOtp({ phone, otp })` — accepts `123456` (`MOCKED_OTP`)
- `useUser()` / `useLogout()` — read/clear the persisted Zustand `auth-store`

Swap the inner bodies of these hooks for real `api.post(...)` calls when the backend ships — the public hook signatures are stable, so pages won't change.

## Data fetching pattern

All HTTP goes through `lib/api.ts`:

```ts
import api from "@/lib/api";
const { data } = await api.get<Trip[]>("/api/trips/");
```

Interceptors:

- **Request** — attaches `Bearer <token>` from `localStorage` (`AUTH_TOKEN_STORAGE_KEY`)
- **Response** — normalises errors so `error.message` is always user-friendly

### Adding a new API hook

1. Add the response shape to `index.d.ts` if it's a new domain entity.
2. Create `hooks/use-<resource>.ts`:

   ```ts
   "use client";
   import { useQuery } from "@tanstack/react-query";
   import api from "@/lib/api";

   export const FOO_QUERY_KEY = ["foo"] as const;

   export const useFoo = (id: string) =>
     useQuery({
       queryKey: [...FOO_QUERY_KEY, id],
       queryFn: async () => (await api.get<Foo>(`/api/foo/${id}/`)).data,
       enabled: Boolean(id),
     });
   ```

3. For mutations, invalidate related keys in `onSuccess`:

   ```ts
   const qc = useQueryClient();
   useMutation({
     mutationFn: (input: CreateFooInput) => api.post("/api/foo/", input).then((r) => r.data),
     onSuccess: () => qc.invalidateQueries({ queryKey: FOO_QUERY_KEY }),
   });
   ```

4. Use `ToastAlert.success/error` from `@/config/toast` for feedback.

## Theming

`app/globals.css` defines tokens in `oklch` for both `:root` and `.dark`. Brand primary is the same green as Ankara: `oklch(0.55 0.18 160)` (light) / `oklch(0.65 0.18 160)` (dark).

Toggle via `useTheme()` from `lib/stores/preferences-store.ts` — persisted, with an inline FOUC script in `app/layout.tsx`.

## i18n

EN/SW dictionary in `lib/i18n/translations.ts`. Use the hook:

```ts
const { t } = useTranslation();
t("landing.headline");
t("dashboard.welcome", { name: user.full_name });
```

To add a string, drop the same key into both `en` and `sw` blocks.

## Conventions

- **Functional components only**, **arrow functions everywhere** (no `function` keyword).
- File names: kebab-case (`trip-card.tsx`).
- Component exports: named `export const Foo = (...)` for shared bits, `export default` only for Next.js pages/layouts.
- Avoid narrating comments — comments only explain non-obvious intent.
- Use the `@/` path alias (mapped to repo root in `tsconfig.json`) — never relative imports across folders.
- Forms: `react-hook-form` + `zod` via `@hookform/resolvers/zod`.
- Dates: `dayjs` (helpers in `helpers/helpers.ts`).
- Money: `formatCurrency(amount, { code: "TZS", decimalDigits: 0 })`.

## Backend contract

See [`HANDOFF.md`](./HANDOFF.md) for the up-to-date endpoint list. As of writing:

- `GET /api/trips/search/?origin=&destination=&date=&passengers=`
- `GET /api/trips/` and `GET /api/trips/{id}/`
- `POST /api/bookings/create/`
- `GET /api/bookings/` and `GET /api/bookings/{id}/`
- `GET /api/routes/`

## Roadmap

- Real phone-OTP backend integration (replace mocks in `use-auth.ts`)
- Payment gateway (Mobile Money + card)
- PDF / image ticket download on confirmation
- Trip history filters and search
- Push notifications for trip updates
- Plane bookings
