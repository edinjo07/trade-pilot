import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, getAdminToken, safeEqual } from "@/lib/adminAuth";
import { detectLocale } from "@/lib/i18n";

const EDUCATION_PATH = "/education";

// ── Bot / crawler User-Agent detection ───────────────────────────────────────
// These are common crawler bot strings. Matching is case-insensitive substring.
// Applies to funnel landing page (/) AND the /continue confirmation page.
const BOT_UA_PATTERNS = [
  // ── Google ──────────────────────────────────────────────────────────────────
  "googlebot",            // main web crawler
  "adsbot-google",        // Google Ads landing-page verification (CRITICAL)
  "mediapartners-google", // Google AdSense content crawler
  "google-inspection",    // Google Search Console inspection tool
  "googleweblight",       // Google Web Light proxy
  "bingbot",
  "slurp",                // Yahoo
  "duckduckbot",
  "baiduspider",
  "yandexbot",
  "sogou",
  "exabot",
  "ia_archiver",          // Wayback Machine
  "applebot",
  "seznambot",
  "bytespider",           // TikTok / ByteDance
  "petalbot",             // Huawei/Petal Search
  // ── Facebook / Meta ─────────────────────────────────────────────────────────
  "facebookexternalhit",  // PRIMARY Facebook link-preview & ad-policy crawler
  "facebot",              // Facebook OpenGraph bot
  "meta-externalagent",   // newer Meta crawler
  "meta-externalfetcher", // newer Meta fetcher
  // ── Taboola / Outbrain ──────────────────────────────────────────────────────
  "taboolabot",
  "taboola",
  "outbrainbot",
  "outbrain",
  // ── SEO / audit bots ────────────────────────────────────────────────────────
  "semrushbot",
  "ahrefsbot",
  "mj12bot",
  "dotbot",
  // ── Headless / automation tools ─────────────────────────────────────────────
  "headlesschrome",
  "phantomjs",
  "selenium",
  "puppeteer",
  "playwright",
  // ── Generic HTTP clients (non-browser) ──────────────────────────────────────
  "python-requests",
  "python-urllib",
  "wget",
  "curl/",
  "scrapy",
  "httpclient",
  "java/",
  "axios/",
  "node-fetch",
];

function isBotUA(ua: string | null): boolean {
  if (!ua) return true; // no UA → treat as bot
  const lower = ua.toLowerCase();
  return BOT_UA_PATTERNS.some((p) => lower.includes(p));
}

// ── Serve a benign "safe page" to bots ───────────────────────────────────────
// Real users see the funnel; crawlers see a plain editorial page.
function serveSafePage(req: NextRequest): NextResponse {
  const url = req.nextUrl.clone();
  url.pathname = EDUCATION_PATH;
  return NextResponse.rewrite(url);
}

function getClientIp(req: NextRequest) {
  const header = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip");
  const raw = header?.split(",")[0]?.trim() || "";
  if (!raw) return null;
  if (raw.includes(".") && raw.includes(":")) return raw.split(":")[0];
  return raw;
}

function ipv4ToInt(ip: string) {
  const parts = ip.split(".").map((part) => Number(part));
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part) || part < 0 || part > 255)) {
    return null;
  }
  return ((parts[0] << 24) >>> 0) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
}

function isIpInRange(ip: string, range: string) {
  if (!range) return false;
  if (!range.includes("/")) return ip === range;
  const [base, bitsRaw] = range.split("/");
  const bits = Number(bitsRaw);
  if (!base || Number.isNaN(bits) || bits < 0 || bits > 32) return false;
  const ipInt = ipv4ToInt(ip);
  const baseInt = ipv4ToInt(base);
  if (ipInt === null || baseInt === null) return false;
  const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
  return (ipInt & mask) === (baseInt & mask);
}

function shouldShowEducation(ip: string | null) {
  if (!ip || !ip.includes(".")) return false;
  const ranges = (process.env.EDUCATION_IP_RANGES || "")
    .split(",")
    .map((range) => range.trim())
    .filter(Boolean);
  if (!ranges.length) return false;
  return ranges.some((range) => isIpInRange(ip, range));
}

export function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isAdmin = path.startsWith("/admin");

  if (isAdmin) {
    // Login + logout bypass auth
    if (path === "/admin/login" || path === "/admin/logout") {
      return NextResponse.next();
    }

    // Validate session cookie
    const token = getAdminToken();
    const cookieVal = req.cookies.get(ADMIN_COOKIE)?.value ?? "";
    if (token && safeEqual(cookieVal, token)) {
      return NextResponse.next();
    }

    // No valid session → redirect to login
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    loginUrl.searchParams.set("next", path);
    return NextResponse.redirect(loginUrl);
  }

  // ── Bot cloaking: landing page + continue page ────────────────────────────
  // Serve the safe editorial page to any recognised bot/crawler/headless UA.
  // Real human visitors receive the full funnel and confirmation page.
  const isCloakedPage = path === "/" || path === "" || path === "/continue";
  if (isCloakedPage && isBotUA(req.headers.get("user-agent"))) {
    return serveSafePage(req);
  }

  // ── IP-based geo routing ──────────────────────────────────────────────────
  if (!path.startsWith(EDUCATION_PATH)) {
    const ip = getClientIp(req);
    if (shouldShowEducation(ip)) {
      const url = req.nextUrl.clone();
      url.pathname = EDUCATION_PATH;
      return NextResponse.rewrite(url);
    }
  }

  // ── Locale detection — set NEXT_LOCALE cookie once per visitor ───────────
  const res = NextResponse.next();
  if (!req.cookies.get("NEXT_LOCALE")?.value) {
    const locale = detectLocale(
      req.headers.get("accept-language") ?? "",
      req.headers.get("cf-ipcountry"),
    );
    res.cookies.set("NEXT_LOCALE", locale, {
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
      sameSite: "lax",
    });
  }
  return res;
}

export default proxy;

export const config = {
  matcher: [
    "/admin/:path*",
    "/((?!_next/|api/|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
