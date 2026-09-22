"use client"

import { Badge, Card } from "@adres/design-system"
import {
  AedAmount,
  BADGE_VARIANT,
  Sparkline,
  SettingsMenu,
  formatAED,
  useClock,
  useKioskTheme,
  type KioskThemeMode,
  type MarketState,
  type PanelTone,
} from "../shared"

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
 * "Live Pulse" — wide banner variant, fixed at 6048×840px for an LED/video
 * wall strip. All seven cards (the standard board's two rows) sit in a single
 * row here, so every card gets far more width and height than on the
 * standard 16:9 board — type, tiles and spacing are all scaled up to use it
 * rather than floating in extra whitespace. Shares its live data, animation
 * and theme logic with the standard board (see `../shared`).
 */
export function LivePulseDisplayWide() {
  const { mode, setMode } = useKioskTheme()
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
    <div className="fixed inset-0 overflow-auto bg-background">
      {/* `fixed` to the real viewport, not the canvas — a `sticky` header
          re-anchors to whatever edge of the scroll container it's stuck
          against, which visibly snaps its own padding away the moment it
          starts sticking. `fixed` just never moves, full stop. Its height
          (`h-28`) matches the `pt-28` reserved below so the card row still
          lands exactly where it would if the header were still in flow. */}
      <Header time={time} mode={mode} onModeChange={setMode} />

      <div className="relative h-210 w-1512 text-foreground">
        <div className="relative z-10 flex h-full flex-col px-2xl pb-xl pt-28">
          <div className="grid min-h-0 flex-1 grid-cols-7 gap-sm">
            <StatCard
              label="Total transactions · today"
              value={<CountValue value={market.transactionsToday} />}
              footer={<p className="t-h1 text-muted-foreground">Session started {sessionStart}</p>}
            />

            <StatCard
              label="Total market value · today"
              value={<CurrencyValue value={market.totalMarketValue} />}
              footer={<Sparkline className="h-16 w-full text-primary" />}
            />

            <StatCard
              label="Avg. transaction value"
              value={<CurrencyValue value={avgTransactionValue} />}
              footer={<p className="t-h1 text-muted-foreground">Across all live groups</p>}
            />

            <StatCard
              label="Top transaction · today"
              value={<CurrencyValue value={market.topTransactionValue} />}
              footer={<p className="t-h1 text-muted-foreground">Sell · Off-plan · Masdar City</p>}
            />

            <Panel
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
}: {
  time: string
  mode: KioskThemeMode
  onModeChange: (mode: KioskThemeMode) => void
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
          src={mode === "dark" ? "/images/logo/livex-white-logo.png" : "/images/logo/livex-logo.png"}
          alt="Abu Dhabi Real Estate Centre"
          className="h-16 w-auto"
        />
        <div className="flex flex-col gap-xs border-s border-border ps-xl">
          <div className="flex items-baseline gap-md">
            <h1 className="t-h1">
              Live <span className="text-primary">Pulse</span>.
            </h1>
            <span className="t-h1 font-normal text-foreground">Market Transaction Feed</span>
          </div>
          <div className="flex items-center gap-md">
            <span className="t-h1 tabular-nums text-foreground">{time}</span>
            <Badge variant="success" size="sm">
              <span aria-hidden className="size-1.5 rounded-full bg-success-foreground" />
              <span className="t-label-sm uppercase tracking-widest">Live</span>
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex items-center bg-background/70 rounded-full backdrop-blur-xl">
        <SettingsMenu mode={mode} onModeChange={onModeChange} />
      </div>
    </header>
  )
}

/* ─── Top stat band ───────────────────────────────────────────────────────── */

function StatCard({
  label,
  value,
  footer,
}: {
  label: string
  value: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <Card variant="default" padding="4xl" className="flex flex-col gap-md bg-card/60 backdrop-blur-xl">
      <div className="flex flex-col gap-xl">
        {/* Fixed height, sized to fit `Panel`'s two-line title + subtitle —
            even though this header is a single line, reserving the same
            space keeps the value below starting at the same height on
            every card in the row. */}
        <div className="flex h-40 items-start">
          <span className="t-display-md text-primary">{label}</span>
        </div>
        {/* Fixed height, bottom-anchored — a labeled value (e.g. "AED" above
            the figure) overflows above this box rather than pushing the
            figure itself down, so the figure's own baseline lands at the
            same height whether or not it has a label above it. */}
        <div className="flex h-64 items-end">{value}</div>
      </div>
      {/* `mt-auto` pins the footer to the card's bottom edge regardless of
          content above — the value sits a fixed gap below the label instead
          of centering in the leftover space, so it lands at the same height
          on every card no matter how tall that card's own footer is. */}
      <div className="mt-auto flex h-16 items-end">{footer}</div>
    </Card>
  )
}

/** Big tabular-nums figure shared by every main value block on this board —
 *  one typography treatment regardless of what (if anything) labels it. */
function BigValue({ children }: { children: React.ReactNode }) {
  return (
    <span className="t-display-2xl text-[14rem]! leading-56! tracking-[0.01em]! tabular-nums">
      {children}
    </span>
  )
}

/** The label-above-value structure shared by every main value block — "AED"
 *  over a currency amount, "sales today" over a count, or no label at all
 *  (the transactions count), all through the same markup. Static — no
 *  count-up tween, no update pulse. */
function ValueBlock({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <span className="inline-flex flex-col items-start">
      {label && <span className="t-display-md text-foreground">{label}</span>}
      <BigValue>{children}</BigValue>
    </span>
  )
}

/** A currency figure with the "AED" unit set small, stacked above the
 *  top-left corner of the value. */
function CurrencyValue({ value }: { value: number }) {
  return <ValueBlock label="AED">{formatAED(value)}</ValueBlock>
}

/** A plain count figure — same block structure as `CurrencyValue` but with
 *  a freeform (or absent) label instead of a fixed "AED" unit. */
function CountValue({ value, label }: { value: number; label?: string }) {
  return <ValueBlock label={label}>{value}</ValueBlock>
}

/* ─── Category panels ─────────────────────────────────────────────────────── */

interface SubMetric {
  label: string
  value: number
}

interface PanelProps {
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

function Panel({ tone, title, subtitle, chipValue, count, countLabel, subMetrics, totalLabel, totalValue }: PanelProps) {
  return (
    <Card variant="default" padding="4xl" className="flex flex-col gap-lg bg-card/60 backdrop-blur-xl">
      <div className="flex flex-col gap-xl">
        {/* Fixed height matching `StatCard`'s header — guards against a long
            subtitle wrapping to a second line and pushing the value below
            further down than the single-line stat cards' values. */}
        <div className="flex h-40 items-start justify-between gap-md">
          <div>
            <h3 className="t-display-md text-primary">{title}</h3>
            <p className="mt-2xs t-body-xl text-muted-foreground">{subtitle}</p>
          </div>
          {chipValue !== undefined && (
            <Badge
              variant={BADGE_VARIANT[tone]}
              size="lg"
              className="bg-primary text-primary-muted! dark:bg-primary dark:text-primary-muted t-h2!"
            >
              AED <AedAmount value={chipValue} />
            </Badge>
          )}
        </div>

        <div className="flex flex-col">
          <div className="flex items-end justify-between gap-lg">
            {/* Same fixed-height, bottom-anchored treatment as `StatCard` —
                keeps the count's own baseline aligned with the stat cards'
                values regardless of the "sales today"-style label above it. */}
            <div className="flex h-64 items-end">
              <CountValue value={count} label={countLabel} />
            </div>

            <div className="grid grid-cols-1 gap-md">
              {subMetrics.map((m) => (
                <div key={m.label} className="pb-xl flex items-baseline gap-md justify-end">
                  <p className="t-h1 text-muted-foreground">{m.label}</p>
                  <span className="t-display-md text-foreground tabular-nums">{m.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* `mt-auto` pins the total-value footer to the card's bottom edge —
          mirrors `StatCard`, so the value above sits at a fixed gap below the
          header instead of centering in whatever space is left. */}
      <div className="mt-auto flex items-baseline justify-between border-t border-dashed border-border-strong pt-md">
        <span className="t-h1 text-muted-foreground">{totalLabel}</span>
        <span className="t-display-md tabular-nums">
          <span className="text-muted-foreground/50">AED</span> <AedAmount value={totalValue} />
        </span>
      </div>
    </Card>
  )
}
