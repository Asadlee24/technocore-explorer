import * as dotenv from "dotenv";
import { resolve } from "path";
dotenv.config({ path: resolve(process.cwd(), ".env") });
dotenv.config({ path: resolve(process.cwd(), ".env.local"), override: true });

import { ContinuumDatabase, supabaseAdmin } from "../src/lib/continuum/db";

async function main() {
  const ping = await ContinuumDatabase.ping();
  const rooms = await ContinuumDatabase.getRooms();
  
  const { count: msgCount } = await supabaseAdmin
    .from("continuum_messages")
    .select("*", { count: "exact", head: true });

  const { count: blockCount } = await supabaseAdmin
    .from("continuum_merkle_blocks")
    .select("*", { count: "exact", head: true });

  const { data: latestBlock } = await supabaseAdmin
    .from("continuum_merkle_blocks")
    .select("merkle_root, leaves_count, published_at")
    .order("block_id", { ascending: false })
    .limit(1);

  const { count: gapCount } = await supabaseAdmin
    .from("continuum_collection_gaps")
    .select("*", { count: "exact", head: true });

  const { count: telCount } = await supabaseAdmin
    .from("continuum_collector_telemetry")
    .select("*", { count: "exact", head: true });

  console.log("=== SUPABASE AUDIT RESULTS ===");
  console.log("Supabase Ping Status:", ping.ok ? "ONLINE" : "FAILED", "-", ping.message);
  console.log("Rooms Discovered & Registered:", rooms.length);
  console.log("Real Messages Ingested & Stored:", msgCount ?? 0);
  console.log("Merkle Epoch Blocks Sealed:", blockCount ?? 0);
  if (latestBlock && latestBlock.length > 0) {
    console.log("Latest Merkle Root:", latestBlock[0].merkle_root);
    console.log("Leaves in Root:", latestBlock[0].leaves_count);
  }
  console.log("Collection Gaps Recorded:", gapCount ?? 0);
  console.log("Telemetry Logs Saved:", telCount ?? 0);
}

main().catch(console.error);
