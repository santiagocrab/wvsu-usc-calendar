export const dynamic = "force-dynamic";

import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminNav } from "@/components/admin/admin-nav";
import { AdminEventsTable } from "@/components/admin/events-table";
import { getEvents } from "@/lib/queries";

export default async function AdminEventsPage() {
  let events: Awaited<ReturnType<typeof getEvents>> = [];
  try {
    events = await getEvents();
  } catch {
    // Database not configured
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-[#1e3a5f] px-4 py-4 text-white sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c9a227]">Administrator</p>
        <p className="text-lg font-semibold">Manage Events</p>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <AdminNav />
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">All Events ({events.length})</h2>
          <Link
            href="/admin/events/new"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#1e3a5f] px-4 text-sm font-medium text-white hover:bg-[#16304f]"
          >
            <Plus className="h-4 w-4" />
            Add Event
          </Link>
        </div>
        <AdminEventsTable events={events} />
      </main>
    </div>
  );
}
