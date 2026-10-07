# Usability test kit

How to run a usability test on this prototype and collect feedback **outside** the product.

## Setup

The form is built into the app. Every page has a **Give feedback** tab on the left edge (a small chat icon on phones). It opens a short form: the task (picked from the page they are on: Searching, Stay and room, Booking, Coupons, My bookings, Account, Help), how easy (1-5), how they would describe it, what happened, and an optional name and team. The page, device and screen size are recorded automatically.

1. Run or deploy the app. Nothing else to configure.
2. Send testers the site link and the task list below. Tell them: *this is a prototype, nothing is a real booking.*
3. Set `FEEDBACK_ADMIN_KEY` when deployed, so only your team can export the results (see `.env.example`).

The tab never reads or changes booking, sign-in or search state. `NEXT_PUBLIC_FEEDBACK=off` hides it.

## Reading the results

- **Everyone testing can see the results** at `/en/feedback` (the "See feedback" tab on the left edge opens it). It shows the tasks people found hardest first, then every response. The form tells testers their feedback is visible to the group.
- **Spreadsheet (team only):** open `/en/feedback?key=YOUR_ADMIN_KEY` and use **Download CSV**, or `/api/feedback?format=csv&key=...`.
- **Storage:** on Vercel, responses go to **Upstash Redis** (Vercel dashboard > Storage > Upstash Redis > connect to the project, then redeploy). Locally they go to `.feedback/responses.jsonl` (gitignored). Without Redis on Vercel the form shows an error instead of silently losing feedback.
- **Env vars:** `FEEDBACK_ADMIN_KEY` guards the CSV and JSON export. `NEXT_PUBLIC_FEEDBACK=off` hides the tabs.

## Tasks for testers (about 10 minutes)

1. Find a stay in a city of your choice for two guests, next weekend.
2. Compare two stays (photos, reviews, price) and pick one.
3. Start a booking, apply the coupon `WELCOME10`, and send the request.
4. Sign in (any valid email and a 6+ character password), then find your booking and your coupons.

## Triage

| Signal | Bucket | Action |
|---|---|---|
| Could not complete, or ease 1-2 | Blocking | Fix first |
| Completed with difficulty, ease 3 | Friction | Fix next |
| Likes, "would be nice" | Nice-to-have | Backlog |

Look for the same screen or step named by 2+ testers. Five testers usually surface most of the major problems.

## Round 1: company employees

Employees know the product and tend to be polite, so adjust the round:

- Make the form anonymous, or the name optional, and say plainly that criticism is the goal.
- Include non-technical staff (support, sales, ops), not only developers. Ask everyone to test on their own phone.
- Ask them to also use the **Confusing** and **Idea** kinds for "what would a first-time guest find confusing here?". They see what they would miss themselves.
- Discount feedback that only says "I know how it works". The question is what a stranger would do.
- Treat this round as a filter for obvious problems. Round 2 should be real guests, who find the problems employees can't see.
