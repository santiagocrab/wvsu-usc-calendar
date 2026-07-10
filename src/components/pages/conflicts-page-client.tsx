"use client";

import Link from "next/link";
import { format, parseISO } from "date-fns";
import { ShieldAlert } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { CategoryBadge } from "@/components/events/category-badge";
import type { Conflict } from "@/lib/conflicts";

export function ConflictsPageClient({
  conflicts,
  orgCount,
}: {
  conflicts: Conflict[];
  orgCount: number;
}) {
  const severityStyles = {
    high: "border-usc-rose/40 bg-usc-rose-wash dark:bg-usc-rose/10",
    medium: "border-usc-coral/40 bg-usc-coral-wash dark:bg-usc-coral/10",
    low: "border-usc-gold/30 bg-usc-gold-wash dark:bg-usc-gold/10",
  };

  return (
    <AppShell orgCount={orgCount} conflictCount={conflicts.length}>
      <div className="max-w-5xl mx-auto space-y-5">
        <section className="usc-card p-6 bg-usc-coral-wash dark:bg-usc-coral/10 dark:bg-[#252220]">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-usc-coral flex items-center justify-center shrink-0">
              <ShieldAlert size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-usc-black dark:text-[#F5F0E8]">Conflict checker</h1>
              <p className="text-sm text-usc-muted mt-2">{conflicts.length} potential scheduling conflicts detected.</p>
            </div>
          </div>
        </section>

        <div className="space-y-4">
          {conflicts.length === 0 ? (
            <p className="text-center text-usc-muted py-12 font-medium">No conflicts detected. Looking good!</p>
          ) : conflicts.map((conflict, i) => (
            <div key={i} className={`usc-card p-5 border-2 ${severityStyles[conflict.severity]} dark:bg-[#252220]`}>
              <div className="flex gap-2 items-center mb-2">
                <span className="text-xs font-bold uppercase px-2 py-0.5 rounded-full bg-white/80 dark:bg-black/20">{conflict.severity}</span>
                <span className="text-xs text-usc-muted uppercase">{conflict.type.replace(/_/g, " ")}</span>
              </div>
              <p className="font-bold text-usc-black dark:text-[#F5F0E8]">{conflict.message}</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {conflict.events.map((event) => (
                  <div key={event.id} className="p-4 rounded-xl bg-white dark:bg-[#2A2724] border border-usc-border">
                    <p className="font-semibold text-sm">{event.title}</p>
                    <p className="text-xs text-usc-muted mt-1">{format(parseISO(event.startDate), "MMM d, yyyy")} · {event.location}</p>
                    <div className="mt-2"><CategoryBadge category={event.category} /></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <Link href="/calendar" className="text-sm font-semibold text-usc-gold-dark hover:underline">← Back to calendar</Link>
      </div>
    </AppShell>
  );
}
