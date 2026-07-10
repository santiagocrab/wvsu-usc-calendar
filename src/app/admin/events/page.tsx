export const dynamic = "force-dynamic";

import { AdminEventsPageClient } from "@/components/pages/admin-events-page-client";
import { getEvents } from "@/lib/queries";
import { getOrganizations } from "@/lib/organizations";
import { getConflictBadgeCount } from "@/lib/conflict-queries";

export default async function AdminEventsPage() {
  let events: Awaited<ReturnType<typeof getEvents>> = [];
  let orgCount = 0;
  let conflictCount = 0;

  try {
    const [evts, orgs] = await Promise.all([getEvents(), getOrganizations()]);
    events = evts;
    orgCount = orgs.length;
    conflictCount = await getConflictBadgeCount();
  } catch {
    // Database not configured
  }

  return (
    <AdminEventsPageClient
      events={events}
      orgCount={orgCount}
      conflictCount={conflictCount}
    />
  );
}
