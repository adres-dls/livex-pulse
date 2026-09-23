# Livex Pulse — Onboarding

> Guide for anyone (human or AI agent) working in this repo. Read this first.

## What Livex Pulse is

Livex Pulse is the "Live Pulse" kiosk board for the LIVEX exhibition stand — a full-bleed,
English-only display of live Abu Dhabi real-estate market activity (transactions, market
value, category breakdowns) meant for a venue monitor or LED wall, not a signed-in app.
It's a single-row 3840×534 banner (`src/app/live-pulse/live-pulse-display-wide.tsx`) for
a video-wall strip, served directly at `/` (see `src/app/page.tsx`) — the only screen in
this app.

This repo was originally bootstrapped from the Dari codebase (same design-system/brand
wiring and app scaffolding). That scaffolding's own pages, components, i18n and theme
infra (marketing homepage, dashboard, playbook, `DariLogo`, bilingual `t()` hook, the
app-wide theme/language providers) have since been removed — the kiosk board manages its
own dark/light toggle independently (see `useKioskTheme` in `live-pulse/shared.tsx`) and
is English-only by design, so none of that infra was needed.

Livex Pulse reuses the **Adres Design System** with the **Adrec brand theme** and follows a
**Swiss (International Typographic) design style**. A working reference for this exact
setup lives at `/repos/auction-adrec-v1` — mirror it when in doubt.

## Stack

- **Next.js 15** (App Router) · **React 19** · **TypeScript** (strict) · **Tailwind CSS v4**
- The design system ships raw TS/TSX from `src/` (no prebuilt `dist`) and is transpiled by the app.

## Design system + Adrec theme

The DS and brand are **installed from npm**, not linked to a sibling checkout. Published
packages: `@adres/design-system` and `@adres/brand-adrec` on the public registry. Canonical
source remains the adresx monorepo. There is no local copy of either package's source in
this repo.

**Wiring (already reflected in the repo — don't drift from it):**

- `package.json`: `"@adres/design-system": "^0.1.6"`, `"@adres/brand-adrec": "^0.1.1"`.
  The DS ships raw TS/TSX, so every runtime dependency it needs (Radix UI primitives, `clsx`,
  `class-variance-authority`, `tailwind-merge`, `tailwind-variants`, `sonner`,
  `@adres/brand-contract`) is declared directly in this repo's own `dependencies` too. If a
  new design-system release adds a runtime dependency, mirror it here and `npm install`.
- `.npmrc`: `registry=https://registry.npmjs.org/` (public registry only — no private Azure feed)
- `next.config.mjs`:
  - `transpilePackages: ["@adres/design-system", "@adres/brand-adrec"]`
  - `experimental.optimizePackageImports: ["lucide-react", "motion", "@adres/design-system"]`
  - `webpack: (config) => { config.resolve.symlinks = false; config.watchOptions.followSymlinks = true; ... }`
    — keeps module identity inside this app's `node_modules`. If these packages are switched
    back to `file:` links into a sibling adresx checkout, webpack would otherwise resolve
    them to adresx's own `node_modules/react` — a second React instance, which breaks hooks
    at runtime ("Invalid hook call").
- `src/app/globals.css` (import order is load-bearing):
  ```css
  @import "tailwindcss";
  @custom-variant dark (&:where(.dark, .dark *));
  @source "../../node_modules/@adres/design-system/src";
  @import "@adres/brand-adrec/theme.css";
  @import "@adres/design-system/styles";
  ```
- `<html data-brand="adrec" suppressHydrationWarning>` activates the Adrec token set.
- Import components from the barrel: `import { Button, Badge, Card } from "@adres/design-system"`.
- **No local styling overrides.** There is no `src/styles/` typography/token file — all type
  classes (`t-display-*`, `t-h1`…`t-h6`, `t-body-*`, `t-label-*`, `t-overline`, `t-code`,
  `t-micro`) and color/spacing/radius/shadow tokens come from `@adres/design-system/styles`
  and the Adrec brand theme. Don't add a local CSS file that redefines a DS utility name with
  different values (a past version of this repo did exactly that with a leftover Propify
  typography file — don't reintroduce it). If a needed type size or token doesn't exist,
  that's a signal to extend the upstream DS, not to shadow it locally.

## Token contract (STRICT)

- Colors use **weak/strong** semantic names only: `bg-primary-weaker`, `text-primary-stronger`,
  `bg-secondary-weakest`, `bg-accent-weaker`, `text-*-foreground`, etc.
  **Never** use `light/lighter/lightest/dark/darker/darkest`.
- Adrec palette: **primary = gold**, **secondary = sage**, **accent = burgundy**, neutrals = grey.
- Use DS scale tokens for the rest: spacing (`gap-md`, `px-xl`, `py-2xs`…), radius
  (`rounded-(--input-radius)`, `radius-*`), typography (`t-display-*`, `t-h1`…`t-h6`,
  `t-body-*`, `t-label-*`, `t-overline`).
- Typeface: **Capitana**, self-hosted from `public/fonts/` (regular + bold only, no italic) —
  see the `--font-family-sans`/`--font-family-display` override in `globals.css`.
- Dark mode = a `.dark` class on `<html>` (not OS preference).

## Swiss design language

- **Flat & sharp** — minimal shadows; hairline `border-border` dividers; tokened radii only;
  DS `Card` elevation used sparingly.
- **Grid-driven** — 12-column layouts, strong left alignment, generous whitespace, editorial
  rhythm, numbered rows/sections where they fit.
- **Typographic hierarchy** — large `t-display-*` headlines; **uppercase `t-overline`** kickers;
  `tabular-nums` for figures; `normal-case` on values under an eyebrow-styled list.
- **Restrained color** — monochrome base + a single accent; type and space carry the design.
  Avoid gradients/scrims unless functional.
- Prefer DS components (`Badge`, `SegmentedControl`, `StepIndicator`, `CheckboxCard`/`RadioCard`
  compact-vertical, `Drawer`, `Alert`, `Card`, `EmptyState`) over hand-rolled UI.
- Conventions: **Live** status → `Badge variant="accent"`; primary CTAs → `variant="primary"`;
  plain-language labels (no insider jargon).

## Bilingual

Livex Pulse is English-only by design (a venue monitor, not a bilingual app screen) —
there is no i18n dictionary or `t()` hook in this repo. If a future screen needs one,
use logical CSS properties (`inset-s`/`inset-e`, `ms`/`me`, `rtl:` variants) so layouts
mirror correctly, rather than reintroducing the removed Dari i18n setup wholesale.

## Local dev & quality gates

- `npm run dev` on a dedicated port; keep it running between checks.
- **Do not run `next build` while `next dev` is running** — it corrupts `.next` (`rm -rf .next` to recover).
- TypeScript strict; **`npm run typecheck` must pass** before a change is considered done.

## Reference

- **`/repos/auction-adrec-v1`** — proven implementation of this integration + design language.
- **npm** `@adres/design-system` / `@adres/brand-adrec` — published packages this app installs. Canonical source remains the adresx monorepo.
