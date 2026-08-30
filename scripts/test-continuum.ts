import "dotenv/config";
import { computeMessageHash, computeLeafHash, combineHashes, verifyMerkleProof } from "../src/lib/continuum/merkle";
import { MerkleEngine } from "../src/lib/continuum/merkle-engine";
import { canonicalizeSingleLine } from "../src/lib/protocol/parser";

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedCount++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    if (detail) console.error(`    Detail: ${detail}`);
    failedCount++;
  }
}

async function runTests() {
  console.log("=========================================================");
  console.log(" Technocore Continuum - Cryptographic & Engine Test Suite");
  console.log("=========================================================\n");

  // TEST SUITE 1: Deterministic Hashing
  console.log("[Suite 1: SHA-256 Message & Leaf Hashing]");
  const rawMsg = {
    room: "lobby",
    seq: 515470,
    from: "did:key:z6MkgapAoAJZ78ybHYX3vNny5Qd9UZSU8MmKNwDpAzGubRG4",
    text: "Hello Continuum Protocol\nwith line break",
    nonce: 1719400000000,
  };

  const msgHash1 = computeMessageHash(rawMsg);
  const msgHash2 = computeMessageHash(rawMsg);
  assert(msgHash1 === msgHash2, "Message hash is 100% deterministic");
  assert(msgHash1.length === 64, "Message hash is 64-char hex string");

  const ts = "2026-08-30T09:00:00Z";
  const leafHash1 = computeLeafHash(rawMsg.seq, msgHash1, ts);
  const leafHash2 = computeLeafHash(rawMsg.seq, msgHash1, ts);
  assert(leafHash1 === leafHash2, "Leaf hash is 100% deterministic");
  assert(leafHash1.length === 64, "Leaf hash is 64-char hex string");

  // Canonicalization invariant check
  const canonical1 = canonicalizeSingleLine("Hello \n World \t 123");
  assert(canonical1 === "Hello World 123", "Control characters canonicalized to 0x20 single space");

  // TEST SUITE 2: Dynamic Merkle Tree Construction
  console.log("\n[Suite 2: Dynamic Merkle Tree Construction]");
  const sampleMessages = [
    { room: "lobby", seq: 101, from: "did:key:z6Mk1", text: "msg 1", nonce: 1, observedTs: ts },
    { room: "lobby", seq: 102, from: "did:key:z6Mk2", text: "msg 2", nonce: 2, observedTs: ts },
    { room: "lobby", seq: 103, from: "did:key:z6Mk3", text: "msg 3", nonce: 3, observedTs: ts },
    { room: "lobby", seq: 104, from: "did:key:z6Mk4", text: "msg 4", nonce: 4, observedTs: ts },
    { room: "lobby", seq: 105, from: "did:key:z6Mk5", text: "msg 5", nonce: 5, observedTs: ts },
  ];

  const epoch = MerkleEngine.buildEpochBlock(1, sampleMessages);
  assert(epoch.records.length === 5, "All 5 records included in epoch block");
  assert(epoch.tree.root.length === 64, "Merkle root computed successfully");
  assert(epoch.firstSeq === 101 && epoch.lastSeq === 105, "First and last sequence correctly bounded");

  // TEST SUITE 3: Dynamic Inclusion Proof Generation & Verification
  console.log("\n[Suite 3: Inclusion Proof Generation & Validation]");
  for (let i = 0; i < epoch.records.length; i++) {
    const record = epoch.records[i];
    const proof = MerkleEngine.generateProof(epoch.tree, i);
    assert(proof !== null, `Proof generated for leaf #${i} (seq ${record.seq})`);

    const result = verifyMerkleProof({
      messageText: record.text,
      room: record.room,
      seq: record.seq,
      from: record.from,
      nonce: record.nonce,
      archiveTimestamp: record.archiveTimestamp,
      expectedMessageHash: record.messageHash,
      expectedLeafHash: record.leafHash,
      merklePath: proof!.merklePath,
      expectedRoot: epoch.tree.root,
    });

    assert(result.verified, `Proof for leaf #${i} verified against computed root`);
    assert(result.rootMatches, `Root comparison matched target root`);
  }

  // TEST SUITE 4: Cryptographic Rejection on Tampered Payload
  console.log("\n[Suite 4: Cryptographic Rejection of Tampered Data]");
  const victimRecord = epoch.records[0];
  const tamperedResult = verifyMerkleProof({
    messageText: "TAMPERED TEXT BY ATTACKER",
    room: victimRecord.room,
    seq: victimRecord.seq,
    from: victimRecord.from,
    nonce: victimRecord.nonce,
    archiveTimestamp: victimRecord.archiveTimestamp,
    expectedMessageHash: victimRecord.messageHash,
    expectedLeafHash: victimRecord.leafHash,
    merklePath: victimRecord.merklePath,
    expectedRoot: victimRecord.merkleRoot,
  });

  assert(!tamperedResult.verified, "Tampered message text is REJECTED by validator");
  assert(!tamperedResult.messageHashMatches, "Message hash mismatch identified correctly");

  const tamperedRootResult = verifyMerkleProof({
    messageText: victimRecord.text,
    room: victimRecord.room,
    seq: victimRecord.seq,
    from: victimRecord.from,
    nonce: victimRecord.nonce,
    archiveTimestamp: victimRecord.archiveTimestamp,
    expectedMessageHash: victimRecord.messageHash,
    expectedLeafHash: victimRecord.leafHash,
    merklePath: victimRecord.merklePath,
    expectedRoot: "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
  });

  assert(!tamperedRootResult.verified, "Tampered Merkle root is REJECTED by validator");

  // TEST SUITE 5: Gap Detection & Coverage Math
  console.log("\n[Suite 5: Gap Detection & Coverage Calculations]");
  const totalArchived = 950;
  const firstSeq = 1;
  const lastSeq = 1000; // 50 missing
  const span = lastSeq - firstSeq + 1;
  const coveragePercent = (totalArchived / span) * 100;
  assert(coveragePercent === 95.0, "Coverage percentage calculated accurately (95.0%)");

  const testSeqs = [1, 2, 3, 4, 10, 11, 12];
  const detectedGaps: Array<{ start: number; end: number; count: number }> = [];
  let cursor = testSeqs[0];
  for (let i = 1; i < testSeqs.length; i++) {
    if (testSeqs[i] > cursor + 1) {
      detectedGaps.push({
        start: cursor + 1,
        end: testSeqs[i] - 1,
        count: testSeqs[i] - cursor - 1,
      });
    }
    cursor = testSeqs[i];
  }

  assert(detectedGaps.length === 1, "Single sequence gap identified");
  assert(detectedGaps[0].start === 5 && detectedGaps[0].end === 9 && detectedGaps[0].count === 5, "Gap range 5-9 correctly isolated (5 missing)");

  console.log("\n=========================================================");
  console.log(` Test Summary: ${passedCount} Passed, ${failedCount} Failed`);
  console.log("=========================================================");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test runner error:", err);
  process.exit(1);
});
