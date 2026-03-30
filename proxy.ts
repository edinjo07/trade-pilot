import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, getAdminToken, safeEqual } from "@/lib/adminAuth";
import { detectLocale } from "@/lib/i18n";

const EDUCATION_PATH = "/education";

// ── Known crawler / bot UA patterns — each with a display label ─────────────
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
  { re: /YandexBot/i,        label: "Bot Yandex" },
  { re: /DuckDuckBot/i,      label: "Bot DuckDuckGo" },
  { re: /Baiduspider/i,      label: "Bot Baidu" },
  { re: /Sogou/i,            label: "Bot Sogou" },
  { re: /ia_archiver/i,      label: "Bot Archive" },
  { re: /archive\.org_bot/i, label: "Bot Archive" },
  // SEO tools
  { re: /SemrushBot/i, label: "Bot Semrush" },
  { re: /AhrefsBot/i,  label: "Bot Ahrefs" },
  { re: /DotBot/i,     label: "Bot DotBot" },
  { re: /MJ12bot/i,    label: "Bot MJ12" },
  { re: /SEOkicks/i,   label: "Bot SEO" },
  // Headless browsers / automation
  { re: /PhantomJS/i,      label: "Bot Headless" },
  { re: /HeadlessChrome/i, label: "Bot Headless" },
  { re: /Selenium/i,       label: "Bot Headless" },
  { re: /SlimerJS/i,       label: "Bot Headless" },
  // Scripts / scrapers
  { re: /python-requests/i, label: "Bot Script" },
  { re: /python-urllib/i,   label: "Bot Script" },
  { re: /go-http-client/i,  label: "Bot Script" },
  { re: /curl\//i,          label: "Bot Script" },
  { re: /wget\//i,          label: "Bot Script" },
  { re: /libwww-perl/i,     label: "Bot Script" },
  { re: /scrapy/i,          label: "Bot Scrapy" },
  { re: /node-fetch/i,      label: "Bot Script" },
  { re: /axios\/[01]\./i,   label: "Bot Script" },
];

// ── Paths that skip bot + geo checks ─────────────────────────────────────────
const EXEMPT_PREFIXES = [
  "/platform",
  "/restricted",
  "/education",
  "/api/",
  "/admin/",
  "/_next/",
  "/robots.txt",
  "/sitemap.xml",
  "/favicon.ico",
  "/images/",
  "/public/",
];

// ── Geo config — module-level cache (per edge worker instance, 60 s TTL) ─────
type GeoConfigData = { mode: string; countries: string[] };
let _geoCache: { data: GeoConfigData; expiresAt: number } | null = null;

async function getGeoConfig(origin: string): Promise<GeoConfigData> {
  const now = Date.now();
  if (_geoCache && now < _geoCache.expiresAt) return _geoCache.data;
  try {
    const res = await fetch(`${origin}/api/internal/geo-config`, {
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

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // ── Admin auth ────────────────────────────────────────────────────────────
  if (path.startsWith("/admin")) {
    if (path === "/admin/login" || path === "/admin/logout") {
      return NextResponse.next();
    }
    const token = getAdminToken();
    const cookieVal = req.cookies.get(ADMIN_COOKIE)?.value ?? "";
    if (token && safeEqual(cookieVal, token)) {
      return NextResponse.next();
    }
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    loginUrl.searchParams.set("next", path);
    return NextResponse.redirect(loginUrl);
  }

  // ── Skip bot/geo checks for exempt paths ─────────────────────────────────
  const isExempt = EXEMPT_PREFIXES.some((p) => path === p || path.startsWith(p));
  if (!isExempt) {
    // ── Bot detection → redirect to /platform with label ─────────────────
    const ua = req.headers.get("user-agent") ?? "";
    const match = ua ? BOT_PATTERNS.find(({ re }) => re.test(ua)) : null;
    if (match) {
      const url = req.nextUrl.clone();
      url.pathname = "/platform";
      url.searchParams.set("b", match.label);
      return NextResponse.redirect(url, { status: 302 });
    }

    // ── Geo restriction check ─────────────────────────────────────────────
    const geoConfig = await getGeoConfig(req.nextUrl.origin);
    if (geoConfig.mode !== "all" && geoConfig.countries.length > 0) {
      const country = (
        req.headers.get("x-vercel-ip-country") ||
        req.headers.get("cf-ipcountry") ||
        ""
      ).toUpperCase().trim();
      if (country) {
        const inList = geoConfig.countries.includes(country);
        const blocked =
          (geoConfig.mode === "whitelist" && !inList) ||
          (geoConfig.mode === "blacklist" && inList);
        if (blocked) {
          const url = req.nextUrl.clone();
          url.pathname = "/restricted";
          url.search = "";
          return NextResponse.redirect(url, { status: 302 });
        }
      }
    }

    // ── IP-based education routing ────────────────────────────────────────
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
