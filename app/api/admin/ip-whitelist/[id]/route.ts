/**
 * DELETE /api/admin/ip-whitelist/[id]  - remove entry
 * PATCH  /api/admin/ip-whitelist/[id]  - toggle active
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/adminAuth";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminSession(req);
  if (!auth.ok) return NextResponse.json({ ok: false, code: "UNAUTHORIZED" }, { status: 401 });

  const { id } = await params;

  const entry = await prisma.ipWhitelistEntry.findUnique({ where: { id } });
  if (!entry) return NextResponse.json({ ok: false, code: "NOT_FOUND" }, { status: 404 });

  await prisma.ipWhitelistEntry.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminSession(req);
  if (!auth.ok) return NextResponse.json({ ok: false, code: "UNAUTHORIZED" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ ok: false, code: "BAD_JSON" }, { status: 400 });

  const { active } = body;

  const entry = await prisma.ipWhitelistEntry.update({
    where: { id },
    data: { active: typeof active === "boolean" ? active : undefined },
  });

  return NextResponse.json({ ok: true, entry });
}
