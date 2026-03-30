/**
 * GET /api/webhook/inbound/[slug]
 * POST /api/webhook/inbound/[slug]
 *
 * Inbound lead webhook - receives leads FROM external CRMs.
 *
 * Security:
 *  1. IP whitelist (global + per-integration)
 *  2. Optional secret key via ?key= or X-Webhook-Key header
 *
 * Behavior:
 *  - Creates an InboundLead record with the raw payload
 *  - If the integration has createLead=true or query ?create_lead=1, creates a Lead
 *  - Returns { ok: true, inboundLeadId } on success
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isIpAllowed, processInboundLead } from "@/lib/crmHub";

function getClientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

async function handle(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const clientIp = getClientIp(req);
  const { searchParams } = new URL(req.url);

  // Resolve integration by slug
  const integration = await prisma.crmIntegration.findUnique({
    where: { inboundSlug: slug },
    select: {
      id: true,
      name: true,
      active: true,
      inboundEnabled: true,
      inboundSecretKey: true,
      inboundIpWhitelist: true,
      inboundMethod: true,
      inboundFieldMapping: true,
    },
  });

  if (!integration) {
    return NextResponse.json({ ok: false, code: "NOT_FOUND" }, { status: 404 });
  }

  if (!integration.active || !integration.inboundEnabled) {
    return NextResponse.json({ ok: false, code: "INTEGRATION_DISABLED" }, { status: 403 });
  }

  // ── Method enforcement ──────────────────────────────────────────────────────
  const allowedMethod = (integration.inboundMethod || "POST").toUpperCase();
  const requestMethod = req.method.toUpperCase();
  if (
    allowedMethod !== "BOTH" &&
    allowedMethod !== "ANY" &&
    allowedMethod !== requestMethod
  ) {
    return NextResponse.json(
      { ok: false, code: "METHOD_NOT_ALLOWED" },
      { status: 405 }
    );
  }

  // ── IP Whitelist check ──────────────────────────────────────────────────────
  const inboundListJson = integration.inboundIpWhitelist;
  const ipOk = await isIpAllowed(clientIp, inboundListJson);
  if (!ipOk) {
    console.warn(`[INBOUND-WEBHOOK] IP blocked: ${clientIp} → slug:${slug}`);
    return NextResponse.json({ ok: false, code: "IP_FORBIDDEN" }, { status: 403 });
  }

  // ── Secret key verification ─────────────────────────────────────────────────
  if (integration.inboundSecretKey) {
    const providedKey =
      searchParams.get("key") ||
      req.headers.get("x-webhook-key") ||
      req.headers.get("x-api-key") ||
      req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
      "";

    if (providedKey !== integration.inboundSecretKey) {
      return NextResponse.json({ ok: false, code: "UNAUTHORIZED" }, { status: 401 });
    }
  }

  // ── Parse payload ───────────────────────────────────────────────────────────
  let rawPayload: Record<string, unknown> = {};
  const method = req.method.toUpperCase();

  if (method === "GET") {
    searchParams.forEach((v, k) => {
      if (!["key", "create_lead"].includes(k)) rawPayload[k] = v;
    });
  } else {
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      rawPayload = (await req.json().catch(() => null)) ?? {};
    } else if (
      contentType.includes("application/x-www-form-urlencoded") ||
      contentType.includes("multipart/form-data")
    ) {
      const formData = await req.formData().catch(() => null);
      if (formData) {
        formData.forEach((v, k) => {
          rawPayload[k] = v;
        });
      }
    } else {
      // Try JSON anyway
      rawPayload = (await req.json().catch(() => null)) ?? {};
    }
  }

  const createLead =
    searchParams.get("create_lead") === "1" ||
    searchParams.get("create_lead") === "true";

  // ── Process ─────────────────────────────────────────────────────────────────
  const result = await processInboundLead({
    integrationId: integration.id,
    rawPayload,
    sourceIp: clientIp,
    createLead,
  });

  if (result.error) {
    return NextResponse.json(
      { ok: false, code: "PROCESSING_ERROR", error: result.error, inboundLeadId: result.inboundLeadId },
      { status: 200 } // 200 so caller doesn't retry endlessly
    );
  }

  return NextResponse.json({
    ok: true,
    inboundLeadId: result.inboundLeadId,
    leadId: result.leadId || null,
  });
}

export async function GET(
  req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  return handle(req, ctx);
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  return handle(req, ctx);
}

export async function PUT(
  req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  return handle(req, ctx);
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  return handle(req, ctx);
}

export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  return handle(req, ctx);
}
