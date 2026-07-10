import Link from "next/link";
import { Calendar, Shield } from "lucide-react";
import { ACADEMIC_YEAR, APP_SUBTITLE, APP_TITLE } from "@/lib/constants";

export function SiteHeader({ showAdminLink = true }: { showAdminLink?: boolean }) {
  return (
    <header className="bg-[#1e3a5f] text-white shadow-lg">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c9a227]">
              {APP_TITLE}
            </p>
            <h1 className="mt-1 text-xl font-bold sm:text-2xl">{APP_SUBTITLE}</h1>
            <p className="mt-1 text-sm text-blue-100">{ACADEMIC_YEAR}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/calendar"
              className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20"
            >
              <Calendar className="h-4 w-4" />
              View Calendar
            </Link>
            {showAdminLink && (
              <Link
                href="/admin/login"
                className="inline-flex items-center gap-2 rounded-lg bg-[#c9a227] px-4 py-2 text-sm font-semibold text-[#1e3a5f] hover:bg-[#dfc04a]"
              >
                <Shield className="h-4 w-4" />
                Admin Login
              </Link>
            )}
          </div>
        </div>
        <div className="rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-sm text-blue-50">
          <strong className="text-[#c9a227]">Notice:</strong> Proposed Events are subject for approval and may change.
        </div>
      </div>
    </header>
  );
}

export function CategoryLegend() {
  const items = [
    { label: "National Holiday", color: "bg-red-600" },
    { label: "WVSU Calendar", color: "bg-yellow-500" },
    { label: "USC Events", color: "bg-blue-600" },
    { label: "Org/CSC Calendared Event", color: "bg-red-900" },
    { label: "Org/CSC Proposed Event", color: "bg-green-500" },
    { label: "Org/CSC Outreach Programs", color: "bg-pink-600" },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="mb-3 text-sm font-medium text-slate-700">
        Please be guided by the legends below.
      </p>
      <div className="flex flex-wrap gap-3">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-xs text-slate-600">
            <span className={`h-3 w-3 rounded-full ${item.color}`} />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}
