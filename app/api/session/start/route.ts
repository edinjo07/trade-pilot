import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, hashIp } from "@/lib/rateLimit";

const BOT_UA_PATTERNS = [
  /bot|crawl|spider|slurp|baidu|yandex|bingpreview|googlebot/i,
  /curl|wget|python-requests|python-urllib|go-http|scrapy|httpx/i,
  /phantomjs|headlesschrome|selenium|webdriver|puppeteer|playwright/i,
];

function isBotRequest(req: Request): boolean {
  const ua = req.headers.get("user-agent") || "";
  if (!ua.trim()) return true;
  return BOT_UA_PATTERNS.some((r) => r.test(ua));
}

export async function POST(req: Request) {
  // Silently ignore bot requests  return a fake session ID
  if (isBotRequest(req)) {
    return NextResponse.json({ ok: true, sessionId: "bot-session", already: true });
  }

  const rl = await rateLimit({ req, route: "/api/session/start", limit: 30, windowSec: 60 });
  if (!rl.ok) return NextResponse.json({ ok: false, code: "RATE_LIMIT" }, { status: 429 });

  const body = await req.json().catch(() => ({}));
  const country = typeof body.country === "string" && body.country.trim() ? body.country.trim() : "CA";

  const userAgent = req.headers.get("user-agent") || null;
  const ipHash = hashIp(rl.ip);

  // If client passes a sessionId, reuse it (idempotent)
  const clientSessionId = typeof body.sessionId === "string" && body.sessionId.trim() ? body.sessionId.trim() : null;

  if (clientSessionId) {
    const existing = await prisma.funnelSession.findUnique({ where: { id: clientSessionId } });
    if (existing) {
      return NextResponse.json({ ok: true, sessionId: existing.id, already: true });
    }
  }

  const session = await prisma.funnelSession.create({
    data: { country, userAgent, ipHash },
    select: { id: true },
  });

  await prisma.funnelEvent.create({
    data: {
      sessionId: session.id,
      name: "session_started",
      payload: JSON.stringify({ country }),
    },
  });

  return NextResponse.json({ ok: true, sessionId: session.id, already: false });
}
