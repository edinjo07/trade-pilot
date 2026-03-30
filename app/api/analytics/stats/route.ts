import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/adminAuth";

export async function GET(req: Request) {
  const auth = await requireAdminSession(req);
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const fiveMinAgo  = new Date(now.getTime() - 5  * 60 * 1000);
  const oneDayAgo   = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const sevenDayAgo = new Date(now.getTime() - 7  * 24 * 60 * 60 * 1000);

  const [
    totalVisitors,
    todayVisitors,
    activeVisitors,
    weekVisitors,
    conversions,
    byCountry,
    byDevice,
    byBrowser,
    byStep,
    bySource,
    recent,
    hourlyRaw,
  ] = await Promise.all([
    // totals
    prisma.visitor.count(),
    prisma.visitor.count({ where: { createdAt: { gte: oneDayAgo } } }),
    prisma.visitor.count({ where: { lastSeenAt: { gte: fiveMinAgo } } }),
    prisma.visitor.count({ where: { createdAt: { gte: sevenDayAgo } } }),

    // conversions (lead submitted)
    prisma.visitor.count({ where: { convertedAt: { not: null } } }),

    // breakdowns
    prisma.visitor.groupBy({ by: ["country"], _count: { id: true }, orderBy: { _count: { id: "desc" } }, take: 10 }),
    prisma.visitor.groupBy({ by: ["device"],  _count: { id: true }, orderBy: { _count: { id: "desc" } } }),
    prisma.visitor.groupBy({ by: ["browser"], _count: { id: true }, orderBy: { _count: { id: "desc" } }, take: 8 }),
    prisma.visitor.groupBy({ by: ["currentStep"], _count: { id: true }, orderBy: { _count: { id: "desc" } } }),
    prisma.visitor.groupBy({
      by: ["utmSource"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
      where: { utmSource: { not: null } },
    }),

    // recent 50 visitors
    prisma.visitor.findMany({
      orderBy: { lastSeenAt: "desc" },
      take: 50,
      select: {
        id: true,
        createdAt: true,
        lastSeenAt: true,
        country: true,
        city: true,
        region: true,
        device: true,
        os: true,
        browser: true,
        currentStep: true,
        convertedAt: true,
        utmSource: true,
        utmMedium: true,
        utmCampaign: true,
        referrer: true,
        landingPath: true,
      },
    }),

    // hourly counts for last 24h (raw)
    prisma.visitor.findMany({
      where: { createdAt: { gte: oneDayAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  // Build hourly buckets (24 slots, 0..23)
  const hourly: number[] = Array(24).fill(0);
  for (const v of hourlyRaw) {
    const h = v.createdAt.getHours();
    hourly[h]++;
  }

  const conversionRate =
    totalVisitors > 0 ? ((conversions / totalVisitors) * 100).toFixed(1) : "0.0";

  return NextResponse.json({
    meta: {
      totalVisitors,
      todayVisitors,
      weekVisitors,
      activeVisitors,
      conversions,
      conversionRate,
    },
    byCountry:  byCountry.map( (r) => ({ label: r.country  || "Unknown", count: r._count.id })),
    byDevice:   byDevice.map(  (r) => ({ label: r.device   || "Unknown", count: r._count.id })),
    byBrowser:  byBrowser.map( (r) => ({ label: r.browser  || "Unknown", count: r._count.id })),
    byStep:     byStep.map(    (r) => ({ label: r.currentStep || "Unknown", count: r._count.id })),
    bySource:   bySource.map(  (r) => ({ label: r.utmSource  || "direct",  count: r._count.id })),
    hourly,
    recent,
  });
}
