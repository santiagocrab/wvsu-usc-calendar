"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES, EVENT_TYPES, STATUSES } from "@/lib/constants";
import { getCategoryStyle } from "@/lib/events";
import type { EventFormData } from "@/actions/events";
import { createEvent, updateEvent } from "@/actions/events";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const emptyForm: EventFormData = {
  title: "",
  category: "Org/CSC Proposed Event",
  host: "",
  organization: "",
  eventType: "Activity",
  status: "Proposed",
  startDate: "",
  endDate: "",
  startTime: "",
  endTime: "",
  location: "",
  mapLink: "",
  targetParticipants: "",
  description: "",
  contactPerson: "",
  sourceFile: "",
  remarks: "",
};

export function EventForm({
  initialData,
  eventId,
  mode,
}: {
  initialData?: EventFormData;
  eventId?: string;
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const [form, setForm] = useState<EventFormData>(initialData ?? emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const categoryStyle = getCategoryStyle(form.category);

  function updateField<K extends keyof EventFormData>(key: K, value: EventFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createEvent(form)
          : await updateEvent(eventId!, form);

      if (result.success) {
        setSuccess(mode === "create" ? "Event created successfully!" : "Event updated successfully!");
        setTimeout(() => router.push("/admin/events"), 800);
      } else {
        setError(result.error ?? "Something went wrong.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="category">Category *</Label>
            <Select
              id="category"
              value={form.category}
              onChange={(e) => updateField("category", e.target.value)}
              required
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
            <div className={`mt-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${categoryStyle.bg} ${categoryStyle.text} ${categoryStyle.border}`}>
              <span className={`h-2 w-2 rounded-full ${categoryStyle.dot}`} />
              Category preview
            </div>
          </div>

          <div>
            <Label htmlFor="status">Status *</Label>
            <Select
              id="status"
              value={form.status}
              onChange={(e) => updateField("status", e.target.value)}
              required
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="organization">Hosting Organization / Council *</Label>
            <Input
              id="organization"
              value={form.organization}
              onChange={(e) => updateField("organization", e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="host">Host *</Label>
            <Input
              id="host"
              value={form.host}
              onChange={(e) => updateField("host", e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="eventType">Event Type *</Label>
            <Select
              id="eventType"
              value={form.eventType}
              onChange={(e) => updateField("eventType", e.target.value)}
              required
            >
              {EVENT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="targetParticipants">Target Participants</Label>
            <Input
              id="targetParticipants"
              value={form.targetParticipants}
              onChange={(e) => updateField("targetParticipants", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Schedule & Venue</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="startDate">Start Date *</Label>
            <Input
              id="startDate"
              type="date"
              value={form.startDate}
              onChange={(e) => updateField("startDate", e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="endDate">End Date *</Label>
            <Input
              id="endDate"
              type="date"
              value={form.endDate}
              onChange={(e) => updateField("endDate", e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="startTime">Start Time</Label>
            <Input
              id="startTime"
              type="time"
              value={form.startTime}
              onChange={(e) => updateField("startTime", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="endTime">End Time</Label>
            <Input
              id="endTime"
              type="time"
              value={form.endTime}
              onChange={(e) => updateField("endTime", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="location">Venue / Location *</Label>
            <Input
              id="location"
              value={form.location}
              onChange={(e) => updateField("location", e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="mapLink">Google Maps Link</Label>
            <Input
              id="mapLink"
              type="url"
              placeholder="https://maps.google.com/..."
              value={form.mapLink}
              onChange={(e) => updateField("mapLink", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input
                id="contactPerson"
                value={form.contactPerson}
                onChange={(e) => updateField("contactPerson", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="sourceFile">Source File / Attachment Link</Label>
              <Input
                id="sourceFile"
                value={form.sourceFile}
                onChange={(e) => updateField("sourceFile", e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea
              id="remarks"
              value={form.remarks}
              onChange={(e) => updateField("remarks", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : mode === "create" ? "Create Event" : "Save Changes"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/events")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
