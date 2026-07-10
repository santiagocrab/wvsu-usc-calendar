"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, isSameMonth,
  parseISO, startOfMonth, startOfWeek, subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight, List, LayoutGrid, Columns } from "lucide-react";
import type { EventDTO } from "@/lib/events";
import { eventOccursOnDate, filterEvents } from "@/lib/events";
import { CATEGORY_META, CATEGORIES, AY_MONTHS } from "@/lib/constants";
import { CategoryBadge } from "./category-badge";
import { StatusBadge } from "./status-badge";
import { EventModal } from "./event-modal";
import { NoticeBanner, CategoryLegend } from "./category-legend";
import { cn } from "@/lib/utils";

type ViewMode = "month" | "week" | "list";

export function CalendarView({
  events,
  organizations,
}: {
  events: EventDTO[];
  organizations: string[];
}) {
  const searchParams = useSearchParams();
  const initialOrg = searchParams.get("org") ?? "all";

  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 6, 1));
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [organization, setOrganization] = useState(initialOrg);
  const [location, setLocation] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState<EventDTO | null>(null);

  useEffect(() => {
    setOrganization(initialOrg);
  }, [initialOrg]);

  const locations = useMemo(() => {
    const s = new Set<string>();
    events.forEach((e) => { if (e.location && e.location !== "TBA") s.add(e.location); });
    return Array.from(s).sort();
  }, [events]);

  const filtered = useMemo(
    () => filterEvents(events, {
      search, category,
      organization: organization === "all" ? undefined : organization,
      location: location === "all" ? undefined : location,
    }),
    [events, search, category, organization, location]
  );

  const monthDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const listEvents = useMemo(() => {
    const monthKey = format(currentMonth, "yyyy-MM");
    return filterEvents(filtered, { month: monthKey });
  }, [filtered, currentMonth]);

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <NoticeBanner />

      <div className="usc-card p-4 sm:p-5 dark:bg-[#252220]">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentMonth(new Date(2026, 6, 1))} className="px-3 py-2 rounded-xl border border-usc-border text-xs font-bold hover:bg-usc-gold-wash">AY Start</button>
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 rounded-lg border border-usc-border hover:bg-usc-gold-wash"><ChevronLeft size={18} /></button>
            <h2 className="min-w-[160px] text-center font-extrabold text-usc-black dark:text-[#F5F0E8]">{format(currentMonth, "MMMM yyyy")}</h2>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 rounded-lg border border-usc-border hover:bg-usc-gold-wash"><ChevronRight size={18} /></button>
          </div>
          <div className="flex rounded-xl border-2 border-usc-black dark:border-usc-gold overflow-hidden shadow-sm">
            {([["month", LayoutGrid, "Month"], ["week", Columns, "Week"], ["list", List, "List"]] as const).map(([mode, Icon, label]) => (
              <button key={mode} onClick={() => setViewMode(mode)} className={cn("flex items-center gap-1.5 px-4 py-2 text-sm font-bold transition", viewMode === mode ? "bg-usc-black text-white dark:bg-usc-gold dark:text-usc-black" : "bg-white dark:bg-[#2A2724] hover:bg-usc-gold-wash")}>
                <Icon size={15} />{label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {AY_MONTHS.map((m) => (
            <button key={m.value} onClick={() => setCurrentMonth(parseISO(`${m.value}-01`))} className={cn("px-3 py-1 rounded-full text-xs font-bold transition", format(currentMonth, "yyyy-MM") === m.value ? "bg-usc-gold text-usc-black shadow" : "bg-gray-100 dark:bg-[#2A2724] text-usc-muted")}>
              {m.label}
            </button>
          ))}
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 mt-4">
          <input placeholder="Search events…" value={search} onChange={(e) => setSearch(e.target.value)} className="px-3 py-2.5 rounded-xl border border-usc-border text-sm font-semibold bg-white dark:bg-[#2A2724] dark:text-[#F2EDE6]" />
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="px-3 py-2.5 rounded-xl border border-usc-border text-sm font-semibold bg-white dark:bg-[#2A2724] dark:text-[#F2EDE6]">
            <option value="all">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={organization} onChange={(e) => setOrganization(e.target.value)} className="px-3 py-2.5 rounded-xl border border-usc-border text-sm font-semibold bg-white dark:bg-[#2A2724] dark:text-[#F2EDE6]">
            <option value="all">All Organizations</option>
            {organizations.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
          <select value={location} onChange={(e) => setLocation(e.target.value)} className="px-3 py-2.5 rounded-xl border border-usc-border text-sm font-semibold bg-white dark:bg-[#2A2724] dark:text-[#F2EDE6]">
            <option value="all">All Locations</option>
            {locations.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>

      {viewMode !== "list" ? (
        <div className="usc-card overflow-hidden dark:bg-[#252220]">
          <div className="grid grid-cols-7 bg-usc-warm dark:bg-[#2A2724]/50 border-b border-usc-border">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d, i) => (
              <div key={d} className={cn("px-2 py-3 text-center text-xs font-bold uppercase", i === 0 || i === 6 ? "text-usc-rose/80 bg-usc-rose-wash/50" : "text-usc-muted")}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {monthDays.map((day) => {
              const dayEvents = filtered.filter((e) => eventOccursOnDate(e, day));
              const inMonth = isSameMonth(day, currentMonth);
              const isToday = isSameDay(day, new Date());
              const isHoliday = dayEvents.some((e) => e.category === "National Holiday");
              return (
                <div key={day.toISOString()} className={cn("min-h-[120px] border-b border-r border-usc-border/50 p-1.5", !inMonth && "opacity-45", isHoliday && "bg-usc-rose-wash/40")}>
                  <div className={cn("mb-1 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold", isToday ? "bg-usc-gold text-usc-black" : "text-usc-charcoal")}>{format(day, "d")}</div>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 3).map((event) => {
                      const meta = CATEGORY_META[event.category];
                      return (
                        <button key={event.id} onClick={() => setSelectedEvent(event)} className="calendar-pill block w-full truncate px-1.5 py-0.5 text-left text-[10px] hover:opacity-80" style={{ backgroundColor: meta?.color, color: meta?.textColor }}>
                          {event.title}
                        </button>
                      );
                    })}
                    {dayEvents.length > 3 && <p className="text-[10px] text-usc-muted px-1">+{dayEvents.length - 3} more</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {listEvents.length === 0 ? (
            <p className="text-center text-usc-muted py-12 font-medium">No events match your filters.</p>
          ) : listEvents.map((event) => {
            const meta = CATEGORY_META[event.category];
            return (
              <button key={event.id} onClick={() => setSelectedEvent(event)} className="usc-card w-full p-4 text-left hover:border-usc-gold/40 transition flex gap-3 dark:bg-[#252220]">
                <div className="w-1 rounded-full shrink-0" style={{ backgroundColor: meta?.color }} />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-usc-black dark:text-[#F5F0E8] truncate">{event.title}</h3>
                  <p className="text-sm text-usc-muted mt-1">{format(parseISO(event.startDate), "MMM d, yyyy")} · {event.location}</p>
                  <p className="text-sm text-usc-charcoal dark:text-white/60">{event.organization}</p>
                </div>
                <div className="flex flex-col gap-1 items-end shrink-0">
                  <CategoryBadge category={event.category} />
                  <StatusBadge status={event.status} />
                </div>
              </button>
            );
          })}
        </div>
      )}

      <CategoryLegend />
      <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </div>
  );
}
