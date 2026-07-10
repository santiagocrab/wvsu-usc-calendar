"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import type { OrganizationDTO } from "@/lib/organizations";
import { deleteOrganization, type OrganizationFormData } from "@/actions/organizations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AdminOrganizationsTable({ organizations }: { organizations: OrganizationDTO[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  const filtered = organizations.filter((o) => {
    const q = search.toLowerCase();
    return o.name.toLowerCase().includes(q) || o.acronym.toLowerCase().includes(q);
  });

  function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    startTransition(async () => {
      await deleteOrganization(id);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <Input placeholder="Search organizations…" value={search} onChange={(e) => setSearch(e.target.value)} />
      <div className="overflow-hidden rounded-2xl border border-usc-border bg-white dark:bg-[#252220]">
        <table className="w-full text-sm">
          <thead className="bg-usc-warm dark:bg-[#2A2724] text-left text-xs uppercase text-usc-muted">
            <tr>
              <th className="px-4 py-3">Organization</th>
              <th className="px-4 py-3">Acronym</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((org) => (
              <tr key={org.id} className="border-t border-usc-border hover:bg-usc-gold-wash/30">
                <td className="px-4 py-3 font-semibold">{org.name}</td>
                <td className="px-4 py-3 text-usc-muted">{org.acronym}</td>
                <td className="px-4 py-3 text-usc-muted truncate max-w-[200px]">{org.contact || "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link href={`/admin/organizations/${org.id}/edit`} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-usc-border text-xs font-bold hover:bg-usc-gold-wash">
                      <Pencil size={14} /> Edit
                    </Link>
                    <Button variant="destructive" size="sm" disabled={isPending} onClick={() => handleDelete(org.id, org.name)}>
                      <Trash2 size={14} /> Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-usc-muted">{filtered.length} organization(s)</p>
    </div>
  );
}

export function OrganizationForm({
  initialData,
  orgId,
  mode,
}: {
  initialData?: OrganizationFormData;
  orgId?: string;
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const [form, setForm] = useState<OrganizationFormData>(
    initialData ?? { name: "", acronym: "", description: "", contact: "", website: "" }
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const { createOrganization, updateOrganization } = await import("@/actions/organizations");
      const result = mode === "create"
        ? await createOrganization(form)
        : await updateOrganization(orgId!, form);
      if (result.success) router.push("/admin/organizations");
      else setError(result.error ?? "Failed to save.");
    });
  }

  const fields: { key: keyof OrganizationFormData; label: string; required?: boolean }[] = [
    { key: "name", label: "Organization Name", required: true },
    { key: "acronym", label: "Acronym" },
    { key: "contact", label: "Contact Person / Email" },
    { key: "website", label: "Website" },
    { key: "description", label: "Description" },
  ];

  return (
    <form onSubmit={handleSubmit} className="usc-card p-6 space-y-4 max-w-xl dark:bg-[#252220]">
      {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}
      {fields.map(({ key, label, required }) => (
        <div key={key}>
          <label className="text-sm font-semibold text-usc-charcoal">{label}{required && " *"}</label>
          {key === "description" ? (
            <textarea
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              className="mt-1 w-full px-3 py-2 rounded-xl border border-usc-border bg-white dark:bg-[#2A2724] dark:text-[#F2EDE6] min-h-[80px]"
            />
          ) : (
            <input
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              required={required}
              className="mt-1 w-full px-3 py-2 rounded-xl border border-usc-border bg-white dark:bg-[#2A2724] dark:text-[#F2EDE6]"
            />
          )}
        </div>
      ))}
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={isPending} className="px-5 py-2.5 rounded-full bg-usc-gold text-usc-black font-bold hover:bg-usc-gold-dark disabled:opacity-50">
          {isPending ? "Saving…" : "Save"}
        </button>
        <button type="button" onClick={() => router.push("/admin/organizations")} className="px-5 py-2.5 rounded-full border border-usc-border font-semibold">
          Cancel
        </button>
      </div>
    </form>
  );
}
