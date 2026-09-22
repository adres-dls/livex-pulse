"use client"

import { useEffect, useId, useRef, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Popover, PopoverContent, PopoverTrigger, Toggle, cn } from "@adres/design-system"
import { Settings } from "lucide-react"

/**
 * Shared logic + primitives for the "Live Pulse" kiosk boards — the simulated
 * live market feed, the clock, the forced-theme hook, and the small animated
 * building blocks (digit tiles, currency amounts, sparkline, aurora backdrop).
 * Each board (`live-pulse-display.tsx`, `wide/live-pulse-display-wide.tsx`)
 * owns its own layout — card components, header — but shares all of this so
 * the two never drift on what "live" actually means.
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

/** Drives `.dark` on `<html>` for as long as a board is mounted, independent
 *  of the signed-in app's own theme toggle — defaults to dark, flippable to
 *  light from the settings popover, and restores whatever state it found on
 *  unmount. A `MutationObserver` keeps re-asserting the chosen mode:
 *  `ThemeProvider`'s own mount effect reads the site's stored theme preference
 *  and can otherwise flip the class right back after this one runs. */
export function useKioskTheme() {
  const [mode, setMode] = useState<KioskThemeMode>("dark")

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

  return { mode, setMode }
}

/* ─── Simulated live market feed ─────────────────────────────────────────── */

export interface MarketState {
  transactionsToday: number
  totalMarketValue: number
  topTransactionValue: number
  sell: { count: number; offPlan: number; ready: number; value: number }
  development: { count: number; registeredProjects: number }
  lease: { count: number; newCount: number; renewCount: number; value: number }
}

const INITIAL_MARKET: MarketState = {
  transactionsToday: 2,
  totalMarketValue: 1_800_000,
  topTransactionValue: 1_300_000,
  sell: { count: 1, offPlan: 1, ready: 0, value: 1_300_000 },
  development: { count: 0, registeredProjects: 0 },
  lease: { count: 1, newCount: 0, renewCount: 1, value: 431_000 },
}

function randomTransactionAmount() {
  return Math.round((200_000 + Math.random() * 1_800_000) / 10_000) * 10_000
}

/** One simulated market event: 70% chance it's a sale or a lease (moves the
 *  money figures), 30% chance it's a no-value expression of interest. */
function simulateMarketEvent(prev: MarketState): MarketState {
  const roll = Math.random()

  if (roll >= 0.7) {
    return {
      ...prev,
      development: {
        count: prev.development.count + 1,
        registeredProjects: prev.development.registeredProjects + 1,
      },
    }
  }

  const amount = randomTransactionAmount()
  const next: MarketState = {
    ...prev,
    transactionsToday: prev.transactionsToday + 1,
    totalMarketValue: prev.totalMarketValue + amount,
    topTransactionValue: Math.max(prev.topTransactionValue, amount),
  }

  if (roll < 0.45) {
    const isOffPlan = Math.random() < 0.5
    next.sell = {
      count: prev.sell.count + 1,
      offPlan: prev.sell.offPlan + (isOffPlan ? 1 : 0),
      ready: prev.sell.ready + (isOffPlan ? 0 : 1),
      value: prev.sell.value + amount,
    }
  } else {
    const isNew = Math.random() < 0.5
    next.lease = {
      count: prev.lease.count + 1,
      newCount: prev.lease.newCount + (isNew ? 1 : 0),
      renewCount: prev.lease.renewCount + (isNew ? 0 : 1),
      value: prev.lease.value + amount,
    }
  }

  return next
}

/** Simulates a trickle of new transactions arriving every few seconds — the
 *  "live" feed both boards are named for. Every card wired to it animates its
 *  own change (see `AedAmount`, `DigitTile`). */
export function useLiveMarket() {
  const [market, setMarket] = useState(INITIAL_MARKET)

  useEffect(() => {
    let timeoutId: number
    const scheduleNext = () => {
      const delay = 4000 + Math.random() * 5000
      timeoutId = window.setTimeout(() => {
        setMarket((prev) => simulateMarketEvent(prev))
        scheduleNext()
      }, delay)
    }
    scheduleNext()
    return () => window.clearTimeout(timeoutId)
  }, [])

  return market
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
 *  by design (no unit, no layout) — each board wraps it in its own typography. */
export function AedAmount({ value, className }: { value: number; className?: string }) {
  const display = useCountUp(value)
  return <span className={cn("tabular-nums", className)}>{formatAED(display)}</span>
}

/** `useCountUp` plus a brief primary-coloured "pulse" flash on change — the
 *  live-ticker highlight shared by every big figure on both boards
 *  (`CurrencyValue`, `CountValue`). */
export function usePulsingCountUp(value: number, duration = 700) {
  const display = useCountUp(value, duration)
  const [pulsing, setPulsing] = useState(false)
  const prevValue = useRef(value)

  useEffect(() => {
    if (prevValue.current === value) return
    prevValue.current = value
    setPulsing(true)
    const id = setTimeout(() => setPulsing(false), 600)
    return () => clearTimeout(id)
  }, [value])

  return { display, pulsing }
}

/* ─── Flip-clock style digit tiles ───────────────────────────────────────── */

export function DigitTile({
  char,
  dim,
  tileClassName,
  textClassName,
}: {
  char: string
  dim: boolean
  tileClassName: string
  textClassName: string
}) {
  return (
    <span
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-sm border",
        tileClassName,
        dim ? "border-border/50 bg-card/50" : "border-border bg-card"
      )}
    >
      {/* Each digit change rolls the old character out and the new one in —
          `key={char}` makes AnimatePresence treat it as a mount/unmount pair
          rather than an update, so the tile "flips" on every value change. */}
      <AnimatePresence initial={false}>
        <motion.span
          key={char}
          initial={{ y: "70%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-70%", opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className={cn("absolute", textClassName, "tabular-nums", dim && "text-muted-foreground/40")}
        >
          {char}
        </motion.span>
      </AnimatePresence>
      <span aria-hidden className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-background" />
    </span>
  )
}

export function FlipCounter({
  value,
  digits,
  tileClassName,
  textClassName,
  gapClassName = "gap-1",
}: {
  value: number
  digits: number
  tileClassName: string
  textClassName: string
  gapClassName?: string
}) {
  const str = String(value).padStart(digits, "0")
  const firstActive = str.search(/[1-9]/)
  const activeFrom = firstActive === -1 ? digits - 1 : firstActive
  return (
    <div className={cn("flex", gapClassName)}>
      {str.split("").map((ch, i) => (
        <DigitTile
          key={i}
          char={ch}
          dim={i < activeFrom}
          tileClassName={tileClassName}
          textClassName={textClassName}
        />
      ))}
    </div>
  )
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

/** Gear icon + popover with the dark/light switch for the kiosk's own forced
 *  theme (see `useKioskTheme`) — identical on every board. */
export function SettingsMenu({
  mode,
  onModeChange,
}: {
  mode: KioskThemeMode
  onModeChange: (mode: KioskThemeMode) => void
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
        <span className="text-[0.625rem] font-semibold leading-none tracking-widest uppercase text-muted-foreground">Display</span>
        <Toggle
          labelClassName="mt-md w-full justify-between"
          label="Dark theme"
          checked={mode === "dark"}
          onCheckedChange={(checked) => onModeChange(checked ? "dark" : "light")}
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
