export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <span
            className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest"
            style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.15)", color: "#34d399" }}
          >
            Privacy &amp; Data
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Privacy Policy</h1>
          <p className="text-xs" style={{ color: "#4e5d7a" }}>Last updated: March 2026</p>
        </div>

        <div className="ic-divider" />

        {/* Sections */}
        {[
          {
            title: "What we collect",
            body: "When you complete the registration form we collect: your first and last name, email address, and phone number. We also collect your IP address, approximate country of origin, browser user-agent, session identifiers, and any affiliate click IDs present in your landing URL. This is the minimum required to contact you regarding trading platform options and to measure campaign performance.",
          },
          {
            title: "How we use it",
            body: "Your contact information is used solely to introduce you to trading platform partners who may reach out to discuss account opening. Aggregated, anonymised analytics data (page views, funnel progression, click rates) is used to improve the screening experience. We do not build advertising profiles or sell your data to third parties.",
          },
          {
            title: "Who we share it with",
            body: "Your lead data (name, email, phone, country) is forwarded to the trading platform partner you are introduced to. That partner is independently responsible for complying with their own privacy obligations once they receive your data. We do not share your information with any other third parties.",
          },
          {
            title: "How long we keep it",
            body: "Lead records are retained for up to 24 months from the date of submission for audit, compliance, and dispute resolution purposes. Anonymous session analytics data is retained indefinitely in aggregated form. You may request deletion at any time (see below).",
          },
          {
            title: "Your rights",
            body: "You have the right to access, correct, or request deletion of your personal data at any time. To exercise these rights, email the address shown in the site footer. We will respond within 30 days. If you are located in the EEA or UK you also have the right to lodge a complaint with your local supervisory authority.",
          },
          {
            title: "Cookies & local storage",
            body: "We use browser sessionStorage to preserve your funnel progress within a single visit (e.g., countdown timer, quiz answers). No persistent advertising or tracking cookies are set. Analytics may use a first-party cookie to distinguish unique sessions - this does not identify you personally.",
          },
          {
            title: "Security",
            body: "All data is transmitted over HTTPS / TLS. Server-side data is stored in encrypted databases with access restricted to authorised personnel only. We implement rate limiting and IP-based access controls on the admin panel.",
          },
        ].map((s) => (
          <div key={s.title} className="space-y-2">
            <h2 className="text-base font-bold text-white">{s.title}</h2>
            <p className="text-sm leading-relaxed" style={{ color: "#8a9bbf" }}>{s.body}</p>
          </div>
        ))}

        <div className="ic-divider" />

        <div className="flex flex-wrap gap-4">
          <a href="/terms" className="text-sm text-emerald-400 hover:text-emerald-300 underline transition-colors">
            Terms of Service
          </a>
          <a href="/" className="text-sm text-neutral-500 hover:text-neutral-400 underline transition-colors">
            Back to start
          </a>
        </div>
      </div>
    </main>
  );
}
