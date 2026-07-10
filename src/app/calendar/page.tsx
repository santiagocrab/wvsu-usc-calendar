export const dynamic = "force-dynamic";

import { SiteHeader } from "@/components/layout/site-header";
import { CalendarView } from "@/components/events/calendar-view";
import { getEvents } from "@/lib/queries";

export default async function CalendarPage() {
  let events: Awaited<ReturnType<typeof getEvents>> = [];
  try {
    events = await getEvents();
  } catch {
    // Database not configured
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <CalendarView events={events} />
      </main>
    </div>
  );
}
