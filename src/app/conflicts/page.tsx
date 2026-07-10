export const dynamic = "force-dynamic";

import Link from "next/link";
import { format, parseISO } from "date-fns";
import { SiteHeader } from "@/components/layout/site-header";
import { CategoryBadge } from "@/components/events/category-badge";
import { getEvents } from "@/lib/queries";
import { detectConflicts } from "@/lib/conflicts";

export default async function ConflictsPage() {
  let conflicts: ReturnType<typeof detectConflicts> = [];

  try {
    const events = await getEvents();
    conflicts = detectConflicts(events);
  } catch {
    // Database not configured
  }

  const severityColors = {
    high: "border-red-300 bg-red-50",
    medium: "border-amber-300 bg-amber-50",
    low: "border-slate-300 bg-white",
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Conflict Checker</h2>
          <p className="mt-2 text-slate-600">
            Possible scheduling conflicts across venues, dates, holidays, and WVSU major events.
          </p>
          <p className="mt-1 text-sm text-slate-500">{conflicts.length} potential conflict(s) detected</p>
        </div>

        <div className="space-y-4">
          {conflicts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
              No conflicts detected with current calendar data.
            </div>
          ) : (
            conflicts.map((conflict, i) => (
              <div
                key={i}
                className={`rounded-2xl border p-5 shadow-sm ${severityColors[conflict.severity]}`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-semibold uppercase text-slate-600">
                    {conflict.severity}
                  </span>
                  <span className="text-xs uppercase text-slate-500">{conflict.type.replace(/_/g, " ")}</span>
                </div>
                <p className="mt-2 font-medium text-slate-900">{conflict.message}</p>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {conflict.events.map((event) => (
                    <div key={event.id} className="rounded-xl border border-slate-200 bg-white p-4">
                      <p className="font-medium text-slate-900">{event.title}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {format(parseISO(event.startDate), "MMM d, yyyy")}
                        {event.startDate !== event.endDate &&
                          ` – ${format(parseISO(event.endDate), "MMM d, yyyy")}`}
                      </p>
                      <p className="text-sm text-slate-600">{event.location}</p>
                      <div className="mt-2">
                        <CategoryBadge category={event.category} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-8">
          <Link href="/calendar" className="text-sm font-medium text-[#1e3a5f] hover:underline">
            ← Back to Calendar
          </Link>
        </div>
      </main>
    </div>
  );
}
