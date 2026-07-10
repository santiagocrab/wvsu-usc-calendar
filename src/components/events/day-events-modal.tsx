"use client";

import { format } from "date-fns";
import { X, MapPin, Clock } from "lucide-react";
import type { EventDTO } from "@/lib/events";
import { formatEventTime } from "@/lib/events";
import { CATEGORY_META } from "@/lib/constants";
import { CategoryBadge } from "./category-badge";
import { StatusBadge } from "./status-badge";

export function DayEventsModal({
  day,
  events,
  onClose,
  onSelectEvent,
}: {
  day: Date;
  events: EventDTO[];
  onClose: () => void;
  onSelectEvent: (event: EventDTO) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative max-h-[85vh] w-full max-w-lg overflow-hidden bg-white dark:bg-[#2A2724] rounded-2xl shadow-xl border border-usc-border dark:border-[#3D3935] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-usc-gold-wash dark:bg-usc-gold/15 border-b border-usc-gold/20 px-6 py-4 flex items-start justify-between shrink-0">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-usc-muted">Events on</p>
            <h2 className="text-xl font-extrabold text-usc-black dark:text-[#F5F0E8]">
              {format(day, "EEEE, MMMM d, yyyy")}
            </h2>
            <p className="text-sm text-usc-muted mt-1">
              {events.length} {events.length === 1 ? "event" : "events"}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-black/20" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-4 py-3 space-y-2">
          {events.length === 0 ? (
            <p className="text-center text-usc-muted py-10 font-medium">No events on this day.</p>
          ) : (
            events.map((event) => {
              const meta = CATEGORY_META[event.category];
              return (
                <button
                  key={event.id}
                  onClick={() => onSelectEvent(event)}
                  className="w-full text-left p-4 rounded-xl border border-usc-border hover:border-usc-gold/50 hover:bg-usc-gold-wash/30 dark:hover:bg-usc-gold/5 transition flex gap-3"
                >
                  <div className="w-1 rounded-full shrink-0 self-stretch" style={{ backgroundColor: meta?.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-usc-black dark:text-[#F5F0E8] leading-snug">{event.title}</p>
                    <p className="text-xs text-usc-muted mt-1 flex items-center gap-1">
                      <Clock size={12} />
                      {formatEventTime(event.startTime, event.endTime)}
                    </p>
                    <p className="text-xs text-usc-muted mt-0.5 flex items-center gap-1 truncate">
                      <MapPin size={12} className="shrink-0" />
                      {event.location}
                    </p>
                    <p className="text-xs text-usc-charcoal dark:text-white/60 mt-1 truncate">{event.host}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <CategoryBadge category={event.category} />
                      <StatusBadge status={event.status} />
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="px-6 py-4 border-t border-usc-border shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-full bg-usc-gold text-usc-black font-bold hover:bg-usc-gold-dark hover:text-white transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
