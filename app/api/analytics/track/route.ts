import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashIp } from "@/lib/rateLimit";

function getClientIp(req: Request): string {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0].trim();
  const xr = req.headers.get("x-real-ip");
  if (xr) return xr.trim();
  return "0.0.0.0";
}

function parseDevice(ua: string): "mobile" | "tablet" | "desktop" {
  if (/tablet|ipad|playbook|silk/i.test(ua)) return "tablet";
  if (/mobile|android|iphone|ipod|opera mini|iemobile|wpdesktop/i.test(ua)) return "mobile";
  return "desktop";
}

function parseOS(ua: string): string {
  if (/windows nt 10/i.test(ua)) return "Windows 10";
  if (/windows nt 11/i.test(ua)) return "Windows 11";
  if (/windows/i.test(ua)) return "Windows";
  if (/mac os x/i.test(ua)) return "macOS";
  if (/android/i.test(ua)) return "Android";
  if (/iphone|ipad/i.test(ua)) return "iOS";
  if (/linux/i.test(ua)) return "Linux";
  return "Unknown";
}

function parseBrowser(ua: string): string {
  if (/edg\//i.test(ua)) return "Edge";
  if (/opr\//i.test(ua) || /opera/i.test(ua)) return "Opera";
  if (/chrome/i.test(ua) && !/chromium/i.test(ua)) return "Chrome";
  if (/firefox/i.test(ua)) return "Firefox";
  if (/safari/i.test(ua) && !/chrome/i.test(ua)) return "Safari";
  return "Unknown";
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const ip = getClientIp(req);
    const ipHash = hashIp(ip);
    const ua = req.headers.get("user-agent") || "";

    // Geo: Vercel/Cloudflare inject these headers
    const country =
      req.headers.get("x-vercel-ip-country") ||
      req.headers.get("cf-ipcountry") ||
      (typeof body.country === "string" ? body.country : "") ||
      "";
    const city =
      req.headers.get("x-vercel-ip-city") ||
      req.headers.get("cf-ipcity") ||
      "";
    const region =
      req.headers.get("x-vercel-ip-country-region") ||
      req.headers.get("cf-ipregion") ||
      "";

    const device  = parseDevice(ua);
    const os      = parseOS(ua);
    const browser = parseBrowser(ua);

    const referrer    = typeof body.referrer    === "string" ? body.referrer.slice(0, 500)    : null;
    const utmSource   = typeof body.utmSource   === "string" ? body.utmSource.slice(0, 200)   : null;
    const utmMedium   = typeof body.utmMedium   === "string" ? body.utmMedium.slice(0, 200)   : null;
    const utmCampaign = typeof body.utmCampaign === "string" ? body.utmCampaign.slice(0, 200) : null;
    const landingPath = typeof body.landingPath === "string" ? body.landingPath.slice(0, 500) : "/";
    const currentStep = typeof body.currentStep === "string" ? body.currentStep.slice(0, 100) : "S1_HOOK";
    const sessionId   = typeof body.sessionId   === "string" ? body.sessionId.slice(0, 200)   : null;
    const converted   = body.converted === true;

    // Upsert: one row per ipHash, update step + lastSeen on each call
    const existing = await prisma.visitor.findFirst({
      where: { ipHash },
      orderBy: { createdAt: "asc" },
    });

    if (existing) {
      await prisma.visitor.update({
        where: { id: existing.id },
        data: {
          lastSeenAt:  new Date(),
          currentStep,
          ...(sessionId && !existing.sessionId ? { sessionId } : {}),
          ...(converted && !existing.convertedAt ? { convertedAt: new Date() } : {}),
        },
      });
    } else {
      await prisma.visitor.create({
        data: {
          ipHash,
          sessionId,
          country,
          city,
          region,
          userAgent: ua || null,
          device,
          os,
          browser,
          referrer,
          utmSource,
          utmMedium,
          utmCampaign,
          landingPath,
          currentStep,
          ...(converted ? { convertedAt: new Date() } : {}),
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[analytics/track]", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
