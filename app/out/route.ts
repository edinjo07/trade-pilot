// app/out/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const url = new URL(req.url);

  const leadId = url.searchParams.get("leadId");
  const clickId = url.searchParams.get("clickid") || url.searchParams.get("click_id");

  const sub1 = url.searchParams.get("sub1");
  const sub2 = url.searchParams.get("sub2");
  const sub3 = url.searchParams.get("sub3");
  const sub4 = url.searchParams.get("sub4");

  const offerKey = url.searchParams.get("offer"); // optional label for analytics
  const target = url.searchParams.get("to");

  const MIN_SCORE_FOR_OUT = 60;

  // HARD requirements for your schema
  if (!leadId || !clickId || !target) {
    return NextResponse.json(
      { ok: false, code: "MISSING_REQUIRED_PARAMS" },
      { status: 400 }
    );
  }

  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    select: { id: true, sessionId: true, qualityScore: true },
  });

  if (!lead) {
    return NextResponse.json({ ok: false, code: "LEAD_NOT_FOUND" }, { status: 404 });
  }

  if ((lead.qualityScore ?? 0) < MIN_SCORE_FOR_OUT) {
    return NextResponse.json({ ok: false, code: "LOW_QUALITY" }, { status: 403 });
  }

  const existingConversion = await prisma.conversion.findFirst({
    where: { click: { leadId } },
    select: { id: true },
  });

  if (existingConversion) {
    return NextResponse.json({ ok: false, code: "ALREADY_CONVERTED" }, { status: 409 });
  }

  // Validate redirect target
  let targetUrl: URL;
  try {
    targetUrl = new URL(target);
  } catch {
    return NextResponse.json({ ok: false, code: "BAD_TARGET_URL" }, { status: 400 });
  }

  // Allowlist for redirect domains (prevents abuse)
  const ALLOWED = [
    "YOUR_CPA_OFFER_URL_HERE",
    // Add your CPA network domains here, e.g.:
    // "track.yournetwork.com",
    // "offers.example.com",
  ];

  const host = targetUrl.hostname.toLowerCase();
  const ok = ALLOWED.some((d) => host === d || host.endsWith("." + d));
  if (!ok) {
    return NextResponse.json({ ok: false, code: "TO_NOT_ALLOWED" }, { status: 400 });
  }

  // Append clickId to CPA offer if not already present
  if (!targetUrl.searchParams.has("clickid")) {
    targetUrl.searchParams.set("clickid", clickId);
  }

  // Append subs (optional, CPA-safe)
  if (sub1 && !targetUrl.searchParams.has("sub1")) targetUrl.searchParams.set("sub1", sub1);
  if (sub2 && !targetUrl.searchParams.has("sub2")) targetUrl.searchParams.set("sub2", sub2);
  if (sub3 && !targetUrl.searchParams.has("sub3")) targetUrl.searchParams.set("sub3", sub3);
  if (sub4 && !targetUrl.searchParams.has("sub4")) targetUrl.searchParams.set("sub4", sub4);

  // 🔒 CLICK LOG (idempotent by clickId)
  try {
    await prisma.click.create({
      data: {
        clickId,
        leadId,
        sub1,
        sub2,
        sub3,
        sub4,
        offerKey: offerKey || null,
      },
    });
  } catch (e: any) {
    // Ignore duplicate clickId (idempotency)
    // Prisma error code P2002 = unique constraint failed
    if (e?.code !== "P2002") {
      console.error("Click create failed:", e);
    }
  }

  const existingEvent = await prisma.funnelEvent.findFirst({
    where: { sessionId: lead.sessionId, name: "click_attached" },
    select: { id: true },
  });

  if (!existingEvent) {
    await prisma.funnelEvent.create({
      data: {
        sessionId: lead.sessionId,
        name: "click_attached",
        payload: JSON.stringify({
          clickId,
          sub1,
          sub2,
          sub3,
          sub4,
          offerKey: offerKey || null,
        }),
      },
    });
  }

  return NextResponse.redirect(targetUrl.toString(), { status: 302 });
}
