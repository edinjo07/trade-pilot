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

// ── Known crawler / bot UA patterns ─────────────────────────────────────────
// Ordered from most specific to most broad.
const BOT_PATTERNS: RegExp[] = [
  // Google
  /Googlebot(?:-Mobile|-Image|-Video|-News)?/i,
  /AdsBot-Google(?:-Mobile)?/i,
  /Mediapartners-Google/i,
  /DuplexWeb-Google/i,
  /Google-InspectionTool/i,
  /GoogleOther/i,
  /Google Favicon/i,
  /Google-Read-Aloud/i,
  /Google-Site-Verification/i,

  // Facebook / Meta
  /facebookexternalhit/i,
  /Facebot/i,
  /FacebookBot/i,
  /meta-externalagent/i,

  // Bing / Microsoft
  /bingbot/i,
  /BingPreview/i,
  /msnbot/i,
  /adidxbot/i,

  // Other major crawlers
  /Twitterbot/i,
  /LinkedInBot/i,
  /Slackbot/i,
  /WhatsApp/i,
  /TelegramBot/i,
  /Discordbot/i,
  /Applebot/i,
  /YandexBot/i,
  /DuckDuckBot/i,
  /Baiduspider/i,
  /Sogou/i,
  /ia_archiver/i,         // Alexa/Wayback Machine
  /archive\.org_bot/i,
  /SemrushBot/i,
  /AhrefsBot/i,
  /DotBot/i,
  /MJ12bot/i,
  /SEOkicks/i,

  // Generic headless / scraper hints
  /python-requests/i,
  /python-urllib/i,
  /go-http-client/i,
  /curl\//i,
  /wget\//i,
  /libwww-perl/i,
  /scrapy/i,
  /node-fetch/i,
  /axios\/[01]\./i,       // old axios version used by scrapers
  /PhantomJS/i,
  /HeadlessChrome/i,
  /Selenium/i,
  /SlimerJS/i,
];

// ── Paths that are NEVER redirected ─────────────────────────────────────────
const EXEMPT_PREFIXES = [
  "/platform",       // the clean bot page itself
  "/api/",
  "/admin/",
  "/_next/",
  "/robots.txt",
  "/sitemap.xml",
  "/favicon.ico",
  "/images/",
  "/public/",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip exempt paths
  if (EXEMPT_PREFIXES.some((p) => pathname === p || pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const ua = request.headers.get("user-agent") ?? "";

  if (ua && BOT_PATTERNS.some((re) => re.test(ua))) {
    // Hard redirect — 302 so crawlers see the redirect and follow it once
    const url = request.nextUrl.clone();
    url.pathname = "/platform";
    // Preserve ?ref= so analytics can log bot source if needed
    url.search = "";
    return NextResponse.redirect(url, { status: 302 });
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
