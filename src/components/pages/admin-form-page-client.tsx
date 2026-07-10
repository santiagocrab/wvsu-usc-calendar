"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminShell } from "@/components/layout/admin-shell";

export function AdminFormPageClient({
  title,
  subtitle,
  backHref,
  backLabel,
  children,
  eventCount,
  orgCount,
  conflictCount,
}: {
  title: string;
  subtitle: string;
  backHref: string;
  backLabel: string;
  children: React.ReactNode;
  eventCount?: number;
  orgCount?: number;
  conflictCount?: number;
}) {
  return (
    <AdminShell
      eventCount={eventCount}
      orgCount={orgCount}
      conflictCount={conflictCount}
      title={title}
      subtitle={subtitle}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-sm font-bold text-usc-gold-dark dark:text-usc-gold hover:underline"
        >
          <ArrowLeft size={16} />
          {backLabel}
        </Link>

        <section className="usc-card p-5 sm:p-6 dark:bg-[#252220]">
          <h1 className="text-xl sm:text-2xl font-extrabold text-usc-black dark:text-[#F5F0E8]">{title}</h1>
          <p className="text-sm text-usc-muted mt-1">{subtitle}</p>
        </section>

        {children}
      </div>
    </AdminShell>
  );
}
