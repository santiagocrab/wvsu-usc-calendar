export const dynamic = "force-dynamic";

import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminNav } from "@/components/admin/admin-nav";
import { AdminOrganizationsTable } from "@/components/admin/organizations-table";
import { getOrganizations } from "@/lib/organizations";

export default async function AdminOrganizationsPage() {
  let orgs: Awaited<ReturnType<typeof getOrganizations>> = [];
  try { orgs = await getOrganizations(); } catch { /* db */ }

  return (
    <div className="min-h-screen bg-usc-cream dark:bg-[#1A1816]">
      <header className="border-b border-usc-border bg-usc-black text-white px-4 py-4 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-usc-gold">Administrator</p>
        <p className="text-lg font-bold">Manage Organizations</p>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <AdminNav />
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-usc-black dark:text-[#F5F0E8]">Organizations ({orgs.length})</h2>
          <Link href="/admin/organizations/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-usc-gold text-usc-black text-sm font-bold hover:bg-usc-gold-dark">
            <Plus size={16} /> Add Organization
          </Link>
        </div>
        <AdminOrganizationsTable organizations={orgs} />
      </main>
    </div>
  );
}
