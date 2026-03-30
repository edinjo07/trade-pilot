import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildOfferUrl } from "@/lib/cpa/buildOfferUrl";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const clickId = url.searchParams.get("clickId");

  if (!clickId) {
    return NextResponse.json({ error: "clickId required" }, { status: 400 });
  }

  const click = await prisma.click.findUnique({ where: { clickId } });
  if (!click) {
    return NextResponse.json({ error: "click not found" }, { status: 404 });
  }

  let offerUrl: string;
  try {
    offerUrl = buildOfferUrl({
      offerKey: click.offerKey ?? "demo",
      clickId: click.clickId,
      sub1: click.sub1 ?? undefined,
      sub2: click.sub2 ?? undefined,
      sub3: click.sub3 ?? undefined,
      sub4: click.sub4 ?? undefined,
    });
  } catch {
    return NextResponse.json({ error: "offer config invalid" }, { status: 500 });
  }

  return NextResponse.redirect(offerUrl, { status: 302 });
}
