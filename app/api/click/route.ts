import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: Request) {
  const rl = await rateLimit({ req, route: "/api/click", limit: 60, windowSec: 60 });
  if (!rl.ok) return NextResponse.json({ ok: false, code: "RATE_LIMIT" }, { status: 429 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ ok: false, code: "BAD_JSON" }, { status: 400 });

  const leadId = String(body.leadId || "").trim();
  const clickId = String(body.clickId || "").trim();

  if (!leadId) return NextResponse.json({ ok: false, code: "MISSING_LEADID" }, { status: 400 });
  if (!clickId) return NextResponse.json({ ok: false, code: "MISSING_CLICKID" }, { status: 400 });

  const lead = await prisma.lead.findUnique({ where: { id: leadId }, select: { id: true, sessionId: true } });
  if (!lead) return NextResponse.json({ ok: false, code: "LEAD_NOT_FOUND" }, { status: 404 });

  const data = {
    clickId,
    leadId,
    sub1: body.sub1 ? String(body.sub1) : null,
    sub2: body.sub2 ? String(body.sub2) : null,
    sub3: body.sub3 ? String(body.sub3) : null,
    sub4: body.sub4 ? String(body.sub4) : null,
    offerKey: body.offerKey ? String(body.offerKey) : null,
  };

  // Upsert by clickId (unique)
  const click = await prisma.click.upsert({
    where: { clickId },
    create: data,
    update: {
      // keep leadId stable; if clickId already exists, don't reassign attribution
      sub1: data.sub1,
      sub2: data.sub2,
      sub3: data.sub3,
      sub4: data.sub4,
      offerKey: data.offerKey,
    },
    select: { id: true, clickId: true },
  });

  await prisma.funnelEvent.create({
    data: {
      sessionId: lead.sessionId,
      name: "click_attached",
      payload: JSON.stringify({ leadId, clickId, offerKey: data.offerKey }),
    },
  });

  return NextResponse.json({ ok: true, clickId: click.clickId });
}
