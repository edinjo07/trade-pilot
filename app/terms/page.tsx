export default function TermsPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <span
            className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest"
            style={{ background: "rgba(240,165,0,0.1)", border: "1px solid rgba(240,165,0,0.15)", color: "#f0a500" }}
          >
            Legal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Terms of Service</h1>
          <p className="text-xs" style={{ color: "#4e5d7a" }}>Last updated: March 2026</p>
        </div>

        <div className="ic-divider" />

        {/* Risk warning box */}
        <div
          className="rounded-xl px-4 py-4 space-y-1"
          style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)" }}
        >
          <p className="text-sm font-bold" style={{ color: "#f87171" }}>&#9888; Risk Warning</p>
          <p className="text-xs leading-relaxed" style={{ color: "#8a9bbf" }}>
            Trading CFDs and leveraged forex products carries a high level of risk and is not
            suitable for all investors. You may lose more than your initial deposit. You should
            only trade with capital that you can afford to lose. Past performance is not
            indicative of future results.
          </p>
        </div>

        {[
          {
            title: "1. Nature of this service",
            body: "TradePilot is an informational and lead-qualification website. It does not provide investment advice, financial advice, trading signals, or portfolio management. It is not regulated by the FCA, ASIC, CySEC, or any other financial authority. The self-assessment quiz and readiness screens are educational tools only and do not constitute a financial suitability assessment.",
          },
          {
            title: "2. No guarantees",
            body: "Nothing on this site constitutes a guarantee, forecast, or representation of future results. Any profit figures mentioned (e.g., trader activity feeds) are for illustrative purposes only and are not representative of what you will earn. Individual results will vary significantly and most retail traders lose money.",
          },
          {
            title: "3. Third-party platforms",
            body: "This site may introduce you to third-party trading platforms. TradePilot is not responsible for the conduct, regulation, solvency, or performance of any third-party platform. You are solely responsible for conducting your own due diligence before depositing any funds with any platform.",
          },
          {
            title: "4. Affiliate relationships",
            body: "TradePilot may receive a referral fee (CPA) when a user it introduces deposits with a partner platform. This relationship does not influence the readiness screening. Users who fail the qualification screens are not forwarded to partner platforms regardless of any commercial relationship.",
          },
          {
            title: "5. Eligibility",
            body: "This site is intended for adults (18+) only. It is your responsibility to ensure that using this site and accessing trading platforms is legal in your jurisdiction. If you are unsure, do not proceed.",
          },
          {
            title: "6. Intellectual property",
            body: "All content, design, and code on this site is the property of TradePilot and may not be reproduced, scraped, or redistributed without written permission.",
          },
          {
            title: "7. Governing law",
            body: "These terms are governed by applicable law. By using this site you agree to resolve any disputes through binding arbitration rather than in court, to the fullest extent permitted by law.",
          },
          {
            title: "8. Changes",
            body: "We may update these terms at any time. The date at the top of this page reflects the most recent revision. Continued use of the site after changes constitutes acceptance of the revised terms.",
          },
        ].map((s) => (
          <div key={s.title} className="space-y-2">
            <h2 className="text-base font-bold text-white">{s.title}</h2>
            <p className="text-sm leading-relaxed" style={{ color: "#8a9bbf" }}>{s.body}</p>
          </div>
        ))}

        <div className="ic-divider" />

        <div className="flex flex-wrap gap-4">
          <a href="/privacy" className="text-sm text-emerald-400 hover:text-emerald-300 underline transition-colors">
            Privacy Policy
          </a>
          <a href="/" className="text-sm text-neutral-500 hover:text-neutral-400 underline transition-colors">
            Back to start
          </a>
        </div>
      </div>
    </main>
  );
}
