export const dynamic = "force-dynamic";

import { getEvents, getUpcomingEvents } from "@/lib/queries";
import { getOrganizations } from "@/lib/organizations";
import { getConflictBadgeCount } from "@/lib/conflict-queries";
import { HomePageClient } from "@/components/pages/home-page-client";

export default async function HomePage() {
  let events: Awaited<ReturnType<typeof getEvents>> = [];
  let upcoming: Awaited<ReturnType<typeof getUpcomingEvents>> = [];
  let orgs: Awaited<ReturnType<typeof getOrganizations>> = [];
  let conflictCount = 0;

  try {
    [events, upcoming, orgs] = await Promise.all([getEvents(), getUpcomingEvents(8), getOrganizations()]);
    conflictCount = await getConflictBadgeCount();
  } catch { /* db */ }

  return (
    <HomePageClient
      events={events}
      orgCount={orgs.length}
      conflictCount={conflictCount}
      upcoming={upcoming}
    />
  );
}
