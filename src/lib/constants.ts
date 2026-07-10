export const CATEGORIES = [
  "National Holiday",
  "WVSU Calendar",
  "USC Events",
  "Org/CSC Calendared Event",
  "Org/CSC Proposed Event",
  "Org/CSC Outreach Programs",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_COLORS: Record<Category, { bg: string; text: string; border: string; dot: string }> = {
  "National Holiday": {
    bg: "bg-red-100",
    text: "text-red-800",
    border: "border-red-300",
    dot: "bg-red-600",
  },
  "WVSU Calendar": {
    bg: "bg-yellow-100",
    text: "text-yellow-900",
    border: "border-yellow-400",
    dot: "bg-yellow-500",
  },
  "USC Events": {
    bg: "bg-blue-100",
    text: "text-blue-800",
    border: "border-blue-300",
    dot: "bg-blue-600",
  },
  "Org/CSC Calendared Event": {
    bg: "bg-red-50",
    text: "text-red-950",
    border: "border-red-900",
    dot: "bg-red-900",
  },
  "Org/CSC Proposed Event": {
    bg: "bg-green-100",
    text: "text-green-800",
    border: "border-green-400",
    dot: "bg-green-500",
  },
  "Org/CSC Outreach Programs": {
    bg: "bg-pink-100",
    text: "text-pink-800",
    border: "border-pink-400",
    dot: "bg-pink-600",
  },
};

export const STATUSES = [
  "Approved",
  "Pending Approval",
  "Proposed",
  "Needs Revision",
  "Cancelled",
  "Needs Verification",
] as const;

export type Status = (typeof STATUSES)[number];

export const STATUS_COLORS: Record<Status, string> = {
  Approved: "bg-emerald-100 text-emerald-800 border-emerald-300",
  "Pending Approval": "bg-amber-100 text-amber-800 border-amber-300",
  Proposed: "bg-green-100 text-green-800 border-green-300",
  "Needs Revision": "bg-orange-100 text-orange-800 border-orange-300",
  Cancelled: "bg-gray-100 text-gray-600 border-gray-300",
  "Needs Verification": "bg-purple-100 text-purple-800 border-purple-300",
};

export const EVENT_TYPES = [
  "University Event",
  "Activity",
  "Orientation",
  "Meeting",
  "Workshop",
  "Seminar",
  "Competition",
  "Outreach",
  "Election",
  "Other",
] as const;

export const ACADEMIC_YEAR = "AY 2026–2027";

export const APP_TITLE = "West Visayas State University";
export const APP_SUBTITLE = "University Student Council Unified Calendar";
