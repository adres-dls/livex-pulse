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
  kioskCardTextClass,
  kioskThemeStyle,
  kioskTitleClass,
  useClock,
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
 * 6048×840px for an LED/video wall strip. All seven cards sit in a single
 * row, sized and spaced to use that width and height rather than floating in
 * extra whitespace. Shares its clock and theme logic (see `./shared`).
 */
export function LivePulseDisplayWide() {
  const { mode, setMode, theme, setTheme, largeCardText, setLargeCardText } = useKioskTheme()
  const { time, sessionStart } = useClock()
  const market = MARKET
  const avgTransactionValue =
    market.transactionsToday > 0 ? Math.round(market.totalMarketValue / market.transactionsToday) : 0

  return (
    // Escapes the root layout's centered `max-w-395` column the same way the
    // standard board does (see `../live-pulse-display.tsx`) — but here the
    // canvas itself stays a literal 6048×840px block in normal flow, so this
    // wrapper's `overflow-auto` can scroll to it instead of clipping it. On
    // an actual 6048×840 kiosk window there's nothing to scroll; anywhere
    // smaller, the whole board is still reachable by scrolling.
    //
    // `style` carries `theme`'s CSS-variable overrides (see `kioskThemeStyle`)
    // — set here, on the common ancestor of the header and the canvas below,
    // so both pick it up through inheritance with no per-element changes.
    <div className="fixed inset-0 overflow-auto bg-background" style={kioskThemeStyle(theme, mode)}>
      {/* `fixed` to the real viewport, not the canvas — a `sticky` header
          re-anchors to whatever edge of the scroll container it's stuck
          against, which visibly snaps its own padding away the moment it
          starts sticking. `fixed` just never moves, full stop. Its height
          (`h-28`) matches the `pt-28` reserved below so the card row still
          lands exactly where it would if the header were still in flow. */}
      <Header
        time={time}
        mode={mode}
        onModeChange={setMode}
        theme={theme}
        onThemeChange={setTheme}
        largeCardText={largeCardText}
        onLargeCardTextChange={setLargeCardText}
      />

      <div className="relative h-210 w-1512 text-foreground">
        <div className="relative z-10 flex h-full flex-col px-2xl pb-xl pt-28">
          <div className="grid min-h-0 flex-1 grid-cols-7 gap-sm">
            <StatCard
              theme={theme}
              mode={mode}
              largeCardText={largeCardText}
              label="Total transactions · today"
              value={<CountValue value={market.transactionsToday} largeCardText={largeCardText} />}
              footer={
                <p className={cn("font-semibold leading-7 tracking-tight text-muted-foreground", kioskCardTextClass("2xl", largeCardText))}>
                  Session started {sessionStart}
                </p>
              }
            />

            <StatCard
              theme={theme}
              mode={mode}
              largeCardText={largeCardText}
              label="Total market value · today"
              value={<CurrencyValue value={market.totalMarketValue} largeCardText={largeCardText} />}
              footer={<Sparkline className={cn("h-16 w-full", kioskTitleClass(theme))} />}
            />

            <StatCard
              theme={theme}
              mode={mode}
              largeCardText={largeCardText}
              label="Avg. transaction value"
              value={<CurrencyValue value={avgTransactionValue} largeCardText={largeCardText} />}
              footer={
                <p className={cn("font-semibold leading-7 tracking-tight text-muted-foreground", kioskCardTextClass("2xl", largeCardText))}>
                  Across all live groups
                </p>
              }
            />

            <StatCard
              theme={theme}
              mode={mode}
              largeCardText={largeCardText}
              label="Top transaction · today"
              value={<CurrencyValue value={market.topTransactionValue} largeCardText={largeCardText} />}
              footer={
                <p className={cn("font-semibold leading-7 tracking-tight text-muted-foreground", kioskCardTextClass("2xl", largeCardText))}>
                  Sell · Off-plan · Masdar City
                </p>
              }
            />

            <Panel
              theme={theme}
              mode={mode}
              largeCardText={largeCardText}
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
              largeCardText={largeCardText}
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
              largeCardText={largeCardText}
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
  )
}

/* ─── Header ──────────────────────────────────────────────────────────────── */

function Header({
  time,
  mode,
  onModeChange,
  theme,
  onThemeChange,
  largeCardText,
  onLargeCardTextChange,
}: {
  time: string
  mode: KioskThemeMode
  onModeChange: (mode: KioskThemeMode) => void
  theme: KioskColorTheme
  onThemeChange: (theme: KioskColorTheme) => void
  largeCardText: boolean
  onLargeCardTextChange: (largeCardText: boolean) => void
}) {
  return (
    // Fixed to the real viewport — this board is previewed at widths far
    // narrower than its native 6048px, and a `fixed` bar (unlike `sticky`,
    // which re-anchors to the scroll container's edge) never moves and never
    // loses the padding it started with.
    <header className="fixed inset-x-0 top-0 z-30 flex h-28 items-center justify-between gap-2xl px-2xl">
      <div className="flex items-center gap-lg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={
            mode === "dark" || theme === "theme1"
              ? "/images/logo/livex-white-logo.png"
              : "/images/logo/livex-logo.png"
          }
          alt="Abu Dhabi Real Estate Centre"
          className="h-16 w-auto"
        />
        <div className="flex flex-col gap-xs border-s border-border ps-xl">
          <div className="flex items-baseline gap-md">
            <h1 className="text-2xl font-semibold leading-7 tracking-tight uppercase text-foreground-strong">
              Live <span className="text-primary">Pulse</span>.
            </h1>
            <span className="text-2xl leading-7 tracking-tight font-normal uppercase text-foreground">Market Transaction Feed</span>
          </div>
          <div className="flex items-center gap-md">
            <span className="text-2xl font-semibold leading-7 tracking-tight tabular-nums text-foreground">{time}</span>
            <Badge variant="success" size="sm">
              <span aria-hidden className="size-1.5 rounded-full bg-success-foreground" />
              <span className="text-sm font-medium leading-none uppercase tracking-widest">Live</span>
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex items-center bg-background/70 rounded-full backdrop-blur-xl">
        <SettingsMenu
          mode={mode}
          onModeChange={onModeChange}
          theme={theme}
          onThemeChange={onThemeChange}
          largeCardText={largeCardText}
          onLargeCardTextChange={onLargeCardTextChange}
        />
      </div>
    </header>
  )
}

/* ─── Top stat band ───────────────────────────────────────────────────────── */

function StatCard({
  theme,
  mode,
  largeCardText,
  label,
  value,
  footer,
}: {
  theme: KioskColorTheme
  mode: KioskThemeMode
  largeCardText: boolean
  label: string
  value: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <Card
      variant="default"
      padding="4xl"
      className={cn("flex flex-col justify-between", kioskCardBgClass(theme))}
      style={kioskCardStyle(theme, mode)}
    >
      {/* Fixed height, sized to fit `Panel`'s two-line title + subtitle —
          even though this header is a single line, reserving the same
          space keeps the value below starting at the same height on
          every card in the row. */}
      <div className="flex h-40 items-start">
        <span
          className={cn(
            "font-display font-semibold leading-12 tracking-tight",
            kioskCardTextClass("4xl", largeCardText),
            kioskTitleClass(theme)
          )}
        >
          {label}
        </span>
      </div>
      {/* Value and footer sit together at the card's bottom edge — `justify-between`
          on the card pushes this group away from the title above, so it lands at
          the same height on every card regardless of that card's own footer. */}
      <div className="flex flex-col gap-md">
        {/* Fixed height, bottom-anchored — a labeled value (e.g. "AED" above
            the figure) overflows above this box rather than pushing the
            figure itself down, so the figure's own baseline lands at the
            same height whether or not it has a label above it. */}
        <div className="flex h-64 items-end">{value}</div>
        <div className="flex h-16 items-end">{footer}</div>
      </div>
    </Card>
  )
}

/** Big tabular-nums figure shared by every main value block on this board —
 *  one typography treatment regardless of what (if anything) labels it. */
function BigValue({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-display font-semibold text-foreground-strong text-[14rem] leading-56 tracking-[0.01em] tabular-nums">
      {children}
    </span>
  )
}

/** The label-above-value structure shared by every main value block — "AED"
 *  over a currency amount, "sales today" over a count, or no label at all
 *  (the transactions count), all through the same markup. Static — no
 *  count-up tween, no update pulse. `largeCardText` only reaches the label —
 *  `BigValue` below it stays fixed at `text-[14rem]` regardless. */
function ValueBlock({
  label,
  largeCardText,
  children,
}: {
  label?: string
  largeCardText: boolean
  children: React.ReactNode
}) {
  return (
    <span className="inline-flex flex-col items-start">
      {label && (
        <span className={cn("font-display font-semibold leading-12 tracking-tight text-foreground", kioskCardTextClass("4xl", largeCardText))}>
          {label}
        </span>
      )}
      <BigValue>{children}</BigValue>
    </span>
  )
}

/** A currency figure with the "AED" unit set small, stacked above the
 *  top-left corner of the value. */
function CurrencyValue({ value, largeCardText }: { value: number; largeCardText: boolean }) {
  return (
    <ValueBlock label="AED" largeCardText={largeCardText}>
      {formatAED(value)}
    </ValueBlock>
  )
}

/** A plain count figure — same block structure as `CurrencyValue` but with
 *  a freeform (or absent) label instead of a fixed "AED" unit. */
function CountValue({ value, label, largeCardText }: { value: number; label?: string; largeCardText: boolean }) {
  return (
    <ValueBlock label={label} largeCardText={largeCardText}>
      {value}
    </ValueBlock>
  )
}

/* ─── Category panels ─────────────────────────────────────────────────────── */

interface SubMetric {
  label: string
  value: number
}

interface PanelProps {
  theme: KioskColorTheme
  mode: KioskThemeMode
  largeCardText: boolean
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
  largeCardText,
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
      padding="4xl"
      className={cn("flex flex-col justify-between", kioskCardBgClass(theme))}
      style={kioskCardStyle(theme, mode)}
    >
      {/* Fixed height matching `StatCard`'s header — guards against a long
          subtitle wrapping to a second line and pushing the value below
          further down than the single-line stat cards' values. */}
      <div className="flex h-40 items-start justify-between gap-md">
        <div>
          <h3
            className={cn(
              "font-display font-semibold leading-12 tracking-tight",
              kioskCardTextClass("4xl", largeCardText),
              kioskTitleClass(theme)
            )}
          >
            {title}
          </h3>
          <p className={cn("mt-2xs leading-7 text-muted-foreground", kioskCardTextClass("2xl", largeCardText))}>{subtitle}</p>
        </div>
        {chipValue !== undefined && (
          <Badge
            variant={BADGE_VARIANT[tone]}
            size="lg"
            className="hidden bg-primary text-primary-muted! dark:bg-primary dark:text-primary-muted text-4xl! font-semibold! leading-12! tracking-tight!"
          >
            AED <AedAmount value={chipValue} />
          </Badge>
        )}
      </div>

      {/* Value/submetrics row and total-value footer sit together at the
          card's bottom edge — `justify-between` on the card pushes this
          group away from the title above, mirroring `StatCard`. */}
      <div className="flex flex-col gap-lg">
        <div className="flex items-end justify-between gap-lg">
          {/* Same fixed-height, bottom-anchored treatment as `StatCard` —
              keeps the count's own baseline aligned with the stat cards'
              values regardless of the "sales today"-style label above it. */}
          <div className="flex h-64 items-end">
            <CountValue value={count} label={countLabel} largeCardText={largeCardText} />
          </div>

          <div className="grid grid-cols-1 gap-md">
            {subMetrics.map((m) => (
              <div key={m.label} className="pb-xl flex items-baseline gap-md justify-end">
                <p className={cn("font-semibold leading-7 tracking-tight text-muted-foreground", kioskCardTextClass("2xl", largeCardText))}>
                  {m.label}
                </p>
                <span
                  className={cn(
                    "font-display font-semibold leading-12 tracking-tight text-foreground tabular-nums",
                    kioskCardTextClass("4xl", largeCardText)
                  )}
                >
                  {m.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-baseline justify-between">
          <span className={cn("font-semibold leading-7 tracking-tight text-muted-foreground", kioskCardTextClass("2xl", largeCardText))}>
            {totalLabel}
          </span>
          <span
            className={cn(
              "font-display font-semibold leading-12 tracking-tight text-foreground-strong tabular-nums",
              kioskCardTextClass("4xl", largeCardText)
            )}
          >
            <span className="text-muted-foreground/50">AED</span> <AedAmount value={totalValue} />
          </span>
        </div>
      </div>
    </Card>
  )
}
