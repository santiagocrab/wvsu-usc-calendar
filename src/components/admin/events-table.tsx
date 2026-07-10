"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import type { EventDTO } from "@/lib/events";
import { filterEvents } from "@/lib/events";
import { CATEGORIES, STATUSES } from "@/lib/constants";
import { deleteEvent } from "@/actions/events";
import { CategoryBadge } from "./category-badge";
import { StatusBadge } from "./status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export function AdminEventsTable({ events }: { events: EventDTO[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [month, setMonth] = useState("all");
  const [isPending, startTransition] = useTransition();

  const filtered = filterEvents(events, {
    search,
    category: category === "all" ? undefined : category,
    status: status === "all" ? undefined : status,
    month: month === "all" ? undefined : month,
  });

  function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    startTransition(async () => {
      await deleteEvent(id);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Input placeholder="Search events..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
        <Select value={month} onChange={(e) => setMonth(e.target.value)}>
          <option value="all">All Months</option>
          {Array.from({ length: 13 }, (_, i) => {
            const d = new Date(2026, 6 + i, 1);
            return (
              <option key={i} value={format(d, "yyyy-MM")}>
                {format(d, "MMMM yyyy")}
              </option>
            );
          })}
        </Select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                    No events found.
                  </td>
                </tr>
              ) : (
                filtered.map((event) => (
                  <tr key={event.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{event.title}</p>
                      <p className="text-xs text-slate-500">{event.organization}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                      {format(parseISO(event.startDate), "MMM d, yyyy")}
                    </td>
                    <td className="px-4 py-3">
                      <CategoryBadge category={event.category} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={event.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/events/${event.id}/edit`}
                          className="inline-flex h-8 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Link>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={isPending}
                          onClick={() => handleDelete(event.id, event.title)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-sm text-slate-500">{filtered.length} event(s) shown</p>
    </div>
  );
}
