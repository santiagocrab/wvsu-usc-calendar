import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { serializeEvent } from "../src/lib/events";
import { classifyEvent } from "../src/lib/event-classification";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const events = await prisma.event.findMany();
  console.log(`Backfilling classification for ${events.length} events...`);

  let updated = 0;
  let ineligible = 0;
  let majorBlocking = 0;
  let monthOnly = 0;

  for (const event of events) {
    const dto = serializeEvent(event);
    const classification = classifyEvent(dto);

    if (!classification.conflictEligible) ineligible++;
    if (classification.isMajorBlockingEvent) majorBlocking++;
    if (classification.dateType === "month_only") monthOnly++;

    await prisma.event.update({
      where: { id: event.id },
      data: classification,
    });
    updated++;
  }

  console.log(`Updated ${updated} events`);
  console.log(`  conflictEligible=false: ${ineligible}`);
  console.log(`  isMajorBlockingEvent=true: ${majorBlocking}`);
  console.log(`  month_only: ${monthOnly}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
