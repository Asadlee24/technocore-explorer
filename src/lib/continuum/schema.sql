-- ==============================================================================
-- Technocore Continuum Archival Database Schema (PostgreSQL / Relational)
-- Independent Historical Collector & Cryptographic Merkle Indexer
-- Designed for Neon / Supabase / Self-hosted PostgreSQL
-- ==============================================================================

-- 1. Monitored Rooms & Coverage Registry
CREATE TABLE IF NOT EXISTS continuum_rooms (
    room_name VARCHAR(64) PRIMARY KEY,
    room_class VARCHAR(16) NOT NULL DEFAULT 'public', -- 'mb-', 'd-', 'e-', 'public'
    first_seq_observed BIGINT NOT NULL DEFAULT 1,
    last_seq_observed BIGINT NOT NULL DEFAULT 1,
    total_archived_count BIGINT NOT NULL DEFAULT 0,
    coverage_percent NUMERIC(5, 2) NOT NULL DEFAULT 100.00,
    is_complete_sequence BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    last_observed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 2. Archived Messages Store
CREATE TABLE IF NOT EXISTS continuum_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_name VARCHAR(64) NOT NULL REFERENCES continuum_rooms(room_name) ON DELETE CASCADE,
    seq BIGINT NOT NULL,
    observed_ts TIMESTAMP WITH TIME ZONE NOT NULL,
    from_identity VARCHAR(128) NOT NULL, -- did:key or ~nick
    raw_text TEXT NOT NULL,
    canonical_text TEXT NOT NULL,
    nonce NUMERIC(20, 0),
    sig TEXT,
    signature_valid BOOLEAN,
    
    -- Cryptographic Merkle Attributes
    message_hash CHAR(64) NOT NULL, -- SHA-256(room|seq|from|canonical_text|nonce)
    leaf_hash CHAR(64) NOT NULL, -- SHA-256(LEAF:seq:message_hash:archive_ts)
    archive_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    archive_block_id BIGINT NOT NULL,
    
    CONSTRAINT uq_room_seq UNIQUE(room_name, seq)
);

CREATE INDEX IF NOT EXISTS idx_continuum_msg_hash ON continuum_messages(message_hash);
CREATE INDEX IF NOT EXISTS idx_continuum_leaf_hash ON continuum_messages(leaf_hash);
CREATE INDEX IF NOT EXISTS idx_continuum_from ON continuum_messages(from_identity);
CREATE INDEX IF NOT EXISTS idx_continuum_room_seq ON continuum_messages(room_name, seq DESC);

-- 3. Merkle Tree Blocks & Published Roots
CREATE TABLE IF NOT EXISTS continuum_merkle_blocks (
    block_id BIGSERIAL PRIMARY KEY,
    merkle_root CHAR(64) NOT NULL,
    prev_root CHAR(64),
    leaves_count INTEGER NOT NULL,
    first_seq BIGINT NOT NULL,
    last_seq BIGINT NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    signature TEXT -- Collector signature over root if signed
);

-- 4. Merkle Inclusion Proof Nodes
CREATE TABLE IF NOT EXISTS continuum_merkle_nodes (
    id BIGSERIAL PRIMARY KEY,
    block_id BIGINT NOT NULL REFERENCES continuum_merkle_blocks(block_id) ON DELETE CASCADE,
    node_hash CHAR(64) NOT NULL,
    parent_hash CHAR(64),
    level INTEGER NOT NULL,
    position VARCHAR(8) NOT NULL -- 'left' or 'right'
);

-- 5. Detected Collection Gaps (Honest Auditing)
CREATE TABLE IF NOT EXISTS continuum_collection_gaps (
    id BIGSERIAL PRIMARY KEY,
    room_name VARCHAR(64) NOT NULL REFERENCES continuum_rooms(room_name) ON DELETE CASCADE,
    start_seq BIGINT NOT NULL,
    end_seq BIGINT NOT NULL,
    missing_count BIGINT NOT NULL,
    detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    gap_reason VARCHAR(32) NOT NULL, -- 'rate_limit_throttle', 'collector_cold_start', 'network_timeout'
    status VARCHAR(32) NOT NULL DEFAULT 'unrecoverable_ephemeral'
);

-- 6. Collector Health & Ingest Telemetry
CREATE TABLE IF NOT EXISTS continuum_collector_telemetry (
    id BIGSERIAL PRIMARY KEY,
    collector_id VARCHAR(64) NOT NULL,
    status VARCHAR(16) NOT NULL, -- 'ONLINE', 'STANDBY', 'OFFLINE'
    messages_ingested_last_min INTEGER NOT NULL,
    active_rooms_count INTEGER NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 7. Row Level Security & Public Read Access (Supabase / Anon Client Support)
-- ==============================================================================
ALTER TABLE continuum_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE continuum_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE continuum_merkle_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE continuum_collection_gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE continuum_collector_telemetry ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Allow public read on continuum_rooms" ON continuum_rooms FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Allow public read on continuum_messages" ON continuum_messages FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Allow public read on continuum_merkle_blocks" ON continuum_merkle_blocks FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Allow public read on continuum_collection_gaps" ON continuum_collection_gaps FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Allow public read on continuum_collector_telemetry" ON continuum_collector_telemetry FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;

