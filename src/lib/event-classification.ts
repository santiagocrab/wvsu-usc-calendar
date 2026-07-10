import type { EventDTO } from "./events";

export type DateType = "exact" | "date_range" | "recurring" | "month_only" | "ongoing";
export type DeliveryMode =
  | "onsite"
  | "online_synchronous"
  | "online_asynchronous"
  | "hybrid"
  | "unspecified";
export type RecordType =
  | "event"
  | "observance"
  | "holiday"
  | "academic_period"
  | "publication"
  | "preparation"
  | "coverage";
export type RelationType =
  | "coverage"
  | "support"
  | "booth"
  | "publication"
  | "preparation"
  | "component"
  | "companion"
  | "independent";

const MONTH_NAMES =
  /january|february|march|april|may|june|july|august|september|october|november|december/i;
const MONTH_ONLY_TITLE =
  /member of the month|featured member|song cover|spotlight|awareness month|publication period|social media campaign|online feature|async campaign|coverage period|prep period|preparation period/i;
const RECURRING_TITLE = /\bevery\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday|week|month)\b|weekly|bi-?weekly|monthly series/i;
const ONGOING_TITLE = /\bongoing\b|open until|runs through|all month long/i;
const OBSERVANCE_TITLE =
  /\bobservance\b|awareness day|awareness week|remembrance day|international day of\b/i;
const PUBLICATION_TITLE =
  /\bpublication\b|press release|newsletter|magazine issue|song cover|featured\b/i;
const PREPARATION_TITLE = /\bpreparation\b|\bprep\b|dry run|dress rehearsal|setup day/i;
const COVERAGE_TITLE = /\bcoverage\b|photo coverage|media coverage|documentation\b/i;
const ASYNC_TITLE =
  /\basync\b|asynchronous|at your own pace|anytime|open submission|submission period\b/i;
const SYNC_ONLINE =
  /\bzoom\b|google meet|microsoft teams|\bteams\b|webinar|fb live|facebook live|live stream/i;
const HYBRID_PATTERN = /\bhybrid\b|online and onsite|onsite and online/i;

const MAJOR_BLOCKING_TITLE =
  /university days|university hinampang|\bsldp\b|commencement|baccalaureate|recognition ceremon|mandatory orientation|no-activity period|suspension of classes|university-wide exam|final examination week|midterm examination/i;

const SLDP_REQUIRED =
  /\bsldp\b.*(required|mandatory|all officers|all members)/i;

const BROAD_VENUE =
  /^(tba|tbd|to be announced|to be determined|not specified|n\/a|online|facebook page|university-?wide|wvsu grounds|multiple locations?|various locations?|campus-?wide)$/i;

const VENUE_ALIASES: Record<string, string> = {
  "com gym": "wvsu com gym",
  "wvsu com gymnasium": "wvsu com gym",
  "college of medicine gym": "wvsu com gym",
  "cas aud": "wvsu cas auditorium",
  "cas auditorium": "wvsu cas auditorium",
  "main library": "wvsu main library",
  "student lounge": "wvsu student lounge",
  "usc office": "usc office",
  "university student council office": "usc office",
};

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function parseEventMonth(event: Pick<EventDTO, "startDate" | "endDate">): {
  year: number;
  month: number;
} | null {
  const [y, m] = event.startDate.split("-").map(Number);
  if (!y || !m) return null;
  return { year: y, month: m };
}

export function isBroadVenue(location: string): boolean {
  const trimmed = location.trim();
  if (!trimmed) return true;
  return BROAD_VENUE.test(trimmed);
}

export function normalizeVenue(location: string): string {
  const raw = location.trim().toLowerCase().replace(/\s+/g, " ");
  if (!raw || isBroadVenue(location)) return "";
  if (VENUE_ALIASES[raw]) return VENUE_ALIASES[raw];
  for (const [alias, canonical] of Object.entries(VENUE_ALIASES)) {
    if (raw === alias || raw.includes(alias)) return canonical;
  }
  if (raw.startsWith("wvsu ")) return raw;
  if (raw.includes("gym") && raw.includes("com")) return "wvsu com gym";
  return raw;
}

export function normalizeHost(host: string): string {
  return host.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function normalizeTargetGroup(target: string): string {
  const raw = target.trim().toLowerCase();
  if (!raw || raw === "tba" || raw === "all students") return raw === "all students" ? "all students" : "";
  return raw.replace(/[^a-z0-9]+/g, " ").trim();
}

export function normalizeTitle(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function inferDateType(event: Pick<EventDTO, "title" | "startDate" | "endDate" | "startTime" | "endTime">): DateType {
  const title = event.title;
  if (MONTH_ONLY_TITLE.test(title) || (MONTH_NAMES.test(title) && /\d{4}/.test(title))) {
    return "month_only";
  }
  if (RECURRING_TITLE.test(title)) return "recurring";
  if (ONGOING_TITLE.test(title)) return "ongoing";

  const monthInfo = parseEventMonth(event);
  if (monthInfo && event.startDate !== event.endDate) {
    const lastDay = daysInMonth(monthInfo.year, monthInfo.month);
    const monthStart = `${monthInfo.year}-${String(monthInfo.month).padStart(2, "0")}-01`;
    const monthEnd = `${monthInfo.year}-${String(monthInfo.month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    if (
      event.startDate === monthStart &&
      event.endDate === monthEnd &&
      !event.startTime?.trim() &&
      !event.endTime?.trim()
    ) {
      return "month_only";
    }
  }

  if (event.startDate !== event.endDate) return "date_range";
  return "exact";
}

export function inferDeliveryMode(
  event: Pick<EventDTO, "location" | "title" | "description">
): DeliveryMode {
  const text = `${event.location} ${event.title} ${event.description}`.toLowerCase();
  if (HYBRID_PATTERN.test(text)) return "hybrid";
  if (ASYNC_TITLE.test(text) || /^online$/i.test(event.location.trim())) {
    if (SYNC_ONLINE.test(text)) return "hybrid";
    return "online_asynchronous";
  }
  if (SYNC_ONLINE.test(text) || /facebook page/i.test(event.location)) {
    return "online_synchronous";
  }
  if (isBroadVenue(event.location) && SYNC_ONLINE.test(text)) return "online_synchronous";
  if (!isBroadVenue(event.location)) return "onsite";
  return "unspecified";
}

export function inferRecordType(
  event: Pick<EventDTO, "category" | "title" | "description" | "eventType">
): RecordType {
  if (event.category === "National Holiday") return "holiday";
  const text = `${event.title} ${event.description} ${event.eventType}`;
  if (ACADEMIC_PERIOD.test(text) || event.category === "WVSU Calendar") {
    if (OBSERVANCE_TITLE.test(text) && !/\bprogram\b|ceremony|assembly/i.test(text)) {
      return "observance";
    }
    if (/academic calendar|enrollment|registration period|class opening/i.test(text)) {
      return "academic_period";
    }
  }
  if (PUBLICATION_TITLE.test(text)) return "publication";
  if (PREPARATION_TITLE.test(text)) return "preparation";
  if (COVERAGE_TITLE.test(text)) return "coverage";
  if (OBSERVANCE_TITLE.test(text)) return "observance";
  return "event";
}

const ACADEMIC_PERIOD = /academic calendar|enrollment period|registration period|class opening/i;

export function inferIsMajorBlocking(
  event: Pick<EventDTO, "title" | "description" | "targetParticipants" | "category">
): boolean {
  const text = `${event.title} ${event.description}`;
  if (!MAJOR_BLOCKING_TITLE.test(text)) return false;
  if (/\bsldp\b/i.test(text)) {
    return SLDP_REQUIRED.test(text) || /required participants|mandatory/i.test(event.targetParticipants);
  }
  return true;
}

export function inferParticipationRequired(
  event: Pick<EventDTO, "title" | "targetParticipants" | "description">
): boolean {
  const text = `${event.title} ${event.targetParticipants} ${event.description}`.toLowerCase();
  return /\b(required|mandatory|must attend|compulsory)\b/.test(text);
}

export function inferConflictEligible(
  event: Pick<EventDTO, "title" | "location" | "startTime" | "endTime" | "status" | "category"> & {
    dateType: DateType;
    deliveryMode: DeliveryMode;
    recordType: RecordType;
    isMajorBlockingEvent: boolean;
  }
): boolean {
  if (event.status === "Cancelled") return false;

  if (event.dateType === "month_only" || event.dateType === "ongoing") return false;

  if (
    event.recordType === "observance" ||
    event.recordType === "publication" ||
    event.recordType === "coverage"
  ) {
    if (!event.startTime?.trim() && !event.endTime?.trim() && isBroadVenue(event.location)) {
      return false;
    }
  }

  if (event.recordType === "preparation" && !event.startTime?.trim() && isBroadVenue(event.location)) {
    return false;
  }

  if (event.deliveryMode === "online_asynchronous") return false;

  if (MONTH_ONLY_TITLE.test(event.title)) return false;

  if (
    /social media campaign|awareness month|online feature|async campaign|announcement|informational/i.test(
      event.title
    ) &&
    isBroadVenue(event.location)
  ) {
    return false;
  }

  return true;
}

export type EventClassification = {
  isMajorBlockingEvent: boolean;
  conflictEligible: boolean;
  dateType: DateType;
  deliveryMode: DeliveryMode;
  recordType: RecordType;
  participationRequired: boolean;
  venueNormalized: string;
  hostNormalized: string;
  targetGroupNormalized: string;
};

export function classifyEvent(event: EventDTO): EventClassification {
  const dateType = inferDateType(event);
  const deliveryMode = inferDeliveryMode(event);
  const recordType = inferRecordType(event);
  const isMajorBlockingEvent = inferIsMajorBlocking(event);
  const participationRequired = inferParticipationRequired(event);
  const venueNormalized = normalizeVenue(event.location);
  const hostNormalized = normalizeHost(event.host);
  const targetGroupNormalized = normalizeTargetGroup(event.targetParticipants);
  const conflictEligible = inferConflictEligible({
    ...event,
    dateType,
    deliveryMode,
    recordType,
    isMajorBlockingEvent,
  });

  return {
    isMajorBlockingEvent,
    conflictEligible,
    dateType,
    deliveryMode,
    recordType,
    participationRequired,
    venueNormalized,
    hostNormalized,
    targetGroupNormalized,
  };
}

export function enrichEventWithClassification(event: EventDTO): EventDTO {
  const classification = classifyEvent(event);
  return { ...event, ...classification };
}
