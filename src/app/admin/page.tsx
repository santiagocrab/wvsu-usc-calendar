export const dynamic = "force-dynamic";

import { AdminNav, StatCard } from "@/components/admin/admin-nav";
import { getEventStats, getEvents } from "@/lib/queries";
import { detectConflicts } from "@/lib/conflicts";

export default async function AdminDashboardPage() {
  let stats = { total: 0, thisMonth: 0, pending: 0, proposed: 0 };
  let conflictCount = 0;

  try {
    const [eventStats, events] = await Promise.all([getEventStats(), getEvents()]);
    stats = eventStats;
    conflictCount = detectConflicts(events).length;
  } catch {
    // Database not configured
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-[#1e3a5f] px-4 py-4 text-white sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c9a227]">Administrator</p>
        <p className="text-lg font-semibold">WVSU USC Unified Calendar</p>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <AdminNav />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard label="Total Events" value={stats.total} />
          <StatCard label="Events This Month" value={stats.thisMonth} />
          <StatCard label="Pending Approval" value={stats.pending} highlight />
          <StatCard label="Proposed Events" value={stats.proposed} highlight />
          <StatCard label="Conflicts Detected" value={conflictCount} highlight={conflictCount > 0} />
        </div>
      </main>
    </div>
  );
}
