import { AdminNav } from "@/components/admin/admin-nav";
import { EventForm } from "@/components/events/event-form";

export default function NewEventPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-[#1e3a5f] px-4 py-4 text-white sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c9a227]">Administrator</p>
        <p className="text-lg font-semibold">Add New Event</p>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <AdminNav />
        <EventForm mode="create" />
      </main>
    </div>
  );
}
