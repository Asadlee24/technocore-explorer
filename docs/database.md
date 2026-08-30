# Technocore Continuum — Database & Supabase Schema Guide

## 1. Relational Database Schema

Continuum uses a PostgreSQL database (hosted on Supabase or self-hosted) to store rooms, messages, Merkle blocks, gaps, and telemetry.

---

## 2. Table Definitions

### `continuum_rooms`
- `room_name` (VARCHAR, PK) — Unique room identifier.
- `first_seq_observed` (BIGINT) — Earliest recorded sequence number.
- `last_seq_observed` (BIGINT) — Most recent sequence number recorded.
- `total_archived_count` (BIGINT) — Total messages stored for this room.
- `coverage_percent` (NUMERIC) — Calculated sequence coverage percentage.
- `is_complete_sequence` (BOOLEAN) — Whether any sequence gaps were detected.
- `last_observed_at` (TIMESTAMP) — Last observation timestamp.

### `continuum_messages`
- `id` (UUID, PK) — Unique archive message ID.
- `room_name` (VARCHAR, FK) — Associated room.
- `seq` (BIGINT) — Protocol sequence counter.
- `observed_ts` (TIMESTAMP) — Original protocol message timestamp.
- `from_identity` (VARCHAR) — Sender `did:key` or `~nick`.
- `raw_text` (TEXT) — Original message payload.
- `canonical_text` (TEXT) — Single-line canonicalized text.
- `nonce` (NUMERIC) — Signer nonce counter.
- `sig` (TEXT) — Base64URL signature.
- `signature_valid` (BOOLEAN) — Offline Ed25519 verification result.
- `message_hash` (CHAR 64) — Deterministic SHA-256 message hash.
- `leaf_hash` (CHAR 64) — Deterministic SHA-256 Merkle leaf hash.
- `archive_block_id` (BIGINT) — Associated epoch block.
- `archive_timestamp` (TIMESTAMP) — Archival sealing time.

### `continuum_merkle_blocks`
- `block_id` (BIGSERIAL, PK) — Sequential epoch block number.
- `merkle_root` (CHAR 64) — Published SHA-256 Merkle root.
- `prev_root` (CHAR 64) — Previous block root.
- `leaves_count` (INTEGER) — Number of leaves in this block.
- `first_seq` (BIGINT) — Lowest sequence number in block.
- `last_seq` (BIGINT) — Highest sequence number in block.
- `leaves_json` (JSONB) — Leaf hashes array for dynamic proof generation.
- `published_at` (TIMESTAMP) — Publication timestamp.

### `continuum_collection_gaps`
- `id` (BIGSERIAL, PK) — Gap record ID.
- `room_name` (VARCHAR, FK) — Room where gap was detected.
- `start_seq` (BIGINT) — Start of missing sequence range.
- `end_seq` (BIGINT) — End of missing sequence range.
- `missing_count` (BIGINT) — Total missing messages in gap.
- `gap_reason` (VARCHAR) — Reason (`rate_limit_throttle`, `collector_cold_start`).
- `status` (VARCHAR) — Status (`unrecoverable_ephemeral`).

---

## 3. Initializing Tables on Supabase

To initialize tables, run the SQL script in `src/lib/continuum/schema.sql` via the Supabase SQL Editor or migration tool.
