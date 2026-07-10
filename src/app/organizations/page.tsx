export const dynamic = "force-dynamic";

import { getEvents } from "@/lib/queries";
import { getOrganizations } from "@/lib/organizations";
import { detectConflicts } from "@/lib/conflicts";
import { OrganizationsPageClient } from "@/components/pages/organizations-page-client";

export default async function OrganizationsPage() {
  let events: Awaited<ReturnType<typeof getEvents>> = [];
  let orgs: Awaited<ReturnType<typeof getOrganizations>> = [];
  let conflicts: ReturnType<typeof detectConflicts> = [];

  try {
    [events, orgs] = await Promise.all([getEvents(), getOrganizations()]);
    conflicts = detectConflicts(events);
  } catch { /* db */ }

  const conflictEventIds = conflicts.flatMap((c) => c.events.map((e) => e.id));

  return (
    <OrganizationsPageClient
      events={events}
      organizations={orgs}
      conflictEventIds={conflictEventIds}
      conflictCount={conflicts.length}
    />
  );
}
