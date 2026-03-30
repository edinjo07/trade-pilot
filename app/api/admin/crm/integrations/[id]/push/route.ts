/**
 * POST /api/admin/crm/integrations/[id]/push
 * Body: { leadId: string, force?: boolean }
 * Push a specific lead to this integration.
 */
import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/adminAuth";
import { pushLeadToIntegration } from "@/lib/crmHub";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminSession(req);
  if (!auth.ok) return NextResponse.json({ ok: false, code: "UNAUTHORIZED" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ ok: false, code: "BAD_JSON" }, { status: 400 });

  const { leadId, force = false } = body;
  if (!leadId) return NextResponse.json({ ok: false, code: "MISSING_LEAD_ID" }, { status: 400 });

  try {
    const result = await pushLeadToIntegration(leadId, id, { force });
    return NextResponse.json({ ok: true, result });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, code: "PUSH_ERROR", message: String(e?.message || e) },
      { status: 500 }
    );
  }
}
