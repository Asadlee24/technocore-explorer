import * as dotenv from "dotenv";
import { resolve } from "path";
// Load .env then .env.local so local credentials override when running tsx directly
dotenv.config({ path: resolve(process.cwd(), ".env") });
dotenv.config({ path: resolve(process.cwd(), ".env.local"), override: true });
import { ContinuumCollector } from "../src/lib/continuum/collector";
import { ContinuumDatabase } from "../src/lib/continuum/db";

const INTERVAL_MS = parseInt(process.env.COLLECTOR_INTERVAL_MS || "6000", 10);
const ONCE_MODE = process.argv.includes("--once");

console.log("=========================================================");
console.log(" Technocore Continuum - Autonomous Archival Worker Node");
console.log("=========================================================");
console.log(`Interval: ${INTERVAL_MS}ms | Run-Once: ${ONCE_MODE}`);

const collector = new ContinuumCollector();
let isShuttingDown = false;

async function runLoop() {
  const dbHealth = await ContinuumDatabase.ping();
  console.log(`[Storage] Database status: ${dbHealth.message}`);

  let cycle = 1;
  while (!isShuttingDown) {
    console.log(`\n[Cycle #${cycle}] Starting ingestion & Merkle audit sweep at ${new Date().toLocaleTimeString()}...`);
    
    try {
      const result = await collector.runCollectionCycle();
      console.log(`[Cycle #${cycle}] Finished: ${result.roomsChecked} rooms checked, ${result.messagesIngested} new messages archived.`);
      
      if (result.newEpochCreated && result.merkleRoot) {
        console.log(`[Merkle Engine] Sealed Epoch Root: ${result.merkleRoot}`);
      }
    } catch (err) {
      console.error(`[Cycle #${cycle}] Error during collection:`, err);
    }

    if (ONCE_MODE) {
      console.log("\n[Worker] Completed single cycle. Exiting.");
      process.exit(0);
    }

    cycle++;
    await new Promise((resolve) => setTimeout(resolve, INTERVAL_MS));
  }
}

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n[Worker] Received SIGINT. Shutting down gracefully...");
  isShuttingDown = true;
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n[Worker] Received SIGTERM. Shutting down gracefully...");
  isShuttingDown = true;
  process.exit(0);
});

runLoop().catch((err) => {
  console.error("[Worker Fatal Error]:", err);
  process.exit(1);
});
