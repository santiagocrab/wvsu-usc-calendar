import "dotenv/config";
import { recalculateConflicts } from "../src/lib/conflict-queries";

async function main() {
  console.log("Recalculating conflicts from zero...");
  const stats = await recalculateConflicts();
  console.log("Done.");
  console.log(`  Auto-deleted: ${stats.deleted}`);
  console.log(`  Created/updated: ${stats.created}`);
  console.log(`  Preserved manual/dismissed: ${stats.preserved}`);
  console.log(`  Total conflicts in DB: ${stats.total}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
