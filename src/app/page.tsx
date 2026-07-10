export const dynamic = "force-dynamic";

import Link from "next/link";
import { format, parseISO } from "date-fns";
import { Calendar, Shield, ArrowRight, AlertCircle } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { CategoryBadge } from "@/components/events/category-badge";
import { Card, CardContent } from "@/components/ui/card";
import { getEventStats, getUpcomingEvents } from "@/lib/queries";

export default async function HomePage() {
  let stats = { total: 0, thisMonth: 0, pending: 0, proposed: 0 };
  let upcoming: Awaited<ReturnType<typeof getUpcomingEvents>> = [];

  try {
    [stats, upcoming] = await Promise.all([getEventStats(), getUpcomingEvents(6)]);
  } catch {
    // Database not configured yet
  }

  const statCards = [
    { label: "Total Events", value: stats.total, icon: Calendar },
    { label: "Events This Month", value: stats.thisMonth, icon: Calendar },
    { label: "Needs Approval", value: stats.pending, icon: AlertCircle },
    { label: "Proposed Events", value: stats.proposed, icon: AlertCircle },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#c9a227]">
            Official University Calendar
          </p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
            Plan together. Stay aligned.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-600">
            The unified calendar for West Visayas State University student organizations,
            councils, and university-wide events for Academic Year 2026–2027.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/calendar"
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#1e3a5f] px-6 text-sm font-medium text-white hover:bg-[#16304f]"
            >
              <Calendar className="h-4 w-4" />
              View Calendar
            </Link>
            <Link
              href="/admin/login"
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#c9a227] px-6 text-sm font-semibold text-[#1e3a5f] hover:bg-[#dfc04a]"
            >
              <Shield className="h-4 w-4" />
              Admin Login
            </Link>
          </div>
        </section>

        <section className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map(({ label, value, icon: Icon }) => (
            <Card key={label}>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1e3a5f]/10 text-[#1e3a5f]">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{value}</p>
                  <p className="text-sm text-slate-500">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-slate-900">Upcoming Events</h3>
            <Link
              href="/calendar"
              className="inline-flex items-center gap-1 text-sm font-medium text-[#1e3a5f] hover:underline"
            >
              See all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {upcoming.length === 0 ? (
              <Card className="md:col-span-2">
                <CardContent className="p-8 text-center text-slate-500">
                  No upcoming events yet. Connect your database and run the seed script to load
                  calendar data.
                </CardContent>
              </Card>
            ) : (
              upcoming.map((event) => (
                <Card key={event.id} className="transition hover:shadow-md">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-semibold text-slate-900">{event.title}</h4>
                        <p className="mt-1 text-sm text-slate-500">
                          {format(parseISO(event.startDate), "MMMM d, yyyy")} · {event.location}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">{event.organization}</p>
                      </div>
                      <CategoryBadge category={event.category} />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
