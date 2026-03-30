import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { rateLimit } from "@/lib/rateLimit";
import { pushLeadToAllIntegrations } from "@/lib/crmHub";

const Body = z.object({
  sessionId: z.string().min(1),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  fullName: z.string().optional(), // fallback for backward compatibility
  email: z.string().min(3),
  phone: z.string().min(3),
  country: z.string().optional(),
  clickId: z.string().optional().nullable(),
  subId: z.string().optional().nullable(),
});

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "tempmail.com",
  "10minutemail.com",
  "yopmail.com",
  "trashmail.com",
]);

function normalizeEmail(s: string) {
  return s.trim().toLowerCase();
}
function normalizePhone(s: string) {
  return s.trim().replace(/[^\d+]/g, "");
}
function isValidEmail(email: string) {
  if (email.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function isDisposableEmail(email: string) {
  const domain = email.split("@")[1]?.toLowerCase() || "";
  return DISPOSABLE_DOMAINS.has(domain);
}
function isValidPhone(phone: string) {
  const digits = phone.replace(/[^\d]/g, "");
  return digits.length >= 7 && digits.length <= 15;
}

function tierFromScore(score: number) {
  if (score >= 80) return "hot";
  if (score >= 55) return "warm";
  return "cold";
}

function computeScore(input: { fullName: string; emailOk: boolean; phoneOk: boolean; disposable: boolean }) {
  let score = 0;
  if (input.fullName.trim().length >= 3) score += 15;
  if (input.emailOk) score += 25;
  if (!input.disposable) score += 25;
  if (input.phoneOk) score += 35;
  return Math.max(0, Math.min(100, score));
}

export async function POST(req: Request) {
  try {
    const rl = await rateLimit({ req, route: "/api/lead", limit: 20, windowSec: 60 });
    if (!rl.ok) return NextResponse.json({ ok: false, code: "RATE_LIMIT" }, { status: 429 });

    const json = await req.json().catch(() => null);
    if (!json) return NextResponse.json({ ok: false, code: "BAD_JSON" }, { status: 400 });

    const parsed = Body.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, code: "INVALID_BODY", issues: parsed.error.issues }, { status: 400 });
    }

    // Build fullName from firstName + lastName or use fullName directly
    const firstName = (parsed.data.firstName || "").trim();
    const lastName = (parsed.data.lastName || "").trim();
    const fullName = parsed.data.fullName?.trim() || `${firstName} ${lastName}`.trim();

    if (!fullName || fullName.length < 2) {
      return NextResponse.json({ ok: false, code: "INVALID_NAME" }, { status: 400 });
    }

    const { sessionId, clickId, subId } = parsed.data;
    const email = normalizeEmail(parsed.data.email);
    const phone = normalizePhone(parsed.data.phone);
    const country = (parsed.data.country || "CA").trim();

    // session must exist
    const session = await prisma.funnelSession.findUnique({
      where: { id: sessionId },
      select: { id: true },
    });
    if (!session) {
      return NextResponse.json({ ok: false, code: "SESSION_NOT_FOUND" }, { status: 404 });
    }

    // idempotent: sessionId is unique on Lead
    const existing = await prisma.lead.findUnique({
      where: { sessionId },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json({ ok: true, leadId: existing.id, already: true });
    }

    const emailOk = isValidEmail(email);
    if (!emailOk) return NextResponse.json({ ok: false, code: "INVALID_EMAIL" }, { status: 400 });

    const disposable = isDisposableEmail(email);
    // enforce anti-fake (block disposable)
    if (disposable) return NextResponse.json({ ok: false, code: "DISPOSABLE_EMAIL" }, { status: 400 });

    const phoneOk = isValidPhone(phone);
    if (!phoneOk) return NextResponse.json({ ok: false, code: "INVALID_PHONE" }, { status: 400 });

    const qualityScore = computeScore({ fullName, emailOk, phoneOk, disposable });
    const qualityTier = tierFromScore(qualityScore);

    const lead = await prisma.lead.create({
      data: {
        sessionId,
        fullName: fullName.trim(),
        email,
        phone,
        country,

        disposableEmail: disposable,
        phoneCountryOk: true,

        qualityScore,
        qualityTier,
        qualityMeta: JSON.stringify({
          emailOk,
          phoneOk,
          disposable,
        }),
      },
      select: { id: true },
    });

    await prisma.funnelEvent.create({
      data: {
        sessionId,
        name: "lead_created",
        payload: JSON.stringify({ leadId: lead.id, qualityScore, qualityTier }),
      },
    });

    // Fire-and-forget: push lead to all active CRM integrations
    // (non-blocking - errors are captured in CrmDelivery records)
    pushLeadToAllIntegrations(lead.id).catch((err) => {
      console.error("[CRM-HUB] Auto-push error:", err);
    });

    return NextResponse.json({ ok: true, leadId: lead.id, already: false });
  } catch (e) {
    return NextResponse.json({ ok: false, code: "SERVER_ERROR" }, { status: 500 });
  }
}
