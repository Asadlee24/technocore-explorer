import * as dotenv from "dotenv";
import { resolve } from "path";
dotenv.config({ path: resolve(process.cwd(), ".env") });
dotenv.config({ path: resolve(process.cwd(), ".env.local"), override: true });

import { ContinuumDatabase, supabaseAdmin } from "../src/lib/continuum/db";
import { ContinuumService } from "../src/lib/continuum/data-service";

async function main() {
  console.log("==================================================");
  console.log(" 🔍 LIVE SYSTEM VERIFICATION AUDIT");
  console.log("==================================================");

  // 1. Supabase connection
  const ping = await ContinuumDatabase.ping();
  console.log("\n[1] DATABASE CONNECTIVITY:");
  console.log("    Supabase Status:", ping.ok ? "ONLINE" : "OFFLINE", `(${ping.message})`);

  // 2. Exact Counts
  const { count: msgCount } = await supabaseAdmin
    .from("continuum_messages")
    .select("*", { count: "exact", head: true });

  const { count: roomCount } = await supabaseAdmin
    .from("continuum_rooms")
    .select("*", { count: "exact", head: true });

  const { count: blockCount } = await supabaseAdmin
    .from("continuum_merkle_blocks")
    .select("*", { count: "exact", head: true });

  console.log("\n[2] DATABASE TABLES (REAL DATA):");
  console.log(`    • continuum_messages:       ${msgCount} messages`);
  console.log(`    • continuum_rooms:          ${roomCount} rooms registered`);
  console.log(`    • continuum_merkle_blocks:  ${blockCount} Merkle epoch blocks`);

  // 3. Registered Rooms
  const rooms = await ContinuumDatabase.getRooms();
  console.log("\n[3] MONITORED ROOMS (SAMPLE):");
  rooms.slice(0, 8).forEach((r) => {
    console.log(`    /r/${r.room_name.padEnd(20)} [${r.room_class}] -> Archived: ${r.total_archived_count} msgs, Coverage: ${r.coverage_percent}%`);
  });

  // 4. Sample Real Ingested Messages
  const records = await ContinuumService.getArchiveRecords({ limit: 2 });
  console.log("\n[4] REAL INGESTED PAYLOADS & CRYPTOGRAPHY:");
  records.forEach((rec, idx) => {
    console.log(`    --- Message #${idx + 1} ---`);
    console.log(`    Room:            /r/${rec.room}`);
    console.log(`    Sequence:        #${rec.seq}`);
    console.log(`    Identity:        ${rec.from}`);
    console.log(`    Text:            ${JSON.stringify(rec.text)}`);
    console.log(`    Original Ts:     ${rec.ts}`);
    console.log(`    Message Hash:    ${rec.messageHash}`);
    console.log(`    Leaf Hash:       ${rec.leafHash}`);
    console.log(`    Merkle Root:     ${rec.merkleRoot}`);
    console.log(`    Merkle Proof:    ${rec.merklePath.length} sibling hashes`);
  });

  // 5. Continuum Service Telemetry
  const status = await ContinuumService.getCollectorStatus();
  console.log("\n[5] LIVE COLLECTOR TELEMETRY:");
  console.log(`    Status:          ${status.collectorStatus}`);
  console.log(`    Total Messages:  ${status.totalMessagesArchived}`);
  console.log(`    Uptime:          ${status.uptimePercent}%`);
  console.log(`    Latest Root:     ${status.latestArchiveRoot}`);
  console.log(`    Backend Provider:${status.backendProvider}`);
  console.log("==================================================");
}

main().catch(console.error);
