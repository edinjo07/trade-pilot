import { NextResponse } from "next/server";
import { z } from "zod";

const Body = z.object({
  sessionId: z.string().min(1).max(128),
});

/**
 * Session lifecycle (lightweight)
 * Note: With new schema, sessionId is just a client-side tracker.
 * No FunnelSession table - Lead is created directly via /api/lead
 */
export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => null);
    if (!json) {
      return NextResponse.json({ ok: false, code: "BAD_JSON" }, { status: 400 });
    }

    const parsed = Body.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, code: "INVALID_SESSION_ID" }, { status: 400 });
    }

    const body = parsed.data;

    // Session is now just an acknowledgment - no DB persistence needed
    // Lead will be created later via /api/lead with full data
    return NextResponse.json({
      ok: true,
      sessionId: body.sessionId,
    });
  } catch {
    return NextResponse.json({ ok: false, code: "SERVER_ERROR" }, { status: 500 });
  }
}
