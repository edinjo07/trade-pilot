/**
 * Edge Middleware — bot gate
 *
 * Runs BEFORE any page is rendered. Detects known crawlers/bots by
 * User-Agent and immediately redirects them to /platform — a clean,
 * isolated static page with no funnel code, no tracking, no session.
 *
 * Protected paths: / and all funnel pages
 * Exempt paths: /platform (the clean page itself), /api/*, /admin/*,
 *               /_next/*, /robots.txt, /sitemap.xml, images, favicon
 */
import { NextRequest, NextResponse } from "next/server";

// ── Known crawler / bot UA patterns — each with a display label ─────────────
// Ordered from most specific to most broad.
const BOT_PATTERNS: Array<{ re: RegExp; label: string }> = [
  // Google
  { re: /Googlebot(?:-Mobile|-Image|-Video|-News)?/i, label: "Bot Google" },
  { re: /AdsBot-Google(?:-Mobile)?/i,                 label: "Bot Google" },
  { re: /Mediapartners-Google/i,                      label: "Bot Google" },
  { re: /DuplexWeb-Google/i,                          label: "Bot Google" },
  { re: /Google-InspectionTool/i,                     label: "Bot Google" },
  { re: /GoogleOther/i,                               label: "Bot Google" },
  { re: /Google Favicon/i,                            label: "Bot Google" },
  { re: /Google-Read-Aloud/i,                         label: "Bot Google" },
  { re: /Google-Site-Verification/i,                  label: "Bot Google" },

  // Facebook / Meta
  { re: /facebookexternalhit/i,  label: "Bot Facebook" },
  { re: /Facebot/i,              label: "Bot Facebook" },
  { re: /FacebookBot/i,          label: "Bot Facebook" },
  { re: /meta-externalagent/i,   label: "Bot Facebook" },

  // Bing / Microsoft
  { re: /bingbot/i,     label: "Bot Bing" },
  { re: /BingPreview/i, label: "Bot Bing" },
  { re: /msnbot/i,      label: "Bot Bing" },
  { re: /adidxbot/i,    label: "Bot Bing" },

  // Social / messaging
  { re: /Twitterbot/i,  label: "Bot Twitter" },
  { re: /LinkedInBot/i, label: "Bot LinkedIn" },
  { re: /Slackbot/i,    label: "Bot Slack" },
  { re: /WhatsApp/i,    label: "Bot WhatsApp" },
  { re: /TelegramBot/i, label: "Bot Telegram" },
  { re: /Discordbot/i,  label: "Bot Discord" },
  { re: /Applebot/i,    label: "Bot Apple" },

  // Search engines
  { re: /YandexBot/i,    label: "Bot Yandex" },
  { re: /DuckDuckBot/i,  label: "Bot DuckDuckGo" },
  { re: /Baiduspider/i,  label: "Bot Baidu" },
  { re: /Sogou/i,        label: "Bot Sogou" },
  { re: /ia_archiver/i,  label: "Bot Archive" },
  { re: /archive\.org_bot/i, label: "Bot Archive" },

  // SEO tools
  { re: /SemrushBot/i, label: "Bot Semrush" },
  { re: /AhrefsBot/i,  label: "Bot Ahrefs" },
  { re: /DotBot/i,     label: "Bot DotBot" },
  { re: /MJ12bot/i,    label: "Bot MJ12" },
  { re: /SEOkicks/i,   label: "Bot SEO" },

  // Headless browsers / automation
  { re: /PhantomJS/i,     label: "Bot Headless" },
  { re: /HeadlessChrome/i, label: "Bot Headless" },
  { re: /Selenium/i,      label: "Bot Headless" },
  { re: /SlimerJS/i,      label: "Bot Headless" },

  // Scripts / scrapers
  { re: /python-requests/i,  label: "Bot Script" },
  { re: /python-urllib/i,    label: "Bot Script" },
  { re: /go-http-client/i,   label: "Bot Script" },
  { re: /curl\//i,           label: "Bot Script" },
  { re: /wget\//i,           label: "Bot Script" },
  { re: /libwww-perl/i,      label: "Bot Script" },
  { re: /scrapy/i,           label: "Bot Scrapy" },
  { re: /node-fetch/i,       label: "Bot Script" },
  { re: /axios\/[01]\./i,    label: "Bot Script" },
];

// ── Paths that are NEVER redirected ─────────────────────────────────────────
const EXEMPT_PREFIXES = [
  "/platform",       // the clean bot page itself
  "/restricted",     // geo-blocked page
  "/api/",
  "/admin/",
  "/_next/",
  "/robots.txt",
  "/sitemap.xml",
  "/favicon.ico",
  "/images/",
  "/public/",
];

// ── Geo config — module-level cache (per edge worker instance) ───────────────
type GeoConfigData = { mode: string; countries: string[] };
let _geoCache: { data: GeoConfigData; expiresAt: number } | null = null;

async function getGeoConfig(origin: string): Promise<GeoConfigData> {
  const now = Date.now();
  if (_geoCache && now < _geoCache.expiresAt) return _geoCache.data;
  try {
    const res = await fetch(`${origin}/api/internal/geo-config`, {
      // Next.js fetch cache: re-validate every 60 s at the CDN layer too
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const data = await res.json() as GeoConfigData;
      _geoCache = { data, expiresAt: now + 60_000 };
      return data;
    }
  } catch { /* network error — fail open */ }
  return { mode: "all", countries: [] };
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip exempt paths
  if (EXEMPT_PREFIXES.some((p) => pathname === p || pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const ua = request.headers.get("user-agent") ?? "";
  const match = ua ? BOT_PATTERNS.find(({ re }) => re.test(ua)) : null;

  if (match) {
    // Hard redirect — 302 so crawlers see the redirect and follow it once
    const url = request.nextUrl.clone();
    url.pathname = "/platform";
    url.searchParams.set("b", match.label); // pass bot label for analytics
    return NextResponse.redirect(url, { status: 302 });
  }

  // ── Geo restriction check ─────────────────────────────────────────────────
  const geoConfig = await getGeoConfig(request.nextUrl.origin);

  if (geoConfig.mode !== "all" && geoConfig.countries.length > 0) {
    // Vercel injects x-vercel-ip-country; Cloudflare uses cf-ipcountry
    const country = (
      request.headers.get("x-vercel-ip-country") ||
      request.headers.get("cf-ipcountry") ||
      ""
    ).toUpperCase().trim();

    // Unknown country (local dev, VPN, etc.) → let through
    if (country) {
      const inList = geoConfig.countries.includes(country);
      const blocked =
        (geoConfig.mode === "whitelist" && !inList) ||
        (geoConfig.mode === "blacklist" &&  inList);

      if (blocked) {
        const url = request.nextUrl.clone();
        url.pathname = "/restricted";
        url.search = "";
        return NextResponse.redirect(url, { status: 302 });
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  /*
   * Match every route EXCEPT:
   *  - /_next/static
   *  - /_next/image
   *  - /favicon.ico
   *  - /robots.txt
   *  - /images/*
   *  - /api/*   (handled separately)
   *
   * We intentionally keep it broad so the bot check fires on all funnel pages.
   */
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|images/).*)",
  ],
};
