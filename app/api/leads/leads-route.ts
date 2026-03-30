import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const filter = (searchParams.get("filter") || "").toLowerCase();
  const take = Math.min(Number(searchParams.get("take") || 50), 200);
  const skip = Math.max(Number(searchParams.get("skip") || 0), 0);

  let where: any = {};

  if (filter === "no_click") {
    where = { session: { events: { none: { name: "continue_clicked" } } } };
  }

  if (filter === "clicked_no_conv") {
    where = {
      session: { events: { some: { name: "continue_clicked" } } },
      clicks: { none: { conversions: { some: {} } } },
    };
  }

  if (filter === "hot") {
    where = {
      qualityScore: { gte: 60 },
      session: { events: { some: { name: "continue_clicked" } } },
      clicks: { none: { conversions: { some: {} } } },
    };
  }

  if (filter === "converted") {
    where = { clicks: { some: { conversions: { some: {} } } } };
  }

  const [items, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
      select: {
        id: true,
        createdAt: true,
        fullName: true,
        email: true,
        phone: true,
        country: true,
        qualityScore: true,
        qualityTier: true,
        sessionId: true,
        session: {
          select: {
            events: {
              where: { name: "continue_clicked" },
              select: { createdAt: true },
              take: 1,
              orderBy: { createdAt: "desc" },
            },
          },
        },
        clicks: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            clickId: true,
            offerKey: true,
            createdAt: true,
            sub1: true,
            sub2: true,
            sub3: true,
            sub4: true,
            conversions: {
              orderBy: { receivedAt: "desc" },
              take: 1,
              select: {
                status: true,
                payout: true,
                currency: true,
                txid: true,
                conversionKey: true,
                receivedAt: true,
              },
            },
          },
        },
      },
    }),
    prisma.lead.count({ where }),
  ]);

  return NextResponse.json({ ok: true, total, items });
}
