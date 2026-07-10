export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { AdminFormPageClient } from "@/components/pages/admin-form-page-client";
import { EventForm } from "@/components/events/event-form";
import { getEventById, getEvents } from "@/lib/queries";
import { getOrganizations } from "@/lib/organizations";
import { detectConflicts } from "@/lib/conflicts";
import type { EventFormData } from "@/actions/events";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEventById(id);
  if (!event) notFound();

  let eventCount = 0;
  let orgCount = 0;
  let conflictCount = 0;

  try {
    const [events, orgs] = await Promise.all([getEvents(), getOrganizations()]);
    eventCount = events.length;
    orgCount = orgs.length;
    conflictCount = detectConflicts(events).length;
  } catch {
    // Database not configured
  }

  const initialData: EventFormData = {
    title: event.title,
    category: event.category,
    host: event.host,
    organization: event.organization,
    eventType: event.eventType,
    status: event.status,
    startDate: event.startDate,
    endDate: event.endDate,
    startTime: event.startTime,
    endTime: event.endTime,
    location: event.location,
    mapLink: event.mapLink,
    targetParticipants: event.targetParticipants,
    description: event.description,
    contactPerson: event.contactPerson,
    sourceFile: event.sourceFile,
    remarks: event.remarks,
  };

  return (
    <AdminFormPageClient
      title="Edit event"
      subtitle={event.title}
      backHref="/admin/events"
      backLabel="Back to events"
      eventCount={eventCount}
      orgCount={orgCount}
      conflictCount={conflictCount}
    >
      <EventForm mode="edit" eventId={id} initialData={initialData} />
    </AdminFormPageClient>
  );
}
