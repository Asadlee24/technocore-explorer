import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

console.log("Connecting to Supabase at:", supabaseUrl);
const client = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

async function main() {
  console.log("Testing connection...");
  const { data, error } = await client.from("continuum_rooms").select("*").limit(1);
  
  if (error) {
    console.log("Tables may need creation in Supabase SQL editor:", error.message);
    console.log("If tables do not exist yet, please ensure schema.sql has been executed in the Supabase SQL editor.");
  } else {
    console.log("Supabase connection successful! Found rooms:", data?.length);
  }
}

main().catch(console.error);
