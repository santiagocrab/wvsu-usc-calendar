import hostAliases from "../../prisma/data/host-aliases.json";

const UNIVERSITY_CALENDAR_ORG = "wvsu";
const GENERIC_ACRONYMS = new Set(["wvsu", "usc", "wvs"]);
const GENERIC_NAME_TOKENS = new Set([
  "west", "visayas", "state", "university", "college", "association", "society",
  "council", "student", "students", "organization", "integrated", "laboratory",
  "school", "wvsu", "sciences", "science", "communication", "education",
  "medicine", "nursing", "business", "management", "information", "technology",
]);

const ALIAS_TO_CANONICAL: Record<string, string> = {};
for (const [alias, canonical] of Object.entries(hostAliases as Record<string, string>)) {
  ALIAS_TO_CANONICAL[normalize(alias)] = canonical;
  ALIAS_TO_CANONICAL[normalize(canonical)] = canonical;
}

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u2018\u2019']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export type OrgRef = { name: string; acronym: string };

function isUniversityCalendarOrg(org: OrgRef): boolean {
  return normalize(org.name) === UNIVERSITY_CALENDAR_ORG;
}

function extractParentheticalTokens(name: string): string[] {
  const matches = name.match(/\(([^)]+)\)/g) ?? [];
  return matches.map((m) => normalize(m.slice(1, -1))).filter(Boolean);
}

function tokensIncludeAcronym(field: string, acronym: string): boolean {
  if (!acronym) return false;
  const fieldTokens = new Set(field.split(/\s+/).filter(Boolean));
  const acrTokens = acronym.split(/\s+/).filter(Boolean);
  if (acrTokens.length === 0) return false;

  const compact = acronym.replace(/\s+/g, "");
  if (compact.length <= 3) {
    return acrTokens.every((t) => fieldTokens.has(t));
  }

  if (fieldTokens.has(acronym)) return true;
  return acrTokens.every((t) => fieldTokens.has(t));
}

function significantOverlap(a: string, b: string): boolean {
  if (!a || !b) return false;
  if (a === b) return true;
  const shorter = a.length <= b.length ? a : b;
  const longer = a.length <= b.length ? b : a;
  return shorter.length >= 8 && longer.includes(shorter);
}

function aliasMatchesOrg(field: string, orgName: string): boolean {
  const canon = ALIAS_TO_CANONICAL[normalize(field)];
  if (!canon) return false;
  const canonNorm = normalize(canon);
  return canonNorm === orgName || significantOverlap(canonNorm, orgName);
}

function distinctiveNameTokens(name: string): string[] {
  return name
    .split(/[^a-zA-Z0-9]+/)
    .map(normalize)
    .filter((t) => t.length > 4 && !GENERIC_NAME_TOKENS.has(t));
}

function sourceFileMatchesOrg(sourceFile: string, org: OrgRef, orgAcr: string): boolean {
  const sf = normalize(sourceFile);
  if (!sf) return false;

  if (orgAcr && !GENERIC_ACRONYMS.has(orgAcr) && tokensIncludeAcronym(sf, orgAcr)) {
    return true;
  }

  const parenTokens = extractParentheticalTokens(org.name);
  if (parenTokens.some((pt) => pt.length >= 4 && sf.includes(pt))) {
    return true;
  }

  const distinctive = distinctiveNameTokens(org.name);
  const hits = distinctive.filter((t) => sf.includes(t));
  return hits.length >= 2 || (hits.length === 1 && hits[0].length >= 8);
}

export function eventMatchesOrg(
  event: { organization: string; host: string; category?: string; sourceFile?: string },
  org: OrgRef
): boolean {
  if (isUniversityCalendarOrg(org)) {
    return (
      event.category === "WVSU Calendar" ||
      event.category === "National Holiday" ||
      normalize(event.organization) === UNIVERSITY_CALENDAR_ORG ||
      normalize(event.host) === UNIVERSITY_CALENDAR_ORG
    );
  }

  const orgName = normalize(org.name);
  const orgAcr = normalize(org.acronym);
  const fields = [event.organization, event.host].map(normalize);

  if (fields.some((f) => f === orgName)) return true;
  if (fields.some((f) => significantOverlap(f, orgName))) return true;

  const parenTokens = extractParentheticalTokens(org.name);
  if (
    fields.some((f) =>
      parenTokens.some(
        (pt) => pt.length >= 4 && (f === pt || significantOverlap(f, pt))
      )
    )
  ) {
    return true;
  }

  if (orgAcr && !GENERIC_ACRONYMS.has(orgAcr)) {
    if (fields.some((f) => tokensIncludeAcronym(f, orgAcr))) return true;
  }

  for (const field of [event.organization, event.host]) {
    if (aliasMatchesOrg(field, orgName)) return true;
  }

  if (event.sourceFile && sourceFileMatchesOrg(event.sourceFile, org, orgAcr)) {
    return true;
  }

  return false;
}

export function findOrgByName(orgs: OrgRef[], name: string): OrgRef | undefined {
  const target = normalize(name);
  return orgs.find((o) => normalize(o.name) === target);
}
