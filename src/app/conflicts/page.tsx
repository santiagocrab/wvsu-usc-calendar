export const dynamic = "force-dynamic";

import { getOrganizations } from "@/lib/organizations";
import { getConflictSummary } from "@/lib/conflict-queries";
import { isAdminAuthenticated } from "@/lib/auth";
import { ConflictsPageClient } from "@/components/pages/conflicts-page-client";

export default async function ConflictsPage() {
  let conflicts: Awaited<ReturnType<typeof getConflictSummary>>["conflicts"] = [];
  let counters = {
    high: 0,
    medium: 0,
    low: 0,
    needsVerification: 0,
    resolved: 0,
    total: 0,
    defaultView: 0,
  };
  let orgCount = 0;
  let isAdmin = false;

  try {
    const [summary, orgs, authed] = await Promise.all([
      getConflictSummary(),
      getOrganizations(),
      isAdminAuthenticated(),
    ]);
    conflicts = summary.conflicts;
    counters = summary.counters;
    orgCount = orgs.length;
    isAdmin = authed;
  } catch {
    /* db */
  }

  return (
    <ConflictsPageClient
      conflicts={conflicts}
      counters={counters}
      orgCount={orgCount}
      isAdmin={isAdmin}
    />
  );
}
