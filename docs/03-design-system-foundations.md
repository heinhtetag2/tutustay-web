# 03 · Design-system foundations

Status: **proposal.** Visual styling is deliberately minimal. Branding and polish come later.

Labels: **Measured** = read from a live page. **Existing** = already in TutuStay's CSS. **Proposed** = my suggestion.

---

## 1. Colour

### 1.1 Brand colour, confirmed
Read from the live stylesheet and from rendered buttons on 2026-10-05:

| Token (existing) | Value | Notes |
|---|---|---|
| `--color-brand` → `--color-primary-600` | **`#0284C7`** (`rgb(2,132,199)`) | Computed background of "Sign in" and "Search" buttons. **This is the brand colour. It is kept.** |
| `--color-brand-hover` → `primary-700` | `#0369A1` | |
| `--color-brand-deep` → `primary-900` | `#0C4A6E` | |
| `--color-brand-tint` → `primary-100` | `#E0F2FE` | |
| `--color-brand-faint` → `primary-50` | `#F0F9FF` | |

The existing primary scale has values for 50, 100, 200, 300, 400, 600, 700 and 900, with **500 and 800 missing**. The values match a standard sky-blue ramp.

### 1.2 Contrast check (WCAG 2.2, calculated)

| Pair | Ratio | Result |
|---|---|---|
| White text on brand `#0284C7` | **4.10** | ❌ Fails AA for normal text. Passes only for large text (≥24px, or ≥18.66px bold). Existing buttons are 14–17px / weight 500. |
| White text on `#0369A1` | **5.93** | ✅ AA |
| `#0284C7` as text or link on white | 4.10 | ❌ for body-size text |
| `#0369A1` as text or link on white / on `#F0F9FF` | 5.93 / 5.57 | ✅ |
| Primary text `#111` on `#FAFAFA` | 18.09 | ✅ |
| Secondary text `#4B4B4D` on white | 8.70 | ✅ |
| Muted text `#707072` on white / on `#FAFAFA` | 4.94 / 4.73 | ✅ AA (close to the limit) |
| Faint text `#9E9EA0` on white | **2.67** | ❌ Use only for disabled or decorative |
| Error `#D30005` on white | 5.57 | ✅ |
| Success text `#027A48` on white | 5.41 | ✅ (`#039855` is 3.73, ❌ for text) |
| Warning text `#CC3702` on white | 5.10 | ✅ |
| Divider `#E5E5E5` vs white | 1.26 | Fine for decorative dividers. ❌ for control boundaries. |
| Input border at `#8C8C8E` vs white | 3.36 | ✅ meets 3:1 for UI boundaries (proposed) |

Info colours were not checked and will be covered by automated contrast tests.

**Decision D-1 (yours):** keep the brand colour `#0284C7` as the *identity* colour (logo, icons, large fills, selected states) and make **button fills and text links use `#0369A1`** to reach AA. The alternative is to keep `#0284C7` buttons and use larger bold label text (≥18.66px bold), which is heavy for a mobile UI. I recommend the first option. The hue is the same and the difference is a step darker.

### 1.3 Primitives vs semantic tokens [Proposed]

**Primitives** (raw values, never used directly in components):
```
brand-50 #F0F9FF   100 #E0F2FE   200 #BAE6FD   300 #7DD3FC   400 #38BDF8
brand-500 (fill gap)   600 #0284C7   700 #0369A1   800 (fill gap)   900 #0C4A6E
neutral-0 #FFFFFF  50 #FAFAFA  100 #F5F5F5  200 #E5E5E5  300 #CACACB  400 #9E9EA0
        450 #8C8C8E (new, control borders)  500 #707072  600 #4B4B4D  700 #39393B  800 #28282A  900 #1F1F21  950 #111111
success-50 #ECFDF3  700 #027A48          error-50 #FFE5E5  600 #D30005  700 #A70E00
warning-50 #FFF6EC  700 #CC3702          info-50 #EFF8FF  700 #175CD3
promo (existing "secondary") 100 #DCE8FE  600 #3E5FEA  700 #4052EB
```
Brand 500 and 800 are filled from the same ramp during implementation, so the scale is complete.

**Semantic tokens** (the only thing components use):
| Group | Token | Maps to | Use |
|---|---|---|---|
| Surface | `surface-page` | neutral-50 | App background |
| | `surface-raised` | neutral-0 | Cards, sheets, inputs |
| | `surface-subtle` | neutral-100 | Quiet blocks, skeletons |
| | `surface-brand-subtle` | brand-50 | Selected rows, info callouts |
| Text | `text-primary` | neutral-950 | Body, headings |
| | `text-secondary` | neutral-600 | Supporting text |
| | `text-muted` | neutral-500 | Hints, captions |
| | `text-disabled` | neutral-400 | **Disabled only** |
| | `text-on-action` | neutral-0 | On filled buttons |
| | `text-link` | brand-700 | Links |
| Action | `action-primary` / `-hover` / `-pressed` | brand-700 / brand-800 / brand-900 | Primary fills (see D-1) |
| | `action-secondary-border` | neutral-450 | Outlined buttons |
| Border | `border-subtle` | neutral-200 | Dividers, card edges |
| | `border-control` | neutral-450 | Input and checkbox boundaries |
| | `border-focus` | brand-600 | 2px ring + 2px offset |
| Status | `status-success-text/-bg`, `status-error-…`, `status-warning-…`, `status-info-…` | 700 text on 50 bg | Messages, badges |
| Promo | `promo-text/-bg` | promo-700 / promo-100 | Coupon surfaces |

**Interaction states** (every interactive token has these): default · hover (one step darker) · pressed (two steps) · focus (ring, never colour change alone) · disabled (`text-disabled` + `surface-subtle`, `aria-disabled`) · selected (`surface-brand-subtle` + `border-focus`) · error (`status-error` text + border + icon).

**Cleanup of existing tokens:** `--radius-lg` and `--radius-2xl` are both 1rem, so remove one. The `--color-yellow-*`, `--color-ticket-*` and `--color-promo*` tokens are used by the coupon UI and need a decision on keep or rename. They are carried over unchanged until then.

## 2. Typography

### 2.1 Measured reference: Airbnb (`airbnb.com.sg`, 1024px viewport, 2026-10-05)
Airbnb Cereal VF is a **proprietary** font. It can't be reused (see §2.3).

| Role (as seen) | Size / line-height | Weight | Colour |
|---|---|---|---|
| Page title (h1) | 28 / 40 | 700 | `#222` |
| Listing title (detail h1) | 26 / 30 | 500 | `#222` |
| Section heading ("Destinations for you") | 20 / 24 | 600 | `#222` |
| Secondary heading | 22 / 26 | 500 | `#222` |
| Body / UI text | 14 / 20 | 400 | `#222` |
| Nav / chips / buttons | 14 / 18 | 500 | `#222` |
| Supporting text | 14 / 18 | 400 | `#6C6C6C` (5.25:1 on white) |
| Card title | 13 / 16 | 500 | `#222` |
| Caption | 12 / 16 | 400 | `#6C6C6C` |
| Field label | 12 / 16 | 500 | `#222` |

Observed principles: **very few sizes** (about 8), weights 400/500/600/700 only, near-black text on white (not pure black), one grey for all supporting text, tight heading line-heights, no letter-spacing tricks.

### 2.2 Measured: current TutuStay (dev, 2026-10-05)
Body 16/24 `#111`, h1 hero 28/32 w600 (white on image), h2 28/**42** w600, h3 15/22.5 w600, button 15/22.5 w500, input 14/20. Font stack `Roboto, Inter, system-ui, "Noto Sans Myanmar", "Noto Sans KR"`. **Observation:** h2 line-height is 1.5, which is loose for headings. Heading sizes jump from 28 to 15.

### 2.3 Font recommendation [Proposed]
**Keep Roboto for Latin text.** It is Apache-2.0 licensed, already loaded, has tabular figures by default (good for prices) and is highly legible. Switching fonts would be churn with no user benefit. The real gap is **Burmese and Korean**:
- Burmese: **Noto Sans Myanmar** (SIL OFL), explicitly loaded and not left to the system fallback. Burmese glyphs are taller, so use `:lang(my)` with +0.15 to +0.2 line-height and avoid weights under 400.
- Korean: **Noto Sans KR** (SIL OFL), subset and loaded on demand.
- Load via `next/font` with `display: swap` and per-script subsets so Latin users don't download Burmese or Korean.
Inter stays only as the existing fallback. **Decision D-2 (low stakes):** if you'd rather move to Inter for a slightly more neutral, Airbnb-like tone, it is a one-line change.

### 2.4 Proposed TutuStay roles
Base body is **16px** (not Airbnb's 14) because most traffic is mobile and Burmese needs the extra size. Values are *desktop / mobile*. Line-heights are for Latin. Burmese gets +0.15 to +0.2.

| Role | Token | Size / LH desktop | Size / LH mobile | Weight | Notes |
|---|---|---|---|---|---|
| Hero (Home only) | `type-display` | 36 / 44 | 28 / 36 | 700 | One per site |
| Page title | `type-title` | 28 / 36 | 24 / 32 | 700 | One h1 per page |
| Section heading | `type-heading` | 22 / 28 | 20 / 26 | 600 | |
| Sub-heading / card title | `type-subheading` | 18 / 24 | 16 / 24 | 600 | |
| Body | `type-body` | 16 / 24 | 16 / 24 | 400 | Default |
| Body small | `type-body-sm` | 14 / 20 | 14 / 20 | 400 | Supporting, metadata |
| Label (buttons, tabs, field labels) | `type-label` | 14 / 20 | 14 / 20 | 500 | Buttons are 16 on mobile |
| Caption | `type-caption` | 12 / 16 | 12 / 16 | 400 | **Never for essential info** (prices, policies, errors) |
| Price large (room total) | `type-price-lg` | 24 / 28 | 22 / 28 | 700 | Tabular figures |
| Price medium (card) | `type-price-md` | 18 / 24 | 18 / 24 | 600 | Tabular figures |
| Price small (inline) | `type-price-sm` | 14 / 20 | 14 / 20 | 600 | Tabular figures |

Rules: a maximum of **one weight step** between a heading and its body. Supporting text uses `text-secondary` or `text-muted`, never smaller than 14px unless it is a caption. Prices always show the currency (`Ks 40,000`) and the unit (`/ night`, `/ session`, `total`). Don't truncate numbers.

## 3. Layout and spacing [Proposed]

**Spacing** (existing base `--spacing: 0.25rem` = 4px, kept): `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96`. Use only these.

**Containers** (existing theme already defines `6xl = 72rem` and `7xl = 80rem`):
| Name | Max width | Used for |
|---|---|---|
| `container-narrow` | 640 px | Login, partner form, status messages |
| `container-content` | 1120 px | Stay detail, review, help, account |
| `container-wide` | 1280 px | Search results (list + map), home |
Horizontal gutters: **16** (<640) / **24** (640–1023) / **32** (≥1024).

**Grid:** 4 columns <640, 8 columns 640–1023, 12 columns ≥1024, 24px gap on desktop and 16px on mobile. Two-column pages use **8 + 4** (content + booking card). Search uses list **5/12** + map **7/12**.

**Alignment and relationships**
- Left-align text. Page content shares **one left edge** with the header logo.
- Heading → content: 16 below a `type-heading`, 24 below a `type-title`. Section → section: 48 desktop, 32 mobile.
- Label → control: 8. Control → control within a form: 16. Form group → group: 32.
- Card padding: 16 (compact) or 24 (default). Card gap: 16.
- Primary action sits **bottom-right on desktop** and **full-width on mobile**. Only one primary action per view.

**Radius** (existing): `8` controls, `12` inputs and small cards, `16` cards, `24` sheets. **Elevation:** two levels only (`shadow-xs`, `shadow-md`), plus `border-subtle`. **Control heights:** 44 min (touch), 48 for primary search/CTA.

## 4. Measured vs proposed, at a glance
| Topic | Measured (Airbnb) | Existing (TutuStay) | Proposed |
|---|---|---|---|
| Body size | 14 | 16 | 16 (14 for supporting) |
| Page title | 28/40 · 700 | 28/32 · 600 | 28/36 · 700 |
| Section heading | 20/24 · 600 | 28/42 · 600 | 22/28 · 600 |
| Supporting colour | `#6C6C6C` | `#707072` | `#707072` (4.94:1) |
| Weights | 400/500/600/700 | 400/500/600/700 | same |
| Primary action | brand red (not ours) | `#0284C7` | `#0369A1` fill, `#0284C7` identity |

## 5. Airbnb-derived visual foundation (applied 2026-10-05)
Measured on `airbnb.com.sg` and mapped onto TutuStay tokens. **Brand blue stays**; only the neutral system, elevation, type and grid follow Airbnb.
| Topic | Airbnb (measured) | TutuStay now |
|---|---|---|
| Text / supporting / hairline / divider / faint | `#222` / `#6A6A6A` / `#DDD` / `#EBEBEB` / `#F7F7F7` | `--p-neutral-900/500/300/200/50`; page is white |
| Elevation | `0 2px 4px .18` (tertiary), `0 6px 16px .12` (secondary), `0 8px 28px .28` (high), each with a `1px rgba(0,0,0,.04)` ring | `shadow-card`, `shadow-raised`, `shadow-high` |
| Radius | 4 / 8 / 12 / 16 / 20 / 24 / 32, search pill 40 | unchanged scale; search pill + round search button |
| Type | Cereal 14/15/22/26, weights 500–600, tight line-heights | **Figtree** (free, closest to Cereal); title 26/32 w600, heading 22/26, card title 16/20 w600, price 16/20 |
| Listing card | borderless, photo 20:19 with 16 radius, heart on photo, title + rating row, grey lines, price last | `ResultCard` |
| Grid | gap-x 24, gap-y 40; 1 / 2 / 3 / 4 columns by width; gutters 24 → 40; wide container 1760 | search 2/3/4 beside filters, home 2/3/4; **Grid is the default view** |
| Secondary button | 1px `#222` outline, 8 radius | `Button` secondary |
Note: the theme removes Tailwind's default palette, so `text-white` does not exist. Use tokens or an explicit value.
