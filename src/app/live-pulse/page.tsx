import type { Metadata } from "next"
import { LivePulseDisplayWide } from "./live-pulse-display-wide"

export const metadata: Metadata = {
  title: "Live Pulse — Wide (3840×534) — ADREC",
  description: "Abu Dhabi Real Estate Centre · live market transaction feed, single-row 3840×534 banner variant.",
}

/** The 3840×534 wide banner board — fixed for an LED/video wall strip. */
export default function LivePulsePage() {
  return <LivePulseDisplayWide />
}
