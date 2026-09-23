"use client"

import { Badge, Card, cn } from "@adres/design-system"
import {
  AedAmount,
  BADGE_VARIANT,
  Sparkline,
  SettingsMenu,
  formatAED,
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
  type PanelTone,
} from "./shared"

// Static snapshot standing in for a day's activity — no live simulation feed
// on this board, just representative figures for the booth display.
const MARKET: MarketState = {
  transactionsToday: 47,
  totalMarketValue: 66_000_000,
  topTransactionValue: 4_800_000,
  sell: { count: 28, offPlan: 17, ready: 11, value: 52_400_000 },
  development: { count: 15, registeredProjects: 9 },
  lease: { count: 19, newCount: 11, renewCount: 8, value: 13_600_000 },
}

/**
 * "Live Pulse" — the kiosk board for the LIVEX exhibition stand, fixed at
 * 3840×534px for an LED/video wall strip. All seven cards sit in a single
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
            <div className="grid min-h-0 flex-1 grid-cols-7 gap-2">
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
                footer={<Sparkline className={cn("h-6.25 w-full", theme === "theme1" ? "text-foreground-strong" : "text-primary")} />}
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

              <Panel
                theme={theme}
                mode={mode}
                tone="primary"
                title="Sell Transactions"
                subtitle="Off-plan & ready unit sales"
                chipValue={market.sell.value}
                count={market.sell.count}
                countLabel="Sales today"
                subMetrics={[
                  { label: "Off-plan", value: market.sell.offPlan },
                  { label: "Ready", value: market.sell.ready },
                ]}
                totalLabel="Total Sales Value"
                totalValue={market.sell.value}
              />
              <Panel
                theme={theme}
                mode={mode}
                tone="secondary"
                title="Development Interest"
                subtitle="Expression of Interest (EOI) service"
                count={market.development.count}
                countLabel="EOIs today"
                subMetrics={[{ label: "Registered projects", value: market.development.registeredProjects }]}
                totalLabel="Total Interest Value"
                totalValue={0}
              />
              <Panel
                theme={theme}
                mode={mode}
                tone="primary"
                title="Lease Transactions"
                subtitle="New contracts & renewals"
                count={market.lease.count}
                countLabel="Contracts today"
                subMetrics={[
                  { label: "New", value: market.lease.newCount },
                  { label: "Renew", value: market.lease.renewCount },
                ]}
                totalLabel="Total Lease Value"
                totalValue={market.lease.value}
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
      {value}
    </ValueBlock>
  )
}

/* ─── Category panels ─────────────────────────────────────────────────────── */

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

interface SubMetric {
  label: string
  value: number
}

interface PanelProps {
  theme: KioskColorTheme
  mode: KioskThemeMode
  tone: PanelTone
  title: string
  subtitle: string
  chipValue?: number
  count: number
  countLabel: string
  subMetrics: SubMetric[]
  totalLabel: string
  totalValue: number
}

function Panel({
  theme,
  mode,
  tone,
  title,
  subtitle,
  chipValue,
  count,
  countLabel,
  subMetrics,
  totalLabel,
  totalValue,
}: PanelProps) {
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
          count value below. */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <CardBackgroundMark />
      </div>

      {/* Fixed height matching `StatCard`'s header — guards against a long
          subtitle wrapping to a second line and pushing the value below
          further down than the single-line stat cards' values. */}
      <div className="flex h-25.5 items-start justify-center gap-2.5">
        <div className="text-center">
          {/* Plain string concatenation, not `cn()` — see the note on
              `StatCard`'s title span. */}
          <h3 className={`text-pulse-md font-display font-semibold leading-8.75 tracking-tight ${kioskTitleClass(theme)}`}>
            {title}
          </h3>
          <p className="text-pulse-sm mt-1.5 leading-5 text-muted-foreground">{subtitle}</p>
        </div>
        {chipValue !== undefined && (
          <Badge
            variant={BADGE_VARIANT[tone]}
            size="lg"
            className="hidden bg-primary text-primary-muted! dark:bg-primary dark:text-primary-muted text-4xl! font-semibold! leading-8.75! tracking-tight!"
          >
            AED <AedAmount value={chipValue} />
          </Badge>
        )}
      </div>

      {/* Centered on the card as a whole (not the space between title and
          footer) — `absolute inset-0` positions it against the `Card`'s own
          padding box, independent of the title/submetrics/footer's own flow.
          The inner `h-44` box is the fixed-size "slot" for the value (fits
          `BigValue` + its label with a little slack); content top-aligns
          within it, so the figure's own top edge stays put regardless of
          label length — only the (centered) slot itself moves as a whole. */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex h-44 items-start justify-center">
          <CountValue value={count} label={countLabel} theme={theme} />
        </div>
      </div>

      <div className={cn("flex items-end justify-center gap-3.75 pt-3.25", theme === "theme1" ? "" : "")}>
        {/* Sub-metrics on the left, each label stacked over its value. */}
        <div className="flex gap-3.75">
          {subMetrics.map((m) => (
            <div key={m.label} className="flex flex-col items-center gap-1.5">
              <p className="text-pulse-sm font-regular leading-5 tracking-tight text-muted-foreground">{m.label}</p>
              {/* Plain string concatenation, not `cn()` — see the note on
                  `StatCard`'s title span. */}
              <span
                className={`text-pulse-md font-display font-semibold leading-8.75 tracking-tight tabular-nums ${
                  theme === "theme1" ? "text-foreground" : "text-primary"
                }`}
              >
                {m.value}
              </span>
            </div>
          ))}
        </div>

        {/* Total on the right, label stacked over its value. */}
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-pulse-sm font-regular leading-5 tracking-tight text-muted-foreground">{totalLabel}</span>
          {/* Plain string concatenation, not `cn()` — see the note on
              `StatCard`'s title span. */}
          <span
            className={`text-pulse-md font-display font-semibold leading-8.75 tracking-tight tabular-nums ${
              theme === "theme1" ? "text-foreground-strong" : "text-primary"
            }`}
          >
            <span className="text-pulse-sm font-semibold leading-5 tracking-tight text-muted-foreground">AED</span> <AedAmount value={totalValue} />
          </span>
        </div>
      </div>
    </Card>
  )
}
