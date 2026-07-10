import { parseISO, eachDayOfInterval } from "date-fns";
import type { EventDTO } from "./events";

export type ConflictType =
  | "same_date"
  | "same_location"
  | "overlapping_dates"
  | "multiple_same_day"
  | "proposed_during_wvsu"
  | "event_during_holiday";

export type Conflict = {
  type: ConflictType;
  severity: "high" | "medium" | "low";
  message: string;
  events: EventDTO[];
  date?: string;
  location?: string;
};

const ONLINE_PATTERNS = /online|virtual|zoom|google meet|teams|webinar|fb live|facebook live/i;
const TBA_PATTERNS = /^tba$|^to be announced$|^n\/a$/i;

function isPhysicalVenue(location: string): boolean {
  const loc = location.trim();
  if (!loc) return false;
  if (TBA_PATTERNS.test(loc)) return false;
  if (ONLINE_PATTERNS.test(loc)) return false;
  return true;
}

function datesOverlap(a: EventDTO, b: EventDTO): boolean {
  return a.startDate <= b.endDate && b.startDate <= a.endDate;
}

function sameLocation(a: EventDTO, b: EventDTO): boolean {
  const locA = a.location.trim().toLowerCase();
  const locB = b.location.trim().toLowerCase();
  if (!locA || !locB) return false;
  if (locA === locB) return true;
  return locA.includes(locB) || locB.includes(locA);
}

function getDaysInEvent(event: EventDTO): string[] {
  try {
    return eachDayOfInterval({
      start: parseISO(event.startDate),
      end: parseISO(event.endDate),
    }).map((d) => d.toISOString().slice(0, 10));
  } catch {
    return [event.startDate];
  }
}

export function detectConflicts(events: EventDTO[]): Conflict[] {
  const conflicts: Conflict[] = [];
  const seen = new Set<string>();

  const addConflict = (conflict: Conflict) => {
    const key = `${conflict.type}:${conflict.events.map((e) => e.id).sort().join(",")}:${conflict.date ?? ""}:${conflict.location ?? ""}`;
    if (seen.has(key)) return;
    seen.add(key);
    conflicts.push(conflict);
  };

  // Same location, overlapping dates, physical venues, different hosts
  for (let i = 0; i < events.length; i++) {
    for (let j = i + 1; j < events.length; j++) {
      const a = events[i];
      const b = events[j];
      if (a.status === "Cancelled" || b.status === "Cancelled") continue;
      if (!datesOverlap(a, b)) continue;

      if (
        isPhysicalVenue(a.location) &&
        isPhysicalVenue(b.location) &&
        sameLocation(a, b) &&
        a.host !== b.host
      ) {
        addConflict({
          type: "same_location",
          severity: "high",
          message: `Venue conflict at "${a.location}" between ${a.organization} and ${b.organization}`,
          events: [a, b],
          location: a.location,
        });
      }

      if (a.startDate === b.startDate && a.endDate === b.endDate) {
        addConflict({
          type: "same_date",
          severity: "medium",
          message: `Same date range: ${a.title} and ${b.title}`,
          events: [a, b],
          date: a.startDate,
        });
      }

      if (datesOverlap(a, b) && (a.startDate !== b.startDate || a.endDate !== b.endDate)) {
        addConflict({
          type: "overlapping_dates",
          severity: "low",
          message: `Overlapping schedules: ${a.title} and ${b.title}`,
          events: [a, b],
        });
      }
    }
  }

  // Multiple events on same day
  const byDay = new Map<string, EventDTO[]>();
  for (const event of events) {
    if (event.status === "Cancelled") continue;
    for (const day of getDaysInEvent(event)) {
      if (!byDay.has(day)) byDay.set(day, []);
      byDay.get(day)!.push(event);
    }
  }
  for (const [day, dayEvents] of byDay) {
    if (dayEvents.length >= 4) {
      addConflict({
        type: "multiple_same_day",
        severity: "low",
        message: `${dayEvents.length} events scheduled on ${day}`,
        events: dayEvents.slice(0, 6),
        date: day,
      });
    }
  }

  // Proposed events during WVSU Calendar major events
  const wvsuEvents = events.filter(
    (e) => e.category === "WVSU Calendar" && e.status !== "Cancelled"
  );
  const proposed = events.filter(
    (e) =>
      (e.category === "Org/CSC Proposed Event" || e.status === "Proposed") &&
      e.status !== "Cancelled"
  );
  for (const prop of proposed) {
    for (const wvsu of wvsuEvents) {
      if (datesOverlap(prop, wvsu)) {
        addConflict({
          type: "proposed_during_wvsu",
          severity: "medium",
          message: `Proposed event "${prop.title}" overlaps with WVSU event "${wvsu.title}"`,
          events: [prop, wvsu],
          date: prop.startDate,
        });
      }
    }
  }

  // Events during National Holidays
  const holidays = events.filter(
    (e) => e.category === "National Holiday" && e.status !== "Cancelled"
  );
  const nonHolidays = events.filter((e) => e.category !== "National Holiday");
  for (const holiday of holidays) {
    for (const event of nonHolidays) {
      if (event.status === "Cancelled") continue;
      if (datesOverlap(holiday, event)) {
        addConflict({
          type: "event_during_holiday",
          severity: "medium",
          message: `"${event.title}" scheduled during holiday "${holiday.title}"`,
          events: [holiday, event],
          date: holiday.startDate,
        });
      }
    }
  }

  const severityOrder = { high: 0, medium: 1, low: 2 };
  return conflicts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
}
