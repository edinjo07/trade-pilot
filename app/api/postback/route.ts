// app/api/postback/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { rateLimit } from "@/lib/rateLimit";
import { sendLeadToCrm } from "@/lib/crm";

function pickClickId(url: URL) {
  return (
    url.searchParams.get("clickid") ||
    url.searchParams.get("click_id") ||
    url.searchParams.get("cid") ||
    url.searchParams.get("click")
  );
}

function normalizeStatus(url: URL) {
  // networks use different names
  const s =
    url.searchParams.get("status") ||
    url.searchParams.get("st") ||
    url.searchParams.get("event") ||
    url.searchParams.get("type") ||
    "conversion";

  return String(s).toLowerCase().trim();
}

function parseFloatMaybe(v: string | null): number | null {
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function makeConversionKey(input: {
  network?: string | null;
  clickId: string;
  txid?: string | null;
  status: string;
  payout?: number | null;
  currency?: string | null;
  rawStable: string;
}) {
  // Best case: network provides txid / conversion id => stable key
  if (input.txid) return `${input.clickId}:${input.txid}`;

  // Otherwise: hash stable representation (still idempotent if same request repeats)
  const base = [
    input.network || "",
    input.clickId,
    input.status,
    input.payout ?? "",
    input.currency || "",
    input.rawStable,
  ].join("|");

  return crypto.createHash("sha256").update(base).digest("hex");
}

function stableStringify(obj: any) {
  // stable stringify: sort keys so same payload => same hash
  const allKeys: string[] = [];
  JSON.stringify(obj, (k, v) => (allKeys.push(k), v));
  allKeys.sort();
  return JSON.stringify(obj, allKeys);
}

function isApproved(status: string) {
  // keep it permissive; you can tighten later
  const s = status.toLowerCase();
  return (
    s === "approved" ||
    s === "approve" ||
    s === "sale" ||
    s === "converted" ||
    s === "conversion" ||
    s === "lead" ||
    s === "1" ||
    s === "success"
  );
}

async function handle(req: Request, bodyJson?: any) {
  // 🔒 rate limit postbacks (they can spike)
  const rl = await rateLimit({
    req,
    route: "/api/postback",
    limit: 120,
    windowSec: 60,
  });

  if (!rl.ok) {
    // Many networks retry; 429 is fine
    return new NextResponse("RATE_LIMIT", { status: 429 });
  }

  const url = new URL(req.url);

  const clickId = pickClickId(url);
  if (!clickId) {
    return new NextResponse("MISSING_CLICKID", { status: 400 });
  }

  const status = normalizeStatus(url);

  const payout =
    parseFloatMaybe(url.searchParams.get("payout")) ??
    parseFloatMaybe(url.searchParams.get("amount")) ??
    parseFloatMaybe(url.searchParams.get("sum"));

  const currency =
    url.searchParams.get("currency") ||
    url.searchParams.get("cur") ||
    url.searchParams.get("ccy");

  const txid =
    url.searchParams.get("txid") ||
    url.searchParams.get("transaction_id") ||
    url.searchParams.get("tid") ||
    url.searchParams.get("conversion_id") ||
    url.searchParams.get("cid2"); // some networks

  const network =
    url.searchParams.get("network") ||
    url.searchParams.get("source") ||
    url.searchParams.get("aff_network");

  // Raw payload stored in Prisma Json
  const raw = {
    method: req.method,
    query: Object.fromEntries(url.searchParams.entries()),
    body: bodyJson ?? null,
  };

  // Stable representation for hashing (idempotency)
  const rawStable = stableStringify(raw);

  const conversionKey =
    url.searchParams.get("conversionKey") ||
    url.searchParams.get("ckey") ||
    makeConversionKey({
      network,
      clickId,
      txid,
      status,
      payout,
      currency,
      rawStable,
    });

  // Ensure click exists (otherwise conversion would violate FK)
  const click = await prisma.click.findUnique({
    where: { clickId },
    include: { lead: true },
  });

  if (!click) {
    // Depending on your CPA, you can return 200 OK to stop retries.
    // But for debugging + integrity, 404 is clearer.
    return new NextResponse("UNKNOWN_CLICKID", { status: 404 });
  }

  const existingForClick = await prisma.conversion.findFirst({
    where: { clickId },
    select: { id: true },
  });

  if (existingForClick) {
    return new NextResponse("OK", { status: 200 });
  }

  // ✅ Create conversion idempotently
  try {
    await prisma.conversion.create({
      data: {
        clickId,
        status,
        payout: payout ?? null,
        currency: currency ?? null,
        txid: txid ?? null,
        conversionKey,
        raw: JSON.stringify(raw), // SQLite: Store as JSON string
      },
    });
  } catch (e: any) {
    // Unique constraint => already received (idempotency)
    if (e?.code !== "P2002") {
      console.error("conversion.create failed:", e);
      return new NextResponse("ERROR", { status: 500 });
    }
  }

  // 🔥 Optional: upgrade lead tier on approved conversions
  if (isApproved(status)) {
    // Keep this conservative and simple: only bump tier/score upwards
    await prisma.lead
      .update({
        where: { id: click.leadId },
        data: {
          qualityTier: "hot",
          qualityScore: Math.max(click.lead.qualityScore ?? 0, 90),
        },
      })
      .catch(() => null);

    await sendLeadToCrm({ leadId: click.leadId }).catch(() => null);
  }

  // CPA networks usually accept plain "OK"
  return new NextResponse("OK", { status: 200 });
}

export async function GET(req: Request) {
  return handle(req);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  return handle(req, body);
}

