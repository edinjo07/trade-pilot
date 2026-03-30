import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/adminAuth";

// ── helpers ──────────────────────────────────────────────────────────────────
function toDateKey(d: Date) {
  return d.toISOString().slice(0, 10); // "YYYY-MM-DD"
}
function toMonthKey(d: Date) {
  return d.toISOString().slice(0, 7); // "YYYY-MM"
}
function toWeekKey(d: Date) {
  // ISO week: YYYY-Www
  const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - day);
  const year = tmp.getUTCFullYear();
  const week = Math.ceil(((tmp.getTime() - Date.UTC(year, 0, 1)) / 86400000 + 1) / 7);
  return `${year}-W${String(week).padStart(2, "0")}`;
}

export async function GET(req: Request) {
  const auth = await requireAdminSession(req);
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const fiveMinAgo    = new Date(now.getTime() - 5   * 60 * 1000);
  const oneDayAgo     = new Date(now.getTime() - 24  * 60 * 60 * 1000);
  const sevenDayAgo   = new Date(now.getTime() - 7   * 24 * 60 * 60 * 1000);
  const thirtyDayAgo  = new Date(now.getTime() - 30  * 24 * 60 * 60 * 1000);
  const ninetyDayAgo  = new Date(now.getTime() - 90  * 24 * 60 * 60 * 1000); // 13 weeks
  const oneYearAgo    = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

  const [
    totalVisitors,
    todayVisitors,
    activeVisitors,
    weekVisitors,
    monthVisitors,
    conversions,
    byCountryAll,
    byDevice,
    byBrowser,
    byStep,
    bySource,
    recent,
    hourlyRaw,
    dailyRaw,
    weeklyRaw,
    monthlyRaw,
  ] = await Promise.all([
    prisma.visitor.count(),
    prisma.visitor.count({ where: { createdAt: { gte: oneDayAgo } } }),
    prisma.visitor.count({ where: { lastSeenAt: { gte: fiveMinAgo } } }),
    prisma.visitor.count({ where: { createdAt: { gte: sevenDayAgo } } }),
    prisma.visitor.count({ where: { createdAt: { gte: thirtyDayAgo } } }),

    prisma.visitor.count({ where: { convertedAt: { not: null } } }),

    // all countries with counts
    prisma.visitor.groupBy({
      by: ["country"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    }),
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

    prisma.visitor.findMany({
      orderBy: { lastSeenAt: "desc" },
      take: 50,
      select: {
        id: true, createdAt: true, lastSeenAt: true, country: true,
        city: true, region: true, device: true, os: true, browser: true,
        currentStep: true, convertedAt: true, utmSource: true, utmMedium: true,
        utmCampaign: true, referrer: true, landingPath: true,
      },
    }),

    // hourly (last 24 h)
    prisma.visitor.findMany({
      where: { createdAt: { gte: oneDayAgo } },
      select: { createdAt: true },
    }),

    // daily (last 30 days)
    prisma.visitor.findMany({
      where: { createdAt: { gte: thirtyDayAgo } },
      select: { createdAt: true },
    }),

    // weekly (last ~13 weeks)
    prisma.visitor.findMany({
      where: { createdAt: { gte: ninetyDayAgo } },
      select: { createdAt: true },
    }),

    // monthly (last 12 months)
    prisma.visitor.findMany({
      where: { createdAt: { gte: oneYearAgo } },
      select: { createdAt: true },
    }),
  ]);

  // ── hourly buckets: 24 slots ──────────────────────────────────────────────
  const hourly: number[] = Array(24).fill(0);
  for (const v of hourlyRaw) hourly[v.createdAt.getHours()]++;

  // ── daily buckets: last 30 days, each labeled "Mar 30" ───────────────────
  const dailyMap: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    dailyMap[toDateKey(d)] = 0;
  }
  for (const v of dailyRaw) {
    const k = toDateKey(v.createdAt);
    if (k in dailyMap) dailyMap[k]++;
  }
  const daily = Object.entries(dailyMap).map(([date, count]) => ({
    date,
    label: new Date(date + "T12:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    count,
  }));

  // ── weekly buckets: last 13 ISO weeks ────────────────────────────────────
  const weeklyMap: Record<string, number> = {};
  for (let i = 12; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
    weeklyMap[toWeekKey(d)] = weeklyMap[toWeekKey(d)] ?? 0;
  }
  for (const v of weeklyRaw) {
    const k = toWeekKey(v.createdAt);
    if (k in weeklyMap) weeklyMap[k]++;
  }
  const weekly = Object.entries(weeklyMap).map(([week, count]) => ({ week, label: week, count }));

  // ── monthly buckets: last 12 months ──────────────────────────────────────
  const monthlyMap: Record<string, number> = {};
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthlyMap[toMonthKey(d)] = 0;
  }
  for (const v of monthlyRaw) {
    const k = toMonthKey(v.createdAt);
    if (k in monthlyMap) monthlyMap[k]++;
  }
  const monthly = Object.entries(monthlyMap).map(([month, count]) => ({
    month,
    label: new Date(month + "-15").toLocaleDateString("en-US", { month: "short", year: "numeric" }),
    count,
  }));

  const conversionRate =
    totalVisitors > 0 ? ((conversions / totalVisitors) * 100).toFixed(1) : "0.0";

  return NextResponse.json({
    meta: {
      totalVisitors,
      todayVisitors,
      weekVisitors,
      monthVisitors,
      activeVisitors,
      conversions,
      conversionRate,
    },
    byCountry:  byCountryAll.slice(0, 10).map((r) => ({ label: r.country || "Unknown", count: r._count.id })),
    byCountryAll: byCountryAll.map((r) => ({ label: r.country || "Unknown", count: r._count.id })),
    byDevice:   byDevice.map(  (r) => ({ label: r.device   || "Unknown", count: r._count.id })),
    byBrowser:  byBrowser.map( (r) => ({ label: r.browser  || "Unknown", count: r._count.id })),
    byStep:     byStep.map(    (r) => ({ label: r.currentStep || "Unknown", count: r._count.id })),
    bySource:   bySource.map(  (r) => ({ label: r.utmSource  || "direct",  count: r._count.id })),
    hourly,
    daily,
    weekly,
    monthly,
    recent,
  });
}
