import type { Metadata } from "next"
import { LivePulseDisplay } from "./live-pulse/live-pulse-display"

export const metadata: Metadata = {
  title: "Live Pulse — ADREC",
  description: "Abu Dhabi Real Estate Centre · live market transaction feed for on-site event displays.",
}

/**
 * Live Pulse is the default (and only) screen in this app — served directly
 * at `/`. See `./live-pulse/page.tsx` for the `/live-pulse` alias and
 * `./live-pulse/wide` for the 6048×840 banner variant.
 */
export default function RootPage() {
  return <LivePulseDisplay />
}
