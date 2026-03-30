import { prisma } from "@/lib/prisma";

export async function rateLimit(opts: {
  ip: string;
  route: string;
  max: number;
  windowSec: number;
}) {
  const now = new Date();
  const windowStart = new Date(now.getTime() - opts.windowSec * 1000);

  const count = await prisma.apiHit.count({
    where: {
      ip: opts.ip,
      route: opts.route,
      createdAt: { gte: windowStart },
    },
  });

  if (count >= opts.max) {
    return { ok: false as const, remaining: 0 };
  }

  await prisma.apiHit.create({
    data: { ip: opts.ip, route: opts.route },
  });

  return { ok: true as const, remaining: opts.max - (count + 1) };
}

export function getClientIp(req: Request) {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0].trim();
  const xr = req.headers.get("x-real-ip");
  if (xr) return xr.trim();
  return "unknown";
}
