import { AdminNav } from "@/components/admin/admin-nav";
import { OrganizationForm } from "@/components/admin/organizations-table";

export default function NewOrganizationPage() {
  return (
    <div className="min-h-screen bg-usc-cream dark:bg-[#1A1816]">
      <header className="border-b border-usc-border bg-usc-black text-white px-4 py-4 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-usc-gold">Administrator</p>
        <p className="text-lg font-bold">Add Organization</p>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <AdminNav />
        <OrganizationForm mode="create" />
      </main>
    </div>
  );
}
