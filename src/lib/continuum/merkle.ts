import { sha256 } from "@noble/hashes/sha256";
import { bytesToHex } from "@noble/hashes/utils";
import { ArchiveRecord, MerkleVerificationResult } from "./types";
import { canonicalizeSingleLine } from "../protocol/parser";

/**
 * Compute SHA-256 hex hash of an arbitrary UTF-8 string
 */
export function computeSha256Hex(input: string): string {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(input);
  const hashBytes = sha256(bytes);
  return bytesToHex(hashBytes);
}

/**
 * Compute canonical message hash for Continuum record
 * Covers: `${room}|${seq}|${from}|${canonicalText}|${nonce || ""}`
 */
export function computeMessageHash(record: {
  room: string;
  seq: number;
  from: string;
  text: string;
  nonce?: number | string;
}): string {
  const canonicalText = canonicalizeSingleLine(record.text);
  const payload = `${record.room}|${record.seq}|${record.from}|${canonicalText}|${record.nonce ?? ""}`;
  return computeSha256Hex(payload);
}

/**
 * Compute leaf hash from message hash + archive timestamp + sequence
 */
export function computeLeafHash(seq: number, messageHash: string, archiveTimestamp: string): string {
  const payload = `LEAF:${seq}:${messageHash}:${archiveTimestamp}`;
  return computeSha256Hex(payload);
}

/**
 * Combine two SHA-256 node hashes in Merkle tree
 */
export function combineHashes(left: string, right: string): string {
  return computeSha256Hex(`NODE:${left}:${right}`);
}

/**
 * Verify a Merkle inclusion proof step-by-step
 */
export function verifyMerkleProof(params: {
  messageText: string;
  room: string;
  seq: number;
  from: string;
  nonce?: number | string;
  archiveTimestamp: string;
  expectedMessageHash: string;
  expectedLeafHash: string;
  merklePath: Array<{ position: "left" | "right"; hash: string }>;
  expectedRoot: string;
}): MerkleVerificationResult {
  const stepDetails: MerkleVerificationResult["stepDetails"] = [];

  // Step 1: Verify Message Hash
  const computedMsgHash = computeMessageHash({
    room: params.room,
    seq: params.seq,
    from: params.from,
    text: params.messageText,
    nonce: params.nonce,
  });

  const messageHashMatches = computedMsgHash.toLowerCase() === params.expectedMessageHash.toLowerCase();
  stepDetails.push({
    step: 1,
    description: "Recompute and verify message payload SHA-256 hash",
    status: messageHashMatches ? "pass" : "fail",
    input: `Canonical: ${params.room}|${params.seq}|${params.from}|${canonicalizeSingleLine(params.messageText)}`,
    output: computedMsgHash,
  });

  // Step 2: Compute Leaf Hash
  const computedLeaf = computeLeafHash(params.seq, computedMsgHash, params.archiveTimestamp);
  const leafHashMatches = computedLeaf.toLowerCase() === params.expectedLeafHash.toLowerCase();
  stepDetails.push({
    step: 2,
    description: "Compute Merkle leaf hash from sequence, message hash, and timestamp",
    status: leafHashMatches ? "pass" : "fail",
    input: `LEAF:${params.seq}:${computedMsgHash}:${params.archiveTimestamp}`,
    output: computedLeaf,
  });

  // Step 3: Traverse Merkle Path to calculate root
  let currentHash = computedLeaf;
  for (let i = 0; i < params.merklePath.length; i++) {
    const sibling = params.merklePath[i];
    if (sibling.position === "left") {
      currentHash = combineHashes(sibling.hash, currentHash);
    } else {
      currentHash = combineHashes(currentHash, sibling.hash);
    }

    stepDetails.push({
      step: 3 + i,
      description: `Hash combination with Merkle sibling #${i + 1} (${sibling.position})`,
      status: "pass",
      input: sibling.position === "left" ? `NODE:${sibling.hash}:${currentHash}` : `NODE:${currentHash}:${sibling.hash}`,
      output: currentHash,
    });
  }

  // Final Step: Compare with expected Merkle root
  const rootMatches = currentHash.toLowerCase() === params.expectedRoot.toLowerCase();
  stepDetails.push({
    step: 3 + params.merklePath.length,
    description: "Compare computed Merkle root with published archive block root",
    status: rootMatches ? "pass" : "fail",
    input: `Computed: ${currentHash}`,
    output: `Target Root: ${params.expectedRoot}`,
  });

  const verified = messageHashMatches && leafHashMatches && rootMatches;

  return {
    verified,
    messageHashMatches,
    computedLeafHash: computedLeaf,
    expectedLeafHash: params.expectedLeafHash,
    leafHashMatches,
    computedRoot: currentHash,
    expectedRoot: params.expectedRoot,
    rootMatches,
    pathLength: params.merklePath.length,
    stepDetails,
  };
}
