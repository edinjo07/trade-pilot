import { prisma } from "@/lib/prisma";

function isCrmEnabled() {
  return (process.env.CRM_ENABLED || "").toLowerCase() === "true";
}

function getCrmConfig() {
  const url = process.env.CRM_URL || "";
  const apiKey = process.env.CRM_API_KEY || "";
  const timeoutMs = Number(process.env.CRM_TIMEOUT_MS || 8000);

  if (!url) throw new Error("CRM_URL missing");
  if (!apiKey) throw new Error("CRM_API_KEY missing");

  return { url, apiKey, timeoutMs };
}

export async function buildCrmPayload(leadId: string) {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: {
      clicks: { orderBy: { createdAt: "desc" }, take: 1 },
      session: true,
    },
  });

  if (!lead) throw new Error("Lead not found");

  const click = lead.clicks?.[0];

  // ✅ Map to a generic CRM payload structure.
  // Later you can change keys to match the real CRM.
  return {
    lead_id: lead.id,
    created_at: lead.createdAt.toISOString(),
    full_name: lead.fullName,
    email: lead.email,
    phone: lead.phone,
    country: lead.country,
    quality_score: lead.qualityScore,
    quality_tier: lead.qualityTier,

    // attribution (if you attached clicks)
    click_id: click?.clickId || null,
    offer_key: click?.offerKey || null,
    sub1: click?.sub1 || null,
    sub2: click?.sub2 || null,
    sub3: click?.sub3 || null,
    sub4: click?.sub4 || null,

    // optional funnel metadata
    funnel: {
      session_id: lead.sessionId,
    },
  };
}

export async function sendLeadToCrm(params: { leadId: string }) {
  if (!isCrmEnabled()) {
    return { ok: false, skipped: true, reason: "CRM_DISABLED" as const };
  }

  const { url, apiKey, timeoutMs } = getCrmConfig();

  // Upsert a job so sending is idempotent per lead
  const idempotencyKey = `crm:${params.leadId}`;

  const existingJob = await prisma.outboundCrmJob.findUnique({
    where: { idempotencyKey },
  });

  if (existingJob?.status === "SENT") {
    return { ok: true, alreadySent: true as const };
  }

  const payload = await buildCrmPayload(params.leadId);

  const job =
    existingJob ||
    (await prisma.outboundCrmJob.create({
      data: {
        leadId: params.leadId,
        idempotencyKey,
        payload: JSON.stringify(payload),
        status: "PENDING",
      },
    }));

  // attempt send
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);

  try {
    await prisma.outboundCrmJob.update({
      where: { id: job.id },
      data: { attempts: { increment: 1 }, lastAttemptAt: new Date() },
    });

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "authorization": `Bearer ${apiKey}`,
        "x-idempotency-key": idempotencyKey,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(t);

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      await prisma.outboundCrmJob.update({
        where: { id: job.id },
        data: {
          status: "FAILED",
          lastError: `HTTP ${res.status}: ${txt.slice(0, 500)}`,
        },
      });
      return { ok: false, skipped: false, error: `CRM_HTTP_${res.status}` as const };
    }

    await prisma.outboundCrmJob.update({
      where: { id: job.id },
      data: { status: "SENT", sentAt: new Date(), lastError: null },
    });

    return { ok: true };
  } catch (e: any) {
    clearTimeout(t);
    await prisma.outboundCrmJob.update({
      where: { id: job.id },
      data: { status: "FAILED", lastError: String(e?.message || e) },
    });
    return { ok: false, skipped: false, error: "CRM_NETWORK_ERROR" as const };
  }
}
