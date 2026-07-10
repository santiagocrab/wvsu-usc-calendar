"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import type { EventDTO } from "@/lib/events";
import type { OrganizationDTO } from "@/lib/organizations";
import { CalendarView } from "@/components/events/calendar-view";

export function CalendarPageClient({
  events,
  organizations,
  orgCount,
  conflictCount,
}: {
  events: EventDTO[];
  organizations: OrganizationDTO[];
  orgCount: number;
  conflictCount: number;
}) {
  const [search, setSearch] = useState("");
  return (
    <AppShell search={search} onSearchChange={setSearch} orgCount={orgCount} conflictCount={conflictCount}>
      <CalendarView events={events} organizations={organizations.map((o) => o.name)} />
    </AppShell>
  );
}
