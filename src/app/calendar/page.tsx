export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { getEvents } from "@/lib/queries";
import { getOrganizations } from "@/lib/organizations";
import { detectConflicts } from "@/lib/conflicts";
import { CalendarPageClient } from "@/components/pages/calendar-page-client";

export default async function CalendarPage() {
  let events: Awaited<ReturnType<typeof getEvents>> = [];
  let orgs: Awaited<ReturnType<typeof getOrganizations>> = [];
  let conflictCount = 0;

  try {
    [events, orgs] = await Promise.all([getEvents(), getOrganizations()]);
    conflictCount = detectConflicts(events).length;
  } catch { /* db */ }

  return (
    <Suspense>
      <CalendarPageClient
        events={events}
        organizations={orgs}
        orgCount={orgs.length}
        conflictCount={conflictCount}
      />
    </Suspense>
  );
}
