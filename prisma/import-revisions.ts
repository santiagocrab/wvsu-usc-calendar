import "dotenv/config";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const SOURCE_FILE = "REVISIONS FOR CALENDAR.docx";

type RevisionEvent = {
  id: string;
  title: string;
  host: string;
  organization: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  location: string;
  targetParticipants?: string;
  category: string;
  status: string;
  remarks?: string;
};

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function parseDate(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00.000Z`);
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required");

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  const dataPath = join(process.cwd(), "prisma/data/revisions-calendar-events.json");
  const incoming: RevisionEvent[] = JSON.parse(readFileSync(dataPath, "utf-8"));

  const existing = await prisma.event.findMany({
    select: {
      id: true,
      title: true,
      host: true,
      organization: true,
      startDate: true,
      endDate: true,
      sourceFile: true,
      updatedAt: true,
    },
  });

  let inserted = 0;
  let skippedDuplicate = 0;
  let skippedExistingId = 0;
  let needsVerification = 0;
  const orgsTouched = new Set<string>();
  const insertedList: string[] = [];
  const skippedList: string[] = [];
  const reviewList: string[] = [];
  const dateConflicts: string[] = [];

  for (const event of incoming) {
    if (event.status === "Needs Verification") needsVerification++;

    const start = parseDate(event.startDate);
    const end = parseDate(event.endDate);
    const normTitle = normalize(event.title);
    const normHost = normalize(event.host);

    const duplicate = existing.find((e) => {
      const sameTitle = normalize(e.title) === normTitle;
      const sameHost =
        normalize(e.host) === normHost ||
        normalize(e.organization) === normalize(event.organization);
      const sameStart = e.startDate.toISOString().slice(0, 10) === event.startDate;
      const sameEnd = e.endDate.toISOString().slice(0, 10) === event.endDate;
      return sameTitle && sameHost && sameStart && sameEnd;
    });

    if (duplicate) {
      skippedDuplicate++;
      skippedList.push(`${event.title} (${event.startDate}) — duplicate of ${duplicate.id}`);
      continue;
    }

    const byId = await prisma.event.findUnique({ where: { id: event.id } });
    if (byId) {
      skippedExistingId++;
      skippedList.push(`${event.id} — id already exists`);
      continue;
    }

    // Similar title+host but different date — insert and flag for review
    const similar = existing.find((e) => {
      const titleMatch =
        normalize(e.title) === normTitle ||
        normalize(e.title).includes(normTitle) ||
        normTitle.includes(normalize(e.title));
      const hostMatch =
        normalize(e.host) === normHost ||
        normalize(e.organization) === normalize(event.organization);
      return titleMatch && hostMatch;
    });
    if (similar) {
      const similarStart = similar.startDate.toISOString().slice(0, 10);
      if (similarStart !== event.startDate) {
        reviewList.push(
          `${event.title}: similar to existing "${similar.title}" on ${similarStart}, new dates ${event.startDate}–${event.endDate}`
        );
        dateConflicts.push(`${event.title} (${event.startDate}) vs existing ${similar.id}`);
      }
    }

    const remarks = [
      event.remarks,
      similar && !duplicate ? "Added alongside similar existing record — please review." : "",
    ]
      .filter(Boolean)
      .join(" ");

    await prisma.event.create({
      data: {
        id: event.id,
        title: event.title,
        category: event.category,
        host: event.host,
        organization: event.organization,
        eventType: "Activity",
        status: event.status,
        startDate: start,
        endDate: end,
        startTime: event.startTime ?? "",
        endTime: event.endTime ?? "",
        location: event.location || "TBA",
        targetParticipants: event.targetParticipants ?? "",
        sourceFile: SOURCE_FILE,
        remarks,
      },
    });

    // Ensure organization exists (insert-only)
    const orgName = event.organization;
    const existingOrg = await prisma.organization.findUnique({ where: { name: orgName } });
    if (!existingOrg) {
      const acronym = orgName
        .split(/\s+/)
        .map((w) => w[0])
        .join("")
        .slice(0, 12)
        .toUpperCase();
      await prisma.organization.create({
        data: { name: orgName, acronym },
      });
    }
    orgsTouched.add(orgName);
    orgsTouched.add(event.host);

    inserted++;
    insertedList.push(`${event.title} | ${event.host} | ${event.startDate}`);
    existing.push({
      id: event.id,
      title: event.title,
      host: event.host,
      organization: event.organization,
      startDate: start,
      endDate: end,
      sourceFile: SOURCE_FILE,
      updatedAt: new Date(),
    });
  }

  const summary = {
    sourceFile: SOURCE_FILE,
    totalInFile: incoming.length,
    inserted,
    duplicatesSkipped: skippedDuplicate,
    idsSkipped: skippedExistingId,
    needsVerification,
    organizationsTouched: [...orgsTouched].sort(),
    similarRecordsFlagged: reviewList.length,
    dateConflicts,
    insertedList,
    skippedList,
    reviewList,
  };

  const outDir = join(process.cwd(), "prisma/reports");
  mkdirSync(outDir, { recursive: true });
  const stamp = new Date().toISOString().slice(0, 10);
  const reportPath = join(outDir, `revisions-import-${stamp}.json`);
  writeFileSync(reportPath, JSON.stringify(summary, null, 2));

  console.log("\n=== REVISIONS CALENDAR IMPORT SUMMARY ===");
  console.log(JSON.stringify(summary, null, 2));
  console.log(`\nReport saved: ${reportPath}`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
