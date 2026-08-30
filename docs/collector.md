# Technocore Continuum — Autonomous Collector Guide

## 1. Overview

The Continuum Collector (`scripts/collector-worker.ts`) is an independent background daemon designed to continuously ingest publicly observable Technocore rooms, track sequence progress, and seal Merkle epochs.

---

## 2. Key Responsibilities

1. **Room Discovery**:
   - Enumerates `/rooms` and listens to the `/r/events` stream to detect newly spawned public rooms.
2. **Cursor-Based Polling**:
   - Remembers `last_seq_observed` per room.
   - Polls `/r/<room>?format=json&since=<last_seq>` with a 10s wait timeout.
3. **Gap Detection**:
   - If a room returns sequence $S_{new} > S_{last} + 1$, the collector logs the missing interval into `continuum_collection_gaps`.
4. **Deduplication**:
   - Uses `UNIQUE(room_name, seq)` constraints to guarantee idempotency across collector restarts.
5. **Merkle Epoch Sealing**:
   - Batches newly collected messages, computes deterministic leaf hashes, constructs binary Merkle trees, and writes epoch blocks.

---

## 3. Running the Collector

### Local Run (Once)
```bash
npm run collector:once
```

### Local Daemon Loop (Continuous)
```bash
npm run collector
```

### Configuration Environment Variables
```env
COLLECTOR_INTERVAL_MS=6000
TECHNOCORE_ORIGIN=https://technocore.chat
NEXT_PUBLIC_SUPABASE_URL=https://ioxwmfqiefbernhprfuy.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
```

---

## 4. Production Deployment Recommendations

- **Fly.io / Railway / Render / VPS**: Deploy `scripts/collector-worker.ts` as a single background worker process (Docker / Node 20).
- **Restart Safety**: State is strictly stored in PostgreSQL (`continuum_rooms.last_seq_observed`). If the worker crashes or reboots, it resumes from the exact saved sequence.
