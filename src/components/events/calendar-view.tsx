"use client";

import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight, List, CalendarDays } from "lucide-react";
import type { EventDTO } from "@/lib/events";
import { eventOccursOnDate, filterEvents, getCategoryStyle, getUniqueValues } from "@/lib/events";
import { CATEGORIES } from "@/lib/constants";
import { EventModal } from "./event-modal";
import { CategoryBadge } from "./category-badge";
import { StatusBadge } from "./status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { CategoryLegend } from "@/components/layout/site-header";

type ViewMode = "month" | "list";

export function CalendarView({ events }: { events: EventDTO[] }) {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 6, 1));
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [organization, setOrganization] = useState("all");
  const [location, setLocation] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState<EventDTO | null>(null);

  const organizations = useMemo(() => getUniqueValues(events, "organization"), [events]);
  const locations = useMemo(() => getUniqueValues(events, "location"), [events]);

  const filteredEvents = useMemo(
    () =>
      filterEvents(events, {
        search,
        category,
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
    return filterEvents(filteredEvents, { month: monthKey });
  }, [filteredEvents, currentMonth]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date(2026, 6, 1))}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="min-w-[180px] text-center text-lg font-semibold text-slate-900">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("month")}
          >
            <CalendarDays className="h-4 w-4" />
            Month
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
            List
          </Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Input placeholder="Search events..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </Select>
        <Select value={organization} onChange={(e) => setOrganization(e.target.value)}>
          <option value="all">All Organizations</option>
          {organizations.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </Select>
        <Select value={location} onChange={(e) => setLocation(e.target.value)}>
          <option value="all">All Locations</option>
          {locations.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </Select>
      </div>

      {viewMode === "month" ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="px-2 py-3 text-center text-xs font-semibold uppercase text-slate-500">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {monthDays.map((day) => {
              const dayEvents = filteredEvents.filter((e) => eventOccursOnDate(e, day));
              const inMonth = isSameMonth(day, currentMonth);
              const isToday = isSameDay(day, new Date());
              return (
                <div
                  key={day.toISOString()}
                  className={`min-h-[110px] border-b border-r border-slate-100 p-1.5 ${!inMonth ? "bg-slate-50/80" : "bg-white"}`}
                >
                  <div
                    className={`mb-1 flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
                      isToday ? "bg-[#1e3a5f] text-white" : inMonth ? "text-slate-700" : "text-slate-400"
                    }`}
                  >
                    {format(day, "d")}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event) => {
                      const style = getCategoryStyle(event.category);
                      return (
                        <button
                          key={event.id}
                          onClick={() => setSelectedEvent(event)}
                          className={`block w-full truncate rounded px-1.5 py-0.5 text-left text-[10px] font-medium ${style.bg} ${style.text} hover:opacity-80`}
                        >
                          {event.title}
                        </button>
                      );
                    })}
                    {dayEvents.length > 3 && (
                      <p className="px-1 text-[10px] text-slate-500">+{dayEvents.length - 3} more</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {listEvents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
              No events found for the selected filters.
            </div>
          ) : (
            listEvents.map((event) => (
              <button
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-[#1e3a5f]/30 hover:shadow-md"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">{event.title}</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {format(parseISO(event.startDate), "MMM d, yyyy")}
                      {event.startDate !== event.endDate &&
                        ` – ${format(parseISO(event.endDate), "MMM d, yyyy")}`}
                      {" · "}{event.location}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">{event.host} · {event.organization}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <CategoryBadge category={event.category} />
                    <StatusBadge status={event.status} />
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}

      <CategoryLegend />
      <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </div>
  );
}
