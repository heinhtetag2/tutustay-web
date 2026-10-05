# 01 · Product audit and reference findings

> **Update (docs/05):** §4b (CT-1 to CT-5) and open question Q1 are largely **resolved** by the Terms of Service, which I had not read when this was written. Payment is per hotel, and a booking is a request with seven stages. See [05-parity-and-findings.md](05-parity-and-findings.md).

Status: **proposal for review. No implementation has started.**
Audited: `https://dev.tutustay.com/` on 2026-10-05, a **dev environment** with test data.

Tags used throughout:
- **[C] Confirmed**: observed directly in the UI, in a page's text, or in a network response.
- **[I] Inferred**: a reasonable reading of the evidence. It needs confirming with you or the backend team.
- **[R] Recommendation**: my proposal, not a fact about the product.

---

## 1. Scope and limits of this audit

| Area | Status |
|---|---|
| Public pages (home, search, destinations, deals, property, reserve step 1, help, FAQ, contact, 1:1 Q&A gate, guide, about, partners, become-a-partner, download, landing, login) | **Read in full.** |
| Property → "Reserve" → room list | **Observed.** |
| Everything **after "Select Room"** (guest details, coupon entry, deposit/KBZPay, confirmation) | **Not observed.** It needs a login, and I did not create an account or start a booking, as instructed. |
| `/account/*` (bookings, favorites, reviews, promo codes) | **Not observed.** All redirect to `/login?next=…`. |
| `/legal/*` pages | **Not read.** The legal text may state business rules, so I'd like to read it next. |
| Mobile | Home and search checked at 375px. The rest was checked at desktop width only. |
| Keyboard, screen reader, focus states | **Not audited.** Only colour contrast was calculated. |
| Repository, API docs, backend | **None provided.** The working folder is empty. |
| Booking.com, Agoda, Vrbo | **Not inspected live.** Booking.com, Agoda and Vrbo block automated browsing or need JS flows I did not drive. Mobbin returned Expedia, Klook, Navan, Kayak, Tripadvisor and Airbnb screens instead, so those carry the reference study. |

Dev data is noisy ("Corporis Tempore Si", Korean and Burmese place names, `Ks 0` stays, lorem-ipsum descriptions, empty photo placeholders). I treat it as **test data and not as a UX defect**, except where it exposes a design weakness such as the unclear location taxonomy.

---

## 2. Sitemap as found [C]

```
/                          Home: search, category chips, trust, destinations, stays
/search?city=&checkIn=&checkOut=&guests=&rooms=&category=&sort=
/destinations              Flat list of 13 "destinations"
/deals                     Tabs: All deals / My coupons / Claimed / Expired
/hotel/:id                 Property detail (stay type, dates, guests, "Reserve", call button)
/hotel/:id/reserve?...     "Choose your rooms"; Select Room is a button, not a link
/login                     Email + password, Google, Telegram, "create an account"
/account  /bookings  /favorites  /reviews  /promo-codes      (auth-gated)
/help  /help/faq  /help/contact  /help/inquiry (1:1 Q&A, auth-gated)  /guide
/about  /landing  /download
/partners  /partners/become-a-partner
/legal/terms  /privacy  /cookies  /location
```

Header at the tested width: logo, language (EN), headset icon (help), **Sign in**. `WebFetch` reported nav links for property categories and Deals. At the width I tested, those appear as home-page chips and tiles, not in the header. **Verify at ≥1280px.**
Technical clues [C]: Next.js App Router with a `[locale]` segment. Tailwind-style CSS variables. Images come from a DigitalOcean Spaces CDN. A same-origin `/api/hotel/:id/available-rooms` endpoint exists.

## 3. Journeys as observed

**Discover → book (guest), [C] up to the sign-in wall**
1. Home: Location, Check-in, Check-out, Rooms and Guests (default `2 guests · 1 room`, dates default to today and tomorrow), category chips (All, Hotel, Motel/Guest house, Resort, Campsite).
2. `/search`: filter panel (category, "other": Popular / Reservation Available / Coupons, price range, room facilities, review score, property facilities, bed types), sort, map or card view, **Filter → "Apply" button**.
3. `/hotel/:id`: Stay type, dates, adults, children, rooms, **"Include Foreigner"**, "Price from", **Reserve**, **Call**.
4. `/hotel/:id/reserve`: date and guest summary with Edit, room cards (name, "Only 1 left", max guests, bed, amenities, refund label, breakfast, **Local Price**, per-night price, total) and **Select Room**.
5. **Not observed:** sign-in gate, guest details, coupon entry, deposit, confirmation, My bookings.

**Partner:** `/partners` → `/partners/become-a-partner` (business, contact, address, ≤5 documents of 5MB each) → email reply → TuTuStay Manager (a **separate application**).

**Support:** Help → FAQ (23 Qs), Contact, 1:1 Q&A (login), Guide.

## 4. Business rules visible in the interface

### 4a. Rules stated consistently [C]
| ID | Rule | Source |
|---|---|---|
| BR-01 | An account is required to book. There is no guest checkout. | FAQ 16/19, `/account/*` redirects |
| BR-02 | Sign-in methods: email and password, Google, Telegram. | `/login` |
| BR-03 | Stay types: **Night** (check-in 14:00 → 12:00 next day), **Session** (3 / 6 / 9 / 12 hrs from 14:00 same day), **Daycation** (named on partner pages). | Property policy block, `/partners` |
| BR-04 | **Local vs foreigner pricing** per room type, with a foreigner toggle on the property page. | Property page, rooms API (`price`, `foreignerPrice`, `dayUsePrice`, `daycationPrice`) |
| BR-05 | Availability is per room type with a remaining count. Only rooms available for the dates are shown. | Reserve page, Guide |
| BR-06 | Property categories: Hotel, Motel/Guest house, Resort, Campsite (partner form says "tent site"). | Home, search URLs |
| BR-07 | Reviews are allowed only after a completed booking. | Home trust block |
| BR-08 | Refundability is per room type (`refundable:false` renders "Non-refundable"). | Rooms API and UI |
| BR-09 | A user-cancelled booking is **not refunded**. If the property cancels, the refund goes to the original method within 3 days. | FAQ 10–12, Contact |
| BR-10 | Dates can be changed **before confirmation**, not after payment. Later changes follow the property's policy. | FAQ 13, 18 |
| BR-11 | Multiple rooms per booking (subject to availability). Booking on behalf of someone else is allowed. | FAQ 14, 15 |
| BR-12 | A platform fee exists and is shown during booking. | FAQ 3 |
| BR-13 | Coupons are claimed first, then the code is entered at checkout. | Deals, Help |
| BR-14 | Property policies shown: check-in and check-out times, breakfast, stay-type windows. | Property page |
| BR-15 | Partner onboarding: application → review (licences may be requested) → Manager account. | `/partners/become-a-partner` |
| BR-16 | Currency is Myanmar Kyat (`Ks`). Languages are English, Burmese and Korean. The Guide adds a fourth (MN). | Site-wide, Guide |

### 4b. The site contradicts itself on the core transaction model [C]
This is the **most important finding**. Almost every booking-flow decision depends on it.

| # | Statement A | Statement B | Where |
|---|---|---|---|
| CT-1 | **Pay by KBZPay deposit.** "Deposit required for every hotel." Booking is **not confirmed until the deposit is paid.** | **Pay cash on arrival.** "No card, no deposit, no online payment." | A: Home, FAQ 4–7. B: `/about`, `/partners`, `/download` |
| CT-2 | **Platform fee** charged to the guest. | "No payment processing" and "you are not charged either way". | FAQ 3 vs `/about` |
| CT-3 | Booking is a **request** the property reviews and confirms. | **"Instant booking"**, "confirm in seconds". | `/about` vs `/landing`, Guide |
| CT-4 | Hotel contact details are shown **after** booking. | A **Call** button with the phone number shows **before** booking. | FAQ 23 vs property page |
| CT-5 | Room labelled **Non-refundable**. | With cash on arrival, nothing is paid, so "refund" has no meaning. | Reserve page |
| CT-6 | "Claimed coupons are stored in **this browser**… needs a backend the website does not have yet." | Marketing says coupons are applied at checkout, and the app keeps them on the account. | Deals page vs Download |

[I] The most likely reading is that the **app and the website are at different stages**. The About, Partners and Download copy describes a cash-on-arrival request model, while the FAQ and Home describe a KBZPay deposit model. I can't tell which one is current. This is **Open Question #1** and blocks the payment and confirmation screens.

Marketing numbers (`50k+ travelers`, `1,200+ hotels`) sit beside a dev catalogue of 12 stays. [I] They are probably aspirational. **Don't reuse them without a source.**

## 5. Forms and interaction states [C unless noted]
- **Search bar:** destination is free text. After arriving via `?city=yangon`, the heading says "Stays in Yangon" but the destination field shows its empty placeholder.
- **Filters:** staged behind an **Apply** button, while the Guide says "results refresh live". Price is min/max with a 0–1,000,000 slider.
- **Property booking card:** steppers for adults and children. The foreigner toggle is a single yes/no, so a mixed party is not modelled [I].
- **Login:** inline email and password with "Forgot password?". Error and validation copy not observed.
- **Partner form:** clear helper text and an "optional" convention. Validation not observed.
- **States seen:** empty (`No coupons right now`), skeleton or grey placeholder images, "Only 1 left". **Not seen:** error, unavailable-for-dates, session-expired, loading of long operations.

## 6. Findings

Severity: **P0** blocks a coherent flow. **P1** hurts task completion or trust. **P2** polish.

| ID | Sev | Finding | Tag |
|---|---|---|---|
| F-01 | P0 | Payment and confirmation model is contradicted across pages (CT-1 to CT-5). | C |
| F-02 | P0 | The **Night / Session / Daycation × Local / Foreigner** pricing matrix is Myanmar-specific and the core differentiator. It is hidden. Search can't filter by stay type, the property page has a single "Price from", and rooms appear only after Reserve. | C/I |
| F-03 | P1 | **Rooms can't be compared on the property page.** They only appear on a separate `/reserve` page, so the user commits to "Reserve" before seeing rooms or the total. | C |
| F-04 | P1 | **Price is never shown as a total with fees** before the room step. Search shows `Ks X /night` only. The FAQ says a platform fee exists. | C |
| F-05 | P1 | **Terminology drifts:** Hotel / stay / property; Reserve / Book / Reservation; My Stay / My Booking / My bookings; Local Price vs foreigner. URLs use `/hotel/` for campsites and resorts. | C |
| F-06 | P1 | **Three date formats** in one flow: `Mon 5 Oct`, `5 October 2026`, `Oct 05 ~ Oct 06`. | C |
| F-07 | P1 | **Location taxonomy is flat.** `/destinations` mixes cities, townships and regions ("Hlaing", "Hlaing Township", "Yangon"). Each is a separate destination. | C |
| F-08 | P1 | **Search state mismatch** (heading says Yangon, field empty). Filters need Apply, contradicting the Guide. | C |
| F-09 | P1 | Contact policy contradiction (CT-4). Pre-booking phone contact may be useful in Myanmar, but the rule must be explicit. | C |
| F-10 | P1 | **Brand-colour contrast fails AA for normal text**: white on `#0284C7` = 4.10:1 (needs 4.5). Buttons are 14–17px / weight 500. `--color-text-faint #9E9EA0` on white = 2.67:1. | C (calculated) |
| F-11 | P1 | Coupons are browser-local only (CT-6), so they vanish across devices. | C |
| F-12 | P2 | Filter labels: "Properties Categories", lowercase "other", "Available Hotel 5" (singular, count after). Unrated stays render `0 (0)` with a gold star. | C |
| F-13 | P2 | FAQ lists a question twice (#16 and #19). Page titles repeat the brand ("About TuTuStay · TuTuStay"). Grammar slips ("max 2 Guest"). | C |
| F-14 | P2 | Auth-gated pages redirect to `/login?next=` but there is no booking-time explanation of **why** sign-in is needed. | C/I |
| F-15 | P2 | `/landing` and `/download` partly duplicate Home and About. Three marketing entry points, one product. | C |
| F-16 | P2 | Design tokens exist but contain gaps and redundancy (see doc 03). | C |

**Worth preserving:** the foreigner-pricing explanation ("may have higher rates due to hotel pricing rules"), the review-only-after-stay trust rule, the "Stay near you" entry, plain FAQ answers, the partner form's clear helper text, the existing semantic token layer (`--color-brand`, `--color-text-*`, `--color-line`).

---

## 7. Reference study

**Sources:** Airbnb (live, measured), Mobbin MCP (connected, working), Expedia / Klook / Navan / Kayak / Tripadvisor / Kiwi.com via Mobbin screens. Booking.com, Agoda and Vrbo were not examined (see §1).

Key Mobbin references: [Expedia "Choosing a room"](https://mobbin.com/flows/e87f6f40-6e2b-4f5a-8bba-26db2fb878cd), [Expedia "Reserving a room"](https://mobbin.com/flows/0bc816fd-c964-40dc-95db-81486a00f0fc), [Klook "Book a hotel"](https://mobbin.com/flows/4bd78a36-4243-4649-965c-dfc478db5351), [Klook "Hotel detail"](https://mobbin.com/flows/e92b1aa4-27f5-41d2-ae90-e70ddf7be933), [Navan "Hotel detail"](https://mobbin.com/flows/9a5da622-9c41-4022-a656-d1aae48d1ca2), [Airbnb search + map](https://mobbin.com/screens/4b9d614f-7f68-47bb-83e6-7fd35efca097), [Airbnb sticky booking card](https://mobbin.com/screens/7cbdb1f6-a5dd-4afa-a957-a30442256f6e).

| Pattern (where seen) | User problem it solves | Where it fits TutuStay | Fits our business rules? | Verdict |
|---|---|---|---|---|
| **Sticky booking card** with dates, guests and total (Airbnb, Expedia, Turo) | Keeps the decision and the action together while scrolling | Property page, right column on desktop, bottom bar on mobile | Yes. Needs a stay-type selector added. | **Adopt**, adapted |
| **Room list on the property page** with per-room price, refund label and CTA (Expedia, Klook, Navan) | Compare rooms without leaving the page | Replaces the separate `/reserve` room step (F-03) | Yes | **Adopt** |
| **"Pay now / Pay when you stay" explainer** (Expedia modal; TravelPerk "pay in advance vs on arrival: $0") | Makes the payment model unmistakable | Price breakdown: "Pay now" vs "Pay at property" | **Depends on Open Question #1.** It works for either model. | **Adopt the pattern**, content pending decision |
| **Price breakdown rows** (nights × rate, taxes and fees, total, due today vs due at property) (Expedia, Klook, TravelPerk) | Removes surprise at checkout | Review step and room card "Price details" | Yes. Platform fee must be shown (FAQ 3). | **Adopt** |
| **All-in price messaging** ("Prices include all fees", seen live on Airbnb SG) | Trust, no surprise | Search cards and room cards show total for the stay | Yes, if the platform fee is known per booking | **Adopt**, subject to fee clarity |
| **Search bar as a persistent summary** (Klook, Navan, Expedia: dates, nights, guests editable in place) | Change dates without restarting | Search results and property and reserve headers | Yes | **Adopt** |
| **Filter groups with counts, price histogram, quick chips** (Tripadvisor, Expedia, Klook) | Narrow quickly | Search results filters | Yes. Filters must come from real facets in the data. | **Adopt**, but keep short: category, price, review score, facilities, bed type |
| **List + map split with price pins, "search as I move the map"** (Airbnb, Navan, Kiwi, Klook) | Neighbourhood judgement | Already present on TutuStay | Yes | **Keep**, make the map secondary on mobile (button, as now) |
| **Section tabs** (Overview · Rooms · Amenities · Reviews · Policies) (Klook, Navan, Expedia) | Fast navigation on a long page | Property page | Yes | **Adopt** |
| **Review aggregate + category bars + verified badge** (Klook, Navan) | Trust | Reviews section, with "Verified stay" (matches BR-07) | Yes | **Adopt** |
| **Countdown timer to hold a rate** (Navan, Klook) | Urgency | Only if deposits and holds exist | Unknown, and it risks pressure tactics | **Defer.** Don't import without a real hold rule. |
| **Scarcity badges** ("Only 2 left", "flash sale ends in…") (Klook) | Urgency | TutuStay already shows "Only 1 left". It is real data. | Yes for real counts only | **Keep real stock only**, no fake urgency |
| **Loyalty / credits / bundles / insurance upsell** (Expedia, Klook, Navan) | Revenue | Not in current requirements | No | **Do not import** |
| **Multi-channel rate comparison** (Navan, Kayak, Kiwi) | Finds the cheapest seller | N/A: TutuStay is the single seller | No | **Do not import** |
| **Free-cancellation filter + per-room refund radio** (Expedia, Tripadvisor) | Reduces risk | Room cards already carry a `refundable` flag, so a "Refundable" filter is cheap | Yes (BR-08) | **Adopt** the filter and label. **No** new cancellation tiers. |

**Reference gap:** none of these platforms handles **hourly Session / Daycation stays** or **local vs foreigner pricing**. This is TutuStay's own design problem. §5 of `02-ux-foundation.md` proposes a first answer.
