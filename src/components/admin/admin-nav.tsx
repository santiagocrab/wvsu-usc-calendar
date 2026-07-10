"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, Plus, List, AlertTriangle, Calendar } from "lucide-react";
import { logoutAction } from "@/actions/events";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function AdminNav() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      await logoutAction();
      router.push("/admin/login");
      router.refresh();
    });
  }

  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-sm text-slate-500">Manage WVSU USC Unified Calendar events</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/events/new"
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#1e3a5f] px-4 text-sm font-medium text-white hover:bg-[#16304f]"
        >
          <Plus className="h-4 w-4" />
          Add Event
        </Link>
        <Link
          href="/admin/events"
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <List className="h-4 w-4" />
          Manage Events
        </Link>
        <Link
          href="/conflicts"
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <AlertTriangle className="h-4 w-4" />
          Conflicts
        </Link>
        <Link
          href="/calendar"
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <Calendar className="h-4 w-4" />
          Public View
        </Link>
        <Button variant="outline" onClick={handleLogout} disabled={isPending}>
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}

export function StatCard({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <Card>
      <CardContent className="p-6">
        <p className={`text-3xl font-bold ${highlight ? "text-amber-600" : "text-slate-900"}`}>{value}</p>
        <p className="mt-1 text-sm text-slate-500">{label}</p>
      </CardContent>
    </Card>
  );
}
