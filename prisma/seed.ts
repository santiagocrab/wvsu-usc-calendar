import "dotenv/config";
import { readFileSync } from "fs";
import { join } from "path";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required for seeding");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

type SeedEvent = {
  id: string;
  title: string;
  category: string;
  host: string;
  organization: string;
  eventType: string;
  status: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  location: string;
  mapLink?: string;
  targetParticipants?: string;
  description?: string;
  contactPerson?: string;
  sourceFile?: string;
  remarks?: string;
};

function parseDate(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00.000Z`);
}

async function main() {
  const dataPath = join(process.cwd(), "prisma", "events.json");
  const raw = readFileSync(dataPath, "utf-8");
  const events: SeedEvent[] = JSON.parse(raw);

  console.log(`Seeding ${events.length} events (insert-only — existing records are preserved)...`);

  let created = 0;
  let skipped = 0;

  const batchSize = 50;
  for (let i = 0; i < events.length; i += batchSize) {
    const batch = events.slice(i, i + batchSize);
    await Promise.all(
      batch.map(async (event) => {
        const existing = await prisma.event.findUnique({ where: { id: event.id } });
        if (existing) {
          skipped++;
          return;
        }

        await prisma.event.create({
          data: {
            id: event.id,
            title: event.title,
            category: event.category,
            host: event.host,
            organization: event.organization,
            eventType: event.eventType,
            status: event.status,
            startDate: parseDate(event.startDate),
            endDate: parseDate(event.endDate),
            startTime: event.startTime ?? "",
            endTime: event.endTime ?? "",
            location: event.location,
            mapLink: event.mapLink ?? "",
            targetParticipants: event.targetParticipants ?? "",
            description: event.description ?? "",
            contactPerson: event.contactPerson ?? "",
            sourceFile: event.sourceFile ?? "",
            remarks: event.remarks ?? "",
          },
        });
        created++;
      })
    );
    process.stdout.write(`\rProcessed ${Math.min(i + batchSize, events.length)} / ${events.length}`);
  }

  console.log(`\nEvents: ${created} created, ${skipped} already existed (skipped).`);

  // Seed organizations (insert-only by name)
  const orgsPath = join(process.cwd(), "prisma", "organizations.json");
  const orgsRaw = readFileSync(orgsPath, "utf-8");
  const orgs: { name: string; acronym: string }[] = JSON.parse(orgsRaw);
  console.log(`\nSeeding ${orgs.length} organizations...`);
  let orgCreated = 0;
  let orgSkipped = 0;
  for (const org of orgs) {
    const existing = await prisma.organization.findUnique({ where: { name: org.name } });
    if (existing) { orgSkipped++; continue; }
    await prisma.organization.create({ data: { name: org.name, acronym: org.acronym } });
    orgCreated++;
  }
  console.log(`Organizations: ${orgCreated} created, ${orgSkipped} already existed (skipped).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
