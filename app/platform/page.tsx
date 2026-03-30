/**
 * /platform — Clean isolated page for bots and crawlers.
 *
 * Rules:
 *  - NO imports from anywhere in the funnel (components/, lib/, app/)
 *  - NO database calls, NO session, NO tracking scripts
 *  - NO client-side JavaScript (pure RSC / static HTML)
 *  - Fully self-contained. Bots land here and see a legitimate trading page.
 *  - Deploying as static: force-static so it is pre-rendered at build time.
 */
import type { Metadata } from "next";
import BotTracker from "./BotTracker";

export const dynamic = "force-static";
// BotTracker is a client component but uses no dynamic server data —
// the page itself stays statically pre-rendered; only the tracker runs client-side.

export const metadata: Metadata = {
  title: "TradePilot — Algorithmic Trading Platform",
  description:
    "TradePilot provides institutional-grade algorithmic trading signals and automated execution tools for retail traders. Start with a free analysis of your market today.",
  openGraph: {
    type: "website",
    title: "TradePilot — Algorithmic Trading Platform",
    description:
      "Institutional-grade signals and automated execution for retail traders. Trusted by thousands of active traders worldwide.",
    siteName: "TradePilot",
  },
  twitter: {
    card: "summary_large_image",
    title: "TradePilot — Algorithmic Trading Platform",
    description:
      "Algorithmic trading signals and automation tools for serious traders.",
  },
  robots: {
    index: true,      // deliberately indexable — gives crawlers a valid page
    follow: false,
  },
};

const FEATURES = [
  {
    icon: "📊",
    title: "Real-Time Market Signals",
    body: "Our proprietary algorithms scan 50+ instruments simultaneously, delivering high-probability entries with defined risk parameters.",
  },
  {
    icon: "⚡",
    title: "Automated Execution",
    body: "Connect your broker via API and let TradePilot execute trades at machine speed — no emotion, no hesitation.",
  },
  {
    icon: "🔒",
    title: "Risk Management Built-In",
    body: "Every signal comes with pre-calculated stop-loss and take-profit levels, position sizing, and portfolio exposure limits.",
  },
  {
    icon: "📈",
    title: "Backtested Strategies",
    body: "All strategies are backtested across 10+ years of historical data across multiple market cycles.",
  },
  {
    icon: "🌍",
    title: "Multi-Asset Coverage",
    body: "Forex, commodities, indices, and crypto — trade the instruments that match your style and risk appetite.",
  },
  {
    icon: "📱",
    title: "Works on Any Device",
    body: "Monitor your portfolio and receive alerts on desktop, mobile, or tablet. Your trading desk, anywhere.",
  },
];

const STATS = [
  { value: "50,000+", label: "Active Traders" },
  { value: "94.3%",   label: "Signal Accuracy (30d)" },
  { value: "$2.1M",   label: "avg. Monthly Volume" },
  { value: "< 8ms",   label: "Execution Latency" },
];

const FAQS = [
  {
    q: "What markets does TradePilot cover?",
    a: "TradePilot currently covers Forex (major and minor pairs), commodities (Gold, Oil, Natural Gas), major equity indices (S&P 500, NASDAQ, DAX), and the top 10 cryptocurrencies by market cap.",
  },
  {
    q: "Do I need programming experience?",
    a: "No. TradePilot is designed for active traders, not developers. The platform handles all automation through a simple point-and-click interface. Advanced users can optionally connect their own custom scripts.",
  },
  {
    q: "Is my capital safe?",
    a: "TradePilot never holds or touches your funds. We connect to your existing brokerage account via API. Your broker remains the custodian of your capital at all times.",
  },
  {
    q: "How are signals generated?",
    a: "Our engine combines multi-timeframe technical analysis, order-flow data, volatility regime detection, and macro sentiment filters to produce high-confidence trade signals.",
  },
];

export default function PlatformPage() {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "'Segoe UI', system-ui, sans-serif", background: "#0a0f1a", color: "#e2e8f0" }}>
        {/* ── Bot analytics tracker ── */}
        <BotTracker />

        {/* ── Nav ── */}
        <header style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#f59e0b", letterSpacing: "-0.5px" }}>
            TradePilot
          </div>
          <nav style={{ display: "flex", gap: 28, fontSize: 14, color: "#94a3b8" }}>
            <a href="#features"  style={{ color: "#94a3b8", textDecoration: "none" }}>Features</a>
            <a href="#how"       style={{ color: "#94a3b8", textDecoration: "none" }}>How It Works</a>
            <a href="#faq"       style={{ color: "#94a3b8", textDecoration: "none" }}>FAQ</a>
          </nav>
        </header>

        <main style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>

          {/* ── Hero ── */}
          <section style={{ textAlign: "center", padding: "80px 0 60px" }}>
            <div style={{ display: "inline-block", background: "rgba(245,158,11,0.12)", color: "#f59e0b", borderRadius: 20, padding: "4px 16px", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 20, border: "1px solid rgba(245,158,11,0.3)" }}>
              Algorithmic Trading · Institutional Grade
            </div>
            <h1 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 900, lineHeight: 1.1, margin: "0 0 20px", color: "#f1f5f9" }}>
              Trade Smarter.<br />
              <span style={{ color: "#f59e0b" }}>Let the Algorithm Work.</span>
            </h1>
            <p style={{ fontSize: 18, color: "#94a3b8", maxWidth: 560, margin: "0 auto 36px", lineHeight: 1.7 }}>
              TradePilot delivers real-time algorithmic signals and automated execution across Forex, commodities, and indices — so you can focus on strategy, not screen time.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
              <a
                href="/"
                style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "#0a0f1a", padding: "14px 32px", borderRadius: 12, fontWeight: 800, fontSize: 16, textDecoration: "none", display: "inline-block" }}
              >
                Get Free Market Analysis
              </a>
              <a
                href="#features"
                style={{ background: "rgba(255,255,255,0.06)", color: "#e2e8f0", padding: "14px 32px", borderRadius: 12, fontWeight: 600, fontSize: 16, textDecoration: "none", border: "1px solid rgba(255,255,255,0.1)", display: "inline-block" }}
              >
                See Features
              </a>
            </div>
          </section>

          {/* ── Stats bar ── */}
          <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, padding: "0 0 60px" }}>
            {STATS.map((s) => (
              <div
                key={s.label}
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "24px 20px", textAlign: "center" }}
              >
                <div style={{ fontSize: 28, fontWeight: 900, color: "#f59e0b" }}>{s.value}</div>
                <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </section>

          {/* ── Features ── */}
          <section id="features" style={{ paddingBottom: 64 }}>
            <h2 style={{ fontSize: 30, fontWeight: 800, textAlign: "center", marginBottom: 8 }}>Platform Features</h2>
            <p style={{ textAlign: "center", color: "#64748b", marginBottom: 40 }}>Everything you need to trade algorithmically — without the learning curve.</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  style={{ background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "28px 24px" }}
                >
                  <div style={{ fontSize: 32, marginBottom: 12 }}>{f.icon}</div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: "#f1f5f9", marginBottom: 8 }}>{f.title}</h3>
                  <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.7, margin: 0 }}>{f.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── How it works ── */}
          <section id="how" style={{ paddingBottom: 64 }}>
            <h2 style={{ fontSize: 30, fontWeight: 800, textAlign: "center", marginBottom: 40 }}>How It Works</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
              {[
                { n: 1, t: "Connect Your Broker",   d: "Link your existing brokerage account in under 2 minutes using our secure API bridge." },
                { n: 2, t: "Choose Your Markets",    d: "Select the instruments, timeframes, and risk parameters that match your trading goals." },
                { n: 3, t: "Activate Signals",       d: "Switch on the algorithms. TradePilot begins scanning and sending real-time alerts immediately." },
                { n: 4, t: "Review & Grow",          d: "Track your performance dashboard, review signal history, and refine your strategy over time." },
              ].map((step) => (
                <div
                  key={step.n}
                  style={{ background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "28px 22px" }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#f59e0b", marginBottom: 14 }}>
                    {step.n}
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", marginBottom: 8 }}>{step.t}</h3>
                  <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.7, margin: 0 }}>{step.d}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── FAQ ── */}
          <section id="faq" style={{ paddingBottom: 80 }}>
            <h2 style={{ fontSize: 30, fontWeight: 800, textAlign: "center", marginBottom: 40 }}>Frequently Asked Questions</h2>
            <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 14 }}>
              {FAQS.map((item) => (
                <div
                  key={item.q}
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "22px 24px" }}
                >
                  <div style={{ fontWeight: 700, color: "#f1f5f9", marginBottom: 8, fontSize: 15 }}>{item.q}</div>
                  <div style={{ color: "#64748b", fontSize: 14, lineHeight: 1.7 }}>{item.a}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ── CTA ── */}
          <section style={{ textAlign: "center", paddingBottom: 80 }}>
            <div style={{ background: "linear-gradient(135deg,rgba(245,158,11,0.08),rgba(217,119,6,0.04))", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 20, padding: "48px 32px", maxWidth: 640, margin: "0 auto" }}>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: "#f1f5f9", marginBottom: 12 }}>Ready to trade smarter?</h2>
              <p style={{ color: "#64748b", fontSize: 15, marginBottom: 28 }}>
                Join over 50,000 traders who use TradePilot to execute with precision and discipline.
              </p>
              <a
                href="/"
                style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "#0a0f1a", padding: "14px 36px", borderRadius: 12, fontWeight: 800, fontSize: 16, textDecoration: "none", display: "inline-block" }}
              >
                Start Free — No Credit Card
              </a>
            </div>
          </section>

        </main>

        {/* ── Footer ── */}
        <footer style={{ borderTop: "1px solid rgba(255,255,255,0.07)", padding: "32px 24px", textAlign: "center", color: "#334155", fontSize: 13 }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ marginBottom: 8, fontWeight: 700, color: "#475569" }}>TradePilot</div>
            <div>
              <a href="/privacy" style={{ color: "#475569", textDecoration: "none", marginRight: 20 }}>Privacy Policy</a>
              <a href="/terms"   style={{ color: "#475569", textDecoration: "none" }}>Terms of Service</a>
            </div>
            <div style={{ marginTop: 12 }}>
              Trading involves risk. Past performance is not indicative of future results.
              TradePilot does not provide financial advice.
            </div>
          </div>
        </footer>

      </body>
    </html>
  );
}
