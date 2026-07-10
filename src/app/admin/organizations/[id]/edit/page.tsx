export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { AdminNav } from "@/components/admin/admin-nav";
import { OrganizationForm } from "@/components/admin/organizations-table";
import { getOrganizationById } from "@/lib/organizations";

export default async function EditOrganizationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const org = await getOrganizationById(id);
  if (!org) notFound();

  return (
    <div className="min-h-screen bg-usc-cream dark:bg-[#1A1816]">
      <header className="border-b border-usc-border bg-usc-black text-white px-4 py-4 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-usc-gold">Administrator</p>
        <p className="text-lg font-bold">Edit Organization</p>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <AdminNav />
        <OrganizationForm
          mode="edit"
          orgId={id}
          initialData={{
            name: org.name,
            acronym: org.acronym,
            description: org.description,
            contact: org.contact,
            website: org.website,
          }}
        />
      </main>
    </div>
  );
}
