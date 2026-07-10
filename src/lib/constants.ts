export const CATEGORY_META: Record<
  string,
  { color: string; textColor: string; bgLight: string; short: string }
> = {
  "National Holiday": { color: "#C00000", textColor: "#FFFFFF", bgLight: "#FEE2E2", short: "Holiday" },
  "WVSU Calendar": { color: "#2563EB", textColor: "#FFFFFF", bgLight: "#DBEAFE", short: "WVSU" },
  "USC Events": { color: "#C9953A", textColor: "#3A3632", bgLight: "#F9F3E8", short: "USC" },
  "Org/CSC Calendared Event": { color: "#EA580C", textColor: "#FFFFFF", bgLight: "#FFEDD5", short: "Calendared" },
  "Org/CSC Proposed Event": { color: "#00B050", textColor: "#FFFFFF", bgLight: "#DCFCE7", short: "Proposed" },
  "Org/CSC Outreach Programs": { color: "#C00080", textColor: "#FFFFFF", bgLight: "#FCE7F6", short: "Outreach" },
};

export const CATEGORIES = Object.keys(CATEGORY_META);

export const STATUSES = [
  "Approved",
  "Pending Approval",
  "Proposed",
  "Needs Revision",
  "Cancelled",
  "Needs Verification",
] as const;

export const STATUS_META: Record<string, { color: string; bg: string }> = {
  Approved: { color: "#166534", bg: "#DCFCE7" },
  "Pending Approval": { color: "#92400E", bg: "#FEF3C7" },
  Proposed: { color: "#15803D", bg: "#BBF7D0" },
  "Needs Revision": { color: "#C2410C", bg: "#FFEDD5" },
  Cancelled: { color: "#6B7280", bg: "#F3F4F6" },
  "Needs Verification": { color: "#7C3AED", bg: "#EDE9FE" },
};

export const EVENT_TYPES = [
  "University Event", "Activity", "Orientation", "Meeting", "Workshop",
  "Seminar", "Competition", "Outreach", "Election", "Academic",
  "General Assembly", "Training / Workshop", "Sports / Wellness",
  "Cultural / Arts", "Other",
];

export const ACADEMIC_YEAR = "AY 2026–2027";
export const USC_NOTICE =
  "Proposed Events are subject for approval and may change. Please be guided by the legends below.";

export const AY_MONTHS = Array.from({ length: 12 }, (_, i) => {
  const d = new Date(2026, 6 + i, 1);
  return { label: d.toLocaleString("en", { month: "short", year: "numeric" }), value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` };
});
