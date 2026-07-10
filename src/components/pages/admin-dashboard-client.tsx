"use client";

import { useMemo } from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import {
  Calendar, Building2, Sparkles, AlertTriangle, Plus, List, Shield, Clock,
} from "lucide-react";
import { AdminShell } from "@/components/layout/admin-shell";
import { NoticeBanner, CategoryLegend } from "@/components/events/category-legend";
import { StatusBadge } from "@/components/events/status-badge";
import { CATEGORY_META } from "@/lib/constants";
import type { EventDTO } from "@/lib/events";
import { cn } from "@/lib/utils";

export function AdminDashboardClient({
  events,
  orgCount,
  conflictCount,
  stats,
}: {
  events: EventDTO[];
  orgCount: number;
  conflictCount: number;
  stats: { total: number; thisMonth: number; pending: number; proposed: number };
}) {
  const needsReview = useMemo(
    () => events.filter((e) => e.status === "Needs Verification" || e.status === "Pending Approval").slice(0, 6),
    [events]
  );

  const byCategory = useMemo(() => {
    const c: Record<string, number> = {};
    events.forEach((e) => { c[e.category] = (c[e.category] || 0) + 1; });
    return Object.entries(c).sort((a, b) => b[1] - a[1]);
  }, [events]);

  const chips = [
    { label: "Total events", value: stats.total, bg: "bg-usc-sky-wash dark:bg-usc-sky/15", border: "border-usc-sky/25", text: "text-usc-sky" },
    { label: "This month", value: stats.thisMonth, bg: "bg-usc-gold-wash dark:bg-usc-gold/15", border: "border-usc-gold/30", text: "text-usc-gold-dark dark:text-usc-gold" },
    { label: "Needs review", value: stats.pending, bg: "bg-usc-coral-wash dark:bg-usc-coral/15", border: "border-usc-coral/25", text: "text-usc-coral" },
    { label: "Proposed", value: stats.proposed, bg: "bg-usc-mint-wash dark:bg-usc-mint/15", border: "border-usc-mint/25", text: "text-usc-mint" },
    { label: "Conflicts", value: conflictCount, bg: "bg-usc-lavender-wash dark:bg-usc-lavender/15", border: "border-usc-lavender/25", text: "text-usc-lavender" },
  ];

  return (
    <AdminShell
      eventCount={stats.total}
      orgCount={orgCount}
      conflictCount={conflictCount}
      title="Administrator Dashboard"
      subtitle="Manage the unified org calendar"
    >
      <div className="space-y-6 max-w-6xl mx-auto">
        <section className="usc-card overflow-hidden dark:bg-[#252220]">
          <div className="relative p-6 sm:p-8 bg-gradient-to-br from-usc-gold-wash via-white to-usc-lavender-wash dark:from-usc-gold/10 dark:via-[#252220] dark:to-usc-lavender/10">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <img src="/usc.jpg" alt="USC" className="w-24 h-24 rounded-2xl object-cover usc-gold-ring shrink-0 rotate-[-2deg]" />
              <div className="text-center sm:text-left flex-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 dark:bg-white/10 border border-usc-gold/30 text-xs font-semibold text-usc-gold-dark dark:text-usc-gold mb-3">
                  <Shield size={12} /> Administrator
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-usc-black dark:text-[#F5F0E8] leading-tight">
                  Calendar command center
                </h1>
                <p className="text-usc-muted dark:text-white/55 text-sm sm:text-base mt-2 max-w-xl leading-relaxed">
                  {orgCount} organizations · {stats.total} events · {conflictCount} conflicts flagged.
                </p>
                <div className="flex flex-wrap gap-2 mt-5 justify-center sm:justify-start">
                  <Link href="/admin/events/new" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-usc-gold text-usc-black text-sm font-bold hover:bg-usc-gold-dark hover:text-white transition shadow-sm">
                    <Plus size={16} /> Add event
                  </Link>
                  <Link href="/admin/events" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white dark:bg-[#2A2724] text-usc-ink dark:text-[#F2EDE6] text-sm font-bold border border-usc-border hover:border-usc-gold transition">
                    <List size={16} /> Manage events
                  </Link>
                  <Link href="/admin/organizations" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white dark:bg-[#2A2724] text-usc-ink dark:text-[#F2EDE6] text-sm font-bold border border-usc-border hover:border-usc-gold transition">
                    <Building2 size={16} /> Organizations
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <NoticeBanner />

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
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
              <Clock size={18} className="text-usc-coral" /> Needs review
            </h2>
            <div className="space-y-2">
              {needsReview.length === 0 ? (
                <p className="text-sm text-usc-muted">No events pending review.</p>
              ) : needsReview.map((event) => (
                <Link
                  key={event.id}
                  href={`/admin/events/${event.id}/edit`}
                  className="block p-3 rounded-xl bg-usc-warm dark:bg-[#2A2724] border border-usc-border/60 hover:border-usc-gold/40 transition"
                >
                  <p className="font-bold text-sm text-usc-black dark:text-[#F5F0E8]">{event.title}</p>
                  <p className="text-xs text-usc-muted mt-1">
                    {format(parseISO(event.startDate), "MMM d")} · {event.organization}
                  </p>
                  <div className="flex gap-1.5 mt-2">
                    <StatusBadge status={event.status} />
                  </div>
                </Link>
              ))}
            </div>
            {needsReview.length > 0 && (
              <Link href="/admin/events" className="inline-block mt-4 text-sm font-bold text-usc-gold-dark hover:underline">
                View all events →
              </Link>
            )}
          </section>

          <section className="usc-card p-5 dark:bg-[#252220]">
            <h2 className="font-extrabold text-usc-black dark:text-[#F5F0E8] flex items-center gap-2 mb-4">
              <AlertTriangle size={18} className="text-usc-lavender" /> By category
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

        {conflictCount > 0 && (
          <section className="usc-card p-5 border-usc-coral/30 bg-usc-coral-wash/30 dark:bg-usc-coral/10 dark:bg-[#252220]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-extrabold text-usc-black dark:text-[#F5F0E8] flex items-center gap-2">
                  <AlertTriangle size={18} className="text-usc-coral" />
                  {conflictCount} scheduling conflicts detected
                </h2>
                <p className="text-sm text-usc-muted mt-1">Review venue overlaps and major calendar conflicts.</p>
              </div>
              <Link href="/conflicts" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-usc-coral text-white text-sm font-bold hover:opacity-90 transition shrink-0">
                <Calendar size={16} /> Open conflict checker
              </Link>
            </div>
          </section>
        )}

        <div className="flex items-center gap-2 text-xs text-usc-muted">
          <Sparkles size={14} className="text-usc-gold" />
          Quick tip: use the sidebar to jump between events, orgs, and the public calendar view.
        </div>

        <CategoryLegend />
      </div>
    </AdminShell>
  );
}
