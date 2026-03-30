import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const Body = z.object({
  leadId: z.string().min(1),
  type: z.enum(["LEAD_CREATED", "CONTINUE_CLICKED", "POSTBACK_RECEIVED", "CONVERTED", "REJECTED"]),
  payload: z.any().optional(),
});

/**
 * Generic event logging endpoint
 * Stores structured events in LeadEvent table
 */
export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => null);
    if (!json) {
      return NextResponse.json({ ok: false, code: "BAD_JSON" }, { status: 400 });
    }

    const parsed = Body.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, code: "INVALID_EVENT", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const body = parsed.data;

    // Verify lead exists
    const lead = await prisma.lead.findUnique({
      where: { id: body.leadId },
      select: { id: true },
    });

    if (!lead) {
      return NextResponse.json({ ok: false, code: "LEAD_NOT_FOUND" }, { status: 404 });
    }

    // Create event
    await prisma.leadEvent.create({
      data: {
        leadId: body.leadId,
        type: body.type,
        payload: body.payload ?? null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, code: "SERVER_ERROR" }, { status: 500 });
  }
}
