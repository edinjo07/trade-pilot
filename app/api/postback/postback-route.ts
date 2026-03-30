import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function normStatus(s: string) {
  const v = (s || "").trim().toLowerCase();
  if (["ftd", "converted", "conversion", "deposit"].includes(v)) return "converted";
  if (["reject", "rejected", "declined"].includes(v)) return "rejected";
  if (!v) return "pending";
  return v;
}

function buildConversionKey(input: {
  clickId: string;
  status: string;
  txid?: string | null;
  payout?: number | null;
}) {
  // If the network doesn't send a conversionKey, we derive a stable one.
  // Not perfect, but idempotent for typical cases.
  return `cv:${input.clickId}:${input.status}:${input.txid || "na"}:${input.payout ?? "na"}`;
}

async function handlePostback(raw: any) {
  const clickId = String(raw.clickId || raw.clickid || raw.click_id || raw.cid || raw.aff_click_id || "").trim();
  const status = normStatus(String(raw.status || raw.event || raw.conversion_status || "pending"));
  const payout = raw.payout != null ? Number(raw.payout) : raw.amount != null ? Number(raw.amount) : null;
  const currency = raw.currency ? String(raw.currency) : null;
  const txid = raw.txid ? String(raw.txid) : raw.transaction_id ? String(raw.transaction_id) : null;

  if (!clickId) {
    return NextResponse.json({ ok: false, code: "MISSING_CLICKID" }, { status: 400 });
  }

  // Find Click by clickId
  const click = await prisma.click.findUnique({
    where: { clickId },
    select: { id: true, leadId: true, lead: { select: { sessionId: true } } },
  });

  // ORPHAN HANDLING: clickId not found
  if (!click) {
    console.warn(`[POSTBACK] Orphan clickId: ${clickId} - no matching click found`);
    return NextResponse.json(
      { ok: true, code: "ORPHAN_CLICKID", message: "No click found, logged for review" },
      { status: 200 }
    );
  }

  const conversionKey = String(raw.conversionKey || raw.conversion_key || raw.key || "").trim()
    || buildConversionKey({ clickId, status, txid, payout });

  // Log postback event to FunnelEvent (optional but useful)
  try {
    await prisma.funnelEvent.create({
      data: {
        sessionId: click.lead.sessionId,
        name: "postback_received",
        payload: JSON.stringify({ status, payout, currency, txid, clickId }),
      },
    });
  } catch {
    // Non-critical - don't fail if event logging fails
  }

  // Idempotent conversion insert
  try {
    await prisma.conversion.create({
      data: {
        clickId,
        conversionKey,
        status,
        payout,
        currency,
        txid,
        raw: typeof raw === "string" ? raw : JSON.stringify(raw),
        receivedAt: new Date(),
      },
    });
  } catch (e: any) {
    // Prisma unique constraint -> already exists
    // We treat as success to keep postbacks idempotent
  }

  // Optional: log on session for analytics/debug
  const sessionId = click.lead?.sessionId;
  if (sessionId) {
    await prisma.funnelEvent.create({
      data: {
        sessionId,
        name: "postback_received",
        payload: JSON.stringify({ clickId, status, payout, currency, txid, conversionKey }),
      },
    });
  }

  return NextResponse.json({ ok: true, clickId, status, conversionKey });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ ok: false, code: "BAD_JSON" }, { status: 400 });
  return handlePostback(body);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const raw: Record<string, string> = {};
  searchParams.forEach((v, k) => (raw[k] = v));
  return handlePostback(raw);
}

