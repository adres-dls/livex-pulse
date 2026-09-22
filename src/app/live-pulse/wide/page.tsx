import type { Metadata } from "next"
import { LivePulseDisplayWide } from "./live-pulse-display-wide"

export const metadata: Metadata = {
  title: "Live Pulse — Wide (6048×840) — ADREC",
  description: "Abu Dhabi Real Estate Centre · live market transaction feed, single-row 6048×840 banner variant.",
}

/**
 * Wide banner variant of the Live Pulse kiosk board — fixed at 6048×840px for
 * an LED/video wall strip at the LIVEX stand. Not part of the signed-in app
 * (no `AppShell`, no nav entry). See `../page.tsx` for the standard board.
 */
export default function LivePulseWidePage() {
  return <LivePulseDisplayWide />
}
