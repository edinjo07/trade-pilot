import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import crypto from "crypto";

const Body = z.object({
  sessionId: z.string().min(6).max(128).optional(),
  userAgent: z.string().optional(),
  country: z.string().optional(),
});

function getClientIp(req: Request): string | null {
  const forwarded = req.headers.get("x-forwarded-for");
  const real = req.headers.get("x-real-ip");
  return forwarded?.split(",")[0]?.trim() || real || null;
}

function hashIp(ip: string | null): string | null {
  if (!ip) return null;
  return crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

/**
 * POST /api/session
 * Creates or acknowledges a FunnelSession
 * Returns sessionId for client tracking
 */
export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => null);
    if (!json) {
      return NextResponse.json({ ok: false, code: "BAD_JSON" }, { status: 400 });
    }

    const parsed = Body.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, code: "INVALID_BODY" }, { status: 400 });
    }

    const body = parsed.data;
    const sessionId = body.sessionId || crypto.randomUUID();
    const ip = getClientIp(req);
    const ipHash = hashIp(ip);
    const userAgent = body.userAgent || req.headers.get("user-agent") || null;
    const country = body.country || "CA";

    // Check if session exists
    const existing = await prisma.funnelSession.findUnique({
      where: { id: sessionId },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json({ ok: true, sessionId, existing: true });
    }

    // Create new session
    await prisma.funnelSession.create({
      data: {
        id: sessionId,
        country,
        userAgent,
        ipHash,
      },
    });

    // Log session_started event
    await prisma.funnelEvent.create({
      data: {
        sessionId,
        name: "session_started",
        payload: JSON.stringify({ ip: ipHash, country }),
      },
    });

    return NextResponse.json({ ok: true, sessionId, existing: false });
  } catch (e) {
    console.error("[POST /api/session] Error:", e);
    return NextResponse.json({ ok: false, code: "SERVER_ERROR" }, { status: 500 });
  }
}
