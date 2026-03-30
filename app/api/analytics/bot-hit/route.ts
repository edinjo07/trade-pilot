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

/**
 * POST /api/analytics/bot-hit
 * Records a bot visit into the Visitor table (isBot: true).
 * Called by the /platform page client component on mount.
 * De-duplicated per ipHash per day to avoid inflating counts on recursive crawlers.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const botType =
      typeof body.botType === "string" && body.botType.startsWith("Bot ")
        ? body.botType.slice(0, 100)
        : "Bot Unknown";

    const ip = getClientIp(req);
    const ipHash = hashIp(ip);
    const ua = req.headers.get("user-agent") || "";
    const country =
      req.headers.get("x-vercel-ip-country") ||
      req.headers.get("cf-ipcountry") ||
      "";

    // De-dupe: one record per ipHash per calendar day per botType
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existing = await prisma.visitor.findFirst({
      where: { ipHash, isBot: true, createdAt: { gte: dayAgo } },
      select: { id: true },
    });

    if (!existing) {
      await prisma.visitor.create({
        data: {
          ipHash,
          isBot: true,
          botType,
          country,
          userAgent: ua || null,
          device: "bot",
          os: "",
          browser: "",
          currentStep: "BOT",
          landingPath: "/platform",
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[analytics/bot-hit]", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
