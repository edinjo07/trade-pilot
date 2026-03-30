/**
 * CRM Hub - multi-integration outbound + inbound lead management.
 *
 * Outbound: push leads to external CRMs on creation.
 * Inbound:  receive leads from external CRMs via webhook.
 * IP check: validate source IPs against a whitelist or per-integration list.
 */

import { prisma } from "@/lib/prisma";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface LeadData {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  qualityScore: number | null;
  qualityTier: string | null;
  clickId?: string | null;
  sub1?: string | null;
  sub2?: string | null;
  sub3?: string | null;
  sub4?: string | null;
  offerKey?: string | null;
  sessionId?: string | null;
  createdAt: Date;
}

export interface DeliveryResult {
  deliveryId: string;
  integrationId: string;
  integrationName: string;
  status: "SENT" | "FAILED";
  responseStatus?: number | null;
  durationMs?: number;
  error?: string;
}

// ─── Field-mapping template engine ─────────────────────────────────────────

/**
 * Resolve {{variable}} placeholders in a string using lead data.
 */
function interpolate(template: string, lead: LeadData): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const val = (lead as any)[key];
    return val != null ? String(val) : "";
  });
}

/**
 * Build a request payload/params object from a JSON field-mapping config.
 *
 * fieldMapping (JSON string): { "their_key": "{{ourField}}" | "literal value" }
 * If fieldMapping is null/empty, falls back to default payload.
 */
function buildMappedPayload(
  fieldMappingJson: string | null | undefined,
  lead: LeadData
): Record<string, string> {
  if (!fieldMappingJson) {
    // Default payload - sensible defaults for most CRMs
    return {
      first_name: lead.firstName || lead.fullName.split(" ")[0] || "",
      last_name:
        lead.lastName ||
        lead.fullName.split(" ").slice(1).join(" ") || "",
      email: lead.email,
      phone: lead.phone,
      country: lead.country,
      lead_id: lead.id,
    };
  }

  let map: Record<string, string>;
  try {
    map = JSON.parse(fieldMappingJson);
  } catch {
    return {};
  }

  const result: Record<string, string> = {};
  for (const [key, tpl] of Object.entries(map)) {
    result[key] = interpolate(String(tpl), lead);
  }
  return result;
}

/**
 * Build body/url for a body-template override (raw interpolated JSON).
 */
function buildBodyTemplate(
  bodyTemplateJson: string | null | undefined,
  lead: LeadData
): string | null {
  if (!bodyTemplateJson) return null;
  return interpolate(bodyTemplateJson, lead);
}

// ─── Auth header builder ────────────────────────────────────────────────────

function buildAuthHeaders(
  authType: string,
  authHeader: string,
  authValue: string
): Record<string, string> {
  if (authType === "none" || !authValue) return {};
  if (authType === "bearer")
    return { [authHeader || "Authorization"]: `Bearer ${authValue}` };
  if (authType === "apikey")
    return {
      [authHeader || "x-api-key"]: authValue,
      "X-API-KEY": authValue,
    };
  if (authType === "basic") {
    // authValue expected to be "username:password" base64
    return {
      [authHeader || "Authorization"]: `Basic ${Buffer.from(authValue).toString("base64")}`,
    };
  }
  // custom / raw header
  return { [authHeader]: authValue };
}

// ─── Extra header builder ───────────────────────────────────────────────────

function buildExtraHeaders(
  extraHeadersJson: string | null | undefined
): Record<string, string> {
  if (!extraHeadersJson) return {};
  try {
    const arr: Array<{ key: string; value: string }> =
      JSON.parse(extraHeadersJson);
    return Object.fromEntries(arr.map((h) => [h.key, h.value]));
  } catch {
    return {};
  }
}

// ─── Fetch lead data ────────────────────────────────────────────────────────

export async function fetchLeadData(leadId: string): Promise<LeadData | null> {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: {
      clicks: { orderBy: { createdAt: "desc" }, take: 1 },
      session: { select: { id: true } },
    },
  });

  if (!lead) return null;

  const click = lead.clicks?.[0];

  return {
    id: lead.id,
    fullName: lead.fullName,
    firstName: lead.firstName || lead.fullName.split(" ")[0] || "",
    lastName:
      lead.lastName || lead.fullName.split(" ").slice(1).join(" ") || "",
    email: lead.email,
    phone: lead.phone,
    country: lead.country,
    qualityScore: lead.qualityScore,
    qualityTier: lead.qualityTier,
    clickId: click?.clickId || null,
    sub1: click?.sub1 || null,
    sub2: click?.sub2 || null,
    sub3: click?.sub3 || null,
    sub4: click?.sub4 || null,
    offerKey: click?.offerKey || null,
    sessionId: lead.session?.id || null,
    createdAt: lead.createdAt,
  };
}

// ─── Deliver to a single integration ───────────────────────────────────────

async function deliverToIntegration(
  integration: {
    id: string;
    name: string;
    method: string;
    endpoint: string;
    authType: string;
    authHeader: string;
    authValue: string;
    extraHeaders: string | null;
    fieldMapping: string | null;
    bodyTemplate: string | null;
  },
  lead: LeadData
): Promise<DeliveryResult> {
  const method = integration.method.toUpperCase();

  const mapped = buildMappedPayload(integration.fieldMapping, lead);
  const bodyTpl = buildBodyTemplate(integration.bodyTemplate, lead);

  const authHeaders = buildAuthHeaders(
    integration.authType,
    integration.authHeader,
    integration.authValue
  );
  const extra = buildExtraHeaders(integration.extraHeaders);

  let url = integration.endpoint;
  let requestBody: string | undefined;
  let contentTypeHeader: Record<string, string> = {};

  if (method === "GET" || method === "DELETE") {
    const qs = new URLSearchParams(mapped).toString();
    url = qs ? `${url}?${qs}` : url;
  } else {
    // POST / PUT / PATCH
    requestBody = bodyTpl || JSON.stringify(mapped);
    contentTypeHeader = { "content-type": "application/json" };
  }

  const headers: Record<string, string> = {
    ...contentTypeHeader,
    ...authHeaders,
    ...extra,
    "x-source": "tradepilot-crm",
  };

  // Idempotency based on integration + lead
  const idemKey = `crm-hub:${integration.id}:${lead.id}`;
  if (method === "POST") {
    headers["x-idempotency-key"] = idemKey;
  }

  // Create PENDING delivery record
  const delivery = await prisma.crmDelivery.create({
    data: {
      integrationId: integration.id,
      leadId: lead.id,
      status: "PENDING",
      requestUrl: url,
      requestMethod: method,
      requestHeaders: JSON.stringify(headers),
      requestBody: requestBody || null,
    },
  });

  const start = Date.now();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(url, {
      method,
      headers,
      body: requestBody,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const durationMs = Date.now() - start;
    const responseBody = await res.text().catch(() => "");

    if (!res.ok) {
      await prisma.crmDelivery.update({
        where: { id: delivery.id },
        data: {
          status: "FAILED",
          responseStatus: res.status,
          responseBody: responseBody.slice(0, 2000),
          durationMs,
          lastError: `HTTP ${res.status}`,
        },
      });

      return {
        deliveryId: delivery.id,
        integrationId: integration.id,
        integrationName: integration.name,
        status: "FAILED",
        responseStatus: res.status,
        durationMs,
        error: `HTTP ${res.status}`,
      };
    }

    await prisma.crmDelivery.update({
      where: { id: delivery.id },
      data: {
        status: "SENT",
        responseStatus: res.status,
        responseBody: responseBody.slice(0, 2000),
        durationMs,
        lastError: null,
      },
    });

    return {
      deliveryId: delivery.id,
      integrationId: integration.id,
      integrationName: integration.name,
      status: "SENT",
      responseStatus: res.status,
      durationMs,
    };
  } catch (e: any) {
    const durationMs = Date.now() - start;
    const errMsg =
      e?.name === "AbortError" ? "TIMEOUT" : String(e?.message || e);

    await prisma.crmDelivery.update({
      where: { id: delivery.id },
      data: {
        status: "FAILED",
        durationMs,
        lastError: errMsg,
      },
    });

    return {
      deliveryId: delivery.id,
      integrationId: integration.id,
      integrationName: integration.name,
      status: "FAILED",
      durationMs,
      error: errMsg,
    };
  }
}

// ─── Push lead to ALL active outbound integrations ─────────────────────────

export async function pushLeadToAllIntegrations(
  leadId: string
): Promise<DeliveryResult[]> {
  const lead = await fetchLeadData(leadId);
  if (!lead) {
    console.warn(`[CRM-HUB] Lead not found: ${leadId}`);
    return [];
  }

  const integrations = await prisma.crmIntegration.findMany({
    where: { active: true },
    select: {
      id: true,
      name: true,
      method: true,
      endpoint: true,
      authType: true,
      authHeader: true,
      authValue: true,
      extraHeaders: true,
      fieldMapping: true,
      bodyTemplate: true,
    },
  });

  if (integrations.length === 0) {
    return [];
  }

  // Check against existing deliveries to avoid double-sends (idempotent)
  const existingDeliveries = await prisma.crmDelivery.findMany({
    where: {
      leadId,
      integrationId: { in: integrations.map((i) => i.id) },
      status: "SENT",
    },
    select: { integrationId: true },
  });

  const alreadySentIds = new Set(existingDeliveries.map((d) => d.integrationId));

  const pending = integrations.filter((i) => !alreadySentIds.has(i.id));

  if (pending.length === 0) return [];

  // Fire all deliveries concurrently
  const results = await Promise.all(
    pending.map((integration) => deliverToIntegration(integration, lead))
  );

  return results;
}

// ─── Push lead to ONE specific integration ─────────────────────────────────

export async function pushLeadToIntegration(
  leadId: string,
  integrationId: string,
  { force = false }: { force?: boolean } = {}
): Promise<DeliveryResult> {
  const lead = await fetchLeadData(leadId);
  if (!lead) throw new Error(`Lead not found: ${leadId}`);

  const integration = await prisma.crmIntegration.findUnique({
    where: { id: integrationId },
    select: {
      id: true,
      name: true,
      method: true,
      endpoint: true,
      authType: true,
      authHeader: true,
      authValue: true,
      extraHeaders: true,
      fieldMapping: true,
      bodyTemplate: true,
    },
  });

  if (!integration) throw new Error(`Integration not found: ${integrationId}`);

  if (!force) {
    const already = await prisma.crmDelivery.findFirst({
      where: { leadId, integrationId, status: "SENT" },
    });
    if (already) {
      return {
        deliveryId: already.id,
        integrationId,
        integrationName: integration.name,
        status: "SENT",
      };
    }
  }

  return deliverToIntegration(integration, lead);
}

// ─── IP Whitelist helpers ──────────────────────────────────────────────────

/** Check if an IP is in the global whitelist or an optional extra list. */
export async function isIpAllowed(
  ip: string,
  extraListJson?: string | null
): Promise<boolean> {
  // Check global whitelist
  const globalEntries = await prisma.ipWhitelistEntry.findMany({
    where: { active: true },
    select: { ip: true },
  });

  const allAllowed = new Set([
    ...globalEntries.map((e) => e.ip),
    ...(extraListJson ? safeParseArray(extraListJson) : []),
  ]);

  if (allAllowed.size === 0) return true; // empty whitelist = allow all

  return ipMatchesAny(ip, [...allAllowed]);
}

function safeParseArray(json: string): string[] {
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}

function ipMatchesAny(ip: string, list: string[]): boolean {
  for (const entry of list) {
    if (entry === ip) return true;
    if (entry.includes("/") && ipInCidr(ip, entry)) return true;
  }
  return false;
}

function ipInCidr(ip: string, cidr: string): boolean {
  try {
    const [range, bits] = cidr.split("/");
    const mask = ~(2 ** (32 - parseInt(bits, 10)) - 1) >>> 0;
    const ipNum = ipToNum(ip);
    const rangeNum = ipToNum(range);
    return (ipNum & mask) === (rangeNum & mask);
  } catch {
    return false;
  }
}

function ipToNum(ip: string): number {
  return ip
    .split(".")
    .reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}

// ─── Inbound lead processing ────────────────────────────────────────────────

/**
 * Process a lead received from an external CRM.
 * Maps their fields → our Lead model fields and optionally creates a Lead.
 */
export async function processInboundLead(params: {
  integrationId: string;
  rawPayload: Record<string, unknown>;
  sourceIp?: string;
  createLead?: boolean;
}): Promise<{ inboundLeadId: string; leadId?: string; error?: string }> {
  const integration = await prisma.crmIntegration.findUnique({
    where: { id: params.integrationId },
    select: { inboundFieldMapping: true },
  });

  let mappedData: Record<string, string> = {};

  if (integration?.inboundFieldMapping) {
    try {
      const map: Record<string, string> = JSON.parse(
        integration.inboundFieldMapping
      );
      // map: { "ourField": "theirField" }
      for (const [ourField, theirField] of Object.entries(map)) {
        const val = params.rawPayload[theirField];
        if (val != null) mappedData[ourField] = String(val);
      }
    } catch {
      // malformed mapping, use raw
      mappedData = Object.fromEntries(
        Object.entries(params.rawPayload).map(([k, v]) => [k, String(v ?? "")])
      );
    }
  } else {
    // Default: try common field names
    const raw = params.rawPayload;
    mappedData = {
      fullName:
        String(
          raw.fullName ||
            raw.full_name ||
            `${raw.firstName || raw.first_name || ""} ${raw.lastName || raw.last_name || ""}`.trim() ||
            raw.name ||
            ""
        ),
      email: String(raw.email || raw.Email || ""),
      phone: String(raw.phone || raw.Phone || raw.mobile || ""),
      country: String(raw.country || raw.Country || ""),
    };
  }

  const record = await prisma.inboundLead.create({
    data: {
      integrationId: params.integrationId,
      sourceIp: params.sourceIp || null,
      rawPayload: JSON.stringify(params.rawPayload),
      mappedData: JSON.stringify(mappedData),
      status: "RECEIVED",
    },
  });

  // Optionally create a real Lead
  if (params.createLead && mappedData.email && mappedData.fullName) {
    try {
      // Create a synthetic session
      const session = await prisma.funnelSession.create({
        data: { country: mappedData.country || "CA" },
      });

      const nameParts = mappedData.fullName.trim().split(/\s+/);
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      const lead = await prisma.lead.create({
        data: {
          fullName: mappedData.fullName,
          firstName,
          lastName,
          email: mappedData.email,
          phone: mappedData.phone || "",
          country: mappedData.country || "CA",
          sessionId: session.id,
          notes: `Inbound from integration ${params.integrationId}`,
        },
      });

      await prisma.inboundLead.update({
        where: { id: record.id },
        data: { createdLeadId: lead.id, status: "PROCESSED" },
      });

      return { inboundLeadId: record.id, leadId: lead.id };
    } catch (e: any) {
      await prisma.inboundLead.update({
        where: { id: record.id },
        data: { status: "ERROR", error: String(e?.message || e) },
      });
      return { inboundLeadId: record.id, error: String(e?.message || e) };
    }
  }

  return { inboundLeadId: record.id };
}

// ─── Utility: get our server's outbound IP ─────────────────────────────────

export async function getOutboundIp(): Promise<string> {
  try {
    const res = await fetch("https://api.ipify.org?format=json", {
      signal: AbortSignal.timeout(4000),
    });
    const j = await res.json();
    return j.ip || "unknown";
  } catch {
    return "unknown";
  }
}
