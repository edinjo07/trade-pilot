import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";
import { sendLeadToCrm } from "@/lib/crm";

export const runtime = "nodejs";

type Body = { leadId?: string };

function jsonError(status: number, error: string) {
  return NextResponse.json({ ok: false, error }, { status });
}

function buildConversionKey(input: { clickId: string; leadId: string }) {
  return `client:${input.clickId}:${input.leadId}`;
}

function buildPostbackUrl(template: string, vars: Record<string, string>) {
  let url = template;
  for (const [k, v] of Object.entries(vars)) {
    url = url.replaceAll(`{${k}}`, encodeURIComponent(v ?? ""));
  }
  return url;
}

export async function POST(req: Request) {
  const rl = await rateLimit({ req, route: "/api/convert", limit: 30, windowSec: 60 });
  if (!rl.ok) return NextResponse.json({ ok: false, code: "RATE_LIMIT" }, { status: 429 });

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return jsonError(400, "Invalid JSON body.");
  }

  const leadId = (body.leadId || "").trim();
  if (!leadId) return jsonError(400, "Missing leadId.");

  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: { clicks: { orderBy: { createdAt: "desc" }, take: 1 }, session: true },
  });

  if (!lead) return jsonError(404, "Lead not found.");

  const minScore = Number.parseInt(process.env.CONVERT_MIN_SCORE || "0", 10) || 0;
  if (minScore > 0 && (lead.qualityScore ?? 0) < minScore) {
    return jsonError(403, "Lead not eligible for conversion.");
  }

  const click = lead.clicks?.[0];
  if (!click) return jsonError(409, "Missing clickId for this lead.");

  const conversionKey = buildConversionKey({ clickId: click.clickId, leadId });

  let lockCreated = false;

  try {
    await prisma.$transaction(async (tx) => {
      const existing = await tx.conversion.findUnique({
        where: { conversionKey },
        select: { id: true, status: true },
      });

      if (existing) return;

      await tx.conversion.create({
        data: {
          clickId: click.clickId,
          status: "locked",
          conversionKey,
          raw: JSON.stringify({ source: "client", leadId, clickId: click.clickId, lockedAt: new Date() }),
        },
      });

      lockCreated = true;
    });
  } catch {
    lockCreated = false;
  }

  const conversion = await prisma.conversion.findUnique({
    where: { conversionKey },
    select: { id: true, status: true, raw: true },
  });

  if (!conversion) return jsonError(500, "Conversion lock missing.");
  if (conversion.status === "posted" || conversion.status === "converted") {
    return NextResponse.json({ ok: true, alreadyConverted: true });
  }

  const template = process.env.CPA_POSTBACK_URL_TEMPLATE || "";
  const postbackUrl = template
    ? buildPostbackUrl(template, {
        click_id: click.clickId,
        sub_id: click.sub1 || "",
      })
    : null;

  try {
    if (!postbackUrl) {
      await prisma.conversion.update({
        where: { conversionKey },
        data: {
          status: "posted",
          raw: JSON.stringify({
            source: "client",
            leadId,
            clickId: click.clickId,
            postbackUrl: null,
            postbackCode: null,
            postbackBody: null,
            lockedCreated: lockCreated,
            skippedPostback: true,
          }),
        },
      });

      if (lead.sessionId) {
        await prisma.funnelEvent
          .create({
            data: {
              sessionId: lead.sessionId,
              name: "converted",
              payload: JSON.stringify({ leadId, clickId: click.clickId }),
            },
          })
          .catch(() => null);
      }

      await sendLeadToCrm({ leadId }).catch(() => null);

      return NextResponse.json({ ok: true, skippedPostback: true });
    }

    const resp = await fetch(postbackUrl, { method: "GET", cache: "no-store" });
    const text = await resp.text().catch(() => "");

    if (resp.ok) {
      await prisma.conversion.update({
        where: { conversionKey },
        data: {
          status: "posted",
          raw: JSON.stringify({
            source: "client",
            leadId,
            clickId: click.clickId,
            postbackUrl,
            postbackCode: resp.status,
            postbackBody: text.slice(0, 2000),
            lockedCreated: lockCreated,
          }),
        },
      });

      if (lead.sessionId) {
        await prisma.funnelEvent
          .create({
            data: {
              sessionId: lead.sessionId,
              name: "converted",
              payload: JSON.stringify({ leadId, clickId: click.clickId }),
            },
          })
          .catch(() => null);
      }

      await sendLeadToCrm({ leadId }).catch(() => null);

      return NextResponse.json({ ok: true });
    }

    await prisma.conversion.update({
      where: { conversionKey },
      data: {
        status: "failed",
        raw: JSON.stringify({
          source: "client",
          leadId,
          clickId: click.clickId,
          postbackUrl,
          postbackCode: resp.status,
          postbackBody: text.slice(0, 2000),
          lockedCreated: lockCreated,
        }),
      },
    });

    return jsonError(502, "Postback failed.");
  } catch (e: any) {
    await prisma.conversion.update({
      where: { conversionKey },
      data: {
        status: "failed",
        raw: JSON.stringify({
          source: "client",
          leadId,
          clickId: click.clickId,
          postbackUrl,
          lastError: e?.message ? String(e.message).slice(0, 500) : "Network error",
          lockedCreated: lockCreated,
        }),
      },
    });

    return jsonError(502, "Postback network error.");
  }
}
