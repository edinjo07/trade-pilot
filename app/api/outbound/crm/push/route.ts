import { NextResponse } from "next/server";
import { z } from "zod";
import { sendLeadToCrm } from "@/lib/crm";

const Body = z.object({
  leadId: z.string().min(1),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  if (!json) return NextResponse.json({ ok: false, code: "BAD_JSON" }, { status: 400 });

  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, code: "INVALID_BODY", issues: parsed.error.issues }, { status: 400 });
  }

  const result = await sendLeadToCrm({ leadId: parsed.data.leadId });

  return NextResponse.json({ ok: true, result });
}
