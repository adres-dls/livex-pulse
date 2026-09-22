"use client"

import { Badge, Card, cn } from "@adres/design-system"
import {
  AedAmount,
  BADGE_VARIANT,
  FlipCounter,
  Sparkline,
  SettingsMenu,
  formatAED,
  kioskCardBgClass,
  kioskCardStyle,
  kioskThemeStyle,
  kioskTitleClass,
  useClock,
  useKioskTheme,
  useLiveMarket,
  usePulsingCountUp,
  type KioskColorTheme,
  type KioskThemeMode,
  type PanelTone,
} from "./shared"

const COUNTER_SM = {
  tileClassName: "h-9 w-7",
  textClassName: "text-xl font-semibold leading-7 tracking-tight text-foreground-strong",
}

/**
 * "Live Pulse" — a fixed, full-bleed kiosk board for the LIVEX exhibition
 * stand. English-only by design (a venue monitor, not a bilingual app
 * screen) and dark by default, with a settings popover to flip it to light
 * for the stand — independent of the signed-in app's own theme toggle.
 *
 * Two rows: a 4-up stat band, then a 3-up row of category panels. For the
 * single-row 6048×840 banner variant, see `wide/live-pulse-display-wide.tsx`.
 */
export function LivePulseDisplay() {
  const { mode, setMode, theme, setTheme } = useKioskTheme()
  const { time, sessionStart } = useClock()
  const market = useLiveMarket()
  const avgTransactionValue =
    market.transactionsToday > 0 ? Math.round(market.totalMarketValue / market.transactionsToday) : 0

  return (
    <div
      className="fixed inset-0 overflow-y-auto bg-background text-foreground"
      style={kioskThemeStyle(theme, mode)}
    >
      <div className="relative z-10 flex min-h-full flex-col px-2xl py-xl">
        <Header time={time} mode={mode} onModeChange={setMode} theme={theme} onThemeChange={setTheme} />
        <div className="mt-xl grid min-h-0 flex-1 grid-cols-4 gap-sm">
          <StatCard
            theme={theme}
            mode={mode}
            label="Total transactions · today"
            value={<CountValue value={market.transactionsToday} />}
            footer={<p className="text-xs font-normal leading-tight text-muted-foreground">Session started {sessionStart}</p>}
          />

          <StatCard
            theme={theme}
            mode={mode}
            label="Total market value · today"
            value={<CurrencyValue value={market.totalMarketValue} />}
            footer={<Sparkline className={cn("h-9 w-full", kioskTitleClass(theme))} />}
          />

          <StatCard
            theme={theme}
            mode={mode}
            label="Avg. transaction value"
            value={<CurrencyValue value={avgTransactionValue} />}
            footer={<p className="text-xs font-normal leading-tight text-muted-foreground">across all live groups</p>}
          />

          <StatCard
            theme={theme}
            mode={mode}
            label="Top transaction · today"
            value={<CurrencyValue value={market.topTransactionValue} />}
            footer={<p className="text-xs font-normal leading-tight text-muted-foreground">Sell · Off-plan · Masdar City</p>}
          />
        </div>

        <div className="mt-sm grid min-h-0 flex-2 grid-cols-3 gap-sm">
          <Panel
            theme={theme}
            mode={mode}
            tone="primary"
            title="Sell Transactions"
            subtitle="Off-plan & ready unit sales"
            chipValue={market.sell.value}
            count={market.sell.count}
            countLabel="sales today"
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
            countLabel="contracts today"
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
    <header className="flex items-center justify-between gap-xl">
      <div className="flex items-center gap-md">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={
            mode === "dark" || theme === "theme1"
              ? "/images/logo/livex-white-logo.png"
              : "/images/logo/livex-logo.png"
          }
          alt="Abu Dhabi Real Estate Centre"
          className="h-12 w-auto"
        />
        <div className="border-s border-border ps-md">
          <h1 className="text-xl leading-7 tracking-tight font-semibold text-foreground-strong">
            Live <span className="text-primary">Pulse</span>
          </h1>
          <p className="text-xl leading-7 tracking-tight font-normal text-foreground">
            Market Transaction Feed
          </p>
        </div>
      </div>

      <div className="flex items-center gap-lg">
        {/* <span className="text-base font-medium leading-none text-muted-foreground">LIVEX 2026 — Abu Dhabi Exhibition</span> */}
        <Badge variant="success" size="sm">
          <span aria-hidden className="size-1.5 rounded-full bg-success-foreground" />
          <span className="text-[0.625rem] font-semibold leading-none tracking-widest uppercase">Live</span>
        </Badge>
        <span className="text-xl font-semibold leading-7 tracking-tight text-foreground-strong tabular-nums">{time}</span>
        <SettingsMenu mode={mode} onModeChange={onModeChange} theme={theme} onThemeChange={onThemeChange} />
      </div>
    </header>
  )
}

/* ─── Top stat band ───────────────────────────────────────────────────────── */

function StatCard({
  theme,
  mode,
  label,
  value,
  footer,
}: {
  theme: KioskColorTheme
  mode: KioskThemeMode
  label: string
  value: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <Card
      variant="default"
      padding="3xl"
      className={cn("flex flex-col gap-sm", kioskCardBgClass(theme))}
      style={kioskCardStyle(theme, mode)}
    >
      <span className={cn("text-[0.625rem] font-semibold leading-none tracking-widest uppercase", kioskTitleClass(theme))}>
        {label}
      </span>
      <div className="flex flex-1 flex-col justify-center">{value}</div>
      {/* Fixed height (matches the sparkline) so every card reserves the same
          footer space — otherwise a taller footer (the chart) shrinks its
          card's centering area and throws the main values out of alignment
          with their neighbours. */}
      <div className="flex h-9 items-end">{footer}</div>
    </Card>
  )
}

/** A currency figure with the "AED" unit set small, top-aligned to the right of
 *  the value. Counts up to `value` whenever it changes and briefly flashes
 *  primary-coloured to call out the update, like a live trading ticker. */
function CurrencyValue({ value }: { value: number }) {
  const { display, pulsing } = usePulsingCountUp(value)

  return (
    <span className="inline-flex items-start gap-2xs">
      <span
        className={cn(
          "font-display text-[4rem] font-semibold leading-16 tracking-tighter text-foreground-strong tabular-nums transition-colors duration-500",
          pulsing && "text-primary"
        )}
      >
        {formatAED(display)}
      </span>
      <span className="text-xs font-normal leading-tight text-muted-foreground pt-2xs pl-2xs">AED</span>
    </span>
  )
}

/** A plain count figure — same live-ticker treatment as `CurrencyValue` (counts
 *  up, pulses primary on change) but without the AED unit, for cards whose
 *  main value is a raw count rather than a currency amount. */
function CountValue({ value }: { value: number }) {
  const { display, pulsing } = usePulsingCountUp(value)

  return (
    <span
      className={cn(
        "font-display text-[4rem] font-semibold leading-16 tracking-tighter text-foreground-strong tabular-nums transition-colors duration-500",
        pulsing && "text-primary"
      )}
    >
      {display}
    </span>
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

function Panel({ theme, mode, tone, title, subtitle, chipValue, count, countLabel, subMetrics, totalLabel, totalValue }: PanelProps) {
  return (
    <Card
      variant="default"
      padding="3xl"
      className={cn("flex flex-col gap-lg", kioskCardBgClass(theme))}
      style={kioskCardStyle(theme, mode)}
    >
      <div className="flex items-start justify-between gap-md">
        <div>
          <h3 className={cn("text-lg font-semibold leading-6 tracking-tight", kioskTitleClass(theme))}>{title}</h3>
          <p className="mt-2xs text-xs font-normal leading-tight text-muted-foreground">{subtitle}</p>
        </div>
        {chipValue !== undefined && (
          <Badge
            variant={BADGE_VARIANT[tone]}
            className="bg-primary text-primary-muted dark:bg-primary dark:text-primary-muted"
          >
            AED <AedAmount value={chipValue} />
          </Badge>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-center gap-lg">
        <div className="flex items-baseline gap-sm">
          <CountValue value={count} />
          <span className="text-xs font-normal leading-tight text-muted-foreground">{countLabel}</span>
        </div>

        <div className={cn("grid gap-sm", subMetrics.length > 1 ? "grid-cols-2" : "grid-cols-1")}>
          {subMetrics.map((m) => (
            <div key={m.label} className="rounded-sm bg-muted/25 p-sm">
              <p className="text-xs font-normal leading-tight text-muted-foreground">{m.label}</p>
              <div className="mt-xs">
                <FlipCounter value={m.value} digits={3} {...COUNTER_SM} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-dashed border-border pt-md">
        <span className="text-xs font-normal leading-tight text-muted-foreground">{totalLabel}</span>
        <span className="text-xl font-semibold leading-7 tracking-tight text-foreground-strong tabular-nums">
          <span className="text-muted-foreground/50">AED</span> <AedAmount value={totalValue} />
        </span>
      </div>
    </Card>
  )
}
