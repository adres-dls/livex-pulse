import type { Metadata } from "next"
import { LivePulseDisplay } from "./live-pulse-display"

export const metadata: Metadata = {
  title: "Live Pulse — ADREC",
  description: "Abu Dhabi Real Estate Centre · live market transaction feed for on-site event displays.",
}

/**
 * Standalone kiosk screen for conference monitors. Also served at `/` (see
 * `../page.tsx`) — this route is kept as an explicit alias for venue displays
 * already pointed at `/live-pulse`.
 */
export default function LivePulsePage() {
  return <LivePulseDisplay />
}
