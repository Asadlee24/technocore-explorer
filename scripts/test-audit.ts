import * as dotenv from "dotenv";
import { resolve } from "path";
dotenv.config({ path: resolve(process.cwd(), ".env.local") });
dotenv.config({ path: resolve(process.cwd(), ".env") });

import { ContinuumDatabase, supabaseAdmin, supabasePublic } from "../src/lib/continuum/db";

async function main() {
  console.log("=== CHECKING DB AND 10801006 ===");
  console.log("SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL);
  console.log("ANON_KEY exists:", !!(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY));
  console.log("SERVICE_KEY exists:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);

  // 1. Search 10801006 with Admin
  const { data: adminSeq, error: adminSeqErr } = await supabaseAdmin
    .from("continuum_messages")
    .select("*")
    .eq("seq", 10801006);
  console.log("\n[Admin] Search seq 10801006:", adminSeq, adminSeqErr);

  // 2. Search 10801006 with Public
  const { data: pubSeq, error: pubSeqErr } = await supabasePublic
    .from("continuum_messages")
    .select("*")
    .eq("seq", 10801006);
  console.log("\n[Public] Search seq 10801006:", pubSeq, pubSeqErr);

  // 3. Search raw_text or from_identity for AsadLee
  const { data: asadMsgs, error: asadErr } = await supabaseAdmin
    .from("continuum_messages")
    .select("seq, room_name, from_identity, raw_text, observed_ts")
    .or("raw_text.ilike.%Asad%,from_identity.ilike.%Asad%");
  console.log("\n[Admin] Search for 'Asad':", asadMsgs, asadErr);

  // 4. Check highest sequence numbers in continuum_messages
  const { data: maxSeqMsgs, error: maxSeqErr } = await supabaseAdmin
    .from("continuum_messages")
    .select("seq, room_name, from_identity, raw_text, observed_ts")
    .order("seq", { ascending: false })
    .limit(5);
  console.log("\n[Admin] Top 5 highest sequence messages:", maxSeqMsgs, maxSeqErr);

  // 5. Test ContinuumDatabase.getMessages() with default (no filters)
  console.log("\nTesting ContinuumDatabase.getMessages()...");
  const msgs = await ContinuumDatabase.getMessages();
  console.log("getMessages() returned count:", msgs.length);
  if (msgs.length > 0) {
    console.log("First message:", msgs[0]);
  }

  // 6. Test ContinuumDatabase.getMessages({ sequence: 10801006 })
  const seqMsgs = await ContinuumDatabase.getMessages({ sequence: 10801006 });
  console.log("\ngetMessages({ sequence: 10801006 }) count:", seqMsgs.length);

  // 7. Test ContinuumDatabase.getMessages({ searchQuery: 'lobby' })
  const lobbyMsgs = await ContinuumDatabase.getMessages({ searchQuery: "lobby" });
  console.log("getMessages({ searchQuery: 'lobby' }) count:", lobbyMsgs.length);

  // 8. Test ContinuumDatabase.getMessages({ searchQuery: '10801006' })
  const qSeqMsgs = await ContinuumDatabase.getMessages({ searchQuery: "10801006" });
  console.log("getMessages({ searchQuery: '10801006' }) count:", qSeqMsgs.length);
}

main().catch(console.error);
