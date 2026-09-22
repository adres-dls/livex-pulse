import "./globals.css"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Live Pulse — ADREC",
  description: "Abu Dhabi Real Estate Centre · live market transaction feed for on-site event displays.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // `data-brand="adrec"` activates the Adrec token set (gold / sage / burgundy).
  // Adrec's typeface is Helvetica Neue (system) so there's no web font to load.
  // Dark mode is a `.dark` class on <html>, toggled per-board by `useKioskTheme`.
  return (
    <html lang="en" dir="ltr" data-brand="adrec" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}//test