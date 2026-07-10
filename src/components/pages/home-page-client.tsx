"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { format, parseISO, addDays } from "date-fns";
import { Calendar, Building2, Sparkles, CalendarDays, AlertTriangle } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { NoticeBanner, CategoryLegend } from "@/components/events/category-legend";
import { CategoryBadge } from "@/components/events/category-badge";
import { CATEGORY_META } from "@/lib/constants";
import type { EventDTO } from "@/lib/events";
import { cn } from "@/lib/utils";

export function HomePageClient({
  events,
  orgCount,
  conflictCount,
  upcoming,
}: {
  events: EventDTO[];
  orgCount: number;
  conflictCount: number;
  upcoming: EventDTO[];
}) {
  const [search, setSearch] = useState("");
  const today = format(new Date(), "yyyy-MM-dd");
  const weekEnd = format(addDays(new Date(), 7), "yyyy-MM-dd");

  const stats = useMemo(() => ({
    total: events.length,
    thisWeek: events.filter((e) => e.startDate >= today && e.startDate <= weekEnd).length,
    outreach: events.filter((e) => e.category === "Org/CSC Outreach Programs").length,
  }), [events, today, weekEnd]);

  const chips = [
    { label: "Events", value: stats.total, bg: "bg-usc-sky-wash dark:bg-usc-sky/15", border: "border-usc-sky/25", text: "text-usc-sky" },
    { label: "Organizations", value: orgCount, bg: "bg-usc-gold-wash dark:bg-usc-gold/15", border: "border-usc-gold/30", text: "text-usc-gold-dark dark:text-usc-gold" },
    { label: "Venue conflicts", value: conflictCount, bg: "bg-usc-coral-wash dark:bg-usc-coral/15", border: "border-usc-coral/25", text: "text-usc-coral" },
    { label: "Outreach", value: stats.outreach, bg: "bg-usc-lavender-wash dark:bg-usc-lavender/15", border: "border-usc-lavender/25", text: "text-usc-lavender" },
  ];

  const byCategory = useMemo(() => {
    const c: Record<string, number> = {};
    events.forEach((e) => { c[e.category] = (c[e.category] || 0) + 1; });
    return Object.entries(c).sort((a, b) => b[1] - a[1]);
  }, [events]);

  return (
    <AppShell search={search} onSearchChange={setSearch} orgCount={orgCount} conflictCount={conflictCount}>
      <div className="space-y-6 max-w-6xl mx-auto">
        <section className="usc-card overflow-hidden dark:bg-[#252220]">
          <div className="relative p-6 sm:p-8 bg-gradient-to-br from-usc-gold-wash via-white to-usc-sky-wash dark:from-usc-gold/10 dark:via-[#252220] dark:to-usc-sky/10">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <img src="/usc.jpg" alt="USC" className="w-24 h-24 rounded-2xl object-cover usc-gold-ring shrink-0 rotate-[-2deg]" />
              <div className="text-center sm:text-left flex-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 dark:bg-white/10 border border-usc-gold/30 text-xs font-semibold text-usc-gold-dark dark:text-usc-gold mb-3">
                  <Sparkles size={12} /> Shared with all WVSU orgs
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-usc-black dark:text-[#F5F0E8] leading-tight">
                  Hey orgs — here&apos;s everyone&apos;s calendar
                </h1>
                <p className="text-usc-muted dark:text-white/55 text-sm sm:text-base mt-2 max-w-xl leading-relaxed">
                  {orgCount} organizations · {stats.total} activities · AY 2026–2027.
                </p>
                <div className="flex flex-wrap gap-2 mt-5 justify-center sm:justify-start">
                  <Link href="/calendar" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-usc-gold text-usc-black text-sm font-bold hover:bg-usc-gold-dark hover:text-white transition shadow-sm">
                    <Calendar size={16} /> Open calendar
                  </Link>
                  <Link href="/organizations" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white dark:bg-[#2A2724] text-usc-ink dark:text-[#F2EDE6] text-sm font-bold border border-usc-border hover:border-usc-gold transition">
                    <Building2 size={16} /> Browse orgs
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <NoticeBanner />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {chips.map(({ label, value, bg, border, text }) => (
            <div key={label} className={cn("usc-stat-chip border", bg, border)}>
              <p className={cn("text-2xl sm:text-3xl font-extrabold", text)}>{value}</p>
              <p className="text-xs font-semibold text-usc-muted dark:text-white/50 mt-1">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          <section className="usc-card p-5 dark:bg-[#252220]">
            <h2 className="font-extrabold text-usc-black dark:text-[#F5F0E8] flex items-center gap-2 mb-4">
              <CalendarDays size={18} className="text-usc-gold" /> Upcoming this week
            </h2>
            <div className="space-y-2">
              {upcoming.length === 0 ? (
                <p className="text-sm text-usc-muted">No upcoming events.</p>
              ) : upcoming.slice(0, 5).map((event) => (
                <div key={event.id} className="p-3 rounded-xl bg-usc-warm dark:bg-[#2A2724] border border-usc-border/60">
                  <p className="font-bold text-sm text-usc-black dark:text-[#F5F0E8]">{event.title}</p>
                  <p className="text-xs text-usc-muted mt-1">{format(parseISO(event.startDate), "MMM d")} · {event.organization}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="usc-card p-5 dark:bg-[#252220]">
            <h2 className="font-extrabold text-usc-black dark:text-[#F5F0E8] flex items-center gap-2 mb-4">
              <AlertTriangle size={18} className="text-usc-coral" /> By category
            </h2>
            <div className="space-y-2">
              {byCategory.map(([cat, count]) => {
                const meta = CATEGORY_META[cat];
                return (
                  <div key={cat} className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: meta?.color }} />
                    <span className="text-sm flex-1 text-usc-charcoal dark:text-white/70 truncate">{meta?.short ?? cat}</span>
                    <span className="text-sm font-bold text-usc-black dark:text-[#F5F0E8]">{count}</span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <CategoryLegend />
      </div>
    </AppShell>
  );
}
