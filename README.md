# TuTuStay web: product foundation (low-fidelity)

A functional, low-fidelity rebuild of the TuTuStay web product, made to **validate flows, information architecture and design foundations** before visual design. It covers every page and feature visible on `dev.tutustay.com`, plus UX improvements (see [`docs/05`](docs/05-parity-and-findings.md)).

> **Everything here is MOCK.** There is no backend. Stays, rooms, rates, coupons, reviews, sign-in, bookings, enquiries and applications are invented fixtures, kept in your browser's `localStorage`. No hotel, payment, email or SMS is behind them, and the UI says so (black strip on every page, banners on booking, sign-in, sign-up and partner screens).

Docs: [`docs/`](docs): `01` audit and references · `02` UX foundation · `03` design system · `04` architecture · **`05` parity, new findings and decisions (read this first)** · `06` [usability test kit](docs/06-usability-test-kit.md).

## Run

```bash
npm install
npm run dev          # http://localhost:3000 → /en   (the preview config uses :3100)
npm test             # 31 unit tests (domain, validation, API mapper)
npm run test:e2e     # 189 Playwright tests, desktop + mobile, incl. axe WCAG 2.2 A/AA audits and a live-strings parity test
npm run typecheck && npm run build
```

First e2e run: `npx playwright install chromium`. Use `npx playwright test --workers=2`: the dev server compiles each page on first visit, and many parallel workers cause timeouts that are not real failures. Tests stub map tiles, so they never hit a tile server. Optional live contract check against the dev API: `LIVE_CONTRACT=1 npx vitest run live-contract`.

## How booking works here (from the live Terms of Service §04–§06)

- **Payment is set per stay:** *Pay at hotel* (TuTuStay takes no payment) or *Online* via KBZPay (with a deposit share set by the hotel). Every card, room and booking says which.
- **A booking is a request.** Stages: **Pending → Accepted → Confirmed**, plus **Overdue, Rejected, Cancelled, Completed**. Rejected, Cancelled and Completed are final.
- **Online stays:** pay after the hotel accepts, before the deadline on the booking. **Pay-at-hotel stays:** nothing to pay online.
- **There is no in-app cancel.** The booking page shows the hotel's number and says each hotel sets its own rules.
- The booking page has **Mock controls** to simulate the hotel or payment provider moving a booking between stages.

## Try it

1. Search → pick a stay → rooms and a sticky booking card are on the page. Try **Overnight / Session / Daycation**, **Guest from outside Myanmar**, the **Stay near you** button (real location prompt, explained first), filters, **List / Grid**, and **Show on map** (full-screen map with price pins, clusters, list beside it, Esc or Close map to leave).
2. Choose a room → sign in (mock; any valid email and a 6+ character password, or phone code `123456`) → you land back on the same booking → review, coupon (`WELCOME10`, `TUTU5000`, `OLDDEAL` is expired) → send request.
3. Try both kinds of stay: **Shwe Pann Hotel** (online, 30% deposit) and **Inya Lakeside Guest House** (pay at hotel).
4. States: sold out (`Ngapali Palm Resort`, 20–31 Dec 2026), stay type not offered (`Mandalay Lantern Inn`), no results, invalid dates, expired coupon, unknown booking, loading skeleton on search.
5. `/en/dev/kitchen-sink` shows the tokens, type roles and every UI state.

Routes (under `/en`, `/my`, `/ko`): `/`, `/search`, `/stays/:id`, `/stays/:id/book`, `/bookings/:ref`, `/login`, `/signup`, `/forgot-password`, `/account`, `/account/bookings`, `/account/favorites`, `/account/reviews`, `/account/promo-codes`, `/deals`, `/destinations`, `/help`, `/help/faq`, `/help/contact`, `/help/inquiry`, `/account/support/inquiries`, `/guide`, `/about`, `/download`, `/partners`, `/partners/apply`, `/legal/{terms,privacy,cookies,location}`, `/dev/kitchen-sink`. Legacy `/hotel/:id`, `/landing`, `/partners/become-a-partner` and un-prefixed paths redirect.

## What is NOT real

- **No backend, auth, payments, email or SMS.** "Pay online" and sign-in only change mock state.
- **Map tiles are OpenStreetMap** (Leaflet, no API key): fine for a prototype. Before launch pick a keyed provider (MapTiler, Stadia, Mapbox) and set `NEXT_PUBLIC_MAP_TILE_URL`. CARTO's free basemaps now need a key, so they are not used. **No photos**, no notifications, no profile or ID details, no search history, no "⋯" menu.
- **Legal pages are plain-language summaries plus a placeholder notice**, not the legal text.
- **Assumed values, not business rules:** platform fee (Ks 1,000, online stays only) in [`src/config/pricing.ts`](src/config/pricing.ts), the 30-minute pay window in [`src/config/booking.ts`](src/config/booking.ts), and `dayUse` API prices mapped to Session in [`room.mapper.ts`](src/services/mappers/room.mapper.ts).
- **Booking creation, payment, My bookings detail and notifications** are not observable on the live site without an account, so they are built from the Terms and FAQ and may differ from the real app.
- `my` and `ko` translations are **skeletons** (fall back to English).
- Not yet done: keyboard-only and screen-reader walkthroughs, real-device testing.

## Real API (optional, rooms only)

Set `TUTUSTAY_API_BASE_URL` (server-only, see `.env.example`) to read **rooms** from a real API through a typed adapter (`src/services/api`, `mappers`). Rooms is the only endpoint with an observed contract. Stays are still mock, so for end-to-end use you need real stay data too.

## Brand assets

The logo is a placeholder: `LogoMark` (`src/shared/ui/LogoMark.tsx`) renders an empty brand-blue tile in the header and as the empty-photo placeholder. The real TuTuStay logo is intentionally not used.

## Structure

```
src/
  app/[locale]/…      routes and page composition only
  features/           search, stay-detail, booking, bookings, auth, deals, help, support, partners, legal, home
  shared/             ui/ (kit), layout/, components/, hooks/, lib/
  domain/             business rules, pure TypeScript, tested (rates, pricing, coupons, booking lifecycle, geo, reviews)
  services/           data access; api/ + mappers/ (real), mocks/ (fixtures + localStorage store)
  validation/         Zod schemas (search params, guest details, partner application)
  i18n/               config, typed messages, small provider (no dependency)
  styles/tokens/      primitives.css, semantic.css, typography.css
  config/             pricing assumptions, booking window, feature flags
tests/e2e/            Playwright flows, states, parity and accessibility
```

Rules this code follows: UI never computes money (it calls `domain/pricing`); components use semantic colour utilities only (the default Tailwind palette is removed); all data access goes through `services/`; search state lives in the URL; `server-only` code never reaches the browser bundle.

## Deviations from the architecture proposal (docs/04)

- i18n is a ~40-line provider, not `next-intl`. No Radix, TanStack Query, MSW or React Hook Form yet: native controls (`<details>`, `<dialog>`, `<input type=date>`) cover the low-fidelity needs.
- The project folder is not its own git repository; nothing has been committed.
