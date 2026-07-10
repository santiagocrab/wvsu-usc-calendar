import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import type { Event } from "@/generated/prisma/client";
import type { Category } from "./constants";
import { CATEGORY_COLORS } from "./constants";

export type EventDTO = {
  id: string;
  title: string;
  category: string;
  host: string;
  organization: string;
  eventType: string;
  status: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  location: string;
  mapLink: string;
  targetParticipants: string;
  description: string;
  contactPerson: string;
  sourceFile: string;
  remarks: string;
  createdAt: string;
  updatedAt: string;
};

export function serializeEvent(event: Event): EventDTO {
  return {
    id: event.id,
    title: event.title,
    category: event.category,
    host: event.host,
    organization: event.organization,
    eventType: event.eventType,
    status: event.status,
    startDate: format(event.startDate, "yyyy-MM-dd"),
    endDate: format(event.endDate, "yyyy-MM-dd"),
    startTime: event.startTime,
    endTime: event.endTime,
    location: event.location,
    mapLink: event.mapLink,
    targetParticipants: event.targetParticipants,
    description: event.description,
    contactPerson: event.contactPerson,
    sourceFile: event.sourceFile,
    remarks: event.remarks,
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
  };
}

export function formatEventDateRange(startDate: string, endDate: string): string {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  if (startDate === endDate) {
    return format(start, "MMMM d, yyyy");
  }
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${format(start, "MMMM d")} – ${format(end, "d, yyyy")}`;
  }
  return `${format(start, "MMM d, yyyy")} – ${format(end, "MMM d, yyyy")}`;
}

export function formatEventTime(startTime: string, endTime: string): string {
  if (!startTime && !endTime) return "All day";
  if (startTime && endTime) return `${startTime} – ${endTime}`;
  return startTime || endTime;
}

export function getCategoryStyle(category: string) {
  return CATEGORY_COLORS[category as Category] ?? CATEGORY_COLORS["USC Events"];
}

export function eventOccursOnDate(event: EventDTO, date: Date): boolean {
  const day = format(date, "yyyy-MM-dd");
  return day >= event.startDate && day <= event.endDate;
}

export function filterEvents(
  events: EventDTO[],
  filters: {
    search?: string;
    category?: string;
    organization?: string;
    location?: string;
    status?: string;
    month?: string;
  }
): EventDTO[] {
  const search = filters.search?.toLowerCase().trim();
  const month = filters.month;

  return events.filter((event) => {
    if (search) {
      const haystack = [
        event.title,
        event.host,
        event.organization,
        event.location,
        event.description,
        event.category,
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    if (filters.category && filters.category !== "all" && event.category !== filters.category) {
      return false;
    }
    if (filters.status && filters.status !== "all" && event.status !== filters.status) {
      return false;
    }
    if (filters.organization && filters.organization !== "all") {
      const org = filters.organization.toLowerCase();
      if (
        !event.organization.toLowerCase().includes(org) &&
        !event.host.toLowerCase().includes(org)
      ) {
        return false;
      }
    }
    if (filters.location && filters.location !== "all") {
      if (!event.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }
    }
    if (month && month !== "all") {
      const [year, monthNum] = month.split("-").map(Number);
      const monthStart = startOfMonth(new Date(year, monthNum - 1));
      const monthEnd = endOfMonth(monthStart);
      const eventStart = parseISO(event.startDate);
      const eventEnd = parseISO(event.endDate);
      const overlaps =
        isWithinInterval(eventStart, { start: monthStart, end: monthEnd }) ||
        isWithinInterval(eventEnd, { start: monthStart, end: monthEnd }) ||
        (eventStart <= monthStart && eventEnd >= monthEnd);
      if (!overlaps) return false;
    }
    return true;
  });
}

export function getUniqueValues(events: EventDTO[], key: "organization" | "location" | "host") {
  const values = new Set<string>();
  for (const event of events) {
    const value = event[key]?.trim();
    if (value && value !== "TBA") values.add(value);
  }
  return Array.from(values).sort((a, b) => a.localeCompare(b));
}

export function generateEventId(): string {
  return `evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
