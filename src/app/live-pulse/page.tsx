import type { Metadata } from "next"
import { LivePulseDisplay } from "./live-pulse-display"

export const metadata: Metadata = {
  title: "Live Pulse — ADREC",
  description: "Abu Dhabi Real Estate Centre · live market transaction feed for on-site event displays.",
}

/**
 * Standalone kiosk screen for conference monitors — the standard 16:9 board.
 * `/` now serves the wide banner variant by default (see `../page.tsx`), so
 * this route is the explicit way to reach this board.
 */
export default function LivePulsePage() {
  return <LivePulseDisplay />
}
