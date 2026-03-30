import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/adminAuth";
import { z } from "zod";

const Body = z.object({
  mode: z.enum(["all", "whitelist", "blacklist"]),
  countries: z.array(z.string().regex(/^[A-Z]{2}$/)).max(250),
});

/** GET /api/admin/geo-config — returns current geo restriction settings */
export async function GET(req: Request) {
  const auth = await requireAdminSession(req);
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const row = await prisma.geoConfig.findUnique({ where: { id: 1 } });
  return NextResponse.json({
    mode:      row?.mode      ?? "all",
    countries: JSON.parse(row?.countries ?? "[]"),
    updatedAt: row?.updatedAt ?? null,
  });
}

/** PUT /api/admin/geo-config — saves geo restriction settings */
export async function PUT(req: Request) {
  const auth = await requireAdminSession(req);
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await req.json().catch(() => null);
  if (!json) return NextResponse.json({ error: "Bad JSON" }, { status: 400 });

  const parsed = Body.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid body", details: parsed.error.flatten() }, { status: 400 });

  const { mode, countries } = parsed.data;

  const row = await prisma.geoConfig.upsert({
    where:  { id: 1 },
    update: { mode, countries: JSON.stringify(countries) },
    create: { id: 1, mode, countries: JSON.stringify(countries) },
  });

  return NextResponse.json({
    ok: true,
    mode:      row.mode,
    countries: JSON.parse(row.countries),
    updatedAt: row.updatedAt,
  });
}
