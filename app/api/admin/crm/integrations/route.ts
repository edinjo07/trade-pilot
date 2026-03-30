import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/adminAuth";

export async function GET(req: Request) {
  const auth = await requireAdminSession(req);
  if (!auth.ok) return NextResponse.json({ ok: false, code: "UNAUTHORIZED" }, { status: 401 });

  const integrations = await prisma.crmIntegration.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { deliveries: true, inboundLeads: true } },
    },
  });

  const safe = integrations.map((i) => ({
    ...i,
    authValue: i.authValue ? "[REDACTED]" : "",
    inboundSecretKey: i.inboundSecretKey ? "[REDACTED]" : "",
  }));

  return NextResponse.json({ ok: true, integrations: safe });
}

export async function POST(req: Request) {
  const auth = await requireAdminSession(req);
  if (!auth.ok) return NextResponse.json({ ok: false, code: "UNAUTHORIZED" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ ok: false, code: "BAD_JSON" }, { status: 400 });

  const {
    name,
    platform = "custom",
    active = true,
    method = "POST",
    endpoint,
    authType = "bearer",
    authHeader = "Authorization",
    authValue = "",
    extraHeaders,
    fieldMapping,
    bodyTemplate,
    outboundIpNote,
    inboundEnabled = false,
    inboundSlug,
    inboundSecretKey,
    inboundIpWhitelist,
    inboundFieldMapping,
    inboundMethod = "POST",
  } = body;

  if (!name?.trim()) return NextResponse.json({ ok: false, code: "MISSING_NAME" }, { status: 400 });
  if (!endpoint?.trim()) return NextResponse.json({ ok: false, code: "MISSING_ENDPOINT" }, { status: 400 });

  if (inboundEnabled && inboundSlug) {
    const existing = await prisma.crmIntegration.findUnique({ where: { inboundSlug } });
    if (existing) return NextResponse.json({ ok: false, code: "SLUG_TAKEN" }, { status: 409 });
  }

  const integration = await prisma.crmIntegration.create({
    data: {
      name: name.trim(),
      platform,
      active,
      method: method.toUpperCase(),
      endpoint: endpoint.trim(),
      authType,
      authHeader,
      authValue,
      extraHeaders: extraHeaders || null,
      fieldMapping: fieldMapping || null,
      bodyTemplate: bodyTemplate || null,
      outboundIpNote: outboundIpNote || null,
      inboundEnabled,
      inboundSlug: inboundEnabled && inboundSlug ? inboundSlug.trim() : null,
      inboundSecretKey: inboundSecretKey || null,
      inboundIpWhitelist: inboundIpWhitelist || null,
      inboundFieldMapping: inboundFieldMapping || null,
      inboundMethod: inboundMethod.toUpperCase(),
    },
  });

  return NextResponse.json({ ok: true, integration: { ...integration, authValue: "••••••••" } }, { status: 201 });
}
