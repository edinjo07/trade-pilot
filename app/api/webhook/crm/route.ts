import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildLeadForCrm } from "@/lib/crmMapper";

function enabled() {
  return (process.env.CRM_ENABLED || "").toLowerCase() === "true";
}

function cfg() {
  const secret = process.env.CRM_WEBHOOK_KEY || "";
  const url = process.env.CRM_URL || "";
  const apiKey = process.env.CRM_API_KEY || "";
  const authMode = (process.env.CRM_AUTH_MODE || "bearer").toLowerCase(); // bearer | x-api-key | none
  const timeoutMs = Number(process.env.CRM_TIMEOUT_MS || 8000);

  if (!secret) throw new Error("CRM_WEBHOOK_KEY missing");
  if (!url) throw new Error("CRM_URL missing");
  return { secret, url, apiKey, authMode, timeoutMs };
}

function headersForCrm(idempotencyKey: string) {
  const apiKey = process.env.CRM_API_KEY || "";
  const authMode = (process.env.CRM_AUTH_MODE || "authorization").toLowerCase(); 
  // authorization | x-api-key | none

  const h: Record<string, string> = {
    "content-type": "application/json",
    "x-idempotency-key": idempotencyKey,
  };

  if (authMode === "authorization") {
    h["authorization"] = `Bearer ${apiKey}`;
  } else if (authMode === "x-api-key") {
    h["x-api-key"] = apiKey;     // some CRMs use this casing
    h["X-API-KEY"] = apiKey;     // some are strict; sending both is safe for most
  }

  return h;
}

async function postToCrm(url: string, payload: any, idempotencyKey: string) {
  const { timeoutMs } = cfg();
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: headersForCrm(idempotencyKey),
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const text = await res.text().catch(() => "");
    return { ok: res.ok, status: res.status, text: text.slice(0, 800) };
  } finally {
    clearTimeout(t);
  }
}

export async function GET(req: Request) {
  try {
    if (!enabled()) {
      return NextResponse.json({ ok: false, skipped: true, reason: "CRM_DISABLED" }, { status: 200 });
    }

    const { secret, url } = cfg();
    const { searchParams } = new URL(req.url);

    const leadId = String(searchParams.get("leadId") || "").trim();
    const key = String(searchParams.get("key") || "").trim();

    if (!leadId) return NextResponse.json({ ok: false, code: "MISSING_LEADID" }, { status: 400 });
    if (!key || key !== secret) return NextResponse.json({ ok: false, code: "UNAUTHORIZED" }, { status: 401 });

    const idempotencyKey = `crm:${leadId}`;

    const existing = await prisma.outboundCrmJob.findUnique({
      where: { idempotencyKey },
      select: { id: true, status: true },
    });

    if (existing?.status === "SENT") {
      return NextResponse.json({ ok: true, alreadySent: true }, { status: 200 });
    }

    const payload = await buildLeadForCrm(leadId);

    const job =
      existing ||
      (await prisma.outboundCrmJob.create({
        data: { leadId, idempotencyKey, payload: JSON.stringify(payload), status: "PENDING" },
        select: { id: true },
      }));

    await prisma.outboundCrmJob.update({
      where: { id: job.id },
      data: { attempts: { increment: 1 }, lastAttemptAt: new Date() },
    });

    const crmRes = await postToCrm(url, payload, idempotencyKey);

    if (!crmRes.ok) {
      await prisma.outboundCrmJob.update({
        where: { id: job.id },
        data: { status: "FAILED", lastError: `HTTP ${crmRes.status}: ${crmRes.text}` },
      });

      // 200 keeps the caller from hammering retries, but you still see failure
      return NextResponse.json({ ok: false, code: "CRM_FAILED", crm: crmRes }, { status: 200 });
    }

    await prisma.outboundCrmJob.update({
      where: { id: job.id },
      data: { status: "SENT", sentAt: new Date(), lastError: null },
    });

    return NextResponse.json({ ok: true, sent: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, code: "SERVER_ERROR", message: String(e?.message || e) }, { status: 500 });
  }
}
