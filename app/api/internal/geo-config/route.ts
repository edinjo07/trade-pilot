import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/internal/geo-config
 *
 * Lightweight endpoint called by the Edge Middleware to read geo restriction
 * settings from the database. Cached for 60 seconds at the CDN and Next.js
 * fetch cache layer so the middleware's own module-level cache is just a backup.
 *
 * NOT auth-protected — only returns the public mode + country list,
 * never admin credentials or private data.
 */
export async function GET() {
  try {
    const row = await prisma.geoConfig.findUnique({ where: { id: 1 } });
    const payload = {
      mode:      row?.mode      ?? "all",
      countries: JSON.parse(row?.countries ?? "[]") as string[],
    };
    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch {
    // On DB error, fail open (allow all) to avoid blocking real users
    return NextResponse.json({ mode: "all", countries: [] }, {
      headers: { "Cache-Control": "no-store" },
    });
  }
}
