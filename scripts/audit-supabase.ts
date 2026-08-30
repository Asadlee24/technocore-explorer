import * as dotenv from "dotenv";
import { resolve } from "path";
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

import { supabaseAdmin, supabasePublic } from "../src/lib/continuum/db";

async function main() {
  console.log("=== SUPABASE AUDIT ===");

  // 1. Count messages
  const { count: totalMsgs, error: cErr } = await supabaseAdmin
    .from("continuum_messages")
    .select("*", { count: "exact", head: true });
  console.log("Total messages in continuum_messages (Admin):", totalMsgs, cErr);

  const { count: pubTotalMsgs, error: pubCErr } = await supabasePublic
    .from("continuum_messages")
    .select("*", { count: "exact", head: true });
  console.log("Total messages in continuum_messages (Public/Anon):", pubTotalMsgs, pubCErr);

  // 2. Fetch sample 5 records
  const { data: sample, error: sErr } = await supabasePublic
    .from("continuum_messages")
    .select("*")
    .limit(5);
  console.log("Sample records (Public):", sample?.length, sErr);
  if (sample && sample.length > 0) {
    console.log("Sample record fields:", Object.keys(sample[0]));
    console.log("First record:", sample[0]);
  }

  // 3. Check rooms table
  const { data: rooms, error: rErr } = await supabasePublic
    .from("continuum_rooms")
    .select("*")
    .order("last_seq_observed", { ascending: false })
    .limit(10);
  console.log("Rooms count:", rooms?.length, rErr);
  if (rooms) {
    rooms.forEach(r => console.log(`  Room: ${r.room_name} (seq: ${r.last_seq_observed}, total: ${r.total_archived_count})`));
  }
}

main().catch(console.error);
