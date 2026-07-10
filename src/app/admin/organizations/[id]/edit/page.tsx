export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { AdminFormPageClient } from "@/components/pages/admin-form-page-client";
import { OrganizationForm } from "@/components/admin/organizations-table";
import { getEvents } from "@/lib/queries";
import { getOrganizationById, getOrganizations } from "@/lib/organizations";
import { getConflictBadgeCount } from "@/lib/conflict-queries";

export default async function EditOrganizationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const org = await getOrganizationById(id);
  if (!org) notFound();

  let eventCount = 0;
  let orgCount = 0;
  let conflictCount = 0;

  try {
    const [events, orgs] = await Promise.all([getEvents(), getOrganizations()]);
    eventCount = events.length;
    orgCount = orgs.length;
    conflictCount = await getConflictBadgeCount();
  } catch {
    // Database not configured
  }

  return (
    <AdminFormPageClient
      title="Edit organization"
      subtitle={org.name}
      backHref="/admin/organizations"
      backLabel="Back to organizations"
      eventCount={eventCount}
      orgCount={orgCount}
      conflictCount={conflictCount}
    >
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
    </AdminFormPageClient>
  );
}
