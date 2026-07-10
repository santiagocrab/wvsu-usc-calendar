"use client";

import { X, MapPin, Clock, Users, User, FileText, ExternalLink } from "lucide-react";
import type { EventDTO } from "@/lib/events";
import { formatEventDateRange, formatEventTime } from "@/lib/events";
import { CategoryBadge } from "./category-badge";
import { StatusBadge } from "./status-badge";

export function EventModal({
  event,
  onClose,
}: {
  event: EventDTO | null;
  onClose: () => void;
}) {
  if (!event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 flex items-start justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div className="space-y-2 pr-4">
            <h2 className="text-xl font-bold text-slate-900">{event.title}</h2>
            <div className="flex flex-wrap gap-2">
              <CategoryBadge category={event.category} />
              <StatusBadge status={event.status} />
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <DetailRow icon={<Clock className="h-4 w-4" />} label="Date & Time">
            <p>{formatEventDateRange(event.startDate, event.endDate)}</p>
            <p className="text-sm text-slate-500">{formatEventTime(event.startTime, event.endTime)}</p>
          </DetailRow>

          <DetailRow icon={<MapPin className="h-4 w-4" />} label="Venue">
            <p>{event.location}</p>
            {event.mapLink && (
              <a
                href={event.mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                View Map
              </a>
            )}
          </DetailRow>

          <DetailRow icon={<Users className="h-4 w-4" />} label="Hosted by">
            <p>{event.host}</p>
            <p className="text-sm text-slate-500">{event.organization}</p>
          </DetailRow>

          {event.targetParticipants && (
            <DetailRow icon={<Users className="h-4 w-4" />} label="Target Participants">
              <p>{event.targetParticipants}</p>
            </DetailRow>
          )}

          <DetailRow icon={<FileText className="h-4 w-4" />} label="Event Type">
            <p>{event.eventType}</p>
          </DetailRow>

          {event.description && (
            <DetailRow icon={<FileText className="h-4 w-4" />} label="Description">
              <p className="whitespace-pre-wrap text-slate-700">{event.description}</p>
            </DetailRow>
          )}

          {event.contactPerson && (
            <DetailRow icon={<User className="h-4 w-4" />} label="Contact Person">
              <p>{event.contactPerson}</p>
            </DetailRow>
          )}

          {event.remarks && (
            <DetailRow icon={<FileText className="h-4 w-4" />} label="Remarks">
              <p className="whitespace-pre-wrap text-slate-600">{event.remarks}</p>
            </DetailRow>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 text-[#1e3a5f]">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <div className="mt-1 text-sm text-slate-900">{children}</div>
      </div>
    </div>
  );
}
