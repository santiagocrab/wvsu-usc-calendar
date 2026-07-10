"use client";

import { X, MapPin, Clock, Users, User, FileText, ExternalLink } from "lucide-react";
import type { EventDTO } from "@/lib/events";
import { formatEventDateRange, formatEventTime } from "@/lib/events";
import { CategoryBadge } from "./category-badge";
import { StatusBadge } from "./status-badge";

export function EventModal({ event, onClose }: { event: EventDTO | null; onClose: () => void }) {
  if (!event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto bg-white dark:bg-[#2A2724] rounded-2xl shadow-xl border border-usc-border dark:border-[#3D3935]">
        <div className="sticky top-0 bg-usc-gold-wash dark:bg-usc-gold/15 rounded-t-2xl border-b border-usc-gold/20 px-6 py-4 flex items-start justify-between">
          <div className="pr-4">
            <h2 className="text-lg font-extrabold text-usc-black dark:text-[#F5F0E8]">{event.title}</h2>
            <div className="flex flex-wrap gap-2 mt-2">
              <CategoryBadge category={event.category} />
              <StatusBadge status={event.status} />
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-black/20" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5 text-sm">
          <Row icon={<Clock size={16} />} label="Date & Time">
            <p className="font-semibold">{formatEventDateRange(event.startDate, event.endDate)}</p>
            <p className="text-usc-muted">{formatEventTime(event.startTime, event.endTime)}</p>
          </Row>
          <Row icon={<MapPin size={16} />} label="Venue">
            <p>{event.location}</p>
            {event.mapLink && (
              <a href={event.mapLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-1 text-usc-gold-dark font-semibold hover:underline">
                <ExternalLink size={14} /> View Map
              </a>
            )}
          </Row>
          <Row icon={<Users size={16} />} label="Hosted by">
            <p className="font-semibold">{event.host}</p>
            <p className="text-usc-muted">{event.organization}</p>
          </Row>
          {event.targetParticipants && (
            <Row icon={<Users size={16} />} label="Target Participants"><p>{event.targetParticipants}</p></Row>
          )}
          <Row icon={<FileText size={16} />} label="Event Type"><p>{event.eventType}</p></Row>
          {event.description && (
            <Row icon={<FileText size={16} />} label="Description"><p className="whitespace-pre-wrap">{event.description}</p></Row>
          )}
          {event.contactPerson && (
            <Row icon={<User size={16} />} label="Contact"><p>{event.contactPerson}</p></Row>
          )}
          {event.remarks && (
            <div className="p-3 rounded-xl bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800">
              <p className="text-xs font-bold text-yellow-800 dark:text-yellow-200">Remarks</p>
              <p className="text-sm mt-1">{event.remarks}</p>
            </div>
          )}
        </div>
        <div className="px-6 pb-5">
          <button onClick={onClose} className="w-full py-2.5 rounded-full bg-usc-gold text-usc-black font-bold hover:bg-usc-gold-dark hover:text-white transition">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="text-usc-gold mt-0.5">{icon}</div>
      <div>
        <p className="text-[10px] font-bold uppercase text-usc-muted tracking-wide">{label}</p>
        <div className="mt-1 text-usc-black dark:text-[#F2EDE6]">{children}</div>
      </div>
    </div>
  );
}
