"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { ShieldAlert, Check, X, Link2, RefreshCw, ChevronDown } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { CategoryBadge } from "@/components/events/category-badge";
import { StatusBadge } from "@/components/events/status-badge";
import {
  changeConflictSeverityAction,
  linkRelatedEventsAction,
  recalculateConflictsAction,
  resolveConflictAction,
  type ResolutionStatus,
} from "@/actions/conflicts";
import {
  matchesConflictFilter,
  type Conflict,
  type ConflictFilter,
  type ConflictSeverity,
} from "@/lib/conflicts";
import { cn } from "@/lib/utils";

const FILTER_OPTIONS: { key: ConflictFilter | "priority"; label: string }[] = [
  { key: "priority", label: "Priority (High + Medium)" },
  { key: "confirmed", label: "Confirmed" },
  { key: "needs_verification", label: "Needs Verification" },
  { key: "same_venue", label: "Same Venue" },
  { key: "same_host", label: "Same Host" },
  { key: "same_participants", label: "Same Participants" },
  { key: "major_calendar", label: "Major Calendar" },
  { key: "holiday_scheduling", label: "Holiday Scheduling" },
  { key: "possible_duplicate", label: "Possible Duplicate" },
  { key: "low_notice", label: "Low Notice" },
  { key: "ignored_resolved", label: "Ignored / Resolved" },
];

const RELATION_TYPES = [
  "coverage",
  "support",
  "booth",
  "publication",
  "preparation",
  "component",
  "companion",
] as const;

export function ConflictsPageClient({
  conflicts,
  counters,
  orgCount,
  isAdmin,
  source = "stored",
  eventCount = 0,
  dbError = null,
}: {
  conflicts: Conflict[];
  counters: {
    high: number;
    medium: number;
    low: number;
    needsVerification: number;
    resolved: number;
    total: number;
    defaultView: number;
  };
  orgCount: number;
  isAdmin: boolean;
  source?: "stored" | "live";
  eventCount?: number;
  dbError?: string | null;
}) {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<ConflictFilter | "priority">("priority");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();
  const [recalcMessage, setRecalcMessage] = useState("");

  const severityStyles = {
    high: "border-usc-rose/40 bg-usc-rose-wash dark:bg-usc-rose/10",
    medium: "border-usc-coral/40 bg-usc-coral-wash dark:bg-usc-coral/10",
    low: "border-usc-gold/30 bg-usc-gold-wash dark:bg-usc-gold/10",
  };

  const filtered = useMemo(() => {
    if (activeFilter === "priority") {
      return conflicts.filter(
        (c) =>
          c.resolutionStatus === "unresolved" &&
          (c.severity === "high" || c.severity === "medium")
      );
    }
    return conflicts.filter((c) => matchesConflictFilter(c, activeFilter));
  }, [conflicts, activeFilter]);

  const badgeCount = counters.defaultView;

  function refreshAfterAction() {
    router.refresh();
  }

  function handleResolve(conflictId: string, status: ResolutionStatus) {
    startTransition(async () => {
      const result = await resolveConflictAction(conflictId, status, notes[conflictId] ?? "");
      if (result.success) refreshAfterAction();
    });
  }

  function handleSeverity(conflictId: string, severity: ConflictSeverity) {
    startTransition(async () => {
      const result = await changeConflictSeverityAction(conflictId, severity);
      if (result.success) refreshAfterAction();
    });
  }

  function handleLinkRelated(childId: string, parentId: string, relationType: string) {
    startTransition(async () => {
      const result = await linkRelatedEventsAction(childId, parentId, relationType);
      if (result.success) refreshAfterAction();
    });
  }

  function handleRecalculate() {
    startTransition(async () => {
      setRecalcMessage("Recalculating conflicts… this may take a minute.");
      const result = await recalculateConflictsAction();
      if (result.success && result.stats) {
        setRecalcMessage(
          `Done: ${result.stats.created} conflicts saved, ${result.stats.total} total in database.`
        );
        refreshAfterAction();
      } else {
        setRecalcMessage(result.error ?? "Recalculation failed.");
      }
    });
  }

  return (
    <AppShell orgCount={orgCount} conflictCount={badgeCount}>
      <div className="max-w-5xl mx-auto space-y-5">
        <section className="usc-card p-6 bg-usc-coral-wash dark:bg-usc-coral/10 dark:bg-[#252220]">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-usc-coral flex items-center justify-center shrink-0">
              <ShieldAlert size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-extrabold text-usc-black dark:text-[#F5F0E8]">
                Conflict checker
              </h1>
              <p className="text-sm text-usc-muted mt-2">
                {counters.defaultView} priority conflicts (high + medium, unresolved) ·{" "}
                {counters.total} total · {eventCount} events scanned
              </p>
              {source === "live" && eventCount > 0 && (
                <p className="text-xs text-usc-coral font-semibold mt-2">
                  Showing live analysis — sign in as admin and click Recalculate to save results.
                </p>
              )}
              {dbError && (
                <p className="text-xs text-usc-coral font-semibold mt-2">{dbError}</p>
              )}
            </div>
            {isAdmin && (
              <button
                onClick={handleRecalculate}
                disabled={pending}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-usc-gold text-usc-black text-sm font-bold hover:bg-usc-gold-dark hover:text-white transition disabled:opacity-60 shrink-0"
              >
                <RefreshCw size={16} className={pending ? "animate-spin" : ""} />
                Recalculate
              </button>
            )}
          </div>
          {recalcMessage && (
            <p className="text-sm text-usc-charcoal dark:text-white/70 mt-3 font-medium">
              {recalcMessage}
            </p>
          )}
        </section>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {(
            [
              ["High", counters.high, "text-usc-rose"],
              ["Medium", counters.medium, "text-usc-coral"],
              ["Low", counters.low, "text-usc-gold-dark dark:text-usc-gold"],
              ["Needs verification", counters.needsVerification, "text-usc-lavender"],
              ["Resolved", counters.resolved, "text-usc-mint"],
            ] as const
          ).map(([label, value, color]) => (
            <div
              key={label}
              className="usc-card p-3 text-center dark:bg-[#252220]"
            >
              <p className={cn("text-xl font-extrabold", color)}>{value}</p>
              <p className="text-[10px] uppercase font-bold text-usc-muted mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {FILTER_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-bold transition",
                activeFilter === key
                  ? "bg-usc-gold text-usc-black"
                  : "bg-white dark:bg-[#2A2724] text-usc-ink dark:text-[#F2EDE6] border border-usc-border hover:border-usc-gold"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <p className="text-sm text-usc-muted font-medium">
          Showing {filtered.length} conflict{filtered.length === 1 ? "" : "s"}
        </p>

        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="text-center text-usc-muted py-12 font-medium space-y-2">
              <p>No conflicts match this filter.</p>
              {eventCount === 0 && (
                <p className="text-sm text-usc-coral">
                  No events found in the database. Restore calendar data first.
                </p>
              )}
              {eventCount > 0 && counters.total === 0 && isAdmin && (
                <p className="text-sm">
                  Click <strong>Recalculate</strong> above to scan {eventCount} events and save conflicts.
                </p>
              )}
            </div>
          ) : (
            filtered.map((conflict) => (
              <ConflictCard
                key={conflict.id ?? conflict.pairKey}
                conflict={conflict}
                severityStyles={severityStyles}
                isAdmin={isAdmin}
                source={source}
                pending={pending}
                notes={notes[conflict.id ?? ""] ?? ""}
                onNotesChange={(v) =>
                  setNotes((prev) => ({ ...prev, [conflict.id ?? ""]: v }))
                }
                onResolve={handleResolve}
                onSeverity={handleSeverity}
                onLinkRelated={handleLinkRelated}
              />
            ))
          )}
        </div>

        <Link href="/calendar" className="text-sm font-semibold text-usc-gold-dark hover:underline">
          ← Back to calendar
        </Link>
      </div>
    </AppShell>
  );
}

function ConflictCard({
  conflict,
  severityStyles,
  isAdmin,
  source,
  pending,
  notes,
  onNotesChange,
  onResolve,
  onSeverity,
  onLinkRelated,
}: {
  conflict: Conflict;
  severityStyles: Record<ConflictSeverity, string>;
  isAdmin: boolean;
  source: "stored" | "live";
  pending: boolean;
  notes: string;
  onNotesChange: (v: string) => void;
  onResolve: (id: string, status: ResolutionStatus) => void;
  onSeverity: (id: string, severity: ConflictSeverity) => void;
  onLinkRelated: (childId: string, parentId: string, relationType: string) => void;
}) {
  const [showLink, setShowLink] = useState(false);
  const [relationType, setRelationType] = useState<string>("coverage");
  const conflictId = conflict.id ?? "";

  const resolutionLabel: Record<string, string> = {
    unresolved: "Unresolved",
    reviewing: "Reviewing",
    resolved: "Resolved",
    dismissed: "Dismissed",
    related_events: "Related events",
  };

  return (
    <div
      className={cn(
        "usc-card p-5 border-2 dark:bg-[#252220]",
        severityStyles[conflict.severity]
      )}
    >
      <div className="flex flex-wrap gap-2 items-center mb-2">
        <span className="text-xs font-bold uppercase px-2 py-0.5 rounded-full bg-white/80 dark:bg-black/20">
          {conflict.severity}
        </span>
        <span className="text-xs text-usc-muted uppercase">
          {conflict.type.replace(/_/g, " ")}
        </span>
        {conflict.resolutionStatus !== "unresolved" && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-usc-mint/20 text-usc-mint">
            {resolutionLabel[conflict.resolutionStatus] ?? conflict.resolutionStatus}
          </span>
        )}
      </div>

      <p className="font-bold text-usc-black dark:text-[#F5F0E8]">{conflict.message}</p>
      <p className="text-sm text-usc-muted mt-2">
        <span className="font-semibold">Why:</span> {conflict.reason}
      </p>
      {conflict.reasons.length > 1 && (
        <ul className="text-xs text-usc-muted mt-1 list-disc list-inside space-y-0.5">
          {conflict.reasons.slice(1).map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      )}
      <p className="text-sm text-usc-charcoal dark:text-white/70 mt-1">
        <span className="font-semibold">Action:</span> {conflict.recommendedAction}
      </p>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {conflict.events.map((event) => (
          <div
            key={event.id}
            className="p-4 rounded-xl bg-white dark:bg-[#2A2724] border border-usc-border"
          >
            <p className="font-semibold text-sm">{event.title}</p>
            <p className="text-xs text-usc-muted mt-1">
              {format(parseISO(event.startDate), "MMM d, yyyy")}
              {event.endDate !== event.startDate &&
                ` – ${format(parseISO(event.endDate), "MMM d, yyyy")}`}
              {" · "}
              {event.location || "TBA"}
              {event.startTime && ` · ${event.startTime}${event.endTime ? `–${event.endTime}` : ""}`}
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              <CategoryBadge category={event.category} />
              <StatusBadge status={event.status} />
            </div>
            {isAdmin && (
              <Link
                href={`/admin/events/${event.id}/edit`}
                className="inline-block mt-2 text-xs font-semibold text-usc-gold-dark hover:underline"
              >
                Edit event →
              </Link>
            )}
          </div>
        ))}
      </div>

      {isAdmin && conflictId && source === "stored" && conflict.resolutionStatus === "unresolved" && (
        <div className="mt-4 pt-4 border-t border-usc-border/60 space-y-3">
          <textarea
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Resolution notes (optional)"
            rows={2}
            className="w-full px-3 py-2 rounded-xl border border-usc-border text-sm bg-white dark:bg-[#2A2724] text-usc-ink dark:text-[#F2EDE6] focus:ring-2 focus:ring-usc-gold/30"
          />

          <div className="flex flex-wrap gap-2">
            <button
              disabled={pending}
              onClick={() => onResolve(conflictId, "resolved")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-usc-mint text-white text-xs font-bold hover:opacity-90 disabled:opacity-60"
            >
              <Check size={14} /> Resolved
            </button>
            <button
              disabled={pending}
              onClick={() => onResolve(conflictId, "dismissed")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-usc-charcoal text-white text-xs font-bold hover:opacity-90 disabled:opacity-60"
            >
              <X size={14} /> Not a conflict
            </button>
            <button
              disabled={pending}
              onClick={() => onResolve(conflictId, "reviewing")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#2A2724] border border-usc-border text-xs font-bold hover:border-usc-gold disabled:opacity-60"
            >
              Reviewing
            </button>
            <button
              disabled={pending}
              onClick={() => setShowLink(!showLink)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-usc-lavender text-white text-xs font-bold hover:opacity-90 disabled:opacity-60"
            >
              <Link2 size={14} /> Link related
            </button>

            <div className="relative inline-flex items-center">
              <select
                disabled={pending}
                value={conflict.severity}
                onChange={(e) =>
                  onSeverity(conflictId, e.target.value as ConflictSeverity)
                }
                className="appearance-none pl-3 pr-7 py-1.5 rounded-full border border-usc-border text-xs font-bold bg-white dark:bg-[#2A2724] cursor-pointer"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <ChevronDown size={12} className="absolute right-2 pointer-events-none text-usc-muted" />
            </div>
          </div>

          {showLink && conflict.events.length === 2 && (
            <div className="p-3 rounded-xl bg-usc-lavender-wash dark:bg-usc-lavender/10 border border-usc-lavender/25 space-y-2">
              <p className="text-xs font-semibold text-usc-charcoal dark:text-white/70">
                Mark &quot;{conflict.events[1].title}&quot; as related to &quot;
                {conflict.events[0].title}&quot;
              </p>
              <div className="flex flex-wrap gap-2 items-center">
                <select
                  value={relationType}
                  onChange={(e) => setRelationType(e.target.value)}
                  className="px-2 py-1 rounded-lg border border-usc-border text-xs font-medium bg-white dark:bg-[#2A2724]"
                >
                  {RELATION_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <button
                  disabled={pending}
                  onClick={() =>
                    onLinkRelated(conflict.events[1].id, conflict.events[0].id, relationType)
                  }
                  className="px-3 py-1 rounded-full bg-usc-lavender text-white text-xs font-bold hover:opacity-90 disabled:opacity-60"
                >
                  Link & dismiss
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {conflict.resolutionNotes && (
        <p className="text-xs text-usc-muted mt-3 italic">Notes: {conflict.resolutionNotes}</p>
      )}
    </div>
  );
}
