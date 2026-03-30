/**
 * GET  /api/admin/ip-whitelist  - list entries
 * POST /api/admin/ip-whitelist  - add entry
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/adminAuth";

export async function GET(req: Request) {
  const auth = await requireAdminSession(req);
  if (!auth.ok) return NextResponse.json({ ok: false, code: "UNAUTHORIZED" }, { status: 401 });

  const entries = await prisma.ipWhitelistEntry.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ ok: true, entries });
}

export async function POST(req: Request) {
  const auth = await requireAdminSession(req);
  if (!auth.ok) return NextResponse.json({ ok: false, code: "UNAUTHORIZED" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ ok: false, code: "BAD_JSON" }, { status: 400 });

  const { ip, label, note, active = true } = body;

  if (!ip?.trim()) return NextResponse.json({ ok: false, code: "MISSING_IP" }, { status: 400 });

  // Basic IP/CIDR validation
  const trimmed = ip.trim();
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/;
  const ipv6Regex = /^[0-9a-fA-F:]+$/;
  if (!ipv4Regex.test(trimmed) && !ipv6Regex.test(trimmed)) {
    return NextResponse.json({ ok: false, code: "INVALID_IP_FORMAT" }, { status: 400 });
  }

  try {
    const entry = await prisma.ipWhitelistEntry.create({
      data: {
        ip: trimmed,
        label: label?.trim() || null,
        note: note?.trim() || null,
        active,
      },
    });
    return NextResponse.json({ ok: true, entry }, { status: 201 });
  } catch {
    return NextResponse.json({ ok: false, code: "IP_CONFLICT" }, { status: 409 });
  }
}
