import "dotenv/config";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import hostAliases from "./data/host-aliases.json";

const SOURCE_FILE = "USC Master Reference Calendar (AY 2026-2027)";
const MONTHS: Record<string, number> = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
};

type OfficialEvent = {
  title: string;
  category: string;
  host: string;
  organization: string;
  startDate: string;
  endDate: string;
  location: string;
  status: string;
};

type ReportRow = {
  sourcePdf: string;
  page: string;
  documentOrg: string;
  eventDate: string;
  originalTitle: string;
  correctHost: string;
  venue: string;
  targetParticipants: string;
  previousCategory: string;
  correctCategory: string;
  officialColor: string;
  previousHost: string;
  correctionMade: string;
  conflictFound: string;
  verificationStatus: string;
  remarks: string;
};

const CATEGORY_COLORS: Record<string, string> = {
  "National Holiday": "Red",
  "WVSU Calendar": "Yellow",
  "USC Events": "Blue",
  "Org/CSC Calendared Event": "Maroon",
  "Org/CSC Proposed Event": "Bright Green",
  "Org/CSC Outreach Programs": "Magenta/Pink",
};

const COLLEGE_HOSTS: [RegExp, string][] = [
  [/^COC\b/i, "WVSU College of Communication Student Council"],
  [/^COL\b/i, "WVSU College of Law Student Council"],
  [/^CAS\b/i, "Arts and Sciences Student Council, Inc."],
  [/^CICT\b/i, "WVSU College of Information and Communications Technology Student Council"],
  [/^CON\b/i, "WVSU College of Nursing Student Council"],
  [/^COD\b/i, "COLLEGE OF DENTISTRY STUDENT COUNCIL"],
  [/^CBM\b/i, "WVSU College of Business and Management Student Council"],
  [/^COE Days/i, "WVSU Education Student Council"],
  [/^COP\b/i, "WVSU College of Communication Student Council"],
  [/^ILS\b/i, "WVSU - Integrated Laboratory School Student Council"],
  [/^Medicine Week/i, "WVSU Medicine Student Council"],
  [/^MICROBIA/i, "MICROBIA"],
  [/^Jericho Walk/i, "CRU WVSU"],
];

function parseDateRange(token: string): { start: string; end: string } | null {
  const cleaned = token.trim().replace(/\u2019/g, "'").replace(/\u2013|\u2014/g, "-");
  const range = cleaned.match(
    /^([A-Za-z]+)\s+(\d{1,2})\s*-\s*(\d{1,2}),?\s*(\d{4})$/
  );
  if (range) {
    const month = MONTHS[range[1].toLowerCase()];
    if (!month) return null;
    const pad = (n: number) => String(n).padStart(2, "0");
    return {
      start: `${range[4]}-${pad(month)}-${pad(Number(range[2]))}`,
      end: `${range[4]}-${pad(month)}-${pad(Number(range[3]))}`,
    };
  }
  const single = cleaned.match(/^([A-Za-z]+)\s+(\d{1,2}),?\s*(\d{4})$/);
  if (single) {
    const month = MONTHS[single[1].toLowerCase()];
    if (!month) return null;
    const pad = (n: number) => String(n).padStart(2, "0");
    const d = `${single[3]}-${pad(month)}-${pad(Number(single[2]))}`;
    return { start: d, end: d };
  }
  return null;
}

function splitTitleLocation(raw: string): { title: string; location: string } {
  const at = raw.lastIndexOf(" @ ");
  if (at === -1) return { title: raw.trim(), location: "TBA" };
  return {
    title: raw.slice(0, at).trim(),
    location: raw.slice(at + 3).trim(),
  };
}

function resolveHost(rawHost: string | undefined, title: string, category: string): string {
  if (rawHost) {
    const alias = (hostAliases as Record<string, string>)[rawHost.trim()];
    return alias ?? rawHost.trim();
  }
  if (category === "WVSU Calendar") return "WVSU";
  if (category === "USC Events") return "University Student Council";
  if (category === "National Holiday") return "WVSU";
  for (const [pattern, host] of COLLEGE_HOSTS) {
    if (pattern.test(title)) return host;
  }
  return "";
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u2018\u2019']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function parseOfficialLines(text: string): OfficialEvent[] {
  const events: OfficialEvent[] = [];
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("=") || !trimmed.includes("|")) continue;
    const parts = trimmed.split("|").map((p) => p.trim());
    if (parts.length < 3) continue;

    const dates = parseDateRange(parts[0]);
    if (!dates) continue;

    let hostRaw: string | undefined;
    let category = parts[parts.length - 1];
    let titlePart = parts[1];

    if (parts.length >= 4 && parts[2].toLowerCase().startsWith("host:")) {
      hostRaw = parts[2].replace(/^host:\s*/i, "");
      category = parts[3];
    }

    const { title, location } = splitTitleLocation(titlePart);
    const host = resolveHost(hostRaw, title, category);
    const organization = host || (category === "WVSU Calendar" ? "WVSU" : category === "USC Events" ? "University Student Council" : "");

    const status =
      category === "Org/CSC Proposed Event"
        ? "Proposed"
        : category === "National Holiday" || category === "WVSU Calendar" || category === "USC Events"
          ? "Approved"
          : host
            ? "Approved"
            : "Needs Verification";

    events.push({
      title,
      category,
      host: host || organization,
      organization: organization || host,
      startDate: dates.start,
      endDate: dates.end,
      location,
      status,
    });
  }
  return events;
}

function scoreMatch(official: OfficialEvent, db: { title: string; startDate: Date; endDate: Date; location: string }): number {
  const titleScore = normalize(db.title).includes(normalize(official.title)) || normalize(official.title).includes(normalize(db.title)) ? 2 : 0;
  const dbStart = db.startDate.toISOString().slice(0, 10);
  const dbEnd = db.endDate.toISOString().slice(0, 10);
  const dateScore =
    dbStart === official.startDate && dbEnd === official.endDate
      ? 3
      : dbStart <= official.endDate && official.startDate <= dbEnd
        ? 1
        : 0;
  const locScore =
    official.location !== "TBA" && normalize(db.location).includes(normalize(official.location)) ? 1 : 0;
  return titleScore + dateScore + locScore;
}

function toCsv(rows: ReportRow[]): string {
  const headers = Object.keys(rows[0] ?? {});
  const esc = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
  return [headers.join(","), ...rows.map((r) => headers.map((h) => esc((r as Record<string, string>)[h] ?? "")).join(","))].join("\n");
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required");

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  const text = readFileSync(join(process.cwd(), "prisma/data/official-unified-calendar.txt"), "utf-8");
  const officialEvents = parseOfficialLines(text);
  console.log(`Parsed ${officialEvents.length} official unified calendar events.`);

  const dbEvents = await prisma.event.findMany();
  const report: ReportRow[] = [];
  const usedDbIds = new Set<string>();

  let updated = 0;
  let inserted = 0;
  let categoryFixes = 0;
  let hostFixes = 0;

  for (const official of officialEvents) {
    let best: (typeof dbEvents)[number] | null = null;
    let bestScore = 0;

    for (const db of dbEvents) {
      if (usedDbIds.has(db.id)) continue;
      const score = scoreMatch(official, db);
      if (score > bestScore) {
        bestScore = score;
        best = db;
      }
    }

    const officialColor = CATEGORY_COLORS[official.category] ?? "";
    const correctionParts: string[] = [];

    if (best && bestScore >= 3) {
      usedDbIds.add(best.id);
      const updates: Record<string, string> = {};
      if (best.category !== official.category) {
        updates.category = official.category;
        categoryFixes++;
        correctionParts.push(`category: ${best.category} -> ${official.category}`);
      }
      if (official.host && normalize(best.host) !== normalize(official.host)) {
        updates.host = official.host;
        hostFixes++;
        correctionParts.push(`host: ${best.host} -> ${official.host}`);
      }
      if (official.organization && normalize(best.organization) !== normalize(official.organization)) {
        updates.organization = official.organization;
        correctionParts.push(`organization: ${best.organization} -> ${official.organization}`);
      }
      if (official.location !== "TBA" && normalize(best.location) !== normalize(official.location)) {
        updates.location = official.location;
        correctionParts.push(`location updated`);
      }
      if (best.status !== official.status && best.status !== "Cancelled") {
        updates.status = official.status;
      }
      updates.sourceFile = SOURCE_FILE;

      if (Object.keys(updates).length > 0) {
        await prisma.event.update({ where: { id: best.id }, data: updates });
        updated++;
      }

      report.push({
        sourcePdf: SOURCE_FILE,
        page: "unified",
        documentOrg: official.organization,
        eventDate: `${official.startDate}${official.endDate !== official.startDate ? ` to ${official.endDate}` : ""}`,
        originalTitle: official.title,
        correctHost: official.host,
        venue: official.location,
        targetParticipants: best.targetParticipants,
        previousCategory: best.category,
        correctCategory: official.category,
        officialColor,
        previousHost: best.host,
        correctionMade: correctionParts.join("; ") || "Matched — no change",
        conflictFound: "",
        verificationStatus: official.host ? "Verified" : "Needs Verification",
        remarks: `Matched DB id ${best.id}`,
      });
    } else {
      const id = `official-${official.startDate}-${normalize(official.title).slice(0, 40).replace(/\s+/g, "-")}`;
      const existing = await prisma.event.findUnique({ where: { id } });
      if (!existing) {
        await prisma.event.create({
          data: {
            id,
            title: official.title,
            category: official.category,
            host: official.host,
            organization: official.organization,
            eventType: "University Event",
            status: official.status,
            startDate: new Date(`${official.startDate}T00:00:00.000Z`),
            endDate: new Date(`${official.endDate}T00:00:00.000Z`),
            location: official.location,
            sourceFile: SOURCE_FILE,
            remarks: "Inserted from official unified calendar audit",
          },
        });
        inserted++;
        correctionParts.push("Inserted new official event");
      }

      report.push({
        sourcePdf: SOURCE_FILE,
        page: "unified",
        documentOrg: official.organization,
        eventDate: `${official.startDate}${official.endDate !== official.startDate ? ` to ${official.endDate}` : ""}`,
        originalTitle: official.title,
        correctHost: official.host,
        venue: official.location,
        targetParticipants: "",
        previousCategory: existing?.category ?? "",
        correctCategory: official.category,
        officialColor,
        previousHost: existing?.host ?? "",
        correctionMade: correctionParts.join("; ") || "New insert",
        conflictFound: "",
        verificationStatus: official.host ? "Verified" : "Needs Verification",
        remarks: best ? `Weak match only (score ${bestScore})` : "No DB match",
      });
    }
  }

  // Fix org-submitted events wrongly labeled WVSU Calendar when host is clearly an org
  const orgCategories = new Set([
    "Org/CSC Proposed Event",
    "Org/CSC Calendared Event",
    "Org/CSC Outreach Programs",
  ]);
  const wrongWvsu = dbEvents.filter(
    (e) =>
      e.category === "WVSU Calendar" &&
      e.host &&
      e.host !== "WVSU" &&
      !e.host.toLowerCase().startsWith("wvsu calendar") &&
      !usedDbIds.has(e.id)
  );

  for (const event of wrongWvsu) {
    const inferred =
      event.title.toLowerCase().includes("outreach") || event.title.toLowerCase().includes("@")
        ? "Org/CSC Proposed Event"
        : "Org/CSC Proposed Event";
    if (event.organization !== "WVSU" && event.host !== "WVSU") {
      await prisma.event.update({
        where: { id: event.id },
        data: {
          category: inferred,
          status: event.status === "Approved" ? "Proposed" : event.status,
          remarks: `${event.remarks ? event.remarks + " | " : ""}Auto-corrected: org event was wrongly labeled WVSU Calendar`,
        },
      });
      categoryFixes++;
      report.push({
        sourcePdf: event.sourceFile || "database audit",
        page: "",
        documentOrg: event.organization,
        eventDate: event.startDate.toISOString().slice(0, 10),
        originalTitle: event.title,
        correctHost: event.host,
        venue: event.location,
        targetParticipants: event.targetParticipants,
        previousCategory: "WVSU Calendar",
        correctCategory: inferred,
        officialColor: CATEGORY_COLORS[inferred],
        previousHost: event.host,
        correctionMade: "Removed incorrect WVSU Calendar label from org-hosted event",
        conflictFound: "",
        verificationStatus: "Corrected",
        remarks: `DB id ${event.id}`,
      });
    }
  }

  const outDir = join(process.cwd(), "prisma/reports");
  mkdirSync(outDir, { recursive: true });
  const stamp = new Date().toISOString().slice(0, 10);
  const jsonPath = join(outDir, `revalidation-report-${stamp}.json`);
  const csvPath = join(outDir, `revalidation-report-${stamp}.csv`);
  writeFileSync(jsonPath, JSON.stringify(report, null, 2));
  if (report.length) writeFileSync(csvPath, toCsv(report));

  const summary = {
    officialEventsParsed: officialEvents.length,
    dbEventsUpdated: updated,
    dbEventsInserted: inserted,
    categoryCorrections: categoryFixes,
    hostCorrections: hostFixes,
    wrongWvsuLabelsFixed: wrongWvsu.length,
    reportRows: report.length,
    reportJson: jsonPath,
    reportCsv: csvPath,
  };

  console.log("\n=== OFFICIAL CALENDAR AUDIT SUMMARY ===");
  console.log(JSON.stringify(summary, null, 2));

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
