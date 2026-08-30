/**
 * Technocore Continuum Type Definitions
 * Independent Historical Archival & Cryptographic Verification Layer
 */

export interface ArchiveRecord {
  id: string; // Unique archive ID or leaf identifier
  room: string;
  seq: number;
  ts: string; // Original observation timestamp
  from: string; // did:key or ~nick
  text: string;
  nonce?: number | string;
  sig?: string; // Ed25519 signature if signed
  signatureValid: boolean | null; // null if unsigned, boolean if verified
  
  // Archival & Merkle Metadata
  messageHash: string; // SHA-256(canonicalPayload)
  leafHash: string; // SHA-256(seq || messageHash || archiveTs)
  archiveTimestamp: string; // When Continuum collector indexed this record
  archiveBlock: number; // Continuum epoch/batch index
  merkleRoot: string; // Merkle root for the block
  merklePath: Array<{
    position: "left" | "right";
    hash: string;
  }>;
  proofAvailable: boolean;
  status: "archived_and_verified" | "archived" | "indexing";
}

export interface CollectionGap {
  room: string;
  startSeq: number;
  endSeq: number;
  missingCount: number;
  detectedAt: string;
  reason: "network_timeout" | "collector_cold_start" | "rate_limit_throttle" | "unmonitored_window";
  status: "unrecoverable_ephemeral" | "under_reconciliation" | "investigating";
}

export interface RoomCoverage {
  room: string;
  firstSeqObserved: number;
  lastSeqObserved: number;
  totalMessagesArchived: number;
  coveragePercent: number;
  gapsCount: number;
  lastCollectorObservation: string;
  isCompleteSequence: boolean;
  collectorStatus: "active" | "standby" | "awaiting_collector";
}

export interface ContinuumCollectorStatus {
  collectorStatus: "ONLINE" | "STANDBY" | "RECONNECTING" | "OFFLINE";
  lastObservationTs: string;
  roomsMonitored: number;
  totalMessagesArchived: number;
  totalLeavesComputed: number;
  latestArchiveRoot: string;
  previousArchiveRoot: string;
  integrityStatus: "HEALTHY" | "RECONCILING" | "DEGRADED";
  collectionGapsDetected: number;
  uptimePercent: number;
  ingestRateMsgPerSec: number;
  backendProvider: string;
}

export interface MerkleVerificationResult {
  verified: boolean;
  messageHashMatches: boolean;
  computedLeafHash: string;
  expectedLeafHash: string;
  leafHashMatches: boolean;
  computedRoot: string;
  expectedRoot: string;
  rootMatches: boolean;
  pathLength: number;
  stepDetails: Array<{
    step: number;
    description: string;
    status: "pass" | "fail";
    input?: string;
    output?: string;
  }>;
}
