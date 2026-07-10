export const dynamic = "force-dynamic";

import { getEvents } from "@/lib/queries";
import { getOrganizations } from "@/lib/organizations";
import { detectConflicts } from "@/lib/conflicts";
import { ConflictsPageClient } from "@/components/pages/conflicts-page-client";

export default async function ConflictsPage() {
  let conflicts: ReturnType<typeof detectConflicts> = [];
  let orgCount = 0;
  try {
    const [events, orgs] = await Promise.all([getEvents(), getOrganizations()]);
    conflicts = detectConflicts(events);
    orgCount = orgs.length;
  } catch { /* db */ }

  return <ConflictsPageClient conflicts={conflicts} orgCount={orgCount} />;
}
