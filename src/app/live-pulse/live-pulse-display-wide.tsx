"use client"

import { Badge, Card, cn } from "@adres/design-system"
import { TrendingUp } from "lucide-react"
import {
  SettingsMenu,
  formatAED,
  formatCount,
  kioskCardBgClass,
  kioskCardStyle,
  kioskThemeStyle,
  kioskTitleClass,
  useClock,
  useFullscreenOnFirstInteraction,
  useKioskTheme,
  type KioskColorTheme,
  type KioskThemeMode,
  type MarketState,
} from "./shared"

// Static snapshot standing in for a day's activity — no live simulation feed
// on this board, just representative figures for the booth display.
// `transactionsToday`/`totalMarketValue` count Sell + Lease only — Development
// (Expression of Interest) leads aren't transactions, so they're excluded.
const MARKET: MarketState = {
  transactionsToday: 47,
  totalMarketValue: 66_000_000,
  topTransactionValue: 4_800_000,
  // `value` is a placeholder — no real EOI valuation source exists yet.
  development: { count: 15, value: 4_200_000 },
  yearToDate: {
    transactionsCount: 41_230,
    transactionsYoyPct: 38.6,
    marketValue: 168_500_000_000,
    marketValueYoyPct: 64.1,
  },
}

/**
 * "Live Pulse" — the kiosk board for the LIVEX exhibition stand, fixed at
 * 3840×534px for an LED/video wall strip. Six or seven cards (the
 * Development/EOI card only shows once its count reaches 5) sit in a single
 * row, sized and spaced to use that width and height rather than floating in
 * extra whitespace. Shares its clock and theme logic (see `./shared`).
 */
export function LivePulseDisplayWide() {
  const { mode, setMode, theme, setTheme } = useKioskTheme()
  const { time, sessionStart } = useClock()
  useFullscreenOnFirstInteraction()
  const market = MARKET
  const avgTransactionValue =
    market.transactionsToday > 0 ? Math.round(market.totalMarketValue / market.transactionsToday) : 0
  // The Development/EOI card only earns its place once there's enough
  // interest to show — stays hidden below that count, and the row falls
  // back to 6 even columns instead of leaving its slot blank.
  const developmentVisible = market.development.count >= 5

  return (
    // Escapes the root layout's centered `max-w-395` column — the canvas
    // itself stays a literal 3840×534px block in normal flow, so this
    // wrapper's `overflow-auto` can scroll to it instead of clipping it. On
    // an actual 3840×534 kiosk window there's nothing to scroll; anywhere
    // smaller, the whole board is still reachable by scrolling — the header
    // scrolls right along with the card row beneath it (both live inside the
    // same `w-960` block) rather than staying pinned to the viewport.
    //
    // `style` carries `theme`'s CSS-variable overrides (see `kioskThemeStyle`)
    // — set here, on the common ancestor of the header and the canvas below,
    // so both pick it up through inheritance with no per-element changes.
    <div className="fixed inset-0 overflow-auto bg-background" style={kioskThemeStyle(theme, mode)}>
      <div className="w-960">
        <Header
          time={time}
          mode={mode}
          onModeChange={setMode}
          theme={theme}
          onThemeChange={setTheme}
        />

        <div className="relative h-133.5 text-foreground">
          <div className="relative z-10 flex h-full flex-col px-5 pb-3.75">
            <div className={cn("grid min-h-0 flex-1 gap-2", developmentVisible ? "grid-cols-7" : "grid-cols-6")}>
              <StatCard
                theme={theme}
                mode={mode}
                label="Total transactions"
                caption="Today"
                value={<CountValue value={market.transactionsToday} theme={theme} />}
                footer={
                  <p className="text-pulse-sm text-center font-regular leading-5 tracking-tight text-muted-foreground">
                    Session started {sessionStart}
                  </p>
                }
              />

              <StatCard
                theme={theme}
                mode={mode}
                label="Total market value"
                caption="Today"
                value={<CurrencyValue value={market.totalMarketValue} theme={theme} />}
              />

              <StatCard
                theme={theme}
                mode={mode}
                label="Avg. transaction value"
                value={<CurrencyValue value={avgTransactionValue} theme={theme} />}
                footer={
                  <p className="text-pulse-sm text-center font-regular leading-5 tracking-tight text-muted-foreground">
                    Across all live groups
                  </p>
                }
              />

              <StatCard
                theme={theme}
                mode={mode}
                label="Top transaction"
                caption="Today"
                value={<CurrencyValue value={market.topTransactionValue} theme={theme} />}
                footer={
                  <p className="text-pulse-sm text-center font-regular leading-5 tracking-tight text-muted-foreground">
                    Sell · Off-plan · Masdar City
                  </p>
                }
              />

              {developmentVisible && (
                <StatCard
                  theme={theme}
                  mode={mode}
                  label="Development Interest"
                  caption="EOI"
                  value={<CurrencyValue value={market.development.value} theme={theme} />}
                  footer={
                    <p className="text-pulse-sm text-center font-regular leading-5 tracking-tight text-muted-foreground">
                      {market.development.count} EOIs today
                    </p>
                  }
                />
              )}

              <StatCard
                theme={theme}
                mode={mode}
                label="Total transactions"
                caption="Year to date"
                value={<CountValue value={market.yearToDate.transactionsCount} theme={theme} />}
                footer={<YoyBadge pct={market.yearToDate.transactionsYoyPct} />}
              />

              <StatCard
                theme={theme}
                mode={mode}
                label="Total market value"
                caption="Year to date"
                value={<CurrencyValue value={market.yearToDate.marketValue} theme={theme} />}
                footer={<YoyBadge pct={market.yearToDate.marketValueYoyPct} />}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Header ──────────────────────────────────────────────────────────────── */

function Header({
  time,
  mode,
  onModeChange,
  theme,
  onThemeChange,
}: {
  time: string
  mode: KioskThemeMode
  onModeChange: (mode: KioskThemeMode) => void
  theme: KioskColorTheme
  onThemeChange: (theme: KioskColorTheme) => void
}) {
  return (
    // In normal flow (not `fixed`/`sticky`) inside the same `w-960` block as
    // the card row below it, so it scrolls right along with the cards when
    // this board is previewed narrower than its native 3840px.
    <header className="flex h-17.75 items-center justify-between gap-5 px-5">
      <div className="flex items-center gap-3.25">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={
            mode === "dark" || theme === "theme1"
              ? "/images/logo/livex-white-logo.png"
              : "/images/logo/livex-logo.png"
          }
          alt="Abu Dhabi Real Estate Centre"
          className="h-9 w-auto"
        />
        <div className="flex items-center gap-2.5 border-s border-border ps-3.75">
          <span className="text-[15px] font-semibold leading-5 tracking-tight tabular-nums text-foreground">{time}</span>
          <Badge variant="success" size="sm">
            <span aria-hidden className="size-1.5 rounded-full bg-success-foreground" />
            <span className="text-sm font-medium leading-none uppercase tracking-widest">Live</span>
          </Badge>
        </div>
      </div>

      <div className="flex items-center bg-background/70 rounded-full backdrop-blur-xl">
        <SettingsMenu
          mode={mode}
          onModeChange={onModeChange}
          theme={theme}
          onThemeChange={onThemeChange}
        />
      </div>
    </header>
  )
}

/* ─── Top stat band ───────────────────────────────────────────────────────── */

function StatCard({
  theme,
  mode,
  label,
  caption,
  value,
  footer,
}: {
  theme: KioskColorTheme
  mode: KioskThemeMode
  label: string
  caption?: string
  value: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <Card
      variant="default"
      padding="none"
      elevation="none"
      borderless
      className={cn("relative flex flex-col justify-between rounded-none p-7.75", kioskCardBgClass(theme))}
      style={kioskCardStyle(theme, mode)}
    >
      {/* Decorative mark, centered on the card and behind everything else —
          placed first so it paints under the (also absolutely-positioned)
          value below. */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <CardBackgroundMark />
      </div>

      {/* Fixed height, sized to fit `Panel`'s two-line title + subtitle —
          even though this header is a single line for cards with no
          `caption`, reserving the same space keeps the value below starting
          at the same height on every card in the row. */}
      <div className="flex h-25.5 items-start justify-center">
        <div className="text-center">
          {/* Plain string concatenation, not `cn()` — `cn`'s tailwind-merge
              doesn't know about the custom `text-pulse-*` theme keys and
              misreads them as conflicting with a `text-color` utility (e.g.
              `text-foreground-strong`), silently dropping whichever comes
              first. */}
          <span className={`text-pulse-md font-display font-semibold leading-8.75 tracking-tight ${kioskTitleClass(theme)}`}>
            {label}
          </span>
          {caption && <p className="text-pulse-sm mt-0.5 leading-5 text-muted-foreground">{caption}</p>}
        </div>
      </div>
      {/* Centered on the card as a whole (not the space between title and
          footer) — `absolute inset-0` positions it against the `Card`'s own
          padding box, independent of the title/footer's own flow. The inner
          `h-44` box is the fixed-size "slot" for the value (fits `BigValue`
          + its label with a little slack); content top-aligns within it, so
          the figure's own top edge stays put regardless of label length —
          only the (centered) slot itself moves as a whole. */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex h-44 items-start justify-center">{value}</div>
      </div>
      <div className="flex items-end justify-center">{footer}</div>
    </Card>
  )
}

/** Year-over-year delta pill for the two "year to date" cards — mirrors the
 *  ADREC website's own trend badge (a `success`-tinted pill with an up arrow
 *  and a percentage) rather than inventing a new treatment. */
function YoyBadge({ pct }: { pct: number }) {
  return (
    <Badge variant="success" size="sm" className="gap-1">
      <TrendingUp className="size-3" aria-hidden />
      <span className="text-pulse-sm font-medium leading-none tabular-nums">{pct.toFixed(2)}% YoY</span>
    </Badge>
  )
}

/** Big tabular-nums figure shared by every main value block on this board —
 *  one typography treatment regardless of what (if anything) labels it.
 *  Accent-coloured under the default theme (every numerical value on the
 *  board is); `theme1`'s primary-tinted card keeps it at the theme's own
 *  neutral text colour instead, matching `kioskTitleClass`. */
function BigValue({ theme, children }: { theme: KioskColorTheme; children: React.ReactNode }) {
  // Plain string concatenation, not `cn()` — see the note on `StatCard`'s
  // title span: tailwind-merge doesn't know the custom `text-pulse-*` keys
  // and drops `text-pulse-xl` when it's combined with a `text-color` class.
  return (
    <span
      className={`text-pulse-xl font-display font-semibold leading-32 tracking-[0.01em] tabular-nums ${
        theme === "theme1" ? "text-foreground-strong" : "text-primary"
      }`}
    >
      {children}
    </span>
  )
}

/** The label-under-value structure shared by every main value block — "AED"
 *  under a currency amount, "sales today" under a count, or no label at all
 *  (the transactions count), all through the same markup. Static — no
 *  count-up tween, no update pulse. */
function ValueBlock({
  label,
  theme,
  children,
}: {
  label?: string
  theme: KioskColorTheme
  children: React.ReactNode
}) {
  return (
    <span className="inline-flex flex-col items-center">
      <BigValue theme={theme}>{children}</BigValue>
      {label && <span className="text-pulse-lg font-display font-regular leading-6 tracking-tight text-foreground">{label}</span>}
    </span>
  )
}

/** A currency figure with the "AED" unit set small, stacked above the
 *  top-left corner of the value. */
function CurrencyValue({ value, theme }: { value: number; theme: KioskColorTheme }) {
  return (
    <ValueBlock label="AED" theme={theme}>
      {formatAED(value)}
    </ValueBlock>
  )
}

/** A plain count figure — same block structure as `CurrencyValue` but with
 *  a freeform (or absent) label instead of a fixed "AED" unit. */
function CountValue({
  value,
  label,
  theme,
}: {
  value: number
  label?: string
  theme: KioskColorTheme
}) {
  return (
    <ValueBlock label={label} theme={theme}>
      {formatCount(value)}
    </ValueBlock>
  )
}

/* ─── Card background mark ────────────────────────────────────────────────── */

function CardBackgroundMark() {
  return (
    <svg
      width="360.9"
      height="248.7"
      viewBox="0 0 550 379"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="text-foreground-strong"
    >
      <path d="M62.4688 300L5.96875 376H267.969L323.969 300" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M487.469 79L543.969 3H281.969L225.969 79" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
