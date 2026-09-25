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
| `sand.800` | `#7A4D23` | Icon foreground on `sand.100` circles — see "Accessibility pass" below; `sand.700` measured under the 3:1 minimum for icons |

`ink` remains the primary brand/interactive color (nav, buttons, links,
focus states) everywhere in the app shell. `sand` is reserved for
auth pages, place-card photo scrims, empty-state illustrations, and the
mascot — i.e. surfaces closer to "marketing" than "dashboard." (A
`coral` family was defined in this same pass for the hand-drawn mascot's
beak/feet; it was removed once the mascot was replaced by real artwork —
see "Real logo integration" below — since nothing referenced it anymore.)

**Logo** — `src/components/ui/Logo.tsx`: `LogoMark` (compass needle split
into four ink/sand facets around a pivot dot, matches `public/favicon.svg`)
and `Logo` (mark + Fraunces "Wayfarer" wordmark, with a `light` variant for
photo/dark backgrounds). Used in the sidebar (mark only) today; auth pages
and any marketing surface should use the full lockup. **Superseded** —
see "Real logo integration" below; both now render the real artwork.

**Photo sourcing (Places tab, itinerary place mentions) — planned, not yet
built:** Wikipedia's REST API (`/api/rest_v1/page/summary/{title}`),
keyless, no account required. Chosen over a stock-photo API (Pexels/
Unsplash) specifically because named landmarks get their actual real
photo rather than a generic keyword match; places without a Wikipedia
page fall back to an icon/pattern card rather than a mismatched photo.

**Mascot — built.** `components/mascot/Toucan.tsx` (originally a static
SVG illustration — ink body, coral beak/feet, compass pendant on a sand
cord, matching `LogoMark`'s facet palette; **superseded** by the real
artwork, see "Real logo integration" below) + `MascotGuide.tsx` (the
interactive wrapper). Mounted once in `AppShell`, so it's genuinely
persistent across client-side navigation (its collapsed/expanded React
state survives route changes,
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

**Empty/loading-state mascot nudges — built.** `MascotNudgeContext.tsx`
adds a small provider (`MascotNudgeProvider`, wrapping `AppShell`'s
children + `MascotGuide`) exposing `useMascotNudge().sendNudge(message)`.
This lets a page trigger a one-off mascot message — taking priority over
the generic first-visit tip — without `MascotGuide` needing to know about
each page's data-fetching state itself. A route change always clears any
active nudge. Wired into the three moments named in the original brief:
- **Empty states**: Places results (no matches) and My Trips (no trips
  yet) nudge on the existing empty-state render branch — no change to
  either page's loading/error state machine, purely an added effect.
- **Celebration**: Itinerary generation wraps `generate()` in a
  `handleGenerate()` that fires a nudge after it resolves, for both the
  first "Generate itinerary" and later "Regenerate" actions.

**Consistency pass over the remaining pages — built.** Closing the gap so
every page reads as one product rather than "5 redesigned pages + the
rest in the old style":
- `Topbar`'s page-title `<h1>` (rendered on every authenticated page) now
  uses `font-display` — the single highest-leverage typography change,
  since it's shared across the whole app shell.
- `TransportOptionCard` / `HotelOptionCard`: added a mode icon
  (`Plane`/`TrainFront`/`Bus`/`Hotel`) in a `sand.100` circle, and
  `font-display` for the option's heading. No price/duration display was
  added — the `TransportOption`/`HotelOption` types don't carry that data
  yet, and adding it would mean a backend/schema change, out of scope here.
- `TripCard`'s origin → destination line and the "No trips yet" / "No
  places found" / "Your day-by-day plan" empty-state headings moved to
  `font-display`, matching the auth pages' heading treatment.
- Deliberately left as-is: `CardHeader` section labels (e.g. "Account",
  "Plan a trip") and the Settings page's utility content — per the
  brief's "restrained motion... a few signature moments instead of
  uniform flatness," Fraunces is reserved for primary page/section
  headings, not every small label.

**Settings + Telegram Bot Setup pages — built.** Brought these two up to
the same visual language as Transport/Hotels/Trips, without touching
`CardHeader` itself (still used elsewhere as a plain small-label
component): each page now uses a local `SectionHeading`-style pattern —
an icon (`User`/`Send`) in a `sand.100` circle next to a `font-display`
heading, matching `TransportOptionCard`/`HotelOptionCard`. The connected-
bot confirmation card on the Telegram page picks up a `CircleCheck` icon
and a `status.success` left border for a small moment of positive
feedback. No behavior, copy, or data-fetching logic changed on either
page — purely the heading/icon treatment.

**Branded loading state — built.** `components/ui/PageLoading.tsx` uses
`LogoMark`'s `animated` prop (spin sped up from the decorative 8s to a
1.4s loading-appropriate rate, `motion-reduce:animate-none` guarded)
in place of the generic border-spinner ring, everywhere a full page or
tab is waiting on data: the root `loading.tsx`, the authenticated-layout
auth check, every Results tab (Places/Transport/Hotels), Itinerary, My
Trips, Results/Itinerary redirect pages, and the Telegram connection
check. Left as plain small spinners: the `h-3.5 w-3.5` spinners inside
the Generate/Regenerate itinerary buttons — a full logo mark reads as too
heavy at button scale.

## Real logo integration (replaces the placeholder compass mark)

The user-supplied artwork — an illustrated toucan wearing a compass
pendant, backpack, and standing on a suitcase in front of a globe, on a
purple gradient rounded-square badge — replaces every placeholder built
during the earlier design-refresh passes:

- **Source processing**: cropped to its transparent-alpha bounding box
  (the source PNG had extra canvas padding), squared, then exported at a
  few purpose-specific sizes rather than shipping one large master
  everywhere:
  - `public/brand/toucan-mark.png` (160×160, ~46KB) — the one asset used
    throughout the running app (sidebar mark, auth-page logo lockup,
    branded loading state, and the corner mascot). One fetch, browser-
    cached across every page that references it.
  - `public/favicon-32.png` / `favicon-16.png`, `public/apple-touch-icon.png`
    (180×180), `public/icon-192.png` / `icon-512.png` (for `manifest.json`).
- **`LogoMark`/`Logo`** (`components/ui/Logo.tsx`): now render the artwork
  directly via `<img>` instead of the earlier hand-built SVG compass — a
  raster asset, so it can't be recolored per-context; the badge's own
  purple gradient is used as-is everywhere.
- **`Toucan`** (`components/mascot/Toucan.tsx`): now the *same* artwork
  instead of a separate hand-drawn SVG, so the brand mark and the
  persistent corner guide are visibly one character. The idle-bob
  animation (`animate-mascot-idle`) still applies as a transform on the
  `<img>`, unchanged.
- **Loading animation changed**: the old abstract compass-needle SVG
  rotated continuously for `PageLoading`; that reads oddly on a character
  illustration, so `LogoMark`'s `animated` prop now applies a gentle
  `logo-pulse` (scale 1→1.06, opacity 1→0.85, 1.6s) instead of a spin —
  new Tailwind keyframe, `motion-reduce:animate-none` guarded. Also added
  `role="status" aria-live="polite"` + a visually-hidden "Loading" label
  to `PageLoading` for screen readers, since the animation itself carries
  no accessible name.
- **Sidebar**: the link's hit-area/mark size bumped slightly (from the
  h-9/h-10 pairing used for the old abstract mark to h-10/h-11) since the
  new artwork already includes its own background padding baked in.
- **`manifest.json`**: `theme_color` updated to the brand `ink-900` hex
  (`#3B2A82`, was a leftover sky-blue default) and real `icons` entries
  added (was an empty array).

## Trip navigation consistency pass

Closed a remaining gap: the trip-summary card and both tab bars a user
sees on every Results/Itinerary page were still in the pre-redesign plain
style.
- Trip-summary card's origin → destination line moved to `font-display`,
  matching `TripCard`'s treatment on the My Trips list.
- Both pill tab bars (`Results`/`Itinerary` in the trip layout, and
  `Places`/`Transport`/`Hotels` in the results layout) gained a small
  leading icon per tab (`Compass`/`CalendarDays`, `MapPin`/`Plane`/`Hotel`),
  matching the icon-circle language already established on
  `TransportOptionCard`/`HotelOptionCard`/Settings. No behavior change —
  same routes, same active-state logic.
- `TripPlannerForm` reviewed and left as-is: its input styling already
  matches the pattern used on the Telegram form (same `inputClass`), so
  no changes were needed there.

## Accessibility pass — warm palette contrast audit

Per the brief's "accessibility shouldn't regress" constraint, ran a WCAG
contrast check (relative-luminance formula, not a browser tool) over
every new color combination introduced across this redesign, rather than
assuming the palette was fine by eye. Found and fixed one real gap:

- **Icon-on-`sand.100` circles** (Transport/Hotel option cards, Settings,
  Telegram): `sand.700` foreground measured **2.99:1** against `sand.100`
  — just under WCAG's 3:1 minimum for meaningful (non-decorative)
  graphical objects. Added `sand.800` (`#7A4D23`, 6.05:1) and swapped all
  four usages to it.
- **`PlacePhoto`'s no-photo fallback card** (`sand.100`→`sand.300`
  gradient): the place-name label was using `ink.700`, which measures
  4.96:1 at the `sand.100` end but only **3.79:1** at the `sand.300`
  end — below the 4.5:1 normal-text minimum wherever the label happens
  to sit over the darker part of the gradient. Split it: the icon (only
  needs 3:1) keeps `ink.700`; the label text moved to `text.heading`
  (11.59:1 at the `sand.300` end, comfortably safe).
- Checked and passing, no changes needed: white/`sand.100` caption text
  over the photo-card scrim (worst case — a bright/white photo under the
  `ink.900/80` gradient — still measures 6.38:1 / 5.35:1); `ink.900`-on-
  `ink.100` badges (9–14:1).

## Branded error states

Found the last visible old-style gap: every error branch across the app
(Places/Transport/Hotels tabs, My Trips, the trip-shell "trip not found"
case, and Itinerary's load failure) was bare red text on a plain `Card`,
with no icon or visual hierarchy — inconsistent with the icon-circle
language used everywhere else in the redesign.

`components/ui/ErrorState.tsx`: a `CircleAlert` icon in a
`status.danger/10` circle next to the message, wrapped in `Card`. Swapped
into all six full-failure branches. Left as plain inline red text: the two
`generateError` messages next to the Generate/Regenerate itinerary
buttons — those are small, contextual to an in-progress action rather
than a full page failure, so a full icon-card treatment would be
disproportionate there.

**Follow-up**: a repo-wide sweep after the pass above caught two more
instances missed the first time — the top-level `/results` and
`/itinerary` redirect pages (shown when navigating to those routes with
no `tripId` in the URL) had the same bare-red-text error and plain h2
empty-state heading; fixed both to match. Also gave `ErrorState` a `bare`
prop (skips its own `Card` wrapper) for the one case where it needed to
nest inside a card that already exists (Telegram's connection-status
check, inside the "Connect your Telegram bot" card) rather than stacking
two cards.
