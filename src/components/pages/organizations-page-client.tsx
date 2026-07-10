"use client";

import { useMemo, useState } from "react";
import { Building2, Search } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { OrganizationCard, buildOrgStats } from "@/components/organizations/organization-card";
import type { EventDTO } from "@/lib/events";
import type { OrganizationDTO } from "@/lib/organizations";

export function OrganizationsPageClient({
  events,
  organizations,
  conflictEventIds,
  conflictCount,
}: {
  events: EventDTO[];
  organizations: OrganizationDTO[];
  conflictEventIds: string[];
  conflictCount: number;
}) {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");

  const stats = useMemo(
    () => buildOrgStats(events, organizations, new Set(conflictEventIds)),
    [events, organizations, conflictEventIds]
  );

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return stats;
    return stats.filter((o) =>
      o.name.toLowerCase().includes(q) || o.acronym.toLowerCase().includes(q)
    );
  }, [stats, query]);

  return (
    <AppShell search={search} onSearchChange={setSearch} orgCount={organizations.length} conflictCount={conflictCount}>
      <div className="max-w-6xl mx-auto space-y-5">
        <section className="usc-card overflow-hidden dark:bg-[#252220]">
          <div className="p-6 sm:p-8 bg-gradient-to-r from-usc-gold-wash to-usc-lavender-wash dark:from-usc-gold/10 dark:to-usc-lavender/10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-usc-gold flex items-center justify-center shrink-0 rotate-3">
                <Building2 size={24} className="text-usc-black" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-usc-black dark:text-[#F5F0E8]">All organizations</h1>
                <p className="text-usc-muted dark:text-white/55 text-sm mt-2 leading-relaxed max-w-xl">
                  {organizations.length} councils & student orgs on the USC list. Tap yours to see your schedule.
                </p>
              </div>
            </div>
            <div className="mt-5 relative max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-usc-muted" size={18} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Find your org…"
                className="w-full pl-10 pr-4 py-3 rounded-full text-usc-ink font-medium text-sm border border-usc-border bg-white dark:bg-[#2A2724] dark:text-[#F2EDE6] focus:outline-none focus:ring-2 focus:ring-usc-gold/30"
              />
            </div>
          </div>
        </section>

        <p className="text-sm font-medium text-usc-muted dark:text-white/45 px-1">
          Showing {filtered.length} of {organizations.length}
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((org) => <OrganizationCard key={org.id} org={org} />)}
        </div>
        {filtered.length === 0 && (
          <p className="text-center text-usc-muted py-12 font-medium">No match — try a shorter name or acronym.</p>
        )}
      </div>
    </AppShell>
  );
}
