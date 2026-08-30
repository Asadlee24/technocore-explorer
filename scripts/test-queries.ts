import * as dotenv from "dotenv";
import { resolve } from "path";
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

import { supabaseAdmin } from "../src/lib/continuum/db";

async function testQuery(name: string, fn: () => Promise<any>) {
  try {
    const res = await fn();
    console.log(`[${name}] Count: ${res.data?.length ?? res.count ?? 0}, Error: ${res.error?.message || "none"}`);
    if (res.data && res.data.length > 0) {
      console.log(`   Sample: seq #${res.data[0].seq} in /r/${res.data[0].room_name} by ${res.data[0].from_identity?.slice(0, 20)}... "${res.data[0].raw_text?.slice(0, 40)}"`);
    }
  } catch (err) {
    console.error(`[${name}] Exception:`, err);
  }
}

async function main() {
  console.log("=== TESTING POSTGREST QUERY VARIATIONS ===");

  // 1. Default list (limit 50, order observed_ts DESC)
  await testQuery("Default List", () =>
    supabaseAdmin.from("continuum_messages").select("*", { count: "exact" }).order("observed_ts", { ascending: false }).limit(50)
  );

  // 2. Room filter = 'lobby'
  await testQuery("Room = lobby", () =>
    supabaseAdmin.from("continuum_messages").select("*", { count: "exact" }).eq("room_name", "lobby").order("observed_ts", { ascending: false }).limit(50)
  );

  // 3. Numeric search '10757851'
  const qNum = "10757851";
  await testQuery("Numeric search '10757851'", () =>
    supabaseAdmin.from("continuum_messages").select("*", { count: "exact" }).or(`seq.eq.${qNum},raw_text.ilike.%${qNum}%,from_identity.ilike.%${qNum}%,room_name.ilike.%${qNum}%`).order("observed_ts", { ascending: false }).limit(50)
  );

  // 4. Text search 'Asad' or 'AsadLee'
  const qAsad = "Asad";
  await testQuery("Text search 'Asad'", () =>
    supabaseAdmin.from("continuum_messages").select("*", { count: "exact" }).or(`raw_text.ilike.%${qAsad}%,from_identity.ilike.%${qAsad}%,room_name.ilike.%${qAsad}%`).order("observed_ts", { ascending: false }).limit(50)
  );

  // 5. Search 'lobby'
  const qLobby = "lobby";
  await testQuery("Search 'lobby'", () =>
    supabaseAdmin.from("continuum_messages").select("*", { count: "exact" }).or(`raw_text.ilike.%${qLobby}%,from_identity.ilike.%${qLobby}%,room_name.ilike.%${qLobby}%`).order("observed_ts", { ascending: false }).limit(50)
  );

  // 6. DID search 'did:key:z6Mk'
  const qDid = "z6MktSKV";
  await testQuery("DID search 'z6MktSKV'", () =>
    supabaseAdmin.from("continuum_messages").select("*", { count: "exact" }).or(`from_identity.ilike.%${qDid}%,raw_text.ilike.%${qDid}%`).order("observed_ts", { ascending: false }).limit(50)
  );

  // 7. Signed-only filter
  await testQuery("Signed only filter", () =>
    supabaseAdmin.from("continuum_messages").select("*", { count: "exact" }).ilike("from_identity", "did:key:%").order("observed_ts", { ascending: false }).limit(50)
  );

  // 8. Specific Sequence 10801006
  await testQuery("Seq 10801006", () =>
    supabaseAdmin.from("continuum_messages").select("*", { count: "exact" }).eq("seq", 10801006)
  );
}

main().catch(console.error);
