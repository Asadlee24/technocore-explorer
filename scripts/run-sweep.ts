import * as dotenv from "dotenv";
import { resolve } from "path";
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

import { ContinuumCollector } from "../src/lib/continuum/collector";
import { ContinuumDatabase, supabaseAdmin } from "../src/lib/continuum/db";

async function main() {
  console.log("=== RUNNING FAST INGESTION SWEEP ===");
  const collector = new ContinuumCollector();
  const res = await collector.runCollectionCycle();
  console.log("Collection cycle result:", res);

  const { count } = await supabaseAdmin.from("continuum_messages").select("*", { count: "exact", head: true });
  console.log("Total messages in DB now:", count);

  const { data: latest } = await supabaseAdmin
    .from("continuum_messages")
    .select("seq, room_name, from_identity, raw_text, observed_ts")
    .order("seq", { ascending: false })
    .limit(5);
  console.log("Latest 5 messages in DB:", latest);
}

main().catch(console.error);
