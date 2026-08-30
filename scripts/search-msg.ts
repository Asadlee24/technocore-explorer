import * as dotenv from "dotenv";
import { resolve } from "path";
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

import { supabaseAdmin } from "../src/lib/continuum/db";

async function main() {
  const q = "10547171";
  console.log(`=== SEARCHING FOR "${q}" IN CONTINUUM ARCHIVE ===`);

  // 1. By exact sequence number
  const { data: bySeq } = await supabaseAdmin
    .from("continuum_messages")
    .select("room_name, seq, from_identity, raw_text, observed_ts, message_hash")
    .eq("seq", 10547171);

  console.log("\n[1] Match by Seq #10547171:", bySeq && bySeq.length > 0 ? bySeq : "No direct seq match");

  // 2. By text content search
  const { data: byText } = await supabaseAdmin
    .from("continuum_messages")
    .select("room_name, seq, from_identity, raw_text, observed_ts, message_hash")
    .ilike("raw_text", `%${q}%`);

  console.log("\n[2] Match by Text containing '10547171':", byText && byText.length > 0 ? byText : "No text match");

  // 3. By nonce search
  const { data: byNonce } = await supabaseAdmin
    .from("continuum_messages")
    .select("room_name, seq, from_identity, raw_text, observed_ts, message_hash")
    .eq("nonce", 10547171);

  console.log("\n[3] Match by Nonce 10547171:", byNonce && byNonce.length > 0 ? byNonce : "No nonce match");

  // 4. Latest 5 messages archived in /r/lobby
  const { data: lobbyMsgs } = await supabaseAdmin
    .from("continuum_messages")
    .select("room_name, seq, from_identity, raw_text, observed_ts")
    .eq("room_name", "lobby")
    .order("seq", { ascending: false })
    .limit(5);

  console.log("\n[4] Latest Ingested Messages in /r/lobby:");
  lobbyMsgs?.forEach((m) => {
    console.log(`    #${m.seq} [${m.from_identity.slice(0, 16)}...]: "${m.raw_text.slice(0, 60)}" (${m.observed_ts})`);
  });

  // 5. Total count
  const { count } = await supabaseAdmin
    .from("continuum_messages")
    .select("*", { count: "exact", head: true });
  console.log(`\nTotal messages currently in Supabase DB: ${count}`);
}

main().catch(console.error);
