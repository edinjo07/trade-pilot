import "./globals.css";
import { cookies } from "next/headers";
import type { Viewport } from "next";
import type { Locale } from "@/lib/i18n";
import { LocaleProvider } from "@/components/LocaleProvider";

export const viewport: Viewport = {
  // viewport-fit=cover allows content to extend behind iOS notch / Dynamic Island
  // user-scalable=no prevents accidental pinch-zoom but is overridden by accessibility zoom
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,     // allow accessibility zoom but cap at 5x
  viewportFit: "cover", // iOS notch / Dynamic Island support
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#000000" },
    { media: "(prefers-color-scheme: dark)",  color: "#000000" },
  ],
};

export const metadata = {
  title: "TradePilot",
  description: "Your autopilot for the financial markets. Trade smarter, earn more, stress less.",
  metadataBase: new URL("https://example.com"),
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg", apple: "/favicon.svg" },
  openGraph: {
    title: "TradePilot",
    description: "Your autopilot for the financial markets. Trade smarter, earn more, stress less.",
    type: "website",
  },
  // Prevent iOS from auto-detecting phone numbers and changing them to links
  other: { "format-detection": "telephone=no" },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = (((await cookies()).get("NEXT_LOCALE")?.value) || "en") as Locale;
  return (
    <html lang={locale}>
      <body className="min-h-screen bg-white text-gray-900 antialiased overflow-x-hidden">
        {/* ── Animated top header ───────────────────────────────────────────── */}
        <header
          className="sticky top-0 z-40 animate-fade-in"
          style={{
            background: "#000000",
            borderBottom: "1px solid rgba(240,165,0,0.25)",
            backdropFilter: "blur(20px) saturate(160%)",
            WebkitBackdropFilter: "blur(20px) saturate(160%)",
            // Push content below iOS notch / Dynamic Island
            paddingTop: "env(safe-area-inset-top, 0px)",
          }}
        >
          <div className="mx-auto flex w-full max-w-xl items-center justify-between px-4 sm:px-6 py-3.5">
            {/* Logo */}
            <div className="flex items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/tradepilot-logo.svg"
                alt="TradePilot"
                width={180}
                height={39}
                className="h-9 w-auto"
                style={{ maxWidth: "180px" }}
              />
            </div>

            {/* Right: SSL badge + live badge */}
            <div className="flex items-center gap-2 sm:gap-3">
              <span
                className="hidden sm:inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
                style={{
                  background: "rgba(240,165,0,0.10)",
                  border: "1px solid rgba(240,165,0,0.35)",
                  color: "#f0a500",
                }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#f0a500" strokeWidth="2.5">
                  <rect x="3" y="11" width="18" height="11" rx="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                SSL Secured
              </span>
              <div
                className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
                style={{ background:"rgba(220,38,38,0.12)", border:"1px solid rgba(220,38,38,0.30)" }}
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500" />
                </span>
                <span className="text-xs text-red-400 font-semibold uppercase tracking-wider">LIVE</span>
              </div>
            </div>
          </div>
        </header>

        {/* ── Page content ─────────────────────────────────────────────────── */}
        <main className="relative z-10"><LocaleProvider initialLocale={locale}>{children}</LocaleProvider></main>

        {/* ── Footer ───────────────────────────────────────────────────────── */}
        <footer
          className="relative z-10 mt-16"
          style={{
            background: "#000000",
            borderTop: "1px solid rgba(240,165,0,0.20)",
            paddingBottom: "env(safe-area-inset-bottom, 16px)",
          }}
        >
          {/* gold top accent line */}
          <div style={{ height: "2px", background: "linear-gradient(90deg, transparent, #f0a500 40%, #f0a500 60%, transparent)" }} />
          <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 space-y-4">
            <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
              <span className="font-semibold" style={{ color: "#f0a500" }}>Risk Warning:</span>{" "}
              Trading in financial instruments involves significant risk. Prices may fluctuate and you
              may lose more than your initial deposit. Only trade with capital you can afford to lose.
              Past performance is not indicative of future results. The minimum starting deposit is{" "}
              <span className="font-semibold text-white">$250</span>.
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <a href="/terms"   className="text-xs transition-colors hover:text-yellow-400" style={{ color: "rgba(255,255,255,0.45)" }}>Terms</a>
              <span style={{ color: "rgba(240,165,0,0.25)" }}>|</span>
              <a href="/privacy" className="text-xs transition-colors hover:text-yellow-400" style={{ color: "rgba(255,255,255,0.45)" }}>Privacy</a>
              <span style={{ color: "rgba(240,165,0,0.25)" }}>|</span>
              <a href="/why-deposits-fail" className="text-xs transition-colors hover:text-yellow-400" style={{ color: "rgba(255,255,255,0.45)" }}>Why Deposits Fail</a>
              <span className="ml-auto text-xs font-semibold" style={{ color: "#f0a500" }}>© 2026 TradePilot</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
