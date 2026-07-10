"use client";

import Link from "next/link";
import { Plus, List } from "lucide-react";
import { AdminShell } from "@/components/layout/admin-shell";
import { AdminEventsTable } from "@/components/admin/events-table";
import type { EventDTO } from "@/lib/events";

export function AdminEventsPageClient({
  events,
  orgCount,
  conflictCount,
}: {
  events: EventDTO[];
  orgCount: number;
  conflictCount: number;
}) {
  return (
    <AdminShell
      eventCount={events.length}
      orgCount={orgCount}
      conflictCount={conflictCount}
      title="Manage Events"
      subtitle={`${events.length} events in the unified calendar`}
    >
      <div className="space-y-6 max-w-6xl mx-auto">
        <section className="usc-card p-5 sm:p-6 dark:bg-[#252220]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-usc-black dark:text-[#F5F0E8] flex items-center gap-2">
                <List size={22} className="text-usc-gold" />
                All events
              </h1>
              <p className="text-sm text-usc-muted mt-1">
                Search, filter, edit, or remove calendar entries.
              </p>
            </div>
            <Link
              href="/admin/events/new"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-usc-gold text-usc-black text-sm font-bold hover:bg-usc-gold-dark hover:text-white transition shadow-sm shrink-0"
            >
              <Plus size={16} />
              Add event
            </Link>
          </div>
        </section>

        <AdminEventsTable events={events} />
      </div>
    </AdminShell>
  );
}
