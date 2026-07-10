import { parseISO, eachDayOfInterval } from "date-fns";
import type { EventDTO } from "./events";

export type ConflictType =
  | "same_venue_overlapping_time"
  | "same_venue_time_missing"
  | "same_date_different_venues"
  | "same_host_overlapping"
  | "major_wvsu_conflict"
  | "holiday_conflict"
  | "participant_conflict"
  | "date_range_overlap"
  | "duplicate_event"
  | "possible_duplicate";

export type Conflict = {
  type: ConflictType;
  severity: "high" | "medium" | "low";
  message: string;
  reason: string;
  recommendedAction: string;
  events: EventDTO[];
  date?: string;
  location?: string;
  host1?: string;
  host2?: string;
  venue1?: string;
  venue2?: string;
};

const ONLINE_PATTERNS = /online|virtual|zoom|google meet|teams|webinar|fb live|facebook live/i;
const TBA_PATTERNS = /^tba$|^to be announced$|^n\/a$/i;

const MAJOR_WVSU_KEYWORDS =
  /examination|commencement|university days|hinampang|recognition program|baccalaureate|foundation day|career fair|curriculum review/i;

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

function sameDay(a: EventDTO, b: EventDTO): boolean {
  return a.startDate === b.startDate && a.endDate === b.endDate;
}

function normalizeHost(host: string): string {
  return host.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function normalizeTitle(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function sameLocation(a: EventDTO, b: EventDTO): boolean {
  const locA = a.location.trim().toLowerCase();
  const locB = b.location.trim().toLowerCase();
  if (!locA || !locB) return false;
  if (locA === locB) return true;
  return locA.includes(locB) || locB.includes(locA);
}

function hasTimeData(event: EventDTO): boolean {
  return Boolean(event.startTime?.trim() && event.endTime?.trim());
}

function timesOverlap(a: EventDTO, b: EventDTO): boolean | null {
  if (!hasTimeData(a) || !hasTimeData(b)) return null;
  const toMin = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + (m || 0);
  };
  const aStart = toMin(a.startTime);
  const aEnd = toMin(a.endTime);
  const bStart = toMin(b.startTime);
  const bEnd = toMin(b.endTime);
  return aStart < bEnd && bStart < aEnd;
}

function isMajorWvsuEvent(event: EventDTO): boolean {
  if (event.category === "USC Events") return true;
  return event.category === "WVSU Calendar" && MAJOR_WVSU_KEYWORDS.test(event.title);
}

function isHoliday(event: EventDTO): boolean {
  return event.category === "National Holiday";
}

function sameParticipants(a: EventDTO, b: EventDTO): boolean {
  const pa = a.targetParticipants.trim().toLowerCase();
  const pb = b.targetParticipants.trim().toLowerCase();
  if (!pa || !pb || pa === "tba" || pb === "tba") return false;
  return pa === pb || pa.includes(pb) || pb.includes(pa);
}

function buildConflict(
  partial: Omit<Conflict, "reason" | "recommendedAction"> & { reason: string; recommendedAction: string }
): Conflict {
  return partial;
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

  const active = events.filter((e) => e.status !== "Cancelled");

  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      const a = active[i];
      const b = active[j];
      if (!datesOverlap(a, b)) continue;

      const overlapDate = a.startDate <= b.startDate ? a.startDate : b.startDate;

      // Duplicate event
      if (
        normalizeHost(a.host) === normalizeHost(b.host) &&
        normalizeTitle(a.title) === normalizeTitle(b.title) &&
        a.startDate === b.startDate &&
        a.endDate === b.endDate &&
        sameLocation(a, b)
      ) {
        addConflict(
          buildConflict({
            type: "duplicate_event",
            severity: "high",
            message: `Duplicate: "${a.title}" by ${a.host}`,
            reason: "Same host, title, date range, and venue.",
            recommendedAction: "Remove or merge duplicate records.",
            events: [a, b],
            date: overlapDate,
            host1: a.host,
            host2: b.host,
            venue1: a.location,
            venue2: b.location,
          })
        );
        continue;
      }

      // Possible duplicate
      if (
        normalizeHost(a.host) === normalizeHost(b.host) &&
        normalizeTitle(a.title).slice(0, 20) === normalizeTitle(b.title).slice(0, 20) &&
        sameDay(a, b)
      ) {
        addConflict(
          buildConflict({
            type: "possible_duplicate",
            severity: "medium",
            message: `Possible duplicate: "${a.title}" and "${b.title}"`,
            reason: "Similar titles, same host, same date.",
            recommendedAction: "Verify details and merge if identical.",
            events: [a, b],
            date: overlapDate,
            host1: a.host,
            host2: b.host,
            venue1: a.location,
            venue2: b.location,
          })
        );
      }

      // Same venue conflicts
      if (isPhysicalVenue(a.location) && isPhysicalVenue(b.location) && sameLocation(a, b)) {
        const timeOverlap = timesOverlap(a, b);
        if (timeOverlap === true) {
          addConflict(
            buildConflict({
              type: "same_venue_overlapping_time",
              severity: "high",
              message: `Venue conflict at ${a.location}`,
              reason: `Both events use "${a.location}" at overlapping times.`,
              recommendedAction: "Reschedule one event or change venue.",
              events: [a, b],
              date: overlapDate,
              location: a.location,
              host1: a.host,
              host2: b.host,
              venue1: a.location,
              venue2: b.location,
            })
          );
        } else if (timeOverlap === null) {
          addConflict(
            buildConflict({
              type: "same_venue_time_missing",
              severity: "medium",
              message: `Same venue on ${overlapDate}: ${a.location}`,
              reason: "Same venue and date but time is missing for one or both events.",
              recommendedAction: "Add times and verify whether schedules truly overlap.",
              events: [a, b],
              date: overlapDate,
              location: a.location,
              host1: a.host,
              host2: b.host,
              venue1: a.location,
              venue2: b.location,
            })
          );
        }
      }

      // Same date, different venues — informational only
      if (
        sameDay(a, b) &&
        isPhysicalVenue(a.location) &&
        isPhysicalVenue(b.location) &&
        !sameLocation(a, b) &&
        normalizeHost(a.host) !== normalizeHost(b.host)
      ) {
        addConflict(
          buildConflict({
            type: "same_date_different_venues",
            severity: "low",
            message: `Same day, different venues: ${a.title} / ${b.title}`,
            reason: "Events share a date but use different venues.",
            recommendedAction: "Informational only — no venue conflict.",
            events: [a, b],
            date: overlapDate,
            host1: a.host,
            host2: b.host,
            venue1: a.location,
            venue2: b.location,
          })
        );
      }

      // Same host overlapping
      if (normalizeHost(a.host) === normalizeHost(b.host) && datesOverlap(a, b) && a.id !== b.id) {
        const timeOverlap = timesOverlap(a, b);
        const impossible = timeOverlap === true || (sameDay(a, b) && isPhysicalVenue(a.location) && sameLocation(a, b));
        if (impossible) {
          addConflict(
            buildConflict({
              type: "same_host_overlapping",
              severity: timeOverlap === true ? "high" : "medium",
              message: `${a.host} has overlapping activities`,
              reason: "Same host cannot be in two places at once if times/venues overlap.",
              recommendedAction: "Adjust schedule or confirm different teams handle each activity.",
              events: [a, b],
              date: overlapDate,
              host1: a.host,
              host2: b.host,
              venue1: a.location,
              venue2: b.location,
            })
          );
        }
      }

      // Major WVSU conflict
      const orgEvent = [a, b].find((e) => e.category.startsWith("Org/CSC"));
      const majorEvent = [a, b].find((e) => isMajorWvsuEvent(e) || e.category === "USC Events");
      if (orgEvent && majorEvent && datesOverlap(orgEvent, majorEvent)) {
        addConflict(
          buildConflict({
            type: "major_wvsu_conflict",
            severity: "high",
            message: `Org event conflicts with major university activity`,
            reason: `"${orgEvent.title}" overlaps with "${majorEvent.title}" (${majorEvent.category}).`,
            recommendedAction: "Verify with USC/college council whether org activity should be rescheduled.",
            events: [orgEvent, majorEvent],
            date: overlapDate,
            host1: orgEvent.host,
            host2: majorEvent.host,
            venue1: orgEvent.location,
            venue2: majorEvent.location,
          })
        );
      }

      // Holiday conflict
      const holiday = [a, b].find(isHoliday);
      const nonHoliday = [a, b].find((e) => !isHoliday(e));
      if (holiday && nonHoliday && datesOverlap(holiday, nonHoliday)) {
        addConflict(
          buildConflict({
            type: "holiday_conflict",
            severity: "medium",
            message: `"${nonHoliday.title}" scheduled during ${holiday.title}`,
            reason: "Organization/university activity overlaps an official holiday.",
            recommendedAction: "Flag for verification — do not auto-delete.",
            events: [holiday, nonHoliday],
            date: overlapDate,
            host1: nonHoliday.host,
            host2: holiday.host,
            venue1: nonHoliday.location,
            venue2: holiday.location,
          })
        );
      }

      // Participant conflict
      if (sameParticipants(a, b) && datesOverlap(a, b)) {
        const timeOverlap = timesOverlap(a, b);
        if (timeOverlap !== false) {
          addConflict(
            buildConflict({
              type: "participant_conflict",
              severity: timeOverlap === true ? "high" : "medium",
              message: `Target participant overlap: ${a.targetParticipants}`,
              reason: "Both events target the same participants on overlapping dates.",
              recommendedAction: "Confirm whether participants can attend both or reschedule.",
              events: [a, b],
              date: overlapDate,
              host1: a.host,
              host2: b.host,
              venue1: a.location,
              venue2: b.location,
            })
          );
        }
      }

      // Date range overlap (low) — only when not same day and not already flagged
      if (!sameDay(a, b) && datesOverlap(a, b) && normalizeHost(a.host) !== normalizeHost(b.host)) {
        addConflict(
          buildConflict({
            type: "date_range_overlap",
            severity: "low",
            message: `Date ranges overlap: ${a.title} / ${b.title}`,
            reason: "Overlapping date ranges may be preparation or multi-day activities.",
            recommendedAction: "Review only if venues, hosts, or participants also conflict.",
            events: [a, b],
            date: overlapDate,
            host1: a.host,
            host2: b.host,
            venue1: a.location,
            venue2: b.location,
          })
        );
      }
    }
  }

  const severityOrder = { high: 0, medium: 1, low: 2 };
  return conflicts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
}
