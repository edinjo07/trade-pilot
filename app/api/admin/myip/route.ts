/**
 * GET /api/admin/myip
 * Returns this server's outbound IP (for whitelisting in external CRMs).
 */
import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/adminAuth";
import { getOutboundIp } from "@/lib/crmHub";

export async function GET(req: Request) {
  const auth = await requireAdminSession(req);
  if (!auth.ok) return NextResponse.json({ ok: false, code: "UNAUTHORIZED" }, { status: 401 });

  const ip = await getOutboundIp();
  return NextResponse.json({ ok: true, ip });
}
