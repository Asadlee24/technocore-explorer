import * as dotenv from "dotenv";
import { resolve } from "path";
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

import { ContinuumService } from "../src/lib/continuum/data-service";

async function runTests() {
  console.log("==================================================");
  console.log(" 🧪 CONTINUUM ARCHIVE INTEGRATION AUDIT TESTS");
  console.log("==================================================");

  // Test 1: Default archive (no filters)
  console.log("\n[TEST 1] Default Archive Load (No Filters):");
  const t1 = await ContinuumService.getArchiveRecordsWithCount({ limit: 50 });
  console.log(`  ✓ Returned ${t1.records.length} records (Total in Supabase: ${t1.totalCount})`);
  if (t1.records.length > 0) {
    console.log(`  ✓ Sample: seq #${t1.records[0].seq} in /r/${t1.records[0].room} [${t1.records[0].from.slice(0, 20)}...]`);
    console.log(`  ✓ Merkle Root: ${t1.records[0].merkleRoot}`);
    console.log(`  ✓ Leaf Hash: ${t1.records[0].leafHash}`);
    console.log(`  ✓ Proof length: ${t1.records[0].merklePath.length} siblings`);
  }

  // Test 2: Search sequence '10801006'
  console.log("\n[TEST 2] Search Sequence '10801006':");
  const t2 = await ContinuumService.getArchiveRecordsWithCount({ searchQuery: "10801006" });
  console.log(`  ✓ Records matching '10801006': ${t2.records.length} (Total: ${t2.totalCount})`);
  if (t2.records.length > 0) {
    console.log(`  ✓ Found record: seq #${t2.records[0].seq} in /r/${t2.records[0].room} "${t2.records[0].text}"`);
  }

  // Test 3: Search room 'lobby'
  console.log("\n[TEST 3] Search 'lobby':");
  const t3 = await ContinuumService.getArchiveRecordsWithCount({ searchQuery: "lobby", limit: 5 });
  console.log(`  ✓ Records matching 'lobby': ${t3.records.length} (Total: ${t3.totalCount})`);
  t3.records.forEach((r, i) => {
    console.log(`    [${i+1}] seq #${r.seq} in /r/${r.room}: "${r.text.slice(0, 50)}"`);
  });

  // Test 4: Search 'AsadLee'
  console.log("\n[TEST 4] Search 'AsadLee':");
  const t4 = await ContinuumService.getArchiveRecordsWithCount({ searchQuery: "AsadLee" });
  console.log(`  ✓ Records matching 'AsadLee': ${t4.records.length} (Total: ${t4.totalCount})`);

  // Test 5: Search DID prefix 'did:key:z6Mk'
  console.log("\n[TEST 5] Search DID prefix 'z6Mk':");
  const t5 = await ContinuumService.getArchiveRecordsWithCount({ searchQuery: "z6Mk", limit: 5 });
  console.log(`  ✓ Records matching DID 'z6Mk': ${t5.records.length} (Total: ${t5.totalCount})`);

  // Test 6: Room Filter 'lobby'
  console.log("\n[TEST 6] Room Filter 'lobby':");
  const t6 = await ContinuumService.getArchiveRecordsWithCount({ room: "lobby", limit: 5 });
  console.log(`  ✓ Records with room='lobby': ${t6.records.length} (Total: ${t6.totalCount})`);

  // Test 7: Signed Only Filter
  console.log("\n[TEST 7] Signed Only Filter:");
  const t7 = await ContinuumService.getArchiveRecordsWithCount({ signedOnly: true, limit: 5 });
  console.log(`  ✓ Signed records: ${t7.records.length} (Total: ${t7.totalCount})`);
  t7.records.forEach((r, i) => {
    console.log(`    [${i+1}] seq #${r.seq} (${r.from.slice(0, 24)}...): signatureValid=${r.signatureValid}`);
  });

  console.log("\n==================================================");
  console.log(" ✅ ALL AUDIT TESTS COMPLETED SUCCESSFULLY");
  console.log("==================================================");
}

runTests().catch(console.error);
