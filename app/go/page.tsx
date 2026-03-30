import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TradePilot | Automated Trading Platform",
  description:
    "Discover how TradePilot's regulated automated trading platform works. Risk warning: trading involves risk. Capital at risk.",
  robots: { index: false, follow: false }, // bridge pages should not be indexed
};

// ── Regulator data ────────────────────────────────────────────────────────────
const REGULATORS = [
  { code: "CySEC", name: "Cyprus Securities & Exchange Commission", flag: "🇨🇾" },
  { code: "FCA",   name: "Financial Conduct Authority",              flag: "🇬🇧" },
  { code: "CONSOB",name: "Commissione Nazionale (Italy)",            flag: "🇮🇹" },
  { code: "FINMA", name: "Swiss Financial Market Supervisory Auth.", flag: "🇨🇭" },
];

// ── Feature points (short, factual, no profit claims) ────────────────────────
const FEATURES = [
  {
    icon: "🤖",
    heading: "Fully automated trading",
    body: "The platform places and manages trades automatically using rules-based strategies. No charts to watch.",
  },
  {
    icon: "🛡️",
    heading: "Built-in risk management",
    body: "Every trade includes a hard stop-loss. The system halts automatically if your daily risk limit is reached.",
  },
  {
    icon: "📊",
    heading: "Four tested strategies",
    body: "MA Crossover, RSI, MACD, and Momentum modes  each designed for different market conditions.",
  },
  {
    icon: "💳",
    heading: "Start from $250",
    body: "No large capital required. Demo accounts available so you can see how it works before depositing anything.",
  },
];

export default function GoBridgePage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* ── Top ad disclosure bar ─────────────────────────────────────── */}
      <div className="bg-gray-900 text-center py-2 px-4">
        <p className="text-xs text-gray-400">
          This is a paid advertisement. TradePilot is an automated trading platform.
        </p>
      </div>

      {/* ── Risk Warning Banner ───────────────────────────────────────── */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
        <div className="mx-auto max-w-xl flex items-start gap-2">
          <span className="text-amber-500 text-base shrink-0 mt-0.5">⚠️</span>
          <p className="text-xs text-amber-800 leading-relaxed">
            <span className="font-bold">Risk Warning:</span> Trading financial instruments
            involves significant risk and is not suitable for all investors. Your capital
            is at risk. Past performance is not indicative of future results. You could
            lose some or all of your invested capital. Only trade with money you can
            afford to lose. Please ensure you fully understand the risks involved before
            trading.
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-xl px-4 pb-16 pt-8 space-y-8">

        {/* ── Logo + headline ───────────────────────────────────────────── */}
        <div className="text-center space-y-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/tradepilot-logo.svg"
            alt="TradePilot"
            className="mx-auto h-9 w-auto"
          />
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight text-gray-900">
              Automated trading for everyday people
            </h1>
            <p className="text-sm text-gray-500 leading-relaxed max-w-sm mx-auto">
              TradePilot is a rules-based trading platform that works automatically
              in the background  no experience or constant screen time required.
            </p>
          </div>
        </div>

        {/* ── Regulatory badges ─────────────────────────────────────────── */}
        <div
          className="rounded-2xl px-5 py-5 space-y-3"
          style={{
            background: "#f8fafc",
            border: "1px solid rgba(0,0,0,0.07)",
          }}
        >
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 text-center">
            Regulated &amp; Authorised
          </p>
          <div className="grid grid-cols-2 gap-3">
            {REGULATORS.map((r) => (
              <div
                key={r.code}
                className="flex items-center gap-2.5 rounded-lg border bg-white px-3 py-2.5"
                style={{ borderColor: "rgba(0,0,0,0.08)" }}
              >
                <span className="text-lg shrink-0">{r.flag}</span>
                <div className="min-w-0">
                  <p className="text-xs font-extrabold text-gray-800">{r.code}</p>
                  <p className="text-[10px] text-gray-400 leading-tight truncate">{r.name}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-[10px] text-gray-400">
            TradePilot operates through regulated broker partners. Regulatory documentation available on request.
          </p>
        </div>

        {/* ── What is TradePilot ────────────────────────────────────────── */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900 text-center">
            What is TradePilot?
          </h2>
          <p className="text-sm text-gray-500 text-center leading-relaxed">
            An automated trading platform that monitors markets and executes
            trades based on pre-set, rules-based strategies. You choose your risk
            level  the platform does the rest.
          </p>
          <div className="space-y-3">
            {FEATURES.map((f) => (
              <div
                key={f.heading}
                className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white px-4 py-4 shadow-sm"
              >
                <span className="text-xl shrink-0 mt-0.5">{f.icon}</span>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-gray-900">{f.heading}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{f.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Who is it for ─────────────────────────────────────────────── */}
        <div
          className="rounded-2xl px-5 py-5 space-y-3"
          style={{
            background: "#f0fdf4",
            border: "1px solid rgba(34,197,94,0.18)",
          }}
        >
          <h3 className="text-sm font-bold text-gray-900">Who typically uses TradePilot?</h3>
          <ul className="space-y-2">
            {[
              "People with a full-time job who have no time to monitor markets",
              "Self-employed individuals looking for a passive income stream",
              "Retirees seeking a managed, rules-based approach to their savings",
              "Traders who want to remove emotion from their decision-making",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-xs text-gray-600">
                <span className="text-emerald-500 font-bold shrink-0 mt-0.5">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* ── Important disclosures ─────────────────────────────────────── */}
        <div
          className="rounded-xl px-4 py-4 space-y-2"
          style={{
            background: "rgba(251,191,36,0.06)",
            border: "1px solid rgba(251,191,36,0.22)",
          }}
        >
          <p className="text-xs font-bold text-gray-700">Important information before you continue:</p>
          <ul className="space-y-1.5 text-xs text-gray-500 leading-relaxed list-disc list-inside">
            <li>Trading carries a high level of risk and may not be suitable for everyone.</li>
            <li>A minimum deposit is required to trade with a live account (from $250).</li>
            <li>All results shown in the presentation are simulated or historical  not a guarantee of future returns.</li>
            <li>You should seek independent financial advice if you are unsure whether trading is right for you.</li>
            <li>This platform is intended for adults aged 18 and over.</li>
          </ul>
        </div>

        {/* ── Primary CTA ───────────────────────────────────────────────── */}
        <div className="space-y-3 text-center">
          <Link
            href="/"
            className="block w-full rounded-2xl px-6 py-4 text-base font-extrabold text-black shadow-lg transition active:scale-[.98]"
            style={{
              background: "linear-gradient(135deg,#f0a500 0%,#d4840a 100%)",
              boxShadow: "0 4px 24px rgba(240,165,0,0.35)",
            }}
          >
            I understand  show me how it works →
          </Link>
          <p className="text-xs text-gray-400">
            Free to access · No credit card required · Takes 60 seconds to complete
          </p>
        </div>

        {/* ── Footer legal ──────────────────────────────────────────────── */}
        <div className="border-t border-gray-100 pt-6 space-y-3">
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-400">
            <Link href="/privacy" className="hover:text-gray-600 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-gray-600 transition-colors">
              Terms &amp; Conditions
            </Link>
          </div>
          <p className="text-center text-[10px] text-gray-400 leading-relaxed max-w-sm mx-auto">
            TradePilot is a trading platform operating in partnership with CySEC, FCA, CONSOB and
            FINMA regulated brokers. Trading CFDs and forex involves significant risk of loss.
            Leveraged products may not be suitable for all clients. Please read our full
            risk disclosure before trading. &copy; {new Date().getFullYear()} TradePilot.
          </p>
        </div>
      </main>
    </div>
  );
}
