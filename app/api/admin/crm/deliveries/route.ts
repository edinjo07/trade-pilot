/**
 * GET /api/admin/crm/deliveries
 * List CRM delivery logs with filtering.
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/adminAuth";

export async function GET(req: Request) {
  const auth = await requireAdminSession(req);
  if (!auth.ok) return NextResponse.json({ ok: false, code: "UNAUTHORIZED" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const integrationId = searchParams.get("integrationId") || undefined;
  const leadId = searchParams.get("leadId") || undefined;
  const status = searchParams.get("status") || undefined;
  const take = Math.min(Number(searchParams.get("take") || 50), 200);
  const skip = Math.max(Number(searchParams.get("skip") || 0), 0);

  const where: any = {};
  if (integrationId) where.integrationId = integrationId;
  if (leadId) where.leadId = leadId;
  if (status) where.status = status.toUpperCase();

  const [deliveries, total] = await Promise.all([
    prisma.crmDelivery.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
      include: {
        integration: { select: { id: true, name: true, platform: true } },
      },
    }),
    prisma.crmDelivery.count({ where }),
  ]);

  return NextResponse.json({ ok: true, total, deliveries });
}
