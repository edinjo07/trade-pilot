import type { NextConfig } from "next";

// ── HTTP Security Headers ─────────────────────────────────────────────────────
// Applied to every response. These block the most common web attacks.
const SECURITY_HEADERS = [
  // Prevent the site from being embedded in iframes (clickjacking)
  { key: "X-Frame-Options", value: "DENY" },
  // Stop browsers from MIME-sniffing the content type
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Force HTTPS for 2 years (production only — ignored on HTTP localhost)
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Only send the origin, not full URL, in Referer header
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disable browser features that are not needed
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=(), interest-cohort=()" },
  // Disable DNS prefetching (leaks visited URLs)
  { key: "X-DNS-Prefetch-Control", value: "off" },
  // Basic XSS auditor (legacy browsers)
  { key: "X-XSS-Protection", value: "1; mode=block" },
  // Content Security Policy:
  // - self: allow same origin
  // - unsafe-inline required for Tailwind inline styles & framer-motion
  // - blob: / data: needed for canvas (BotGate) and chart SVGs
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",   // Next.js needs unsafe-eval in dev
      "style-src 'self' 'unsafe-inline'",                  // Tailwind inline styles
      "font-src 'self' data:",
      "img-src 'self' data: blob: https://randomuser.me",
      "connect-src 'self'",
      "frame-ancestors 'none'",                            // double-locks iframe embedding
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // ── Remove the "X-Powered-By: Next.js" header (fingerprint removal) ───────
  poweredByHeader: false,

  // ── Source maps: off in production so attackers can't read your source ────
  productionBrowserSourceMaps: false,

  // ── Attach security headers to all routes ─────────────────────────────────
  async headers() {
    return [
      {
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
    ];
  },
};

export default nextConfig;
