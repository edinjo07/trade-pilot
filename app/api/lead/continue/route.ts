import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";

function tierFromScore(score: number) {
  if (score >= 80) return "hot";
  if (score >= 55) return "warm";
  return "cold";
}

const CONTINUE_SCORE_THRESHOLD = 60;

export async function POST(req: Request) {
  const rl = await rateLimit({ req, route: "/api/lead/continue", limit: 60, windowSec: 60 });
  if (!rl.ok) return NextResponse.json({ ok: false, code: "RATE_LIMIT" }, { status: 429 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ ok: false, code: "BAD_JSON" }, { status: 400 });

  const leadId = body.leadId ? String(body.leadId).trim() : "";
  const sessionIdDirect = body.sessionId ? String(body.sessionId).trim() : "";

  let sessionId = sessionIdDirect;

  if (!sessionId && leadId) {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      select: { sessionId: true },
    });
    sessionId = lead?.sessionId || "";
  }

  if (!sessionId) {
    return NextResponse.json(
      { ok: false, code: "MISSING_SESSION", message: "Provide sessionId or leadId." },
      { status: 400 }
    );
  }

  // Idempotent: don't create duplicate continue events
  const existing = await prisma.funnelEvent.findFirst({
    where: { sessionId, name: "continue_clicked" },
    select: { id: true },
  });

  if (!existing) {
    await prisma.funnelEvent.create({
      data: {
        sessionId,
        name: "continue_clicked",
        payload: JSON.stringify({ ts: new Date().toISOString() }),
      },
    });
  }

  // Bump lead quality if lead exists
  const lead = await prisma.lead.findUnique({
    where: { sessionId },
    select: { id: true, qualityScore: true },
  });

  let qualityScore: number | null = lead?.qualityScore ?? null;
  let qualityTier: string | null = lead ? tierFromScore(lead.qualityScore) : null;

  if (lead) {
    const newScore = Math.min(100, lead.qualityScore + 20);
    qualityScore = newScore;
    qualityTier = tierFromScore(newScore);

    await prisma.lead.update({
      where: { id: lead.id },
      data: { qualityScore: newScore, qualityTier },
    });
  }

  const allowContinue = typeof qualityScore === "number" ? qualityScore >= CONTINUE_SCORE_THRESHOLD : false;

  return NextResponse.json({
    ok: true,
    sessionId,
    already: !!existing,
    qualityScore,
    qualityTier,
    allowContinue,
  });
}
