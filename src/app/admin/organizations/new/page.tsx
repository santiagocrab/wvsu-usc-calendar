export const dynamic = "force-dynamic";

import { AdminFormPageClient } from "@/components/pages/admin-form-page-client";
import { OrganizationForm } from "@/components/admin/organizations-table";
import { getEvents } from "@/lib/queries";
import { getOrganizations } from "@/lib/organizations";
import { getConflictBadgeCount } from "@/lib/conflict-queries";

export default async function NewOrganizationPage() {
  let eventCount = 0;
  let orgCount = 0;
  let conflictCount = 0;

  try {
    const [events, orgs] = await Promise.all([getEvents(), getOrganizations()]);
    eventCount = events.length;
    orgCount = orgs.length;
    conflictCount = await getConflictBadgeCount();
  } catch {
    // Database not configured
  }

  return (
    <AdminFormPageClient
      title="Add organization"
      subtitle="Register a new council, society, or student org."
      backHref="/admin/organizations"
      backLabel="Back to organizations"
      eventCount={eventCount}
      orgCount={orgCount}
      conflictCount={conflictCount}
    >
      <OrganizationForm mode="create" />
    </AdminFormPageClient>
  );
}
