"use client"

import { Badge, Card, cn } from "@adres/design-system"
import {
  SettingsMenu,
  formatAED,
  formatCount,
  kioskCardBgClass,
  kioskCardStyle,
  kioskThemeStyle,
  kioskTitleClass,
  useClock,
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
  transactionsToday: 238,
  totalMarketValue: 66_000_000,
  topTransactionValue: 4_800_000,
  // `value` is a placeholder — no real EOI valuation source exists yet.
  development: { count: 15, value: 4_200_000 },
  yearToDate: {
    transactionsCount: 41_230,
  },
}

// Column widths for a Volume/Value pair (the "Total transactions" and "Total
// R.E. Activities" cards) — shared between the value columns and their
// background marks (see `markColumnWidths` on `StatCard`) so the two rows'
// columns line up instead of drifting apart. Equal and sized close to the
// mark's own ~361px width (narrower than the default `w-95`, to fit two side
// by side on a 2fr card column) rather than fit to each value's own (very
// different) text width — otherwise the narrower Volume column would force
// its mark to overflow past its column and overlap the value's own digits.
const TWO_VALUE_COLUMN_WIDTHS = ["w-88", "w-88"]

/**
 * "Live Pulse" — the kiosk board for the LIVEX exhibition stand, fixed at
 * 3840×534px for an LED/video wall strip. Four or five cards (the
 * Expression of Interests card only shows once its count reaches 5) sit in a
 * single row, sized and spaced to use that width and height rather than
 * floating in extra whitespace. Shares its clock and theme logic (see
 * `./shared`).
 */
export function LivePulseDisplayWide() {
  const { mode, setMode, theme, setTheme } = useKioskTheme()
  const { time, sessionStart } = useClock()
  const market = MARKET
  // The Expression of Interests card only earns its place once there's
  // enough interest to show — stays hidden below that count, and the row
  // falls back to 4 even columns instead of leaving its slot blank.
  const developmentVisible = market.development.count >= 5

  return (
    // Escapes the root layout's centered `max-w-395` column — the canvas
    // itself stays a literal 3840×534px block in normal flow, so this
    // wrapper's `overflow-auto` can scroll to it instead of clipping it. On
    // an actual 3840×534 kiosk window there's nothing to scroll; anywhere
    // smaller, the whole board is still reachable by scrolling.
    //
    // `style` carries `theme`'s CSS-variable overrides (see `kioskThemeStyle`)
    // — set here, on the common ancestor of the settings button and the
    // canvas below, so both pick it up through inheritance with no
    // per-element changes.
    <div className="fixed inset-0 overflow-auto bg-background" style={kioskThemeStyle(theme, mode)}>
      <div className="w-960">
        {/* Debug aid — a red bottom border marking where the fixed 534px
            canvas ends. Remove once the layout's been checked against it. */}
        <div className="relative h-133.5 text-foreground border-b border-black">
          {/* A single settings control, floated over the last card's corner —
              unlike the logo/time/Live badge (see `CardBrand`), it's an
              operator control rather than branding, so it doesn't need to
              repeat on every card. */}
          <div className="absolute right-8.75 top-3.75 z-20 flex items-center bg-background/70 rounded-full backdrop-blur-xl">
            <SettingsMenu
              mode={mode}
              onModeChange={setMode}
              theme={theme}
              onThemeChange={setTheme}
            />
          </div>

          <div className="relative z-10 flex h-full flex-col px-5 pb-3.75">
            <div
              className={cn(
                "grid min-h-0 flex-1 gap-2",
                developmentVisible ? "grid-cols-[2fr_2fr_1fr_1fr_2fr_1fr]" : "grid-cols-[2fr_2fr_1fr_2fr_1fr]",
              )}
            >
              <StatCard
                theme={theme}
                mode={mode}
                time={time}
                backgroundMarks={2}
                markColumnWidths={TWO_VALUE_COLUMN_WIDTHS}
                label="Total transactions"
                caption="LiveX Week"
                value={
                  <div className="flex items-start">
                    <ValueColumn className={TWO_VALUE_COLUMN_WIDTHS[0]}>
                      <CountValue value={market.transactionsToday} label="Volume" theme={theme} />
                    </ValueColumn>
                    <ValueColumn className={TWO_VALUE_COLUMN_WIDTHS[1]}>
                      <CurrencyValue value={market.totalMarketValue} label="Value" theme={theme} />
                    </ValueColumn>
                  </div>
                }
                // footer={
                //   <p className="text-pulse-sm text-center font-regular leading-5 tracking-tight text-muted-foreground">
                //     Session started {sessionStart}
                //   </p>
                // }
              />

              <StatCard
                theme={theme}
                mode={mode}
                time={time}
                showBrand={false}
                backgroundMarks={2}
                markColumnWidths={TWO_VALUE_COLUMN_WIDTHS}
                label="Total R.E. Activities"
                caption="LiveX Week"
                value={
                  <div className="flex items-start">
                    <ValueColumn className={TWO_VALUE_COLUMN_WIDTHS[0]}>
                      <CountValue value={market.transactionsToday} label="Volume" theme={theme} />
                    </ValueColumn>
                    <ValueColumn className={TWO_VALUE_COLUMN_WIDTHS[1]}>
                      <CurrencyValue value={market.totalMarketValue} label="Value" theme={theme} />
                    </ValueColumn>
                  </div>
                }
              />

              <StatCard
                theme={theme}
                mode={mode}
                time={time}
                label="Top transaction"
                caption="LiveX Week"
                value={<CurrencyValue value={market.topTransactionValue} theme={theme} />}
                footer={
                  <p className="text-pulse-sm text-center font-regular leading-5 tracking-tight text-muted-foreground">
                    Sell · Off-plan
                  </p>
                }
              />

              {developmentVisible && (
                <StatCard
                  theme={theme}
                  mode={mode}
                  time={time}
                  showBrand={false}
                  label="Expression of Interests"
                  caption="LiveX Week"
                  value={<CurrencyValue value={market.development.value} label="Total Value" theme={theme} />}
                  footer={
                    <p className="text-pulse-sm text-center font-regular leading-5 tracking-tight text-muted-foreground">
                      {market.development.count} EOIs Volume
                    </p>
                  }
                />
              )}

              <StatCard
                theme={theme}
                mode={mode}
                time={time}
                backgroundMarks={2}
                markColumnWidths={TWO_VALUE_COLUMN_WIDTHS}
                label="Total transactions"
                caption="Year to date"
                value={
                  <div className="flex items-start gap-8">
                    <ValueColumn className={TWO_VALUE_COLUMN_WIDTHS[0]}>
                      <CountValue value={market.yearToDate.transactionsCount} label="Volume" theme={theme} />
                    </ValueColumn>
                    <ValueColumn className={TWO_VALUE_COLUMN_WIDTHS[1]}>
                      <CurrencyValue value={market.totalMarketValue} label="Value" theme={theme} />
                    </ValueColumn>
                  </div>
                }
              />

              <HighlightsCard
                theme={theme}
                mode={mode}
                time={time}
                showBrand={false}
                label=""
                items={[
                  <><span className="text-primary">1st</span> worldwide improver and fully transparent market</>,
                  <><span className="text-primary">1st</span> in Livability Index, MENA region</>,
                  <>
                    Residential YoY growth <span className="text-primary">+50%</span>
                  </>,
                  <>
                    Nationalities YoY growth <span className="text-primary">+60%</span>
                  </>,
                ]}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Card brand block ────────────────────────────────────────────────────── */

/** Logo + time + "Live" badge — repeated on every card (instead of once in a
 *  shared page header) so the branding is visible on whichever segment faces
 *  a viewer on the circular display, no matter how it's rotated. */
function CardBrand({
  time,
  mode,
  theme,
}: {
  time: string
  mode: KioskThemeMode
  theme: KioskColorTheme
}) {
  return (
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
          <span className="text-sm font-semibold leading-none uppercase tracking-widest">Live</span>
        </Badge>
      </div>
    </div>
  )
}

/* ─── Top stat band ───────────────────────────────────────────────────────── */

function StatCard({
  theme,
  mode,
  time,
  showBrand = true,
  backgroundMarks = 1,
  markColumnWidths,
  className,
  label,
  caption,
  value,
  footer,
}: {
  theme: KioskColorTheme
  mode: KioskThemeMode
  time: string
  /** Alternating cards skip the repeated logo/time block — the reserved
   *  `h-17.75` row stays empty rather than collapsing, so every card in the
   *  row still lines up at the same height. */
  showBrand?: boolean
  /** Number of marks to lay out side by side (each in a `w-95` column by
   *  default — see `ValueColumn`) in the card's shared centered slot. A
   *  multi-value card (e.g. Volume + Value) passes its value count here so
   *  each value gets its own mark, still centered using the exact same box
   *  as a single-value card's mark — centering it per value block instead
   *  would use a shorter box (just that value's own height) and end up
   *  vertically offset from every other card. */
  backgroundMarks?: number
  /** Per-mark column width class, overriding the `w-95` default — pass the
   *  same widths given to the matching `ValueColumn`s so each mark's column
   *  lines up with the value it sits behind instead of the two rows (marks
   *  vs. values) drifting apart when their content widths differ. */
  markColumnWidths?: string[]
  /** Extra classes on the grid cell itself — e.g. `col-span-2` for a wider card. */
  className?: string
  label: string
  caption?: string
  value: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    // The brand block sits outside (above) the card itself — on the page
    // background, not the card surface — repeating per column instead of
    // once in a shared page header (see `CardBrand`).
    <div className={cn("flex flex-col", className)}>
      <div className="flex h-17.75 items-center">
        {showBrand && <CardBrand time={time} mode={mode} theme={theme} />}
      </div>

      <Card
        variant="default"
        padding="none"
        elevation="none"
        borderless
        className={cn("relative flex h-112 flex-col justify-between rounded-none py-7.75 px-9.75", kioskCardBgClass(theme))}
        style={kioskCardStyle(theme, mode)}
      >
        {/* Decorative mark, centered on the same (nudged-down) space the
            value below is centered on and behind everything else — placed
            first so it paints under the (also absolutely-positioned) value. */}
        <div className="pointer-events-none absolute inset-x-0 top-8 bottom-0 flex items-center justify-center gap-8">
          {Array.from({ length: backgroundMarks }, (_, i) => (
            <div key={i} className={cn("flex items-center justify-center", markColumnWidths?.[i] ?? "w-95")}>
              <CardBackgroundMark />
            </div>
          ))}
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
            footer), but nudged down (`top-8` instead of `inset-0`) for a
            bigger gap under the title — positioned against the `Card`'s own
            padding box, independent of the title/footer's own flow. The inner
            `h-44` box is the fixed-size "slot" for the value (fits `BigValue`
            + its label with a little slack); content top-aligns within it, so
            the figure's own top edge stays put regardless of label length —
            only the (centered) slot itself moves as a whole. */}
        <div className="absolute inset-x-0 top-8 bottom-0 flex items-center justify-center">
          <div className="flex h-44 items-start justify-center">{value}</div>
        </div>
        <div className="flex items-end justify-center">{footer}</div>
      </Card>
    </div>
  )
}

/* ─── Highlights card ─────────────────────────────────────────────────────── */

/** A bulleted-fact card (market rankings, YoY growth) alongside the numeric
 *  `StatCard`s — same brand row + card shell, but no decorative background
 *  mark or centered value slot, since dense list text needs the flat reading
 *  space rather than a hero number. Kept at the board's own kiosk type scale
 *  (`text-pulse-*`, not the DS's much smaller `t-body-*`) so it reads at the
 *  same distance as every other card. */
function HighlightsCard({
  theme,
  mode,
  time,
  showBrand = true,
  label,
  items,
}: {
  theme: KioskColorTheme
  mode: KioskThemeMode
  time: string
  showBrand?: boolean
  label: string
  items: React.ReactNode[]
}) {
  return (
    <div className="flex flex-col">
      <div className="flex h-17.75 items-center">
        {showBrand && <CardBrand time={time} mode={mode} theme={theme} />}
      </div>

      <Card
        variant="default"
        padding="none"
        elevation="none"
        borderless
        className={cn("relative flex h-112 flex-col rounded-none py-7.75 px-9.75", kioskCardBgClass(theme))}
        style={kioskCardStyle(theme, mode)}
      >
        <div className="text-center">
          <span className={`text-pulse-md font-display font-semibold leading-8.75 tracking-tight ${kioskTitleClass(theme)}`}>
            {label}
          </span>
        </div>

        <ul className="mt-6 flex flex-1 flex-col justify-center gap-6">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-4">
              <span aria-hidden className="mt-2.5 size-2.5 shrink-0 rounded-full bg-foreground-strong" />
              <span className="text-pulse-md font-display font-regular leading-7.5 tracking-tight text-foreground-strong">
                {item}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
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

/** The UAE's official Dirham currency symbol (Unicode U+20C3, encoded in
 *  Unicode 18.0) — inlined from the Central Bank's public-domain reference
 *  SVG (see `public/images/currency/dirham.svg`) since system fonts don't
 *  reliably carry the glyph yet. `fill="currentColor"` so it always matches
 *  the value it prefixes. */
function DirhamSign({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 1000 870" fill="currentColor" aria-hidden="true" className={className}>
      <path d="m88.3 1c0.4 0.6 2.6 3.3 4.7 5.9 15.3 18.2 26.8 47.8 33 85.1 4.1 24.5 4.3 32.2 4.3 125.6v87h-41.8c-38.2 0-42.6-0.2-50.1-1.7-11.8-2.5-24-9.2-32.2-17.8-6.5-6.9-6.3-7.3-5.9 13.6 0.5 17.3 0.7 19.2 3.2 28.6 4 14.9 9.5 26 17.8 35.9 11.3 13.6 22.8 21.2 39.2 26.3 3.5 1 10.9 1.4 37.1 1.6l32.7 0.5v43.3 43.4l-46.1-0.3-46.3-0.3-8-3.2c-9.5-3.8-13.8-6.6-23.1-14.9l-6.8-6.1 0.4 19.1c0.5 17.7 0.6 19.7 3.1 28.7 8.7 31.8 29.7 54.5 57.4 61.9 6.9 1.9 9.6 2 38.5 2.4l30.9 0.4v89.6c0 54.1-0.3 94-0.8 100.8-0.5 6.2-2.1 17.8-3.5 25.9-6.5 37.3-18.2 65.4-35 83.6l-3.4 3.7h169.1c101.1 0 176.7-0.4 187.8-0.9 19.5-1 63-5.3 72.8-7.4 3.1-0.6 8.9-1.5 12.7-2.1 8.1-1.2 21.5-4 40.8-8.9 27.2-6.8 52-15.3 76.3-26.1 7.6-3.4 29.4-14.5 35.2-18 3.1-1.8 6.8-4 8.2-4.7 3.9-2.1 10.4-6.3 19.9-13.1 4.7-3.4 9.4-6.7 10.4-7.4 4.2-2.8 18.7-14.9 25.3-21 25.1-23.1 46.1-48.8 62.4-76.3 2.3-4 5.3-9 6.6-11.1 3.3-5.6 16.9-33.6 18.2-37.8 0.6-1.9 1.4-3.9 1.8-4.3 2.6-3.4 17.6-50.6 19.4-60.9 0.6-3.3 0.9-3.8 3.4-4.3 1.6-0.3 24.9-0.3 51.8-0.1 53.8 0.4 53.8 0.4 65.7 5.9 6.7 3.1 8.7 4.5 16.1 11.2 9.7 8.7 8.8 10.1 8.2-11.7-0.4-12.8-0.9-20.7-1.8-23.9-3.4-12.3-4.2-14.9-7.2-21.1-9.8-21.4-26.2-36.7-47.2-44l-8.2-3-33.4-0.4-33.3-0.5 0.4-11.7c0.4-15.4 0.4-45.9-0.1-61.6l-0.4-12.6 44.6-0.2c38.2-0.2 45.3 0 49.5 1.1 12.6 3.5 21.1 8.3 31.5 17.8l5.8 5.4v-14.8c0-17.6-0.9-25.4-4.5-37-7.1-23.5-21.1-41-41.1-51.8-13-7-13.8-7.2-58.5-7.5-26.2-0.2-39.9-0.6-40.6-1.2-0.6-0.6-1.1-1.6-1.1-2.4 0-0.8-1.5-7.1-3.5-13.9-23.4-82.7-67.1-148.4-131-197.1-8.7-6.7-30-20.8-38.6-25.6-3.3-1.9-6.9-3.9-7.8-4.5-4.2-2.3-28.3-14.1-34.3-16.6-3.6-1.6-8.3-3.6-10.4-4.4-35.3-15.3-94.5-29.8-139.7-34.3-7.4-0.7-17.2-1.8-21.7-2.2-20.4-2.3-48.7-2.6-209.4-2.6-135.8 0-169.9 0.3-169.4 1zm330.7 43.3c33.8 2 54.6 4.6 78.9 10.5 74.2 17.6 126.4 54.8 164.3 117 3.5 5.8 18.3 36 20.5 42.1 10.5 28.3 15.6 45.1 20.1 67.3 1.1 5.4 2.6 12.6 3.3 16 0.7 3.3 1 6.4 0.7 6.7-0.5 0.4-100.9 0.6-223.3 0.5l-222.5-0.2-0.3-128.5c-0.1-70.6 0-129.3 0.3-130.4l0.4-1.9h71.1c39 0 78 0.4 86.5 0.9zm297.5 350.3c0.7 4.3 0.7 77.3 0 80.9l-0.6 2.7-227.5-0.2-227.4-0.3-0.2-42.4c-0.2-23.3 0-42.7 0.2-43.1 0.3-0.5 97.2-0.8 227.7-0.8h227.2zm-10.2 171.7c0.5 1.5-1.9 13.8-6.8 33.8-5.6 22.5-13.2 45.2-20.9 62-3.8 8.6-13.3 27.2-15.6 30.7-1.1 1.6-4.3 6.7-7.1 11.2-18 28.2-43.7 53.9-73 72.9-10.7 6.8-32.7 18.4-38.6 20.2-1.2 0.3-2.5 0.9-3 1.3-0.7 0.6-9.8 4-20.4 7.8-19.5 6.9-56.6 14.4-86.4 17.5-19.3 1.9-22.4 2-96.7 2h-76.9v-129.7-129.8l220.9-0.4c121.5-0.2 221.6-0.5 222.4-0.7 0.9-0.1 1.8 0.5 2.1 1.2z" />
    </svg>
  )
}

/** A currency figure with the dirham symbol set before the value, both
 *  sharing the same accent colour as a single unit — optionally captioned
 *  below (e.g. "Value"), matching `ValueBlock`'s label styling so a currency
 *  and count figure can sit side by side and still read as the same family. */
function CurrencyValue({ value, theme, label }: { value: number; theme: KioskColorTheme; label?: string }) {
  return (
    <span className="inline-flex flex-col items-center">
      <span className={`inline-flex items-center gap-3 ${theme === "theme1" ? "text-foreground-strong" : "text-primary"}`}>
        <DirhamSign className="h-17 w-auto" />
        <BigValue theme={theme}>{formatAED(value)}</BigValue>
      </span>
      {label && <span className="text-pulse-lg font-display font-regular leading-6 tracking-tight text-foreground">{label}</span>}
    </span>
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

/** Wraps a single value block (e.g. "Volume" or "Value") with its own
 *  centered background mark — for a multi-value card where each figure needs
 *  its own graphic instead of sharing the one `StatCard` already renders
 *  behind the whole card (pass `hideBackgroundMark` there when using this). */
function ValueColumn({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("flex w-95 items-center justify-center", className)}>{children}</div>
}
