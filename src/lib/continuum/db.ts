import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { ArchiveRecord, CollectionGap, RoomCoverage, ContinuumCollectorStatus } from "./types";

// Lazy client factories — evaluated on first use so env vars are available
function getPublicClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";
  return createClient(url, key, { auth: { persistSession: false } });
}

function getAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";
  return createClient(url, serviceKey || anonKey, { auth: { persistSession: false } });
}

// Cached singletons (created on first access)
let _publicClient: SupabaseClient | null = null;
let _adminClient: SupabaseClient | null = null;

export const supabasePublic: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!_publicClient) _publicClient = getPublicClient();
    return (_publicClient as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export const supabaseAdmin: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!_adminClient) _adminClient = getAdminClient();
    return (_adminClient as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export interface DbMessageRow {
  id?: string;
  room_name: string;
  seq: number;
  observed_ts: string;
  from_identity: string;
  raw_text: string;
  canonical_text: string;
  nonce?: number | string | null;
  sig?: string | null;
  signature_valid?: boolean | null;
  message_hash: string;
  leaf_hash: string;
  archive_timestamp: string;
  archive_block_id: number;
}

export interface DbRoomRow {
  room_name: string;
  room_class: string;
  first_seq_observed: number;
  last_seq_observed: number;
  total_archived_count: number;
  coverage_percent: number;
  is_complete_sequence: boolean;
  last_observed_at: string;
  created_at?: string;
}

export interface DbEpochRow {
  block_id: number;
  merkle_root: string;
  prev_root?: string | null;
  leaves_count: number;
  first_seq: number;
  last_seq: number;
  leaves_json?: string[] | null;
  published_at: string;
}

export interface DbGapRow {
  id?: number;
  room_name: string;
  start_seq: number;
  end_seq: number;
  missing_count: number;
  detected_at: string;
  gap_reason: string;
  status: string;
}

export interface DbTelemetryRow {
  id?: number;
  collector_id: string;
  status: string;
  messages_ingested_last_min: number;
  active_rooms_count: number;
  recorded_at: string;
}

export interface LiveContinuumStats {
  messagesArchived: number;
  roomsMonitored: number;
  epochsSealed: number;
  collectorStatus: "ONLINE" | "STANDBY" | "OFFLINE";
  latestMerkleRoot: string;
  lastUpdated: string;
}

export class ContinuumDatabase {
  private static get client(): SupabaseClient {
    if (!_adminClient) _adminClient = getAdminClient();
    return _adminClient;
  }

  /**
   * Test database connectivity
   */
  static async ping(): Promise<{ ok: boolean; message: string }> {
    try {
      const { data, error } = await this.client.from("continuum_rooms").select("room_name").limit(1);
      if (error) {
        return { ok: false, message: error.message };
      }
      return { ok: true, message: "Supabase connection active." };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { ok: false, message: msg };
    }
  }

  /**
   * Get exact live metrics from Supabase
   */
  static async getLiveStats(): Promise<LiveContinuumStats> {
    try {
      const [msgRes, roomRes, blockRes, telRes, latestBlockRes] = await Promise.all([
        this.client.from("continuum_messages").select("*", { count: "exact", head: true }),
        this.client.from("continuum_rooms").select("*", { count: "exact", head: true }),
        this.client.from("continuum_merkle_blocks").select("*", { count: "exact", head: true }),
        this.client.from("continuum_collector_telemetry").select("*").order("recorded_at", { ascending: false }).limit(1),
        this.client.from("continuum_merkle_blocks").select("merkle_root").order("block_id", { ascending: false }).limit(1),
      ]);

      const telemetry = telRes.data && telRes.data.length > 0 ? (telRes.data[0] as DbTelemetryRow) : null;
      const latestBlock = latestBlockRes.data && latestBlockRes.data.length > 0 ? (latestBlockRes.data[0] as DbEpochRow) : null;

      // Determine if collector is active within last 2 minutes
      let status: "ONLINE" | "STANDBY" | "OFFLINE" = "OFFLINE";
      if (telemetry) {
        const recordedTime = new Date(telemetry.recorded_at).getTime();
        const now = Date.now();
        const diffSec = (now - recordedTime) / 1000;
        status = diffSec < 120 ? "ONLINE" : diffSec < 600 ? "STANDBY" : "OFFLINE";
      }

      return {
        messagesArchived: msgRes.count ?? 0,
        roomsMonitored: roomRes.count ?? 0,
        epochsSealed: blockRes.count ?? 0,
        collectorStatus: status,
        latestMerkleRoot: latestBlock?.merkle_root || "None",
        lastUpdated: new Date().toISOString(),
      };
    } catch (err) {
      console.error("DB getLiveStats error:", err);
      return {
        messagesArchived: 0,
        roomsMonitored: 0,
        epochsSealed: 0,
        collectorStatus: "STANDBY",
        latestMerkleRoot: "None",
        lastUpdated: new Date().toISOString(),
      };
    }
  }

  /**
   * Save or update a room's metadata and cursor
   */
  static async upsertRoom(room: DbRoomRow): Promise<boolean> {
    try {
      const { error } = await this.client.from("continuum_rooms").upsert(room, {
        onConflict: "room_name",
      });
      if (error) {
        console.error("DB upsertRoom error:", error);
        return false;
      }
      return true;
    } catch (err) {
      console.error("DB upsertRoom exception:", err);
      return false;
    }
  }

  /**
   * Get all registered rooms and coverage data
   */
  static async getRooms(): Promise<DbRoomRow[]> {
    try {
      const { data, error } = await this.client
        .from("continuum_rooms")
        .select("*")
        .order("last_observed_at", { ascending: false });

      if (error || !data) {
        return [];
      }
      return data as DbRoomRow[];
    } catch {
      return [];
    }
  }

  /**
   * Insert messages batch with deduplication (ON CONFLICT DO NOTHING)
   */
  static async insertMessages(messages: DbMessageRow[]): Promise<{ insertedCount: number; errors: any[] }> {
    if (!messages.length) return { insertedCount: 0, errors: [] };

    try {
      const { data, error } = await this.client
        .from("continuum_messages")
        .upsert(messages, {
          onConflict: "room_name,seq",
          ignoreDuplicates: true,
        })
        .select("id");

      if (error) {
        console.error("DB insertMessages error:", error);
        return { insertedCount: 0, errors: [error] };
      }
      return { insertedCount: data?.length || messages.length, errors: [] };
    } catch (err) {
      console.error("DB insertMessages exception:", err);
      return { insertedCount: 0, errors: [err] };
    }
  }

  /**
   * Query archived messages with filters
   */
  static async getMessages(filter?: {
    room?: string;
    sequence?: number;
    did?: string;
    messageHash?: string;
    searchQuery?: string;
    limit?: number;
    offset?: number;
  }): Promise<DbMessageRow[]> {
    try {
      let query = this.client
        .from("continuum_messages")
        .select("*")
        .order("observed_ts", { ascending: false })
        .limit(filter?.limit || 50);

      if (filter?.offset) {
        query = query.range(filter.offset, filter.offset + (filter?.limit || 50) - 1);
      }
      if (filter?.room) {
        query = query.ilike("room_name", `%${filter.room}%`);
      }
      if (filter?.sequence !== undefined && !isNaN(filter.sequence)) {
        query = query.eq("seq", filter.sequence);
      }
      if (filter?.did) {
        query = query.ilike("from_identity", `%${filter.did}%`);
      }
      if (filter?.messageHash) {
        query = query.or(`message_hash.ilike.%${filter.messageHash}%,leaf_hash.ilike.%${filter.messageHash}%`);
      }
      if (filter?.searchQuery) {
        const q = filter.searchQuery;
        query = query.or(`raw_text.ilike.%${q}%,from_identity.ilike.%${q}%,room_name.ilike.%${q}%`);
      }

      const { data, error } = await query;
      if (error || !data) {
        return [];
      }
      return data as DbMessageRow[];
    } catch {
      return [];
    }
  }

  /**
   * Get single message by ID or (room + seq)
   */
  static async getMessageByIdOrSeq(idOrSeq: string, room?: string): Promise<DbMessageRow | null> {
    try {
      const isSeq = /^\d+$/.test(idOrSeq);
      let query = this.client.from("continuum_messages").select("*");

      if (isSeq && room) {
        query = query.eq("room_name", room).eq("seq", parseInt(idOrSeq, 10));
      } else if (isSeq) {
        query = query.eq("seq", parseInt(idOrSeq, 10)).limit(1);
      } else {
        query = query.or(`id.eq.${idOrSeq},message_hash.eq.${idOrSeq},leaf_hash.eq.${idOrSeq}`).limit(1);
      }

      const { data, error } = await query;
      if (error || !data || data.length === 0) return null;
      return data[0] as DbMessageRow;
    } catch {
      return null;
    }
  }

  /**
   * Save a computed Merkle epoch block
   */
  static async insertMerkleBlock(block: DbEpochRow): Promise<boolean> {
    try {
      const { error } = await this.client.from("continuum_merkle_blocks").upsert(block, {
        onConflict: "block_id",
      });
      if (error) {
        console.error("DB insertMerkleBlock error:", error);
        return false;
      }
      return true;
    } catch (err) {
      console.error("DB insertMerkleBlock exception:", err);
      return false;
    }
  }

  /**
   * Get latest published Merkle epoch blocks
   */
  static async getMerkleBlocks(limit: number = 10): Promise<DbEpochRow[]> {
    try {
      const { data, error } = await this.client
        .from("continuum_merkle_blocks")
        .select("*")
        .order("block_id", { ascending: false })
        .limit(limit);

      if (error || !data) return [];
      return data as DbEpochRow[];
    } catch {
      return [];
    }
  }

  /**
   * Get specific Merkle block by block ID
   */
  static async getMerkleBlockById(blockId: number): Promise<DbEpochRow | null> {
    try {
      const { data, error } = await this.client
        .from("continuum_merkle_blocks")
        .select("*")
        .eq("block_id", blockId)
        .limit(1);

      if (error || !data || data.length === 0) return null;
      return data[0] as DbEpochRow;
    } catch {
      return null;
    }
  }

  /**
   * Save detected sequence gap
   */
  static async insertGap(gap: DbGapRow): Promise<boolean> {
    try {
      const { error } = await this.client.from("continuum_collection_gaps").insert(gap);
      if (error) {
        console.error("DB insertGap error:", error);
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get all detected collection gaps
   */
  static async getGaps(): Promise<DbGapRow[]> {
    try {
      const { data, error } = await this.client
        .from("continuum_collection_gaps")
        .select("*")
        .order("detected_at", { ascending: false });

      if (error || !data) return [];
      return data as DbGapRow[];
    } catch {
      return [];
    }
  }

  /**
   * Record collector telemetry heartbeat
   */
  static async recordTelemetry(telemetry: DbTelemetryRow): Promise<boolean> {
    try {
      const { error } = await this.client.from("continuum_collector_telemetry").insert(telemetry);
      if (error) return false;
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get latest collector telemetry heartbeat
   */
  static async getLatestTelemetry(): Promise<DbTelemetryRow | null> {
    try {
      const { data, error } = await this.client
        .from("continuum_collector_telemetry")
        .select("*")
        .order("recorded_at", { ascending: false })
        .limit(1);

      if (error || !data || data.length === 0) return null;
      return data[0] as DbTelemetryRow;
    } catch {
      return null;
    }
  }
}
