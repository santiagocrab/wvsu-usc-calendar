"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Building2 } from "lucide-react";
import { AdminShell } from "@/components/layout/admin-shell";
import { AdminOrganizationsTable } from "@/components/admin/organizations-table";
import type { OrganizationDTO } from "@/lib/organizations";

export function AdminOrganizationsPageClient({
  organizations,
  eventCount,
  conflictCount,
}: {
  organizations: OrganizationDTO[];
  eventCount: number;
  conflictCount: number;
}) {
  const [search, setSearch] = useState("");

  return (
    <AdminShell
      search={search}
      onSearchChange={setSearch}
      eventCount={eventCount}
      orgCount={organizations.length}
      conflictCount={conflictCount}
      title="Manage Organizations"
      subtitle={`${organizations.length} registered organizations`}
    >
      <div className="space-y-6 max-w-6xl mx-auto">
        <section className="usc-card p-5 sm:p-6 dark:bg-[#252220]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-usc-black dark:text-[#F5F0E8] flex items-center gap-2">
                <Building2 size={22} className="text-usc-gold" />
                Organizations
              </h1>
              <p className="text-sm text-usc-muted mt-1">
                Councils, societies, and orgs linked to calendar events.
              </p>
            </div>
            <Link
              href="/admin/organizations/new"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-usc-gold text-usc-black text-sm font-bold hover:bg-usc-gold-dark hover:text-white transition shadow-sm shrink-0"
            >
              <Plus size={16} />
              Add organization
            </Link>
          </div>
        </section>

        <AdminOrganizationsTable organizations={organizations} search={search} />
      </div>
    </AdminShell>
  );
}
