import { prisma } from "@/lib/prisma";
import crypto from "crypto";

function getClientIp(req: Request) {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0].trim();
  const xr = req.headers.get("x-real-ip");
  if (xr) return xr.trim();
  return "0.0.0.0";
}

export function hashIp(ip: string) {
  const salt = process.env.IP_HASH_SALT || "dev-salt";
  return crypto.createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

export async function rateLimit(opts: {
  req: Request;
  route: string;
  limit: number;       // e.g. 20
  windowSec: number;   // e.g. 60
}) {
  const ip = getClientIp(opts.req);
  const since = new Date(Date.now() - opts.windowSec * 1000);

  const recentCount = await prisma.apiHit.count({
    where: {
      ip,
      route: opts.route,
      createdAt: { gte: since },
    },
  });

  if (recentCount >= opts.limit) {
    return { ok: false as const, ip, retryAfterSec: opts.windowSec };
  }

  await prisma.apiHit.create({
    data: { ip, route: opts.route },
  });

  return { ok: true as const, ip };
}
