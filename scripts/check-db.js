// Load .env from project root
const path = require("path");
const fs   = require("fs");
const envPath = path.resolve(__dirname, "../.env");
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf8").split("\n");
  for (const line of lines) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^"|"$/g, "");
  }
}
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function run() {
  try {
    const dbTime = await p.$queryRaw`SELECT NOW() as now`;
    console.log("DB connection OK. Server time:", dbTime[0].now);

    const leadCount    = await p.lead.count();
    const sessionCount = await p.funnelSession.count();
    console.log("Lead count:    ", leadCount);
    console.log("Session count: ", sessionCount);

    if (leadCount > 0) {
      const leads = await p.lead.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { id: true, createdAt: true, fullName: true, email: true, phone: true, country: true, qualityTier: true, qualityScore: true },
      });
      console.log("\n--- Latest leads ---");
      leads.forEach((l) => {
        console.log(`  ${l.createdAt.toISOString().slice(0,19)}  ${l.fullName.padEnd(20)} ${l.email.padEnd(30)} ${l.phone.padEnd(15)} ${l.country}  tier=${l.qualityTier}  score=${l.qualityScore}`);
      });
    } else {
      console.log("No leads in database yet.");
    }
  } catch (e) {
    console.error("ERROR:", e.message);
  } finally {
    await p.$disconnect();
  }
}

run();
