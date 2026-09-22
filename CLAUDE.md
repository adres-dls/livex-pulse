# Livex Pulse — project instructions

Read `ONBOARDING.md` for the full picture. These are the rules to follow when writing code here.

## Non-negotiables
- **Colors: weak/strong tokens ONLY** — `bg-primary-weaker`, `text-primary-stronger`, `bg-accent-weaker`, `text-*-foreground`, etc. NEVER `light/lighter/lightest/dark/darker/darkest`.
- **Design system is linked, not vendored** — `@adres/design-system` and `@adres/brand-adrec` are `file:../adresx/packages/*` deps pointing at a sibling `adresx` checkout (matching `madhmoun`; see `docs/adres-ds-integration.md` in that repo for the full integration guide). Import components from the barrel: `@adres/design-system`. Don't add a private registry — the DS's own runtime deps (Radix UI, `clsx`, `tailwind-merge`, etc.) are declared directly in this repo's `package.json` too, since npm won't install a `file:` link's dependencies when the target lives outside this repo. `next.config.mjs` sets `resolve.symlinks = false` so those deps resolve to *this* app's `node_modules` (not adresx's) — never remove that or you'll get a duplicate-React "Invalid hook call" crash. Editing DS source under `../adresx` is picked up live by the dev server (no rsync/reinstall step) unless its own `package.json` dependencies changed, in which case run `npm install` here again.
- **Adrec theme** is active via `<html data-brand="adrec">`. Palette: primary=gold, secondary=sage, accent=burgundy, neutral=grey. Typeface: Capitana (self-hosted from `public/fonts/`, regular + bold only — see `globals.css`). Dark mode = `.dark` class on `<html>`.
- Keep `src/app/globals.css` import order intact (tailwind → `@custom-variant dark` → `@source` DS → brand theme → DS styles). All typography (`t-display-*`, `t-h1`…`t-h6`, `t-body-*`, `t-label-*`, `t-overline`, `t-code`, `t-micro`) comes from the DS — no local override file.

## Design language — Swiss / International Typographic
- Flat & sharp: hairline `border-border` dividers, tokened radii, minimal shadow. 12-column grids, generous whitespace, strong left alignment.
- Type carries the design: `t-display-*` headlines, **uppercase `t-overline`** kickers, `tabular-nums` for figures, `normal-case` on values under an eyebrow list.
- Monochrome base + one accent. No gradients/scrims unless functional.
- Prefer DS components over hand-rolled UI. Conventions: Live status → `Badge variant="accent"`; primary CTAs → `variant="primary"`; plain-language labels.

## Terminology / i18n
- English-only by design (a venue kiosk display, not a bilingual app screen) — no i18n dictionary or `t()` hook in this repo.

## Workflow
- TypeScript strict. **`npm run typecheck` must pass** before a change is done.
- Keep `next dev` running on its port; **never run `next build` while dev is running** (corrupts `.next`; `rm -rf .next` to recover).
- Reference implementation for all of the above: `/repos/auction-adrec-v1`.
