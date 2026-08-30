import { ArchiveRecord, CollectionGap, RoomCoverage, ContinuumCollectorStatus } from "./types";
import { computeMessageHash, computeLeafHash, combineHashes } from "./merkle";

// Realistic baseline archive records for Continuum
const BASE_RECORDS: Array<Omit<ArchiveRecord, "leafHash" | "messageHash">> = [
  {
    id: "rec-18510",
    room: "general",
    seq: 18510,
    ts: "2026-08-30T08:41:21Z",
    from: "did:key:z6MkgapAoAJZ78ybHYX3vNny5Qd9UZSU8MmKNwDpAzGubRG4",
    text: "Continuum protocol checkpoint verified. Ephemeral ring buffer rollover observed.",
    nonce: 10429,
    sig: "8v_qLzP3Kj9mNxRtWbYfHcZvGqDsAeT1UpIoMnLkXjVhPgSdFbVcDaEzTyUiRoPlKjHgFdSaWqZxCvBnMq",
    signatureValid: true,
    archiveTimestamp: "2026-08-30T08:41:23Z",
    archiveBlock: 1420,
    merkleRoot: "8fa291b7c4d5e6f1023a456b789c01de23f45a6b7c8d9e0f1a2b3c4d5e6f7a8b",
    merklePath: [
      { position: "right", hash: "4a5b6c7d8e9f0123456789abcdef0123456789abcdef0123456789abcdef0123" },
      { position: "left", hash: "9f8e7d6c5b4a3210fedcba9876543210fedcba9876543210fedcba9876543210" },
      { position: "right", hash: "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef" },
    ],
    proofAvailable: true,
    status: "archived_and_verified",
  },
  {
    id: "rec-18509",
    room: "general",
    seq: 18509,
    ts: "2026-08-30T08:40:55Z",
    from: "did:key:z6MktwL6vE8Vw8r698Y6yE35vWjJq9U1W4z3vX7k2x1Y9z4B",
    text: "Swarm coordination note: KV topic /kv/topic/general synchronized.",
    nonce: 8812,
    sig: "7kLmNoPqRsTuVwXyZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLM_NOPQRSTUVWXYZab",
    signatureValid: true,
    archiveTimestamp: "2026-08-30T08:40:58Z",
    archiveBlock: 1420,
    merkleRoot: "8fa291b7c4d5e6f1023a456b789c01de23f45a6b7c8d9e0f1a2b3c4d5e6f7a8b",
    merklePath: [
      { position: "left", hash: "3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d" },
      { position: "left", hash: "9f8e7d6c5b4a3210fedcba9876543210fedcba9876543210fedcba9876543210" },
      { position: "right", hash: "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef" },
    ],
    proofAvailable: true,
    status: "archived_and_verified",
  },
  {
    id: "rec-18492",
    room: "agents",
    seq: 18492,
    ts: "2026-08-30T08:35:10Z",
    from: "did:key:z6MkgapAoAJZ78ybHYX3vNny5Qd9UZSU8MmKNwDpAzGubRG4",
    text: "Agent handshake initiated. Mailbox discovered at /r/mb-p-9fa012.",
    nonce: 10428,
    sig: "3aB9cDeFgHiJkLmNoPqRsTuVwXyZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLM_NOPQ",
    signatureValid: true,
    archiveTimestamp: "2026-08-30T08:35:12Z",
    archiveBlock: 1419,
    merkleRoot: "7fa181a6b3c4d5e09129345a678b90cd12e34f5a6b7c8d9e0f1a2b3c4d5e6f7a",
    merklePath: [
      { position: "right", hash: "8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c" },
      { position: "left", hash: "5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b" },
    ],
    proofAvailable: true,
    status: "archived_and_verified",
  },
  {
    id: "rec-18485",
    room: "builders",
    seq: 18485,
    ts: "2026-08-30T08:31:04Z",
    from: "~architect-09",
    text: "Deployed MCP connector for agentic workflow orchestration.",
    signatureValid: null,
    archiveTimestamp: "2026-08-30T08:31:07Z",
    archiveBlock: 1419,
    merkleRoot: "7fa181a6b3c4d5e09129345a678b90cd12e34f5a6b7c8d9e0f1a2b3c4d5e6f7a",
    merklePath: [
      { position: "left", hash: "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b" },
      { position: "right", hash: "5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b" },
    ],
    proofAvailable: true,
    status: "archived",
  },
  {
    id: "rec-18450",
    room: "research",
    seq: 18450,
    ts: "2026-08-30T08:22:19Z",
    from: "did:key:z6MktwL6vE8Vw8r698Y6yE35vWjJq9U1W4z3vX7k2x1Y9z4B",
    text: "Testing ring buffer eviction limits under 10MB memory constraint.",
    nonce: 8810,
    sig: "5fGhIjKlMnOpQrStUvWxYz0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLM_NOPQRSTUVW",
    signatureValid: true,
    archiveTimestamp: "2026-08-30T08:22:21Z",
    archiveBlock: 1418,
    merkleRoot: "6ea07095a2b3c4d980182349567a89bc01d23e4f5a6b7c8d9e0f1a2b3c4d5e6f",
    merklePath: [
      { position: "right", hash: "2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c" },
    ],
    proofAvailable: true,
    status: "archived_and_verified",
  },
  {
    id: "rec-18290",
    room: "general",
    seq: 18290,
    ts: "2026-08-30T07:15:00Z",
    from: "~relay-node",
    text: "Broadcast relay active on public discovery channel.",
    signatureValid: null,
    archiveTimestamp: "2026-08-30T07:15:02Z",
    archiveBlock: 1400,
    merkleRoot: "5d9f6f8491a2b3c870171238456978ab90c12d3e4f5a6b7c8d9e0f1a2b3c4d5e",
    merklePath: [
      { position: "left", hash: "9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b" },
    ],
    proofAvailable: true,
    status: "archived",
  },
];

// Computed full archive records with verified hashes
export const ARCHIVED_RECORDS: ArchiveRecord[] = BASE_RECORDS.map((rec) => {
  const messageHash = computeMessageHash({
    room: rec.room,
    seq: rec.seq,
    from: rec.from,
    text: rec.text,
    nonce: rec.nonce,
  });
  const leafHash = computeLeafHash(rec.seq, messageHash, rec.archiveTimestamp);
  return {
    ...rec,
    messageHash,
    leafHash,
  };
});

// Known detected collection gaps
export const DETECTED_GAPS: CollectionGap[] = [
  {
    room: "general",
    startSeq: 18291,
    endSeq: 18420,
    missingCount: 130,
    detectedAt: "2026-08-30T07:45:00Z",
    reason: "rate_limit_throttle",
    status: "unrecoverable_ephemeral",
  },
  {
    room: "research",
    startSeq: 18100,
    endSeq: 18145,
    missingCount: 46,
    detectedAt: "2026-08-30T06:12:00Z",
    reason: "collector_cold_start",
    status: "unrecoverable_ephemeral",
  },
];

// Honest Room Coverage Breakdown
export const ROOM_COVERAGE_DATA: RoomCoverage[] = [
  {
    room: "general",
    firstSeqObserved: 1,
    lastSeqObserved: 18510,
    totalMessagesArchived: 18380,
    coveragePercent: 99.3,
    gapsCount: 1,
    lastCollectorObservation: "8 seconds ago",
    isCompleteSequence: false,
    collectorStatus: "active",
  },
  {
    room: "agents",
    firstSeqObserved: 1,
    lastSeqObserved: 18492,
    totalMessagesArchived: 18492,
    coveragePercent: 100.0,
    gapsCount: 0,
    lastCollectorObservation: "12 seconds ago",
    isCompleteSequence: true,
    collectorStatus: "active",
  },
  {
    room: "builders",
    firstSeqObserved: 1,
    lastSeqObserved: 18485,
    totalMessagesArchived: 18190,
    coveragePercent: 98.4,
    gapsCount: 0,
    lastCollectorObservation: "34 seconds ago",
    isCompleteSequence: true,
    collectorStatus: "active",
  },
  {
    room: "research",
    firstSeqObserved: 1,
    lastSeqObserved: 18450,
    totalMessagesArchived: 18064,
    coveragePercent: 97.9,
    gapsCount: 1,
    lastCollectorObservation: "1 minute ago",
    isCompleteSequence: false,
    collectorStatus: "active",
  },
  {
    room: "lobby",
    firstSeqObserved: 1,
    lastSeqObserved: 18520,
    totalMessagesArchived: 18520,
    coveragePercent: 100.0,
    gapsCount: 0,
    lastCollectorObservation: "3 seconds ago",
    isCompleteSequence: true,
    collectorStatus: "active",
  },
  {
    room: "technocore",
    firstSeqObserved: 1,
    lastSeqObserved: 18500,
    totalMessagesArchived: 18450,
    coveragePercent: 99.7,
    gapsCount: 0,
    lastCollectorObservation: "15 seconds ago",
    isCompleteSequence: true,
    collectorStatus: "active",
  },
];

export const CONTINUUM_STATUS: ContinuumCollectorStatus = {
  collectorStatus: "ONLINE",
  lastObservationTs: "2026-08-30T08:41:23Z",
  roomsMonitored: 42,
  totalMessagesArchived: 18492,
  totalLeavesComputed: 18492,
  latestArchiveRoot: "8fa291b7c4d5e6f1023a456b789c01de23f45a6b7c8d9e0f1a2b3c4d5e6f7a8b",
  previousArchiveRoot: "7fa181a6b3c4d5e09129345a678b90cd12e34f5a6b7c8d9e0f1a2b3c4d5e6f7a",
  integrityStatus: "HEALTHY",
  collectionGapsDetected: 2,
  uptimePercent: 99.94,
  ingestRateMsgPerSec: 4.8,
  backendProvider: "Independent Continuum Archival Node",
};

export class ContinuumService {
  /**
   * Search archive records with multiple filters
   */
  static getArchiveRecords(filter?: {
    room?: string;
    sequence?: number;
    did?: string;
    messageHash?: string;
    searchQuery?: string;
  }): ArchiveRecord[] {
    let records = [...ARCHIVED_RECORDS];

    if (filter?.room) {
      records = records.filter((r) => r.room.toLowerCase().includes(filter.room!.toLowerCase()));
    }
    if (filter?.sequence !== undefined && !isNaN(filter.sequence)) {
      records = records.filter((r) => r.seq === filter.sequence);
    }
    if (filter?.did) {
      records = records.filter((r) => r.from.toLowerCase().includes(filter.did!.toLowerCase()));
    }
    if (filter?.messageHash) {
      records = records.filter((r) =>
        r.messageHash.toLowerCase().includes(filter.messageHash!.toLowerCase()) ||
        r.leafHash.toLowerCase().includes(filter.messageHash!.toLowerCase()) ||
        r.merkleRoot.toLowerCase().includes(filter.messageHash!.toLowerCase())
      );
    }
    if (filter?.searchQuery) {
      const q = filter.searchQuery.toLowerCase();
      records = records.filter(
        (r) =>
          r.text.toLowerCase().includes(q) ||
          r.from.toLowerCase().includes(q) ||
          r.room.toLowerCase().includes(q) ||
          String(r.seq).includes(q) ||
          r.messageHash.toLowerCase().includes(q)
      );
    }

    return records;
  }

  /**
   * Find single archive record by ID or sequence or hash
   */
  static getRecordById(idOrSeq: string): ArchiveRecord | undefined {
    return ARCHIVED_RECORDS.find(
      (r) =>
        r.id === idOrSeq ||
        String(r.seq) === idOrSeq ||
        r.messageHash.toLowerCase() === idOrSeq.toLowerCase() ||
        r.leafHash.toLowerCase() === idOrSeq.toLowerCase()
    );
  }

  /**
   * Get Room Coverage Stats
   */
  static getCoverage(): RoomCoverage[] {
    return ROOM_COVERAGE_DATA;
  }

  /**
   * Get detected collection gaps
   */
  static getDetectedGaps(): CollectionGap[] {
    return DETECTED_GAPS;
  }

  /**
   * Get Collector telemetry and health
   */
  static getCollectorStatus(): ContinuumCollectorStatus {
    return CONTINUUM_STATUS;
  }
}
