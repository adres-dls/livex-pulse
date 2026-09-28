"use client"

import { useRouter } from "next/navigation"
import { Button } from "@adres/design-system"

/**
 * Launcher screen — a single centered button. Browsers only allow
 * `requestFullscreen()` from directly within a user-gesture handler (a click),
 * so unlike the board itself, this page can reliably go fullscreen: the
 * request fires in the same click that then navigates to `/live-pulse`.
 */
export default function LauncherPage() {
  const router = useRouter()

  const launch = () => {
    document.documentElement.requestFullscreen?.().catch(() => {})
    router.push("/live-pulse")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Button variant="primary" size="lg" onClick={launch}>
        Launch dashboard
      </Button>
    </div>
  )
}
