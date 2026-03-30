/**
 * GET /api/admin/crm/make-hooks?token=TOKEN&zone=https://eu1.make.com
 *
 * Proxy to Make.com REST API — lists the caller's webhook hooks.
 * We never store the Make API token; it's passed per-request.
 *
 * Make API docs: https://developers.make.com/api-documentation
 * Auth: Authorization: Token <token>
 * Zone examples: https://eu1.make.com | https://eu2.make.com | https://us1.make.com | https://us2.make.com
 */
import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/adminAuth";

function normalizeZone(zone: string): string {
  const z = zone.trim().replace(/\/$/, "");
  if (!z.startsWith("http")) return `https://${z}`;
  return z;
}

export async function GET(req: Request) {
  const auth = await requireAdminSession(req);
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const token = (searchParams.get("token") ?? "").trim();
  const zone = normalizeZone(searchParams.get("zone") ?? "https://eu1.make.com");

  if (!token) {
    return NextResponse.json({ error: "Missing Make API token" }, { status: 400 });
  }

  const headers = {
    Authorization: `Token ${token}`,
    "Content-Type": "application/json",
  };

  // Step 1: get the user's info (so we can read their teamId)
  let teamId: number | null = null;
  try {
    const meRes = await fetch(`${zone}/api/v2/users/me`, { headers });
    if (!meRes.ok) {
      const text = await meRes.text().catch(() => "");
      return NextResponse.json(
        { error: `Make.com API error (${meRes.status}): ${text.slice(0, 300)}` },
        { status: 400 }
      );
    }
    const me = await meRes.json();
    // Make API returns { user: { id, name, email, ... } } or nested
    teamId = me?.user?.teamId ?? me?.user?.teams?.[0]?.id ?? null;
  } catch (e) {
    return NextResponse.json({ error: `Failed to reach Make.com: ${String(e)}` }, { status: 502 });
  }

  // Step 2: list hooks — with or without teamId filter
  try {
    const hooksUrl = teamId
      ? `${zone}/api/v2/hooks?teamId=${teamId}&pg[limit]=100`
      : `${zone}/api/v2/hooks?pg[limit]=100`;

    const hooksRes = await fetch(hooksUrl, { headers });
    if (!hooksRes.ok) {
      const text = await hooksRes.text().catch(() => "");
      return NextResponse.json(
        { error: `Make.com hooks API error (${hooksRes.status}): ${text.slice(0, 300)}` },
        { status: 400 }
      );
    }

    const data = await hooksRes.json();

    // Normalise to a simple array of { id, name, url, enabled }
    const hooks: Array<{ id: number; name: string; url: string; enabled: boolean; type: string }> =
      (data?.hooks ?? []).map((h: any) => ({
        id: h.id,
        name: h.name || `Hook #${h.id}`,
        url: h.url ?? "",
        enabled: h.enabled ?? true,
        type: h.type ?? "web",
      }));

    return NextResponse.json({ ok: true, hooks, teamId });
  } catch (e) {
    return NextResponse.json({ error: `Failed to fetch hooks: ${String(e)}` }, { status: 502 });
  }
}
