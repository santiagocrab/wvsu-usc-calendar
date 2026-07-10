import hostAliases from "../../prisma/data/host-aliases.json";

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

export function eventMatchesOrg(
  event: { organization: string; host: string; sourceFile?: string },
  org: { name: string; acronym: string }
): boolean {
  const orgName = normalize(org.name);
  const orgAcr = normalize(org.acronym);
  const fields = [event.organization, event.host].map(normalize);

  if (fields.some((f) => f === orgName || (orgAcr && f.includes(orgAcr)))) return true;
  if (fields.some((f) => orgName && f.includes(orgName))) return true;

  for (const field of [event.organization, event.host]) {
    const canon = ALIAS_TO_CANONICAL[normalize(field)];
    if (canon && normalize(canon) === orgName) return true;
  }

  const sf = normalize(event.sourceFile ?? "");
  if (orgAcr && sf.includes(orgAcr)) return true;
  const nameToken = org.name.split(/[^a-zA-Z0-9]+/).filter((t) => t.length > 4)[0];
  if (nameToken && sf.includes(normalize(nameToken))) return true;

  return false;
}
