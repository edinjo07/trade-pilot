/**
 * PATCH /api/admin/leads/[id]/notes
 * Body: { notes: string }
 * Saves admin notes on a lead.
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/adminAuth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminSession(req);
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const notes = typeof body.notes === "string" ? body.notes.slice(0, 2000) : "";

  await prisma.lead.update({ where: { id }, data: { notes } });
  return NextResponse.json({ ok: true });
}
