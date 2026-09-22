# Wayfarer AI — Design Reference

Derived from a reference dashboard screenshot (call-center analytics UI) the
user provided for Phase 3. Colors below were sampled directly from the
reference image's pixels, not eyeballed, so they're accurate to the source.
This file is the single source of truth for UI tokens — read it before
building or changing any frontend UI.

## Overall feel

Light, airy, low-contrast dashboard with one saturated brand color (deep
indigo/violet) used sparingly for the sidebar, active states, and data
visualizations. Everything else — page background, cards — sits in
near-white neutrals so the purple accent pops without the UI feeling heavy.
Corners are consistently rounded (cards, pills, buttons), and category data
is color-coded using a family of tints from the same purple, plus one
secondary blue tint for a second data category.

## Color tokens

Add these to `tailwind.config.ts` under `theme.extend.colors`.

| Token | Hex | Sampled from | Usage |
|---|---|---|---|
| `ink.950` | `#34256E` | floating side tab | Hover/pressed states, floating action tabs |
| `ink.900` | `#3B2A82` | sidebar background | Sidebar background, primary buttons |
| `ink.800` | `#4B3AA0` | *(derived, +1 step lighter)* | Active nav-item highlight background |
| `ink.700` | `#6954B7` | stat-card accent bar | Left accent bars, secondary buttons, icons on light bg |
| `ink.600` | `#8170D8` | chart area fill (mid) | Chart fills, mid-emphasis accents |
| `ink.500` | `#8D87FF` | donut ring | Progress rings, links, focus rings |
| `ink.300` | `#C5C2FE` | chart area fill (light) | Light chart fills, subtle highlights |
| `ink.100` | `#E5E4FF` | stat-card #2 accent tint | Tinted card backgrounds, badges (purple category) |
| `sky.100` | `#E4EEFD` | stat-card #3 accent tint | Tinted card backgrounds, badges (blue category) — second data color family |
| `text.heading` | `#170B42` | dashboard title (darkest pixel sampled `#0E024C`, lightened for body use) | Page titles, card titles, big stat numbers |
| `text.body` | `#525266` | *(standard muted-neutral, no legible small text to sample)* | Body copy |
| `text.muted` | `#9C9CAE` | legend/caption text | Captions, placeholder text, secondary labels |
| `surface.page` | `#F5F5FA` | page background | `<body>` background |
| `surface.card` | `#FFFFFF` | card background (sampled ~`#FAFAFA`, rounded to pure white — cards are distinguished by shadow, not fill, in the source) | All card backgrounds |
| `surface.border` | `#ECEBF3` | *(derived light-neutral)* | Card borders/dividers, input borders |
| `status.success` | `#5FA83B` | online-status dot | Online indicators, success states |
| `status.danger` | `#D36063` | notification badge | Error states, notification badges |

## Layout

**Sidebar (icon rail)**
- Fixed left, width `72px`, full viewport height, background `ink.900`
- Large rounded corner on the outer bottom-left of the whole app (`24px`) —
  matches the source image's soft window-corner treatment
- Logo/mark centered at top, ~`40px`, light/white, `24px` top margin
- Nav icons stacked vertically below, centered, `~40px` tap targets, `24–28px`
  gap between them, icon color `ink.100` (inactive) / white (active)
- Active nav item gets a rounded-square highlight behind the icon in `ink.800`
- No text labels in the rail — icon-only, matches source

**Topbar**
- Background = `surface.page` (no visible card/border, sits flush on the page)
- Height ~`72px`
- Left: page title, `text.heading`, bold, `20–22px`
- Right: a row of circular icon buttons (`36px`, light-gray circular bg,
  `status.danger` badge dot for unread counts) + user avatar + name + role +
  a small `status.success` presence dot
- Optional secondary row: a light pill (`surface.border` outline, rounded-full,
  small muted text) for contextual info like a date/time or filter

**Cards**
- Background `surface.card`, radius `20px`, soft shadow with a faint purple
  tint (`shadow: 0 8px 24px -8px rgba(59,42,130,0.10)`)
- Padding `20–24px`
- Header row inside every card: title (`text.heading`, semibold, `14–15px`)
  on the left, an optional dropdown/filter control on the right (rounded-full
  or rounded-md, light border, small text + chevron)

**Stat cards** (used for headline numbers, e.g. dashboard totals)
- White card, radius `20px`, a thick (`4–6px`) colored left accent bar
- Big bold number (`26–28px`, `text.heading`)
- Label below the number (`14px`, medium weight)
- Small muted caption below that (`12px`, `text.muted`)
- Rotate the accent bar color across a row of stat cards: `ink.700`,
  `ink.100`, `sky.100` — same pattern the source image uses to
  color-code different metric categories without needing more than two hues

**List/breakdown rows**
- Pill-shaped row (`rounded-full`), tinted background per category
  (`ink.100` or `sky.100`), small square/dot indicator on the left
- Label left-aligned, value + percentage right-aligned
- No border — the tint alone separates it from the page

**Floating elements**
- A vertical pill tab fixed to the right edge of the viewport (e.g. a
  persistent action like "Ask the bot"), `ink.950` background, white
  vertical text, rounded only on the side facing into the page
- Small circular floating action buttons (~`40–44px`), `ink.700` background,
  white icon, soft shadow, bottom-right of the section they act on

## Typography

- Font: system UI sans-serif stack (`Inter` if we add a webfont later, but
  the default Tailwind sans stack matches the source closely enough — no
  webfont is required for Phase 3)
- Page titles: `20–22px`, bold, `text.heading`
- Card titles: `14–15px`, semibold, `text.heading`
- Big stat numbers: `26–28px`, bold, `text.heading`
- Body/labels: `13–14px`, regular, `text.body`
- Captions/muted: `12px`, regular, `text.muted`

## Data visualization (for later phases: itinerary charts, budget breakdowns)

- Stacked/area charts: layer fills from the `ink` family light→dark
  (`ink.300` → `ink.600` → `ink.700`), plus `sky.100`'s darker sibling for a
  4th series if needed. Legend: small filled circles matching each series
  color, label text in `text.muted`
- Donut/progress rings: light track in `ink.300`, progress arc in `ink.500`,
  big bold percentage centered in `text.heading`, a small muted pill caption
  underneath
- Tooltips: white rounded card, soft shadow, small colored-bullet rows

## What this means for Wayfarer AI's actual pages

Wayfarer AI's sidebar nav (Phase 3 scope) maps directly onto this icon rail:
Trip Planner (home), Results, Itinerary, Telegram Bot Setup, My Trips,
Settings — six icons, same treatment as the source's Home/Contacts/Calls/
etc. rail. Stat-card and accent-bar treatment gets reused later for
itinerary/budget summaries (Phase 7) once there's real numeric data to show;
Phase 3 itself only needs the shell, nav, and empty page cards.

## Redesign addendum (design refresh, post-Phase 9)

Everything above still governs the sidebar/card/layout mechanics. This
section adds a visual-identity layer on top — additive, not a replacement.

**Why:** the app functions well but reads as templated/default-AI-output.
This pass adds typographic personality, a warmer accent family for
marketing-feeling surfaces, and a real brand mark, without touching any
business logic, data model, or the `ink` violet scale's role as the
primary interactive color.

**Typography**
- Display / headlines / logo wordmark: **Fraunces** (variable, soft+wonk
  axes) — `font-display` Tailwind utility, CSS var `--font-fraunces`
- Body / UI: **Plus Jakarta Sans** (variable) — `font-sans` (now the
  Tailwind default), CSS var `--font-general-sans`
- Both self-hosted via `next/font/local` from
  `src/assets/fonts/` (vendored from the google/fonts OFL repo — see that
  folder's `OFL.txt`) — zero runtime CDN dependency, works offline/on any
  host.
- Chose Plus Jakarta Sans over the original General Sans/Onest suggestions
  specifically because it's self-hostable without a Fontshare account.

**Color — warm secondary family (additive to the existing tokens above)**

| Token | Hex | Usage |
|---|---|---|
| `sand.50` | `#FBF6EE` | Warm page backgrounds (auth pages) |
| `sand.100` | `#F5EAD6` | Warm card tints, place-card scrim gradients |
| `sand.300` | `#E8CBA0` | Compass mark secondary facet |
| `sand.500` | `#D9A567` | Warm accents, mascot pendant cord |
| `sand.700` | `#B87A3D` | Warm text-on-light accents |
| `coral.400–600` | `#E8825F` / `#DE6A43` / `#C4522E` | Sparing warm CTA/highlight use — mascot beak, celebratory moments |

`ink` remains the primary brand/interactive color (nav, buttons, links,
focus states) everywhere in the app shell. `sand`/`coral` are reserved for
auth pages, place-card photo scrims, empty-state illustrations, and the
mascot — i.e. surfaces closer to "marketing" than "dashboard."

**Logo** — `src/components/ui/Logo.tsx`: `LogoMark` (compass needle split
into four ink/sand facets around a pivot dot, matches `public/favicon.svg`)
and `Logo` (mark + Fraunces "Wayfarer" wordmark, with a `light` variant for
photo/dark backgrounds). Used in the sidebar (mark only) today; auth pages
and any marketing surface should use the full lockup.

**Photo sourcing (Places tab, itinerary place mentions) — planned, not yet
built:** Wikipedia's REST API (`/api/rest_v1/page/summary/{title}`),
keyless, no account required. Chosen over a stock-photo API (Pexels/
Unsplash) specifically because named landmarks get their actual real
photo rather than a generic keyword match; places without a Wikipedia
page fall back to an icon/pattern card rather than a mismatched photo.

**Mascot — built.** `components/mascot/Toucan.tsx` (static SVG illustration
— ink body, coral beak/feet, compass pendant on a sand cord, matching
`LogoMark`'s facet palette) + `MascotGuide.tsx` (the interactive wrapper).
Mounted once in `AppShell`, so it's genuinely persistent across client-side
navigation (its collapsed/expanded React state survives route changes,
since `AppShell` isn't remounted between pages in the `(app)` layout).
Details:
- **Idle animation**: `animate-mascot-idle` (custom Tailwind keyframe — a
  3.2s ease-in-out bob + slight rotation, not a generic bounce), disabled
  via `motion-reduce:animate-none`.
- **Contextual tips**: one line per top-level route (`TIPS` map keyed by
  path prefix), shown once per page via a `localStorage` "seen" set
  (`wayfarer:mascot-seen-tips`) — reappears harmlessly if storage is
  unavailable (private browsing etc.), never blocks rendering.
- **Collapsible/dismissible**: a chevron collapses it to a small idle-
  animated icon button; the tip bubble has its own dismiss (×) independent
  of collapsing the mascot itself. Fixed `bottom-4 right-4`, capped at
  `min(280px, 100vw − 2rem)` so it never overflows on narrow mobile
  viewports or blocks page content.
- No backend changes — purely a frontend/localStorage feature, per the
  redesign's "no schema changes" constraint.

**Auth pages (login/signup) — built.** `features/auth/AuthBackdrop.tsx` +
`AuthLayout.tsx`: full-bleed looping video background, riffing on the
mobile destination-search reference's floating white card, adapted from a
search sheet into a login/signup form. Details:
- Video: Mixkit "Palm tree on a sunny day" (11s, 720p, 3.68MB,
  `assets.mixkit.co/videos/4645/4645-720.mp4`) — free for commercial use
  under the Mixkit Stock Video Free License, no attribution or account
  required. Muted, looped, `playsInline`, with the same still frame used
  as both `poster` and an always-rendered base `<img>` layer.
- `prefers-reduced-motion`: the `<video>` element is hidden via Tailwind's
  `motion-reduce:hidden`, so reduced-motion users see only the static
  poster frame underneath — never autoplaying motion.
- Only mounted on `/login` and `/signup` (not app-wide), per the
  performance constraint in the original brief.
- Card: `bg-white/90 backdrop-blur-md` — the "glassmorphism 2.0" note from
  the brief (translucency used for hierarchy against the photo, not
  decoration) — with the full `Logo` lockup, `font-display` (Fraunces)
  heading, and a warm ink→sand gradient scrim over the video for text
  legibility.

**Place cards + photo sourcing — built.** `features/places/PlacePhoto.tsx`
+ `usePlacePhoto.ts`, adapting the "Columbus" reference's tilted-photo
language to real-time, per-trip data:
- **Photo source**: Wikipedia's public search+pageimages API
  (`en.wikipedia.org/w/api.php`, `origin=*` for CORS) — one request per
  unique place name, module-level cached for the session. No key, no
  account, no backend proxy needed (Wikipedia's CORS headers allow direct
  client-side calls). Chosen over Pexels/Unsplash specifically because the
  user doesn't have a stock-photo account, and named landmarks get their
  actual real photo rather than a generic keyword match.
- **Fallback**: places with no reasonable Wikipedia match (small cafés,
  minor parks) render a category-icon pattern card
  (`Landmark`/`Trees`/`Church`/`Building2`/`Ticket`/`Sparkles` on a
  sand gradient) instead of a mismatched stock photo, or a broken image.
- **Visual treatment**: pin icon + name overlaid on a gradient scrim at
  the photo's bottom, `rounded-card` + `shadow-card`, with a deterministic
  (not random, to avoid layout shift) subtle tilt on roughly one in three
  cards — the reference image's "one polaroid among flat cards" accent,
  adapted so a dynamic grid doesn't feel chaotic.
- **Two contexts**: full treatment (photo + overlay caption) on the Places
  results grid; a compact `showCaption={false}` thumbnail (no overlay text,
  smaller icon) next to each place mention inside `ItineraryDayCard` rows,
  where the name is already shown as the row label.
- `Card` gained a `padded` prop (default `true`) so photo cards can bleed
  their image to the card edge without fighting the base `p-6` via
  className-order tricks — every other existing `<Card>` usage is
  unaffected (defaults unchanged).
