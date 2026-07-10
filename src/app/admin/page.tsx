export const dynamic = "force-dynamic";

import { AdminDashboardClient } from "@/components/pages/admin-dashboard-client";
import { getEventStats, getEvents } from "@/lib/queries";
import { getOrganizations } from "@/lib/organizations";
import { getConflictBadgeCount } from "@/lib/conflict-queries";

export default async function AdminDashboardPage() {
  let stats = { total: 0, thisMonth: 0, pending: 0, proposed: 0 };
  let events: Awaited<ReturnType<typeof getEvents>> = [];
  let orgCount = 0;
  let conflictCount = 0;

  try {
    const [eventStats, evts, orgs] = await Promise.all([
      getEventStats(),
      getEvents(),
      getOrganizations(),
    ]);
    stats = eventStats;
    events = evts;
    orgCount = orgs.length;
    conflictCount = await getConflictBadgeCount();
  } catch {
    // Database not configured
  }

  return (
    <AdminDashboardClient
      events={events}
      orgCount={orgCount}
      conflictCount={conflictCount}
      stats={stats}
    />
  );
}
