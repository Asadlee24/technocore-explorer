import * as dotenv from "dotenv";
import { resolve } from "path";
dotenv.config({ path: resolve(process.cwd(), ".env.local") });
dotenv.config({ path: resolve(process.cwd(), ".env") });

import { technocoreClient } from "../src/lib/protocol/client";
import { ContinuumCollector } from "../src/lib/continuum/collector";
import { ContinuumDatabase, supabaseAdmin } from "../src/lib/continuum/db";

async function main() {
  console.log("Fetching lobby messages from technocore.chat...");
  const res = await technocoreClient.getRoomMessages("lobby", { limit: 100 });
  console.log("Lobby messages count:", res.count, "first:", res.first_seq, "last:", res.last_seq);
  const found = res.messages.find(m => m.seq === 10801006);
  console.log("Is 10801006 in recent lobby messages?", !!found, found);

  // If not found in last 100, let's query with since or search
  if (!found) {
    console.log("Checking if 10801006 is reachable via since=10801000...");
    const resSince = await technocoreClient.getRoomMessages("lobby", { since: 10801000, limit: 50 });
    console.log("Since 10801000:", resSince.count, resSince.messages);
  }

  // Let's run a collector cycle to ingest newest messages from protocol into Supabase!
  console.log("Running collector collection cycle...");
  const collector = new ContinuumCollector();
  const collRes = await collector.runCollectionCycle();
  console.log("Collector result:", collRes);

  // Now check if 10801006 is in database
  const { data: dbCheck } = await supabaseAdmin.from("continuum_messages").select("*").eq("seq", 10801006);
  console.log("DB check for 10801006 after collection:", dbCheck);
}

main().catch(console.error);
