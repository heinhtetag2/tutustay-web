# 05 · Live-product parity, new findings and what changed

Written 2026-10-05 after a second pass over `dev.tutustay.com`, this time **including the legal pages**, which I had not read before. It **supersedes** parts of docs 01, 02 and 04 (marked below).

Tags: **[C]** confirmed on the live site · **[I]** inferred · **[R]** my recommendation.

---

## 1. The Terms of Service answer most of the "payment contradiction"

[C] Terms §04–§06 define the booking model. This **supersedes doc 01 §4b (CT-1 to CT-5) and open question Q1**:

| Topic | What the Terms say | What I got wrong before |
|---|---|---|
| Payment | **Two models exist, per hotel:** *Pay at hotel* (TuTuStay takes no payment) and *Online payment* via KBZPay / QPay. | I treated payment as one site-wide model and built a global switch. It is **per stay** now. |
| Booking | "A booking is a request, not a confirmed reservation." | The status model was invented. It now uses the Terms' seven stages. |
| Stages | **Pending → Accepted → Confirmed**, plus **Overdue, Rejected, Cancelled, Completed**. Rejected, Cancelled and Completed are final. | Mine were `requested / awaiting_payment / declined / expired / cancelled_by_guest / cancelled_by_property`. |
| Payment timing | Online payment is due **after the hotel accepts**, before a deadline shown on the booking, otherwise the booking goes Overdue and is auto-cancelled. | I put payment before the request. |
| Cancellation | **"There is no cancel button in the app."** Cancel by calling the hotel's reception. Each hotel sets its own cancellation and refund rules. | I built an in-app "Cancel this booking" flow. Removed. |
| Session length | "Check-in and check-out times, and any hourly duration, are set by the hotel." | I hard-coded 3 / 6 / 9 / 12 hours. Now per stay. |
| Reviews | Must attach to a real booking. Hotels can reply publicly and can ask us to hide a review, with a reason. | Rule was right, detail added to the FAQ. |
| Coupons | Validity window, per-user limit, total pool, hotel participation, no cash value, reversed on cancellation. | Added "coupons accepted" per stay. |
| Account | Email + password, **phone + one-time code**, or Google. At least 16 years old. Delete in the app: permanent after **30 days**, legally required records are kept. | Added phone sign-in, age check, account deletion. |
| Contact | `support@tutustay.com`. The app shows the hotel's number. | Phone is now shown before and after booking. |

[C] The FAQ answers "a deposit is required for every hotel" and "you can change your dates before the booking is confirmed" and the Contact page's "Cancel the booking yourself from My bookings" **disagree with the Terms**. I followed the Terms (the binding document) and rewrote the FAQ in the prototype. **Someone on the product team should confirm the Terms are current.**

## 2. New defects found in the live product

| ID | Sev | Finding |
|---|---|---|
| F-17 | **P0** | **The published Terms page contains internal drafting notes.** §04 includes "UNRESOLVED — do not publish this section as-is", source file names and line numbers, and "TESTING: change back to 30 for production" comments. |
| F-18 | **P0** | **The Terms page has unfilled placeholders:** `[LEGAL ENTITY NAME]`, `[REGISTRATION NUMBER]`, `[REGISTERED ADDRESS]`, `[JURISDICTION]`, `[DISPUTE RESOLUTION / COURTS]`. |
| F-19 | **P0** | **The payment deadline is not defined.** The Terms say the code and the spec disagree: spec = 48-hour grace, code = pending bookings go overdue **1 minute** after creation and accepted ones after **15 minutes**, with the auto-cancel job running every 30 seconds ("for testing"). A guest could lose a booking before the hotel has seen it. |
| F-20 | P1 | FAQ, Contact page and Terms contradict each other on deposits and on how to cancel (see §1). |
| F-21 | P1 | The Cookie policy says the website "has no login, no cart", but the site has sign-in. The page also names Google Analytics 4. A consent banner is not mentioned. |
| F-22 | P2 | Marketing numbers (50k+ travellers, 1,200+ hotels, "< 30 s average booking") sit beside a 12-stay catalogue and a booking model that is a request, not "instant". I kept them out of the prototype. |

I read the Privacy, Cookie and Location policies as well. The legal text is the company's, so the prototype carries **plain-language summaries and a placeholder notice**, not copies.

## 3. Parity with the live product

Method (second pass): I re-crawled every live page, extracted each heading, button, link and form field, then **turned the strings into a test** (`tests/e2e/live-strings.spec.ts`) that fails if any is missing from our matching page. The first run caught three real gaps, now fixed.

✓ built · ◐ built differently on purpose · ✗ not built (reason)

| Live feature | Status |
|---|---|
| Header: logo, **Hotel / Motel / Resort / Campsite / Deals / Help & support**, language dropdown (English EN ✓, မြန်မာ MM, 한국어 KO), Sign in, hamburger menu on small screens | ✓ |
| Footer: Destinations, Deals & coupons, Get the app, About, Help centre, FAQ, User guide, Contact us, 1:1 Q&A, My bookings, Wishlist, My reviews, Account, List your property, Become a partner, 4 legal policies | ✓ grouped (live footer also lists "Product tour" = `/landing`, which now redirects to About) |
| Home: search form, category chips, **Stay near you**, trust block, **Top Destinations with "from Ks X/night · N stays"**, **Explore TuTuStay tiles** (claim, your coupons, get app, lowest price first, browse), coupons band, **More Stays to Explore**, wishlist hearts | ✓ (featured stays are a grid, the live one is a carousel) |
| Search: destination, dates, guests; filters (**property types, Popular / Reservation Available / Coupons, price min/max + sliders, room facilities, review score bands, property facilities, bed types**), sort | ✓ filters apply live (the live site has an Apply button) |
| Search: **real map** (Leaflet + OpenStreetMap), price pins, "Update results when map moves" | ✓ **built the Booking.com way, at your request**: sidebar map card with **Show on map** opens a **full-screen** map: **Filter by:** column, results list, then the map, with **Close map** floating top-right and "update results when map moves" top-left (small screens: slim top bar and a Filters button); it eases in and out (and respects reduced motion); **List / Grid** toggle. Replaces the live site's "Map view / Card view" labels |
| Stay: stay type, dates, adults, children, rooms, **Include foreigner (now visible in the card)**, price from, call, **Share, More actions (Save, Copy link), Show all photos (grouped)**, back / Search / Details breadcrumb | ✓ |
| Stay: About, Map (Location), Reviews ("No written reviews yet."), facilities, policies | ✓ as sections instead of tabs |
| Reserve → rooms list | ◐ merged into the stay page |
| Login: email, password with **Show password**, Google, Telegram, Forgot password, create account (routes `/login`, `/signup`, `/forgot-password`) | ✓ mock |
| **Sign up and Forgot password are 3-step flows with an emailed verification code** ("Step 1 of 3") | ✓ step 1 observed, steps 2-3 inferred and labelled so |
| Phone + one-time code sign-in (Terms §03) | ✓ mock |
| Deals: **All deals / My coupons / Claimed / Expired**, claim, "How to use coupons?" → FAQ | ✓ ("My coupons" vs "Claimed" meaning is my assumption; the live semantics aren't documented) |
| Destinations | ◐ region → city → township hierarchy instead of a flat list |
| Help: help home, **Popular questions with deep links**, FAQ (search, 3 topics, per-question anchors, "Still need help?"), Contact, 1:1 Q&A, **My enquiries at `/account/support/inquiries`**, Guide | ✓ FAQ answers rewritten to match the Terms |
| About, Download (Google Play link), Partners, Become a partner (**all fields, country-code select, 5 documents**) | ✓ |
| Legal: Terms, Privacy, Cookies, Location | ◐ plain-language summaries plus a placeholder notice (not the legal text) |
| Account: overview, bookings, wishlist, reviews, promo codes, deletion (Terms §03) | ✓ |
| Map details: price pins, pin ↔ card highlight (hover and click), popup with a link to the stay, **clustering** of nearby stays, search-as-you-move, Esc to close, inert background, list/map toggle on small screens, a real location map on each stay page | ✓ (tiles are OpenStreetMap: free and fine for a prototype, pick a provider before launch) |
| Language of stay types: live says "Night"; we say **Overnight** | ◐ deliberate (clearer next to Session and Daycation) |
| "Reserve" button; we say **Choose room** | ◐ deliberate (a booking is a request, so "Reserve" over-promises) |
| Custom calendar range picker | ◐ native date inputs: accessible and mobile-friendly, but not a range calendar. **A candidate for the next design iteration** |
| Booking creation, payment, My bookings detail, notifications, profile and ID details, search history | ✗ **not observable without a real account.** Built from the Terms and FAQ, so details may differ |
| Hotel manager dashboard | out of scope (separate application) |

## 4. UX improvements over the live product (all A or B, no rule changes)

1. **Payment mode on every card, room and booking**, so no one learns at the last step how they pay.
2. **Rooms on the stay page** with a sticky booking card, instead of a separate step.
3. **Total, pay now vs pay at property, and what happens next**, before the request is sent.
4. **A booking page built on the real lifecycle**: plain explanation per stage, a "pay by" time for online stays, the hotel's number, and the cancellation route stated before anyone needs it.
5. **One recovery path per failure**: sold-out offers the next dates, a missing stay type is explained, bad dates are repaired and said so, empty states say why.
6. **Location with consent first**: explained before the browser prompt, one reading, never stored, and a denial leaves everything usable.
7. **Accessibility built in and tested**: skip link, labelled errors, focus to the first error, keyboard-operable dialogs, AA contrast (the audit's own brand-colour finding caught a bug in my build, now fixed).
8. **Plain-language legal summaries** above the full text.
9. **FAQ rewritten to match the Terms**, with search and topic filter.
10. **Forgot password that does not reveal whether an account exists.**

## 5. Decisions I made (UX-owned defaults, easy to change)

| # | Decision | Where | Reversible by |
|---|---|---|---|
| D-3 | Payment is a **per-stay attribute** (`pay_at_hotel` / `online` + deposit share). | `domain/stay.ts`, fixtures | data only |
| D-4 | Booking statuses use the Terms' seven stages. Pay-at-hotel stays go Accepted → Completed (skip Confirmed / Overdue). | `domain/booking.ts` | one function |
| D-5 | No in-app cancel. Cancel = call the hotel. | status page | UI only |
| D-6 | Session lengths come from each stay. | fixtures, `StayTypePicker` | data only |
| D-7 | The hotel phone shows **before** booking, as on the live property page. | `config/features.ts` | one flag |
| D-8 | Platform fee is an **assumed Ks 1,000 for online stays only**; pay window **30 min**. Both are placeholders. | `config/pricing.ts`, `config/booking.ts` | one value |
| D-9 | `dayUse*` API prices map to **Session**, `daycation*` to **Daycation**. | `services/mappers/room.mapper.ts` | one mapper |

## 6. Questions that are still open (smaller list)

For the **product or backend** owner (not blocking the UX work):
1. **Payment deadline** (F-19): the real number, and what a guest sees when it runs out. The UI already reads it from the booking.
2. **Platform fee**: exists (FAQ) or not (Terms are silent)? Fixed or percentage?
3. Can a guest **withdraw a Pending request**? The Terms only allow cancelling Accepted, Overdue or Confirmed bookings.
4. For pay-at-hotel stays, is the stage after Accepted called Confirmed?
5. How are **mixed local and foreign parties** priced?
6. Does search support **stay type** server-side? Are `dayUse` and `session` the same thing?
7. Is there a location **hierarchy** in the data?
8. Remove the internal notes and placeholders from the public Terms page (F-17, F-18).
9. Translations for Burmese and Korean (the prototype has skeletons).

## 7. Verification

- 31 unit tests (domain, validation, API mapper) and **189 Playwright tests** on desktop and mobile viewports, including axe WCAG 2.2 A/AA audits of 27 pages and states and a **live-strings test** that checks about 250 labels, links and options extracted from the live site. They pass.
- The rooms API shape is checked against the **real dev API** for three properties (`LIVE_CONTRACT=1 npx vitest run live-contract`).
- Not done: keyboard-only and screen-reader walkthroughs (automated checks catch roughly a third of issues), real-device testing, and Burmese and Korean copy review.
