/**
 * GET /api/admin/crm/inbound-leads
 * List inbound leads received from external CRMs.
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/adminAuth";

export async function GET(req: Request) {
  const auth = await requireAdminSession(req);
  if (!auth.ok) return NextResponse.json({ ok: false, code: "UNAUTHORIZED" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const integrationId = searchParams.get("integrationId") || undefined;
  const status = searchParams.get("status") || undefined;
  const take = Math.min(Number(searchParams.get("take") || 50), 200);
  const skip = Math.max(Number(searchParams.get("skip") || 0), 0);

  const where: any = {};
  if (integrationId) where.integrationId = integrationId;
  if (status) where.status = status.toUpperCase();

  const [items, total] = await Promise.all([
    prisma.inboundLead.findMany({
      where,
      orderBy: { receivedAt: "desc" },
      skip,
      take,
      include: {
        integration: { select: { id: true, name: true, platform: true } },
      },
    }),
    prisma.inboundLead.count({ where }),
  ]);

  return NextResponse.json({ ok: true, total, items });
}
