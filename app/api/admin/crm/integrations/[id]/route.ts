import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/adminAuth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminSession(req);
  if (!auth.ok) return NextResponse.json({ ok: false, code: "UNAUTHORIZED" }, { status: 401 });

  const { id } = await params;
  const integration = await prisma.crmIntegration.findUnique({
    where: { id },
    include: {
      _count: { select: { deliveries: true, inboundLeads: true } },
    },
  });

  if (!integration) return NextResponse.json({ ok: false, code: "NOT_FOUND" }, { status: 404 });

  return NextResponse.json({
    ok: true,
    integration: {
      ...integration,
      authValue: integration.authValue ? "[REDACTED]" : "",
      inboundSecretKey: integration.inboundSecretKey ? "[REDACTED]" : "",
    },
  });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminSession(req);
  if (!auth.ok) return NextResponse.json({ ok: false, code: "UNAUTHORIZED" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ ok: false, code: "BAD_JSON" }, { status: 400 });

  const existing = await prisma.crmIntegration.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ ok: false, code: "NOT_FOUND" }, { status: 404 });

  // Don't overwrite masked values
  const authValue =
    body.authValue && body.authValue !== "••••••••"
      ? body.authValue
      : existing.authValue;

  const inboundSecretKey =
    body.inboundSecretKey && body.inboundSecretKey !== "••••••••"
      ? body.inboundSecretKey
      : existing.inboundSecretKey;

  // Check slug uniqueness if changed
  if (
    body.inboundEnabled &&
    body.inboundSlug &&
    body.inboundSlug !== existing.inboundSlug
  ) {
    const taken = await prisma.crmIntegration.findUnique({
      where: { inboundSlug: body.inboundSlug },
    });
    if (taken && taken.id !== id) {
      return NextResponse.json({ ok: false, code: "SLUG_TAKEN" }, { status: 409 });
    }
  }

  const updated = await prisma.crmIntegration.update({
    where: { id },
    data: {
      name: body.name?.trim() ?? existing.name,
      platform: body.platform ?? existing.platform,
      active: body.active ?? existing.active,
      method: body.method ? body.method.toUpperCase() : existing.method,
      endpoint: body.endpoint?.trim() ?? existing.endpoint,
      authType: body.authType ?? existing.authType,
      authHeader: body.authHeader ?? existing.authHeader,
      authValue,
      extraHeaders: "extraHeaders" in body ? body.extraHeaders : existing.extraHeaders,
      fieldMapping: "fieldMapping" in body ? body.fieldMapping : existing.fieldMapping,
      bodyTemplate: "bodyTemplate" in body ? body.bodyTemplate : existing.bodyTemplate,
      outboundIpNote: "outboundIpNote" in body ? body.outboundIpNote : existing.outboundIpNote,
      inboundEnabled: body.inboundEnabled ?? existing.inboundEnabled,
      inboundSlug:
        body.inboundEnabled && body.inboundSlug
          ? body.inboundSlug.trim()
          : existing.inboundSlug,
      inboundSecretKey,
      inboundIpWhitelist:
        "inboundIpWhitelist" in body
          ? body.inboundIpWhitelist
          : existing.inboundIpWhitelist,
      inboundFieldMapping:
        "inboundFieldMapping" in body
          ? body.inboundFieldMapping
          : existing.inboundFieldMapping,
      inboundMethod: body.inboundMethod
        ? body.inboundMethod.toUpperCase()
        : existing.inboundMethod,
    },
  });

  return NextResponse.json({
    ok: true,
    integration: { ...updated, authValue: "[REDACTED]", inboundSecretKey: "[REDACTED]" },
  });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminSession(req);
  if (!auth.ok) return NextResponse.json({ ok: false, code: "UNAUTHORIZED" }, { status: 401 });

  const { id } = await params;

  const existing = await prisma.crmIntegration.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ ok: false, code: "NOT_FOUND" }, { status: 404 });

  await prisma.crmIntegration.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
