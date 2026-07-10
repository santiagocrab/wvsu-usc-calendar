"use client";

import Link from "next/link";
import { Calendar, Building2, MapPin } from "lucide-react";
import type { EventDTO } from "@/lib/events";
import { format, parseISO } from "date-fns";

export type OrgStats = {
  id: string;
  name: string;
  acronym: string;
  total: number;
  upcoming: EventDTO | null;
  outreach: number;
  proposed: number;
  conflictCount: number;
};

export function OrganizationCard({ org }: { org: OrgStats }) {
  return (
    <div className="usc-card p-5 hover:border-usc-gold/40 hover:shadow-md transition dark:bg-[#252220]">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-2xl bg-usc-gold flex items-center justify-center shrink-0">
          <Building2 size={20} className="text-usc-black" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-usc-black dark:text-[#F5F0E8] text-sm leading-snug line-clamp-2">{org.name}</h3>
          {org.acronym && (
            <p className="text-[10px] font-bold text-usc-gold-dark dark:text-usc-gold mt-0.5">{org.acronym}</p>
          )}
          <p className="text-xs text-usc-muted dark:text-white/50 mt-1 font-medium">
            {org.total > 0 ? `${org.total} events` : "No events yet"}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-4">
        <div className="text-center py-2 px-1 rounded-xl bg-usc-mint-wash dark:bg-usc-mint/15">
          <p className="text-base font-extrabold text-usc-mint">{org.proposed}</p>
          <p className="text-[10px] text-usc-muted font-medium">Proposed</p>
        </div>
        <div className="text-center py-2 px-1 rounded-xl bg-usc-lavender-wash dark:bg-usc-lavender/15">
          <p className="text-base font-extrabold text-usc-lavender">{org.outreach}</p>
          <p className="text-[10px] text-usc-muted font-medium">Outreach</p>
        </div>
        <div className="text-center py-2 px-1 rounded-xl bg-usc-coral-wash dark:bg-usc-coral/15">
          <p className="text-base font-extrabold text-usc-coral">{org.conflictCount}</p>
          <p className="text-[10px] text-usc-muted font-medium">Overlaps</p>
        </div>
      </div>
      {org.upcoming && (
        <div className="mt-3 p-3 rounded-xl bg-usc-warm dark:bg-[#2A2724] text-xs border border-usc-border/60">
          <p className="text-usc-muted text-[10px] font-semibold">Up next</p>
          <p className="font-bold mt-1 truncate text-usc-black dark:text-[#F5F0E8]">{org.upcoming.title}</p>
          <p className="text-usc-muted flex items-center gap-1 mt-0.5">
            <MapPin size={10} />{org.upcoming.location}
          </p>
        </div>
      )}
      <Link
        href={`/calendar?org=${encodeURIComponent(org.name)}`}
        className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-full bg-usc-gold text-usc-black text-sm font-bold hover:bg-usc-gold-dark hover:text-white transition"
      >
        <Calendar size={14} /> See calendar
      </Link>
    </div>
  );
}

export function buildOrgStats(
  events: EventDTO[],
  organizations: { id: string; name: string; acronym: string }[],
  conflictEventIds: Set<string>
): OrgStats[] {
  const today = new Date().toISOString().slice(0, 10);
  return organizations.map((org) => {
    const orgEvents = events.filter(
      (e) => e.organization === org.name || e.host === org.name ||
        e.organization.toLowerCase().includes(org.name.toLowerCase()) ||
        e.host.toLowerCase().includes(org.name.toLowerCase())
    );
    const upcoming = orgEvents
      .filter((e) => e.startDate >= today)
      .sort((a, b) => a.startDate.localeCompare(b.startDate))[0] ?? null;
    return {
      id: org.id,
      name: org.name,
      acronym: org.acronym,
      total: orgEvents.length,
      upcoming,
      outreach: orgEvents.filter((e) => e.category === "Org/CSC Outreach Programs").length,
      proposed: orgEvents.filter((e) => e.status === "Proposed" || e.category === "Org/CSC Proposed Event").length,
      conflictCount: orgEvents.filter((e) => conflictEventIds.has(e.id)).length,
    };
  }).sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
}
