import * as dotenv from "dotenv";
import { resolve } from "path";
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

import { supabaseAdmin } from "../src/lib/continuum/db";

async function main() {
  console.log("Checking sequence ranges in continuum_messages...");
  
  // Check min and max seq in lobby
  const { data: maxLobby } = await supabaseAdmin
    .from("continuum_messages")
    .select("seq, observed_ts, from_identity, raw_text")
    .eq("room_name", "lobby")
    .order("seq", { ascending: false })
    .limit(10);
  console.log("Latest lobby messages in DB:", maxLobby);

  const { data: minLobby } = await supabaseAdmin
    .from("continuum_messages")
    .select("seq, observed_ts, from_identity, raw_text")
    .eq("room_name", "lobby")
    .order("seq", { ascending: true })
    .limit(10);
  console.log("Oldest lobby messages in DB:", minLobby);

  // Check if any message in DB has seq >= 10757850
  const { data: highSeqs } = await supabaseAdmin
    .from("continuum_messages")
    .select("seq, room_name, from_identity, raw_text")
    .gte("seq", 10757850)
    .limit(10);
  console.log("Messages with seq >= 10757850:", highSeqs);
}

main().catch(console.error);
