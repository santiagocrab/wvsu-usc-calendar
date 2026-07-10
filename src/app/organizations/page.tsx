export const dynamic = "force-dynamic";

import { getEvents } from "@/lib/queries";
import { getOrganizations } from "@/lib/organizations";
import { getConflictBadgeCount, getConflictEventIdList } from "@/lib/conflict-queries";
import { OrganizationsPageClient } from "@/components/pages/organizations-page-client";

export default async function OrganizationsPage() {
  let events: Awaited<ReturnType<typeof getEvents>> = [];
  let orgs: Awaited<ReturnType<typeof getOrganizations>> = [];
  let conflictEventIds: string[] = [];
  let conflictCount = 0;

  try {
    [events, orgs, conflictEventIds, conflictCount] = await Promise.all([
      getEvents(),
      getOrganizations(),
      getConflictEventIdList(),
      getConflictBadgeCount(),
    ]);
  } catch { /* db */ }

  return (
    <OrganizationsPageClient
      events={events}
      organizations={orgs}
      conflictEventIds={conflictEventIds}
      conflictCount={conflictCount}
    />
  );
}
