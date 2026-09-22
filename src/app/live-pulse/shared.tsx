"use client"

import { useEffect, useId, useRef, useState, type CSSProperties } from "react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  SegmentedControl,
  SegmentedControlItem,
  Toggle,
  cn,
} from "@adres/design-system"
import { Settings } from "lucide-react"

/**
 * Shared logic + primitives for the "Live Pulse" kiosk board — the clock, the
 * forced-theme hook, and the small building blocks (currency amounts,
 * sparkline) — kept apart from `live-pulse-display-wide.tsx`'s own layout
 * (card components, header).
 */

/* ─── Clock ───────────────────────────────────────────────────────────────── */

export function useClock() {
  const [now, setNow] = useState<Date | null>(null)
  const [sessionStart, setSessionStart] = useState<Date | null>(null)

  useEffect(() => {
    const start = new Date()
    setSessionStart(start)
    setNow(start)
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const fmt = (d: Date, withSeconds: boolean) =>
    d.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: withSeconds ? "2-digit" : undefined,
    })

  return {
    time: now ? fmt(now, true) : "--:--:--",
    sessionStart: sessionStart ? fmt(sessionStart, false) : "--:--",
  }
}

/* ─── Forced kiosk theme ──────────────────────────────────────────────────── */

export type KioskThemeMode = "light" | "dark"

/** Colour theme, independent of light/dark `mode` (though `theme1` is
 *  light-only — see `useKioskTheme`):
 *   - `default` — the Adrec semantic palette, as everywhere else in the app.
 *   - `theme1`  — a black page with primary-tinted `Card` surfaces floating
 *     on it. Text is white/light-grey directly on the page (the header) and
 *     black/dark-grey inside a card, so each reads correctly against its own
 *     surface — see `kioskThemeStyle` (page) and `kioskCardStyle` (card). */
export type KioskColorTheme = "default" | "theme1"

/** Page-root override for each non-default color theme, keyed by `mode` —
 *  spread as inline `style` on a board's root element so every existing
 *  `bg-background` / `text-foreground-strong` / `text-muted-foreground`
 *  class picks up the new values with no per-element changes. Everything
 *  outside a `Card` (the header) inherits this — white text on a black page.
 *  `kioskCardStyle` then re-overrides the same three tokens back to solid
 *  black, scoped to each card, since a card sits on its own primary-tinted
 *  surface instead. `--primary` itself is left alone. HSL triplets, matching
 *  every other token here. */
const KIOSK_THEME_VARS: Record<Exclude<KioskColorTheme, "default">, Record<KioskThemeMode, CSSProperties>> = {
  theme1: {
    light: {
      "--background": "0 0% 0%",
      "--foreground-strong": "0 0% 100%",
      "--foreground": "0 0% 100%",
      "--muted-foreground": "0 0% 65%",
    } as CSSProperties,
    dark: {
      "--background": "var(--primary)",
      "--foreground-strong": "0 0% 0%",
      "--foreground": "0 0% 0%",
      "--muted-foreground": "0 0% 40%",
    } as CSSProperties,
  },
}

/** `Card`-scoped override — spread as inline `style` on every `Card` element
 *  (in addition to `kioskThemeStyle` on the board root) so its own subtree
 *  gets the primary-tinted `--card` surface with all-black text (both the
 *  main and "lighter" tiers — the card is small and busy enough that a grey
 *  second tier reads as low-contrast rather than de-emphasized), while
 *  everything outside it keeps the root's white-on-black. See
 *  `KIOSK_THEME_VARS` for why this needs its own map. */
const KIOSK_CARD_VARS: Record<Exclude<KioskColorTheme, "default">, Record<KioskThemeMode, CSSProperties>> = {
  theme1: {
    light: {
      // #EBA56C — LIVEX brand guidelines background swatch.
      "--card": "27 76% 67%",
      "--foreground-strong": "0 0% 0%",
      "--foreground": "0 0% 0%",
      "--muted-foreground": "0 0% 0%",
    } as CSSProperties,
    dark: {
      "--card": "var(--primary-950)",
      "--foreground-strong": "0 0% 100%",
      "--foreground": "0 0% 100%",
      "--muted-foreground": "0 0% 100%",
    } as CSSProperties,
  },
}

/** Inline `style` for a board's root element implementing `theme` — `undefined`
 *  for `"default"`, so it's a no-op spread (`style={kioskThemeStyle(...)}`). */
export function kioskThemeStyle(theme: KioskColorTheme, mode: KioskThemeMode): CSSProperties | undefined {
  return theme === "default" ? undefined : KIOSK_THEME_VARS[theme][mode]
}

/** Inline `style` for a `Card` element implementing `theme` — `undefined` for
 *  `"default"` (so it's a no-op spread: `style={kioskCardStyle(...)}`). Use
 *  alongside `kioskThemeStyle` on the board root, never instead of it. */
export function kioskCardStyle(theme: KioskColorTheme, mode: KioskThemeMode): CSSProperties | undefined {
  return theme === "default" ? undefined : KIOSK_CARD_VARS[theme][mode]
}

/** Card/section title colour — brand primary by default, or the theme's main
 *  text colour under `theme1` (black in light, white in dark — see
 *  `KIOSK_CARD_VARS`; a title always lives inside a `Card`), since an
 *  accent-coloured title reads poorly once the card itself is primary-tinted. */
export function kioskTitleClass(theme: KioskColorTheme): string {
  return theme === "theme1" ? "text-foreground-strong" : "text-primary"
}

/** `Card` background — the default board keeps the translucent `bg-card/60`
 *  glass look, but `theme1` needs a fully opaque card: the page behind it is
 *  now black, and a translucent card lets that black bleed through, darkening
 *  the intended swatch colour enough that `text-muted-foreground` loses
 *  contrast against it. */
export function kioskCardBgClass(theme: KioskColorTheme): string {
  return theme === "theme1" ? "bg-card" : "bg-card/60 backdrop-blur-xl"
}

/* ─── Card text scale ─────────────────────────────────────────────────────── */

export type KioskCardTextStep = "3xs" | "xs" | "lg" | "xl" | "2xl" | "4xl"

/** Base size ↔ one step up Tailwind's named type scale, for every card text
 *  size in use on the board (see `kioskCardTextClass`) — `"3xs"` is
 *  this app's `text-[0.625rem]` overline size, which isn't a named Tailwind
 *  step of its own. Every class name here is a literal string — including
 *  the "base" ones — so Tailwind's scanner generates all of them regardless
 *  of which branch runs at render time; a `text-${step}` template would only
 *  ever emit whichever size happened to be interpolated during a build-time
 *  scan, not a real utility class name. */
const TEXT_STEP: Record<KioskCardTextStep, { base: string; up: string }> = {
  "3xs": { base: "text-[0.625rem]", up: "text-xs" },
  xs: { base: "text-xs", up: "text-sm" },
  lg: { base: "text-lg", up: "text-xl" },
  xl: { base: "text-xl", up: "text-2xl" },
  "2xl": { base: "text-2xl", up: "text-3xl" },
  "4xl": { base: "text-4xl", up: "text-[3.7rem]" },
}

/** Card copy size — `text-{step}` normally, or one step up when `enlarge`
 *  (the settings popover's "Larger card text" toggle) is on. Every text
 *  element inside a `Card` uses this instead of a literal size class, EXCEPT
 *  the main figure (`BigValue`'s `text-[14rem]`), which the settings copy
 *  calls out as staying fixed regardless. */
export function kioskCardTextClass(step: KioskCardTextStep, enlarge: boolean): string {
  return enlarge ? TEXT_STEP[step].up : TEXT_STEP[step].base
}

/** Drives `.dark` on `<html>` for as long as a board is mounted, independent
 *  of the signed-in app's own theme toggle — defaults to dark, flippable to
 *  light from the settings popover, and restores whatever state it found on
 *  unmount. A `MutationObserver` keeps re-asserting the chosen mode:
 *  `ThemeProvider`'s own mount effect reads the site's stored theme preference
 *  and can otherwise flip the class right back after this one runs.
 *
 *  Also owns `theme` (see `KioskColorTheme`) — a plain, DOM-effect-free state
 *  value, since every color theme is implemented as inline CSS variables on
 *  the board's own root (`kioskThemeStyle`) rather than a global toggle.
 *  `theme1` is light-only: selecting it forces `mode` to `"light"` and the
 *  returned `setMode` then ignores further changes until `theme` switches
 *  back — the settings popover also disables its toggle in that state (see
 *  `SettingsMenu`), so this is a belt-and-braces guard, not the only one.
 *
 *  Also owns `largeCardText` (see `kioskCardTextClass`) — another plain,
 *  DOM-effect-free toggle, same reasoning as `theme`. */
export function useKioskTheme() {
  const [mode, setModeState] = useState<KioskThemeMode>("dark")
  const [theme, setTheme] = useState<KioskColorTheme>("default")
  const [largeCardText, setLargeCardText] = useState(false)

  useEffect(() => {
    if (theme === "theme1") setModeState("light")
  }, [theme])

  const setMode = (next: KioskThemeMode) => {
    if (theme === "theme1") return
    setModeState(next)
  }

  useEffect(() => {
    const root = document.documentElement
    const hadDark = root.classList.contains("dark")

    const apply = () => {
      const shouldBeDark = mode === "dark"
      if (root.classList.contains("dark") !== shouldBeDark) {
        root.classList.toggle("dark", shouldBeDark)
      }
    }
    apply()

    const observer = new MutationObserver(apply)
    observer.observe(root, { attributes: true, attributeFilter: ["class"] })

    return () => {
      observer.disconnect()
      root.classList.toggle("dark", hadDark)
    }
  }, [mode])

  return { mode, setMode, theme, setTheme, largeCardText, setLargeCardText }
}

/* ─── Market snapshot shape ───────────────────────────────────────────────── */

export interface MarketState {
  transactionsToday: number
  totalMarketValue: number
  topTransactionValue: number
  sell: { count: number; offPlan: number; ready: number; value: number }
  development: { count: number; registeredProjects: number }
  lease: { count: number; newCount: number; renewCount: number; value: number }
}

/* ─── Currency formatting + counting animation ───────────────────────────── */

const aedFormatter = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 })

export function formatAED(value: number) {
  return aedFormatter.format(value)
}

/** Animates a number tweening from its previous value to `target` over
 *  `duration`ms (eased) — the "counting up" effect behind every live figure. */
export function useCountUp(target: number, duration = 700) {
  const [display, setDisplay] = useState(target)
  const fromRef = useRef(target)

  useEffect(() => {
    const from = fromRef.current
    if (from === target) return

    const start = performance.now()
    let raf = 0

    function tick(now: number) {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(Math.round(from + (target - from) * eased))
      if (t < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        fromRef.current = target
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])

  return display
}

/** A compact AED amount that counts up to `value` whenever it changes. Bare
 *  by design (no unit, no layout) — the board wraps it in its own typography. */
export function AedAmount({ value, className }: { value: number; className?: string }) {
  const display = useCountUp(value)
  return <span className={cn("tabular-nums", className)}>{formatAED(display)}</span>
}

/* ─── Sparkline ───────────────────────────────────────────────────────────── */

export function Sparkline({ className }: { className?: string }) {
  const gradientId = useId()
  return (
    <svg viewBox="0 0 100 40" preserveAspectRatio="none" className={className} fill="none" aria-hidden>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.35" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M0,32 L25,28 L50,30 L75,14 L100,6 L100,40 L0,40 Z" fill={`url(#${gradientId})`} stroke="none" />
      <polyline
        points="0,32 25,28 50,30 75,14 100,6"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/* ─── Settings popover ────────────────────────────────────────────────────── */

/** Gear icon + popover with the dark/light switch, the colour-theme picker,
 *  and the card text-size toggle for the kiosk's own forced theme (see
 *  `useKioskTheme`). */
export function SettingsMenu({
  mode,
  onModeChange,
  theme,
  onThemeChange,
  largeCardText,
  onLargeCardTextChange,
}: {
  mode: KioskThemeMode
  onModeChange: (mode: KioskThemeMode) => void
  theme: KioskColorTheme
  onThemeChange: (theme: KioskColorTheme) => void
  largeCardText: boolean
  onLargeCardTextChange: (largeCardText: boolean) => void
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Display settings"
          className="flex size-11 shrink-0 items-center justify-center rounded-full transition-colors"
        >
          <Settings className="size-5" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" size="sm">
        <span className="text-[0.625rem] font-semibold leading-none tracking-widest uppercase text-muted-foreground">Theme</span>
        <SegmentedControl
          className="mt-md"
          size="sm"
          fullWidth
          value={theme}
          onValueChange={(value) => onThemeChange(value as KioskColorTheme)}
        >
          <SegmentedControlItem value="default">Default</SegmentedControlItem>
          <SegmentedControlItem value="theme1">Theme 1</SegmentedControlItem>
        </SegmentedControl>

        <span className="mt-xl block text-[0.625rem] font-semibold leading-none tracking-widest uppercase text-muted-foreground">Display</span>
        <Toggle
          labelClassName="mt-md w-full justify-between"
          label="Dark theme"
          checked={mode === "dark"}
          onCheckedChange={(checked) => onModeChange(checked ? "dark" : "light")}
          disabled={theme === "theme1"}
        />

        <span className="mt-xl block text-[0.625rem] font-semibold leading-none tracking-widest uppercase text-muted-foreground">
          Text
        </span>
        <Toggle
          labelClassName="mt-md w-full justify-between"
          label="Larger card text"
          checked={largeCardText}
          onCheckedChange={onLargeCardTextChange}
        />
      </PopoverContent>
    </Popover>
  )
}

/* ─── Panel tone → Badge variant ──────────────────────────────────────────── */

export type PanelTone = "primary" | "secondary"

// `Badge` has no "primary" variant — its primary-coloured variant is named "default".
export const BADGE_VARIANT: Record<PanelTone, "default" | "secondary"> = {
  primary: "default",
  secondary: "secondary",
}
