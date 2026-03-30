/**
 * /restricted — shown to visitors from blocked countries.
 *
 * Completely isolated page: no funnel imports, no DB, force-static.
 */
import type { Metadata } from "next";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Not Available In Your Region",
  robots: { index: false, follow: false },
};

export default function RestrictedPage() {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Segoe UI', system-ui, sans-serif",
          background: "#0a0f1a",
          color: "#e2e8f0",
        }}
      >
        <div style={{ textAlign: "center", padding: "40px 24px", maxWidth: 480 }}>
          {/* Globe icon */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "rgba(100,116,139,0.12)",
              border: "1px solid rgba(100,116,139,0.25)",
              marginBottom: 28,
            }}
          >
            <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
              <circle cx="19" cy="19" r="15" stroke="#64748b" strokeWidth="1.8" />
              <ellipse cx="19" cy="19" rx="7" ry="15" stroke="#64748b" strokeWidth="1.4" />
              <line x1="4" y1="19" x2="34" y2="19" stroke="#64748b" strokeWidth="1.4" />
              <line x1="7" y1="12" x2="31" y2="12" stroke="#64748b" strokeWidth="1.2" />
              <line x1="7" y1="26" x2="31" y2="26" stroke="#64748b" strokeWidth="1.2" />
            </svg>
          </div>

          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "#f1f5f9",
              margin: "0 0 12px",
              lineHeight: 1.3,
            }}
          >
            Not Available In Your Region
          </h1>

          <p style={{ fontSize: 15, color: "#94a3b8", lineHeight: 1.7, margin: "0 0 32px" }}>
            This service is currently not available in your country or region.
            We may expand to your area in the future.
          </p>

          <div
            style={{
              display: "inline-block",
              background: "rgba(100,116,139,0.08)",
              border: "1px solid rgba(100,116,139,0.18)",
              borderRadius: 8,
              padding: "10px 20px",
              fontSize: 12,
              color: "#64748b",
              letterSpacing: "0.05em",
            }}
          >
            ACCESS RESTRICTED
          </div>
        </div>
      </body>
    </html>
  );
}
