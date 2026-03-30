import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { rateLimit } from "@/lib/rateLimit";

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
  quizAnswers: z.array(z.object({ qid: z.string(), aid: z.string() })).optional(),
  _hp: z.string().optional(), // honeypot field  must be empty
});

const DISPOSABLE_DOMAINS = new Set([
  // --- Original short list ---
  "mailinator.com",
  "guerrillamail.com",
  "tempmail.com",
  "10minutemail.com",
  "yopmail.com",
  "trashmail.com",
  // --- Extended list ---
  "temp-mail.org",
  "getnada.com",
  "fakeinbox.com",
  "sharklasers.com",
  "grr.la",
  "minuteinbox.com",
  "maildrop.cc",
  "mohmal.com",
  "dispostable.com",
  "throwam.com",
  "spamgourmet.com",
  "spamfree24.org",
  "spam4.me",
  "mytemp.email",
  "burnermail.io",
  "getairmail.com",
  "inboxkitten.com",
  "mailnull.com",
  "nwldx.com",
  "trashmail.at",
  "trashmail.io",
  "trashmail.me",
  "discard.email",
  "crap.email",
  "throwam.com",
  "sofimail.com",
  "mailnesia.com",
  "nh3.ro",
  "tempr.email",
  "dropmail.me",
  "emailondeck.com",
  "anonmails.de",
  "tempinbox.com",
  "spamhereplease.com",
  "mailsac.com",
  "trbvm.com",
  "jetable.fr.nf",
  "notsharingmy.info",
  "dontreg.com",
  "wegwerfemail.de",
  "wegwerfmail.de",
  "mailtemp.net",
  "tempemail.net",
  "tempemail.co",
  "mt2015.com",
  "mt2016.com",
  "emlpro.com",
  "emlhub.com",
  "harakirimail.com",
  "spamevader.com",
]);

const BOT_UA_PATTERNS = [
  /bot|crawl|spider|slurp|baidu|yandex|bingpreview|googlebot/i,
  /curl|wget|python-requests|python-urllib|go-http|scrapy|httpx/i,
  /phantomjs|headlesschrome|selenium|webdriver|puppeteer|playwright/i,
];

function isBotRequest(req: Request): boolean {
  const ua = req.headers.get("user-agent") || "";
  // Empty UA is suspicious
  if (!ua.trim()) return true;
  return BOT_UA_PATTERNS.some((r) => r.test(ua));
}

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
    // ── Server-side bot UA rejection ────────────────────────────────────
    if (isBotRequest(req)) {
      // Return fake success so scrapers don't retry aggressively
      return NextResponse.json({ ok: true, leadId: "bot-rejected", already: false });
    }

    const rl = await rateLimit({ req, route: "/api/lead", limit: 20, windowSec: 60 });
    if (!rl.ok) return NextResponse.json({ ok: false, code: "RATE_LIMIT" }, { status: 429 });

    const json = await req.json().catch(() => null);
    if (!json) return NextResponse.json({ ok: false, code: "BAD_JSON" }, { status: 400 });

    const parsed = Body.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, code: "INVALID_BODY", issues: parsed.error.issues }, { status: 400 });
    }

    // ── Honeypot check: bots fill hidden fields, humans don't ──────────────
    if (parsed.data._hp && parsed.data._hp.trim().length > 0) {
      // Silently accept and return a fake success so bots think they won
      return NextResponse.json({ ok: true, leadId: "bot-rejected", already: false });
    }

    // Build fullName from firstName + lastName or use fullName directly
    const firstName = (parsed.data.firstName || "").trim();
    const lastName = (parsed.data.lastName || "").trim();
    const fullName = parsed.data.fullName?.trim() || `${firstName} ${lastName}`.trim();

    if (!fullName || fullName.length < 2) {
      return NextResponse.json({ ok: false, code: "INVALID_NAME" }, { status: 400 });
    }

    const sessionId = parsed.data.sessionId;
    const clickId = parsed.data.clickId ? String(parsed.data.clickId).trim() : "";
    const subId = parsed.data.subId ? String(parsed.data.subId).trim() : "";
    const email = normalizeEmail(parsed.data.email);
    const phone = normalizePhone(parsed.data.phone);
    const country = (parsed.data.country || "CA").trim();

    // session must exist - if not, create one on the fly (handles hard-refresh race)
    let sessionRecord = await prisma.funnelSession.findUnique({
      where: { id: sessionId },
      select: { id: true },
    });
    if (!sessionRecord) {
      sessionRecord = await prisma.funnelSession.create({
        data: { country, userAgent: req.headers.get("user-agent") || null, ipHash: rl.ip },
        select: { id: true },
      });
    }

    // idempotent: sessionId is unique on Lead
    const existing = await prisma.lead.findUnique({
      where: { sessionId: sessionRecord.id },
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
        sessionId: sessionRecord.id,
        firstName,
        lastName,
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
          quizAnswers: parsed.data.quizAnswers ?? [],
        }),
      },
      select: { id: true },
    });

    await prisma.funnelEvent.create({
      data: {
        sessionId: sessionRecord.id,
        name: "lead_created",
        payload: JSON.stringify({ leadId: lead.id, qualityScore, qualityTier }),
      },
    });

    // Fire continue_clicked so admin dashboard shows the lead as "continued"
    await prisma.funnelEvent.create({
      data: {
        sessionId: sessionRecord.id,
        name: "continue_clicked",
        payload: JSON.stringify({ leadId: lead.id }),
      },
    });

    if (clickId) {
      try {
        await prisma.click.create({
          data: {
            clickId,
            leadId: lead.id,
            sub1: subId || null,
          },
        });
      } catch (e: any) {
        // Ignore duplicate clickId (idempotent)
        if (e?.code !== "P2002") {
          console.error("Click create failed:", e);
        }
      }

      const existingClickEvent = await prisma.funnelEvent.findFirst({
        where: { sessionId: sessionRecord.id, name: "click_attached" },
        select: { id: true },
      });

      if (!existingClickEvent) {
        const userAgent = req.headers.get("user-agent") || null;
        await prisma.funnelEvent.create({
          data: {
            sessionId: sessionRecord.id,
            name: "click_attached",
            payload: JSON.stringify({
              clickId,
              sub1: subId || null,
              ip: rl.ip,
              userAgent,
            }),
          },
        });
      }
    }

    return NextResponse.json({ ok: true, leadId: lead.id, already: false });
  } catch (e) {
    console.error("[/api/lead] POST error:", e);
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, code: "SERVER_ERROR", detail: msg }, { status: 500 });
  }
}
