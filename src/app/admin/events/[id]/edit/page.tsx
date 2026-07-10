export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { AdminNav } from "@/components/admin/admin-nav";
import { EventForm } from "@/components/events/event-form";
import { getEventById } from "@/lib/queries";
import type { EventFormData } from "@/actions/events";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEventById(id);
  if (!event) notFound();

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
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-[#1e3a5f] px-4 py-4 text-white sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c9a227]">Administrator</p>
        <p className="text-lg font-semibold">Edit Event</p>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <AdminNav />
        <EventForm mode="edit" eventId={id} initialData={initialData} />
      </main>
    </div>
  );
}
