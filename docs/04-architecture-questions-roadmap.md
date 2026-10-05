# 04 · Technical architecture, open questions and roadmap

> **Update (docs/05):** Q1 is answered by the Terms (per-stay payment mode). Q7 resolved as D-7. The remaining questions are in docs/05 §6. The folder tree has grown: see the README for the current structure.

Status: **proposal.** No repository, API documentation or backend was provided, and `/Users/heinhtet/Documents/TuTuStayWebRevamp` is empty. Everything in §1 is based on **what the live site exposes**, not on its source.

---

## 1. Evidence about the current stack [C unless noted]
- **Next.js, App Router, with a `[locale]` route segment** (chunk names like `app/[locale]/guide/page-….js`, RSC prefetch requests, `/_next/image`).
- **Tailwind-generated CSS variables** (`--color-*`, `--spacing`, `--text-*`, `--radius-*`) plus a hand-made semantic layer (`--color-brand`, `--color-text-primary`, `--color-line`).
- **Same-origin API route:** `GET /api/hotel/:id/available-rooms?stayType&checkIn&checkOut&guests&rooms`. Response fields: `id, name, bed, capacity, availableCount, price, foreignerPrice, dayUsePrice, foreignerDayUsePrice, daycationPrice, foreignerDaycationPrice, refundable, photos[], amenities[]`.
  [I] This is a backend-for-frontend (BFF) layer in front of a real backend. **The upstream API is unknown.**
- Images served from a DigitalOcean Spaces CDN. Map: provider unidentified.
- The Deals page states that coupon claiming **is stored in the browser** because "the website" has no backend support yet. The mobile app has it. [I] The app has capabilities the web backend integration does not.
- Language switcher present. Locale files and the translation tool are unknown.

## 2. Recommended stack [R]

**Stay on Next.js (App Router) + TypeScript + Tailwind CSS.** It is what the product already uses, the URL structure, SSR/SEO and i18n routing all fit, and a migration would add risk without user benefit.

| Concern | Choice | Why |
|---|---|---|
| Framework | **Next.js App Router**, Server Components by default | Matches the current product. SEO for search and stay pages. |
| Language | **TypeScript (strict)** | Shared domain types. Safer pricing logic. |
| Styling | **Tailwind CSS with tokens defined as CSS variables** (semantic tokens only in components) | Existing practice. Business logic stays out of styling. |
| i18n | **`next-intl`** (EN, MY, KO, and MN if confirmed) | Locale segment already in use. Handles plurals and formats. |
| URL state | Search params parsed and validated in one place (**`nuqs`** or a small hand-rolled hook) | Search state lives in the URL (as today). Shareable and recoverable. |
| Server data | Server Components + `fetch` with tags. **TanStack Query** only for client-interactive data (live filters, map) | Avoids duplicating caches. |
| Forms and validation | **React Hook Form + Zod**; schemas in `domain/` | One source for validation, shared by client and server. |
| Auth | Behind an **`AuthService` interface**: adapter for the real backend. Mock adapter for development. | Auth contract unknown (Q9). |
| Testing | **Vitest** (domain + components), **Playwright** (flows), **axe** (a11y in CI) | Pricing and flows are the risk. |
| Mocking | **MSW** mock handlers, labelled "MOCK" in the UI and in code | The brief requires mock data to be visibly mock. |
| Quality | ESLint, Prettier, `tsc --noEmit`, size budget in CI | |
| Config | Environment variables validated with Zod. **No secrets in the repo.** | |

Not recommended: a global state library (Redux, Zustand) on day one. Add one only if cross-page client state emerges. A component library (MUI, Chakra) would fight the token system. **Headless primitives (Radix UI)** for date picker, dialog, popover, tabs and sheet cover the accessibility-heavy parts without imposing visuals.

## 3. Principles
1. **Domain is pure.** `domain/` has no React, no `fetch`, no CSS. It is plain TypeScript and fully unit-tested.
2. **UI never computes money.** Totals, fees, and refund consequences come from `domain/pricing`.
3. **Features own their pieces.** A feature folder contains its components, hooks, and server actions. Shared code moves to `shared/` only when a second feature needs it.
4. **One way to call the backend.** All HTTP goes through `services/`. Components never `fetch`.
5. **Tokens in one place.** Components use semantic tokens. Raw hex values never appear in components.
6. **No premature abstraction.** Rule of three before extracting.

## 4. Folder tree

```
tutustay-web/
├─ src/
│  ├─ app/                                  # Routes + page composition only (thin)
│  │  └─ [locale]/
│  │     ├─ (marketing)/  page.tsx · about/ · download/ · partners/
│  │     ├─ search/page.tsx
│  │     ├─ stays/[id]/page.tsx
│  │     ├─ stays/[id]/book/page.tsx
│  │     ├─ bookings/[ref]/page.tsx
│  │     ├─ account/ (bookings|saved|reviews|coupons)/
│  │     ├─ deals/ · destinations/ · help/
│  │     ├─ login/
│  │     ├─ layout.tsx · error.tsx · not-found.tsx
│  │  └─ api/                               # BFF route handlers, thin, call services/
│  │
│  ├─ features/                             # Feature components + logic
│  │  ├─ search/        (SearchBar, Filters, ResultCard, ResultsMap, useSearchParams, search.schema.ts)
│  │  ├─ stay-detail/   (Gallery, SectionTabs, RoomList, RoomCard, PoliciesBlock, BookingCard)
│  │  ├─ booking/       (ReviewStep, GuestForm, CouponField, PriceBreakdown, BookingStatus)
│  │  ├─ auth/          (LoginForm, AuthGate, session hooks)
│  │  ├─ deals/         (CouponCard, ClaimButton)
│  │  ├─ bookings/      (BookingList, CancelDialog)
│  │  ├─ reviews/       (ReviewList, ReviewForm, RatingSummary)
│  │  ├─ help/          (FaqList, EnquiryForm)
│  │  └─ partners/      (PartnerApplicationForm)
│  │
│  ├─ shared/
│  │  ├─ ui/            # Button, Input, Select, Checkbox, Dialog, Sheet, Tabs, Badge, Skeleton, EmptyState, ErrorState, Toast
│  │  ├─ layout/        # Container, Section, Grid, Header, Footer, PageHeader, StickyBar
│  │  ├─ components/    # DateRangePicker, GuestStepper, Price, StatusBanner, LanguageSwitcher
│  │  └─ hooks/         # useMediaQuery, useDebounce, useFocusTrap
│  │
│  ├─ domain/                               # Business rules. Pure TypeScript.
│  │  ├─ stay/          (Stay, StayType, PropertyCategory)
│  │  ├─ room/          (RoomType, Availability, rate selection by stayType × guestType)
│  │  ├─ pricing/       (computeTotal, fees, discounts, payNow/payAtProperty)   ← tested heavily
│  │  ├─ booking/       (Booking, BookingStatus, allowed transitions, cancellation rules)
│  │  ├─ coupon/        (eligibility, application)
│  │  ├─ review/        (eligibility: completed booking only)
│  │  ├─ money.ts · dates.ts · guests.ts
│  │  └─ policy.ts      (single place for refund / change rules; BR-09, BR-10)
│  │
│  ├─ services/                             # API + data access (no React)
│  │  ├─ http/          (client, errors, retry)
│  │  ├─ stays.service.ts · rooms.service.ts · bookings.service.ts
│  │  ├─ auth.service.ts · coupons.service.ts · reviews.service.ts · support.service.ts
│  │  ├─ mappers/       (API DTO → domain model; the only place that knows API field names)
│  │  └─ mocks/         (MSW handlers + fixtures: clearly labelled MOCK)
│  │
│  ├─ validation/       # Zod schemas (search params, guest details, partner application)
│  ├─ i18n/             # config, messages/{en,my,ko}.json, format helpers
│  ├─ styles/
│  │  ├─ tokens/        # primitives.css · semantic.css · typography.css · layout.css
│  │  └─ globals.css
│  ├─ config/           # env.ts (Zod-validated), feature flags (paymentModel: 'cash' | 'deposit')
│  └─ types/            # shared non-domain types
│
├─ public/              # Static assets, icons, fonts (self-hosted subsets)
├─ tests/               # e2e/ (Playwright flows) · a11y/ · fixtures/
├─ docs/                # These documents, ADRs, glossary, token reference
├─ .env.example         # Names only, no values
└─ README.md
```

**Payment model as configuration:** `config.paymentModel = 'cash' | 'deposit'` selects copy, the confirmation step and the status flow. Both variants are built once Q1 is answered. Until then both are mocked.

## 5. Open questions

**Blocking (P0)**
| # | Question | Needed for |
|---|---|---|
| Q1 | **Which payment model is current?** Cash on arrival with a request→confirm flow (About, Partners, Download), or a required KBZPay deposit with a platform fee (Home, FAQ)? Are both live, for different properties? | Review step, confirmation, FAQ, trust copy |
| Q2 | Is the website replacing the **mobile app**, complementing it, or both? Is the web backend the same as the app's? | Scope, coupons, account features |
| Q3 | Final **stay-type names and rules**: Night, Session (3/6/9/12 hrs), Daycation. How do `dayUse` and `daycation` differ? Are session start times fixed (14:00) or chosen? | Search bar, price display |
| Q4 | Does the **search API** accept stay type and guest type, or only dates and guests? | Search UX |
| Q5 | How should **foreigner pricing** work for mixed groups, and how is it verified at the property? | Booking card, policy copy |

**Important (P1)**
| # | Question |
|---|---|
| Q6 | Is there a **location hierarchy** (region > city > township) in the data, or only free-text names? |
| Q7 | Policy on showing the **property phone number before booking**. |
| Q8 | **Platform fee** rule: fixed, percentage or per booking? Shown inside the total? |
| Q9 | **Auth contract**: email/password, Google and Telegram, tokens, session length, password reset. |
| Q10 | **Booking API**: statuses, request expiry, cancellation endpoints. |
| Q11 | Source for marketing numbers (50k+ travellers, 1,200+ hotels), or remove. |
| Q12 | Languages: three (EN, MY, KO) or four (+MN)? Who supplies translations? |
| Q13 | Read `/legal/*` and the account area. Can you share a test account, or should I go without? |
| Q14 | **Brand assets:** logo files, any brand guideline, and approval of **D-1** (button fill `#0369A1`) and **D-2** (keep Roboto). |
| Q15 | Is there an existing repo I should align with, or is this a clean rebuild that consumes the same API? |

## 6. Implementation roadmap

| Phase | Outcome | Exit check |
|---|---|---|
| **0 · Decisions** | Answers to Q1 to Q5 and D-1/D-2. Sign-off on sitemap and flows. | Written decisions in `docs/` |
| **1 · Foundations** | Repo scaffold, tokens, typography, layout primitives, shared UI kit with all states, i18n skeleton, mock layer, CI (lint, types, tests, axe) | Storybook-free kitchen-sink page. Contrast tests green |
| **2 · Discovery** | Home, Search (URL state, filters, list/map), Destinations | Search flows work end-to-end on mock data |
| **3 · Stay + price** | Stay detail with rooms, sticky booking card, stay type × guest type, `domain/pricing`, price breakdown | Pricing unit tests cover every rate combination |
| **4 · Booking (mock)** | Auth gate with state preservation, Review step, status page, both payment variants behind a flag | Playwright flow incl. failure paths |
| **5 · Account and support** | My bookings, cancel, reviews, deals, help, partner application | |
| **6 · Hardening** | Accessibility pass, performance budget, Burmese/Korean QA, real API adapters | Ready for visual design phase |

**What I'll build after approval (the "low-fidelity foundation"):** phases 1 to 4 at low fidelity, plus static versions of phase 5 pages. Every mock endpoint and simulated outcome will carry a visible **MOCK** label. I will not present a simulated booking as a working backend. Mock "bookings" will say so on screen.
