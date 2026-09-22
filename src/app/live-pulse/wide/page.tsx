import type { Metadata } from "next"
import { LivePulseDisplayWide } from "./live-pulse-display-wide"

export const metadata: Metadata = {
  title: "Live Pulse — Wide (6048×840) — ADREC",
  description: "Abu Dhabi Real Estate Centre · live market transaction feed, single-row 6048×840 banner variant.",
}

/**
 * Wide banner variant of the Live Pulse kiosk board — fixed at 6048×840px for
 * an LED/video wall strip at the LIVEX stand. This is also the app's default
 * screen, served directly at `/` (see `../../page.tsx`); this route is kept
 * as an explicit alias for venue displays already pointed at `/live-pulse/wide`.
 * See `../page.tsx` for the standard 16:9 board.
 */
export default function LivePulseWidePage() {
  return <LivePulseDisplayWide />
}
