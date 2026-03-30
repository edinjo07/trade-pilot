import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";

const ALLOWED_KEYS = new Set([
  "entryChoice",
  "mirrorCount",
  "frameChoice",
  "simAction",
  "simTimeTakenMs",
  "quizQuestionsCount",
  "avoidanceType",
  "responsibilityScore",
]);

export async function POST(req: Request) {
  const rl = await rateLimit({ req, route: "/api/session/update", limit: 60, windowSec: 60 });
  if (!rl.ok) return NextResponse.json({ ok: false, code: "RATE_LIMIT" }, { status: 429 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ ok: false, code: "BAD_JSON" }, { status: 400 });

  const sessionId = String(body.sessionId || "").trim();
  if (!sessionId) return NextResponse.json({ ok: false, code: "MISSING_SESSIONID" }, { status: 400 });

  const patch: any = {};
  for (const [k, v] of Object.entries(body.patch || {})) {
    if (ALLOWED_KEYS.has(k)) patch[k] = v;
  }

  const updated = await prisma.funnelSession.update({
    where: { id: sessionId },
    data: patch,
    select: { id: true },
  }).catch(() => null);

  if (!updated) return NextResponse.json({ ok: false, code: "SESSION_NOT_FOUND" }, { status: 404 });

  await prisma.funnelEvent.create({
    data: {
      sessionId,
      name: "session_updated",
      payload: JSON.stringify({ patch }),
    },
  });

  return NextResponse.json({ ok: true, sessionId });
}
