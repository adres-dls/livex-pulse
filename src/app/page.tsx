import type { Metadata } from "next"
import { LivePulseDisplayWide } from "./live-pulse/wide/live-pulse-display-wide"

export const metadata: Metadata = {
  title: "Live Pulse — Wide (6048×840) — ADREC",
  description: "Abu Dhabi Real Estate Centre · live market transaction feed, single-row 6048×840 banner variant.",
}

/**
 * The 6048×840 wide banner board is the default screen in this app — served
 * directly at `/`. See `./live-pulse/page.tsx` for the standard 16:9 board
 * (`/live-pulse`) and `./live-pulse/wide/page.tsx` for this board's own
 * `/live-pulse/wide` alias.
 */
export default function RootPage() {
  return <LivePulseDisplayWide />
}
