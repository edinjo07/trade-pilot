import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log("\n=== DATABASE CONNECTION CHECK ===\n");

  // 1. Test connection via raw query
  const ping = await prisma.$queryRaw<{ now: Date }[]>`SELECT NOW() as now`;
  console.log("✓ Connected to database at:", ping[0].now);

  // 2. Table row counts
  const tables = [
    "FunnelSession",
    "Lead",
    "FunnelEvent",
    "LeadEvent",
    "Click",
    "OutboundCrmJob",
  ] as const;

  console.log("\n=== TABLE ROW COUNTS ===\n");
  const sessionCount     = await prisma.funnelSession.count();
  const leadCount        = await prisma.lead.count();
  const eventCount       = await prisma.funnelEvent.count();
  const leadEventCount   = await prisma.leadEvent.count();

  console.log(`  FunnelSession : ${sessionCount}`);
  console.log(`  Lead          : ${leadCount}`);
  console.log(`  FunnelEvent   : ${eventCount}`);
  console.log(`  LeadEvent     : ${leadEventCount}`);

  // 3. Latest 5 leads
  if (leadCount > 0) {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        createdAt: true,
        fullName: true,
        email: true,
        phone: true,
        country: true,
        qualityTier: true,
        qualityScore: true,
      },
    });
    console.log(`\n=== LATEST ${leads.length} LEADS ===\n`);
    for (const l of leads) {
      console.log(`  [${l.createdAt.toISOString()}] ${l.fullName} | ${l.email} | ${l.phone} | ${l.country} | tier=${l.qualityTier} score=${l.qualityScore}`);
    }
  } else {
    console.log("\n  No leads yet in database.");
  }

  // 4. Latest 5 funnel sessions
  const sessions = await prisma.funnelSession.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, createdAt: true, country: true, entryChoice: true },
  });
  console.log(`\n=== LATEST ${sessions.length} SESSIONS ===\n`);
  for (const s of sessions) {
    console.log(`  [${s.createdAt.toISOString()}] id=${s.id} country=${s.country} entry=${s.entryChoice}`);
  }

  console.log("\n=== DONE ===\n");
}

main()
  .catch((e) => { console.error("ERROR:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
