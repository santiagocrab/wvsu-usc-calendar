export const dynamic = "force-dynamic";

import { AdminFormPageClient } from "@/components/pages/admin-form-page-client";
import { EventForm } from "@/components/events/event-form";
import { getEvents } from "@/lib/queries";
import { getOrganizations } from "@/lib/organizations";
import { getConflictBadgeCount } from "@/lib/conflict-queries";

export default async function NewEventPage() {
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
      title="Add new event"
      subtitle="Create a calendar entry for an organization or council."
      backHref="/admin/events"
      backLabel="Back to events"
      eventCount={eventCount}
      orgCount={orgCount}
      conflictCount={conflictCount}
    >
      <EventForm mode="create" />
    </AdminFormPageClient>
  );
}
