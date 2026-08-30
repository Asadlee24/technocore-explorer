import * as dotenv from "dotenv";
import { resolve } from "path";
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

import { supabasePublic, supabaseAdmin } from "../src/lib/continuum/db";

async function main() {
  console.log("Testing Admin Client...");
  const { count: adminMsgs, error: adminErr } = await supabaseAdmin
    .from("continuum_messages")
    .select("*", { count: "exact", head: true });
  console.log("Admin Client Result:", { count: adminMsgs, error: adminErr?.message || null });

  console.log("Testing Public Anon Client...");
  const { count: publicMsgs, error: publicErr } = await supabasePublic
    .from("continuum_messages")
    .select("*", { count: "exact", head: true });
  console.log("Public Anon Client Result:", { count: publicMsgs, error: publicErr?.message || null });
}

main().catch(console.error);
