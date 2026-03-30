import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/geo-check
 *
 * Called by BotGate (client-side) after the user passes the slider puzzle.
 * Reads the Vercel/CF country header from the incoming request and checks
 * against the admin-configured geo restriction rules.
 *
 * Returns: { allowed: boolean }
 * Fails open on any DB/network error so real users are never wrongly blocked.
 */
export async function GET(req: NextRequest) {
  try {
    const country = (
      req.headers.get("x-vercel-ip-country") ||
      req.headers.get("cf-ipcountry") ||
      ""
    ).toUpperCase().trim();

    // No country header (local dev, misconfigured CDN) → allow through
    if (!country) {
      return NextResponse.json({ allowed: true }, { headers: { "Cache-Control": "no-store" } });
    }

    const row = await prisma.geoConfig.findUnique({ where: { id: 1 } });
    const mode = row?.mode ?? "all";
    const countries = JSON.parse(row?.countries ?? "[]") as string[];

    if (mode === "all" || countries.length === 0) {
      return NextResponse.json({ allowed: true }, { headers: { "Cache-Control": "no-store" } });
    }

    const inList = countries.includes(country);
    const allowed =
      (mode === "whitelist" && inList) ||
      (mode === "blacklist" && !inList);

    return NextResponse.json({ allowed }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    // Fail open — never block a real user due to a DB error
    return NextResponse.json({ allowed: true }, { headers: { "Cache-Control": "no-store" } });
  }
}
