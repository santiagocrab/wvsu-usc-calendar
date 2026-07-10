export const dynamic = "force-dynamic";

import { AdminOrganizationsPageClient } from "@/components/pages/admin-organizations-page-client";
import { getEvents } from "@/lib/queries";
import { getOrganizations } from "@/lib/organizations";
import { getConflictBadgeCount } from "@/lib/conflict-queries";

export default async function AdminOrganizationsPage() {
  let orgs: Awaited<ReturnType<typeof getOrganizations>> = [];
  let eventCount = 0;
  let conflictCount = 0;

  try {
    const [events, organizations] = await Promise.all([getEvents(), getOrganizations()]);
    orgs = organizations;
    eventCount = events.length;
    conflictCount = await getConflictBadgeCount();
  } catch {
    // Database not configured
  }

  return (
    <AdminOrganizationsPageClient
      organizations={orgs}
      eventCount={eventCount}
      conflictCount={conflictCount}
    />
  );
}
