/**
 * POST /api/admin/crm/integrations/[id]/retry
 * Retries all FAILED deliveries for this integration (or specific leadId).
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/adminAuth";
import { pushLeadToIntegration } from "@/lib/crmHub";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminSession(req);
  if (!auth.ok) return NextResponse.json({ ok: false, code: "UNAUTHORIZED" }, { status: 401 });

  const { id } = await params;

  const body = await req.json().catch(() => ({}));
  const { leadId } = body;

  const where: any = {
    integrationId: id,
    status: "FAILED",
  };

  if (leadId) where.leadId = leadId;

  const failed = await prisma.crmDelivery.findMany({
    where,
    select: { leadId: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Unique lead IDs
  const leadIds = [...new Set(failed.map((d) => d.leadId))];

  const results = await Promise.all(
    leadIds.map((lid) =>
      pushLeadToIntegration(lid, id, { force: true }).catch((e) => ({
        leadId: lid,
        error: String(e?.message || e),
        status: "FAILED" as const,
        deliveryId: "",
        integrationId: id,
        integrationName: "",
      }))
    )
  );

  const sent = results.filter((r) => r.status === "SENT").length;
  const failed2 = results.filter((r) => r.status === "FAILED").length;

  return NextResponse.json({ ok: true, retried: results.length, sent, failed: failed2, results });
}
