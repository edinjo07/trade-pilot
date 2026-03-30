/**
 * POST /api/admin/crm/integrations/[id]/test
 * Sends a synthetic test payload to the CRM endpoint.
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/adminAuth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminSession(req);
  if (!auth.ok) return NextResponse.json({ ok: false, code: "UNAUTHORIZED" }, { status: 401 });

  const { id } = await params;

  const integration = await prisma.crmIntegration.findUnique({ where: { id } });
  if (!integration) return NextResponse.json({ ok: false, code: "NOT_FOUND" }, { status: 404 });

  // Build test payload - synthetic lead data
  const testLead = {
    id: "test-lead-000",
    firstName: "Test",
    lastName: "Lead",
    fullName: "Test Lead",
    email: "test@example.com",
    phone: "+1234567890",
    country: "US",
    qualityScore: 75,
    qualityTier: "warm",
    clickId: "test-click-001",
    sub1: "test",
    sub2: null,
    sub3: null,
    sub4: null,
    offerKey: null,
    sessionId: "test-session-000",
    createdAt: new Date(),
  };

  const method = integration.method.toUpperCase();

  // Build headers
  const headers: Record<string, string> = {
    "content-type": "application/json",
    "x-source": "tradepilot-crm-test",
    "x-idempotency-key": `test:${id}:${Date.now()}`,
  };

  // Auth
  if (integration.authType === "bearer" && integration.authValue) {
    headers[integration.authHeader || "Authorization"] = `Bearer ${integration.authValue}`;
  } else if (integration.authType === "apikey" && integration.authValue) {
    headers[integration.authHeader || "x-api-key"] = integration.authValue;
  } else if (integration.authType === "basic" && integration.authValue) {
    headers[integration.authHeader || "Authorization"] = `Basic ${Buffer.from(integration.authValue).toString("base64")}`;
  }

  // Extra headers
  if (integration.extraHeaders) {
    try {
      const extra: Array<{ key: string; value: string }> = JSON.parse(integration.extraHeaders);
      for (const h of extra) headers[h.key] = h.value;
    } catch {}
  }

  // Build payload
  let bodyStr: string | undefined;
  let url = integration.endpoint;

  if (method === "GET" || method === "DELETE") {
    const params = new URLSearchParams({
      first_name: "Test",
      last_name: "Lead",
      email: "test@example.com",
      phone: "+1234567890",
      country: "US",
      lead_id: "test-lead-000",
    });
    url = `${url}?${params}`;
  } else {
    bodyStr = integration.bodyTemplate
      ? integration.bodyTemplate
          .replace(/\{\{(\w+)\}\}/g, (_, k) => (testLead as any)[k] ?? "")
      : JSON.stringify({
          first_name: "Test",
          last_name: "Lead",
          email: "test@example.com",
          phone: "+1234567890",
          country: "US",
          lead_id: "test-lead-000",
        });
  }

  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(url, {
      method,
      headers,
      body: bodyStr,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const responseBody = await res.text().catch(() => "");
    const durationMs = Date.now() - start;

    return NextResponse.json({
      ok: res.ok,
      status: res.status,
      durationMs,
      responseBody: responseBody.slice(0, 1000),
      sentUrl: url,
      sentBody: bodyStr,
      sentHeaders: {
        ...headers,
        Authorization: headers.Authorization ? "••••••••" : undefined,
        "x-api-key": headers["x-api-key"] ? "••••••••" : undefined,
      },
    });
  } catch (e: any) {
    return NextResponse.json({
      ok: false,
      error: e?.name === "AbortError" ? "TIMEOUT" : String(e?.message || e),
      durationMs: Date.now() - start,
    });
  }
}
