# 02 · UX foundation: principles, sitemap, flows, pages, states, backlog

> **Update (docs/05):** the flows below were drafted with one global payment model and an in-app cancel. The prototype now follows the Terms of Service: payment is per stay, the lifecycle has seven stages, and cancelling is by phone with the hotel. See [05-parity-and-findings.md](05-parity-and-findings.md).

Status: **proposal.** Items are classified as:
- **A**: existing business requirement to preserve.
- **B**: UX improvement that doesn't change business rules.
- **C**: proposed business change, **needs your approval**.

Wherever the payment model matters, I draft both variants. **Model A = cash on arrival, request → property confirms. Model B = KBZPay deposit → confirmed on payment.** The flows are built so the choice is a configuration, not a redesign.

---

## 1. UX principles for TutuStay

1. **Show the real price before the commitment.** Total for the stay, fees included, what is paid now and what is paid at the property. No surprises at the last step.
2. **Make stay type and guest type first-class.** Night, Session and Daycation, and Local vs Foreigner, change the price. They belong in the search and the booking card, not in fine print.
3. **One decision per screen region.** Search is for finding, the property page is for choosing a room, review is for confirming.
4. **Say what happens next.** Every action ends with a plain statement: "The property will confirm your request", "Pay the deposit in KBZPay to confirm", "You pay the property in cash".
5. **Real scarcity, real data.** Only show "Only 1 left" from actual availability. No timers or urgency without a business rule behind them.
6. **Recoverable by default.** Keep the user's search, dates and selection through sign-in, errors and refreshes. A failure always offers a next step.
7. **Myanmar-first, mobile-first, three scripts.** Burmese, Korean and Latin must all render well. Layouts must survive text expansion (Burmese runs taller, Korean wider).
8. **Consistent words.** One name per concept (see glossary). Copy is plain, short, and the same in every language.

## 2. Glossary [B]

| Concept | Use | Retire |
|---|---|---|
| Any listing (hotel, motel, resort, campsite) | **Stay** in guest UI. **Property** in partner and internal contexts. | "Hotel" as the generic term |
| Reservation made by a guest | **Booking** | Reservation, "My Stay", "My Booking" |
| Action on the property page | **Check availability** / **Book** | "Reserve" (ambiguous with "request") |
| Action on a room | **Choose room** | "Select Room" |
| Guest's list | **My bookings** | |
| Stay types | **Overnight**, **Session (3 / 6 / 9 / 12 hrs)**, **Daycation** (final names pending Q3) | "Night / Session / Stay type" mix |
| Price tiers | **Local rate**, **Foreigner rate** | "Local Price", "Include Foreigner" |
| Date display | One format: `Mon, 5 Oct 2026` (long) / `5 Oct` (compact) | Three formats |

## 3. Revised sitemap and navigation [B]

```
Global header:  Logo · Stays (search) · Deals · Help · [Language] · [Sign in | Account menu]
Account menu:   My bookings · Saved · My reviews · My coupons · Support enquiries · Sign out

/                                Home (search-first)
/search                          Results  (list + map; URL carries all state)
/destinations → /destinations/:slug   Place hubs (city > township hierarchy)  [needs Q6]
/stays/:id                       Stay detail (rooms + sticky booking card)       (redirect from /hotel/:id)
/stays/:id/book                  Review & confirm  (auth-gated, state preserved)
/bookings/:ref                   Booking status / confirmation / receipt
/account/bookings | saved | reviews | coupons
/deals                           Coupons (claim, my coupons)
/help  /help/faq  /help/contact  /help/enquiries
/about  /partners  /partners/apply  /download
/legal/*
```
Changes against today:
- `/reserve` is merged into the stay page, and a new `/book` Review step carries the commitment. **[B]**
- `/landing`, `/about` and `/download` are consolidated into About and Download. **[B]**
- `/hotel/:id` becomes `/stays/:id` with a redirect. **[B]**
- A destination hierarchy replaces the flat list. **[B, needs location data, Q6]**
- Deals are added to the header, since coupons are a stated value proposition. **[B]**

## 4. End-to-end flows

### 4.1 Search to booking (primary)

```
Home / Search bar
  where · dates · guests · [stay type] · [foreigner guests?]
        │
Results ──► filters (category, price, review, facilities, beds, refundable, coupons) · sort · list/map
        │
Stay detail
  gallery · summary · section tabs · ROOMS (priced for current stay type / guest type)
  sticky booking card: dates · guests · stay type · total · primary CTA
        │ choose room
Sign-in gate  (only here; returns with state intact)
        │
Review & confirm
  who is staying (me / someone else) · contact · special requests · coupon
  price breakdown (rate × nights, fees, discount, total, PAY NOW vs PAY AT PROPERTY)
  policy summary (cancellation, refund, check-in/out) · terms checkbox
        │
 ┌──────────────── Model A ────────────────┐   ┌──────────────── Model B ─────────────────┐
 │ Request sent → "Awaiting property"      │   │ Pay deposit in KBZPay → return → Confirmed│
 │ → Confirmed / Declined / Expired        │   │ → (Unpaid → Expired)                      │
 └─────────────────────────────────────────┘   └───────────────────────────────────────────┘
        │
Booking status page: details · property contact · directions · receipt · cancel
```

**Failure and alternative paths**
| Step | Failure | Recovery |
|---|---|---|
| Search | No results | Explain why (dates, filters). Offer: clear filters, nearby dates, nearby places, other stay types. |
| Search | Place not recognised | Suggest the closest places. Offer "Stay near you". |
| Stay detail | Chosen dates unavailable | Show the next available dates from data. Keep the search bar editable. |
| Stay detail | Stay type unavailable (e.g. no Session rooms) | Disable the option with a reason. Show the stay types that are available. |
| Choose room | Room sold out between steps | Return to the rooms list with the rest preserved. Say what changed. |
| Sign-in | Wrong credentials | Inline error naming the field. Offer reset. |
| Sign-in | Google or Telegram cancelled | Return to the form, keep the booking state. |
| Review | Coupon invalid, expired or not applicable | Inline reason, and the price stays unchanged. |
| Review | Price changed since the room step | Show old and new totals and require re-confirmation. |
| Confirm (A) | Request declined or expired | Status page explains and offers similar stays and the same dates. |
| Confirm (B) | Payment failed or abandoned | Return to the booking with "Complete payment". Show the time left, if there is a real rule. |
| Any | Session expired or network error | Preserve form data. Retry action. |
| Any | Foreigner/local rate mismatch at the property | Defined by the policy question (Q5). The status page states the rule. |

### 4.2 Manage booking
My bookings (Upcoming / Past / Cancelled) → booking page → **Cancel** (shows the exact consequence first: "This booking is non-refundable" / "No charge") → confirmation. **Property cancels** → notification, status "Cancelled by property", refund timeline if Model B (3 days, FAQ 11). **[A]** for the rules, **[B]** for the presentation.

### 4.3 Review
Only after a completed booking (**[A]**). Entry from the booking page and from email or notification. States: not eligible, eligible, submitted.

### 4.4 Partner
Landing → application (single page, grouped sections) → submitted confirmation with "what happens next" and expected response time → email → Manager. **[A]**

### 4.5 Support
Help home → FAQ search → Contact or 1:1 enquiry (login) → My enquiries thread. **[A]**

## 5. Proposed handling of Stay type and Guest type [B/C]

- **Search bar:** an optional **Stay type** control, default **Overnight**. Choosing Session shows a start-time and duration. Choosing Daycation shows one date. *Depends on the API supporting stay-type search (Q4).*
- **Guests:** adults, children, rooms, plus **"Guest from outside Myanmar"** with a one-line explainer that reuses the existing sentence. Mixed parties need a defined rule (Q5).
- **Prices everywhere** are computed for the active stay type and guest type, and **labelled**: `Local rate · Overnight · 1 night`.
- **Room card** shows the rate for the chosen combination. A secondary line shows other available stay types ("Session from Ks X").

---

## 6. Page-by-page requirements

Template: **Purpose · Primary action · Content hierarchy (top → bottom) · Notes**

| Page | Purpose | Primary action | Hierarchy | Notes |
|---|---|---|---|---|
| **Home** | Start a search | Search | 1 search bar → 2 category chips → 3 popular places → 4 featured stays → 5 deals strip → 6 trust (three claims) → 7 app/partner | Drop unverified stats. Trust copy follows the payment decision. |
| **Search results** | Compare stays | Open a stay | 1 editable summary bar → 2 result count and sort → 3 filters (side panel on desktop, sheet on mobile) → 4 list + map | Filters apply live, or "Apply" only on mobile sheet. Active filters as removable chips. |
| **Stay detail** | Choose a room | Choose room / Book | 1 title, location, rating → 2 gallery → 3 section tabs → 4 **Rooms** → 5 About → 6 Facilities → 7 Policies → 8 Map → 9 Reviews → sticky card | The call button moves to Contact with the policy decision (Q7). |
| **Review & confirm** | Commit | Send request / Pay deposit | 1 stay + room summary → 2 who is staying → 3 coupon → 4 price breakdown with Pay now / Pay at property → 5 policies → 6 terms → CTA | Labels carry what happens next. |
| **Booking status** | Know what's next | Contact / Cancel | 1 status banner → 2 details → 3 price paid/due → 4 property contact + directions → 5 policy → 6 actions | Status vocabulary: Requested, Confirmed, Declined, Expired, Cancelled, Completed. |
| **My bookings** | Find a booking | Open | Tabs Upcoming/Past/Cancelled → cards | Empty states per tab. |
| **Deals** | Claim coupons | Claim | Coupon cards (value, conditions, expiry) | Needs account-bound storage (C-6). |
| **Destinations** | Browse places | Open a place | Search + grouped list | Needs hierarchy (Q6). |
| **Help / FAQ / Contact / Enquiries** | Self-serve then escalate | Search help / Write enquiry | Search → topics → popular → contact | Fix duplicates. Keep answers in one source of truth. |
| **Partners** | Convert owners | Apply | Value props → how it works → form | Keep the existing structure, which works. |
| **Login** | Authenticate | Log in | Methods → form → recovery | Explain why sign-in is needed at booking time. |
| **Account** | Manage profile | n/a | Profile, saved, reviews, coupons | Not observed. Needs discovery. |

## 7. States

| State | Pattern |
|---|---|
| **Loading** | Skeletons that match final layout (cards, rooms, price panel). Price panel shows "Calculating…" and never a stale price. |
| **Empty** | Cause + one clear action (no results, no bookings, no coupons, no reviews yet). |
| **Error** | Inline for fields. Banner for page failures, with Retry. Never lose user input. |
| **Success** | Confirmation screen states what happened, what's next and where to find it. |
| **Unavailable** | Room: "Sold out for these dates" + next dates. Stay type: disabled with reason. Stay: "No rooms available" + alternatives. |
| **Partial** | The map fails but the list works. Photos fail with a neutral placeholder. Reviews fail with "Couldn't load reviews". |
| **Expired** | Session, request or payment window has expired, with a restart that keeps the selection. |

## 8. Responsive and accessibility requirements

**Responsive [B]**
- Breakpoints: 360 (min supported), 640, 768, 1024, 1280.
- Search results: map behind a button below 1024 (as today). Filters in a full-height sheet.
- Stay detail: booking card becomes a **bottom bar** (price + CTA) that opens the full card.
- Review step: single column, price summary collapsible but total always visible.
- Touch targets ≥ 44×44 px. Single-column forms. Native date and number input behaviour where it helps.

**Accessibility (target WCAG 2.2 AA) [B]**
- Text contrast ≥ 4.5:1 (3:1 for large text and UI boundaries). See doc 03 for the brand-colour consequence.
- Visible focus ring on every interactive element. Full keyboard operation of the date picker, guest stepper, filters, map controls, gallery and dialogs.
- Labels tied to inputs. Errors programmatically associated and announced. Status messages use live regions.
- Never use colour alone for status. Provide icons and text.
- Language attribute per locale. Burmese and Korean line-height and font fallbacks tested.
- Reduced-motion support. Images with meaningful alt text. Map has a list equivalent.

## 9. Classification summary

**A. Preserve** (BR-01 to BR-16): account required to book, three sign-in methods, stay types, local/foreigner pricing, per-room availability and refund flag, reviews only after a stay, user-cancel non-refundable, property-cancel refund in 3 days, multi-room and book-for-others, coupons claimed then applied, partner approval flow, three languages, Kyat.

**B. UX improvements that don't change rules:** merge rooms into the stay page, sticky booking card, total price breakdown, persistent summary bar, live filters, glossary, single date format, destination hierarchy, status vocabulary, state patterns, header with Deals, consolidated marketing pages, accessibility and contrast fixes.

**C. Business changes needing your approval**
| ID | Proposal | Why |
|---|---|---|
| C-1 | **Choose one payment model** (A or B), then align all copy and the FAQ. | Contradiction CT-1 to CT-5. |
| C-2 | Define a **response-time rule** for requests (Model A): e.g. auto-expire if the property hasn't replied in N hours. | Without it "Requested" can hang forever. |
| C-3 | Decide whether guests see the **property phone number before booking**. | CT-4. Pre-booking calls help guests but may bypass the platform. |
| C-4 | Show **platform fee inside the displayed total** from search onward. | Needs the fee rule (fixed or percentage). |
| C-5 | Define **mixed local/foreigner parties** (per room, per guest, or per booking). | A single toggle can't express it. |
| C-6 | **Account-bound coupons** (server-side). | Currently browser-only. |
| C-7 | Optional: **"Refundable"** rooms as a partner-set option beyond today's per-room flag. Not recommended before C-1. | Reference platforms use it heavily, but it is a new commitment. |

## 10. Prioritised backlog

| Pri | Item | Class | Depends on |
|---|---|---|---|
| **P0** | Resolve payment model and align copy (F-01) | C-1 | You |
| **P0** | Price breakdown component with Pay now / Pay at property | B | C-1, C-4 |
| **P0** | Stay type and guest type model in search, detail and booking card | B/C | Q3, Q4, Q5 |
| **P1** | Rooms inside the stay page + sticky booking card | B | n/a |
| **P1** | Persistent search summary bar + fix search state mismatch | B | n/a |
| **P1** | Auth gate with state preservation | B | Auth contract |
| **P1** | Status vocabulary + booking status page | B | Booking API |
| **P1** | Contrast and focus fixes in tokens | B | Decision D-1 (doc 03) |
| **P1** | Glossary rollout, single date format | B | n/a |
| **P2** | Destination hierarchy | B | Q6 |
| **P2** | Filters redesign (live, chips, refundable) | B | Facet data |
| **P2** | Help/FAQ cleanup, consolidated marketing pages | B | n/a |
| **P2** | Account-bound coupons | C-6 | Backend |
| **P3** | Reviews summary with category bars | B | Review data model |
