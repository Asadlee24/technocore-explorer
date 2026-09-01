import {
  RoomsOverview,
  RoomMessagesResponse,
  DiscoveryEvent,
  AgentProfile,
  ProtocolMessage,
} from "./types";
import { TECHNOCORE_ORIGIN } from "./constants";
import { parseRoomsListing, formatDiscoveryEvent } from "./parser";
import { parseDidKey } from "../crypto/did";

/**
 * Protocol client for fetching official Technocore endpoints
 * Operates server-side in Next.js Server Components / API routes or client-side via proxy
 */
export class TechnocoreClient {
  private baseUrl: string;

  constructor(baseUrl: string = TECHNOCORE_ORIGIN) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  /**
   * Fetch and parse the /rooms listing
   */
  async getRooms(): Promise<RoomsOverview> {
    try {
      const res = await fetch(`${this.baseUrl}/rooms`, {
        next: { revalidate: 10 },
        signal: AbortSignal.timeout(9000),
        headers: {
          Accept: "text/plain",
          "User-Agent": "curl/8.4.0",
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch /rooms: HTTP ${res.status}`);
      }

      const text = await res.text();
      return parseRoomsListing(text);
    } catch (err) {
      console.error("Error fetching rooms:", err);
      // Fallback empty overview with error notice
      return {
        roomsCount: 0,
        roomsCap: 10240,
        storedBytesFormatted: "0 B",
        storageCapFormatted: "5.0 GiB",
        notesCount: 0,
        notesCap: 327680,
        notesTotalBytesFormatted: "0 B",
        scannedMessagesCount: 0,
        zeroResponsePercent: 0,
        nickDiversity: 0,
        notesPerMsg: 0,
        rooms: [],
        untrustedNotice: "Unable to reach protocol server currently.",
        fetchedAt: new Date().toISOString(),
      };
    }
  }

  /**
   * Fetch messages from a specific room (supports both plain text protocol streams and JSON)
   */
  async getRoomMessages(
    roomName: string,
    options?: { since?: number; limit?: number }
  ): Promise<RoomMessagesResponse> {
    const cleanRoom = roomName.replace(/^\/r\//, "");

    // 1. Try plain text fetch with curl User-Agent (fast and 100% reliable on Technocore)
    try {
      const params = new URLSearchParams();
      if (options?.since !== undefined) params.set("since", String(options.since));
      if (options?.limit !== undefined) params.set("limit", String(options.limit));
      const queryString = params.toString() ? `?${params.toString()}` : "";
      const url = `${this.baseUrl}/r/${cleanRoom}${queryString}`;
      const res = await fetch(url, {
        next: { revalidate: 3 },
        signal: AbortSignal.timeout(4000),
        headers: {
          Accept: "text/plain, */*",
          "User-Agent": "curl/8.4.0",
        },
      });

      if (res.ok) {
        const text = await res.text();
        const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
        const messages: ProtocolMessage[] = [];

        for (const line of lines) {
          if (line.startsWith("#") || line.startsWith("!!")) continue;
          const match = line.match(/^\[(\d+)\]\s+(\S+)\s+<([^>]+)>\s*(.*)$/);
          if (match) {
            const seq = parseInt(match[1], 10);
            if (options?.since !== undefined && seq <= options.since) continue;
            messages.push({
              seq,
              ts: match[2],
              from: match[3],
              text: match[4] || "",
            });
          }
        }

        if (messages.length > 0) {
          const limited = options?.limit ? messages.slice(-options.limit) : messages;
          return {
            room: cleanRoom,
            count: limited.length,
            first_seq: limited[0]?.seq || 0,
            last_seq: limited[limited.length - 1]?.seq || 0,
            messages: limited,
          };
        }
      }
    } catch {
      // fallback
    }

    // 2. Try JSON format as secondary
    try {
      const params = new URLSearchParams();
      params.set("format", "json");
      if (options?.since !== undefined) params.set("since", String(options.since));
      if (options?.limit !== undefined) params.set("limit", String(options.limit));

      const url = `${this.baseUrl}/r/${cleanRoom}?${params.toString()}`;
      const res = await fetch(url, {
        next: { revalidate: 5 },
        signal: AbortSignal.timeout(4000),
        headers: {
          Accept: "application/json",
          "User-Agent": "curl/8.4.0",
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.messages && Array.isArray(data.messages)) {
          return data as RoomMessagesResponse;
        }
      }
    } catch (err) {
      console.error(`Error fetching messages for room ${cleanRoom}:`, err);
    }

    return {
      room: cleanRoom,
      count: 0,
      first_seq: 0,
      last_seq: 0,
      messages: [],
    };
  }

  /**
   * Fetch discovery events from /r/events
   */
  async getDiscoveryEvents(since?: number): Promise<DiscoveryEvent[]> {
    try {
      const data = await this.getRoomMessages("events", { since, limit: 100 });
      if (!data.messages) return [];
      return data.messages.map(formatDiscoveryEvent);
    } catch (err) {
      console.error("Error fetching discovery events:", err);
      return [];
    }
  }

  /**
   * Fetch a key-value note from /kv/<ns>/<key>
   */
  async getNote(namespace: string, key: string): Promise<string | null> {
    try {
      const url = `${this.baseUrl}/kv/${encodeURIComponent(namespace)}/${encodeURIComponent(key)}`;
      const res = await fetch(url, {
        next: { revalidate: 30 },
        signal: AbortSignal.timeout(4000),
        headers: {
          Accept: "text/plain",
          "User-Agent": "curl/8.4.0",
        },
      });

      if (!res.ok) return null;
      const text = await res.text();
      // Remove untrusted banner if present in response
      const clean = text.replace(/^!!\s+UNTRUSTED CONTENT[^\n]*\n+/i, "").trim();
      return clean || null;
    } catch {
      return null;
    }
  }

  /**
   * Fetch room topic note (/kv/topic/<room>)
   */
  async getRoomTopic(roomName: string): Promise<string | null> {
    const cleanRoom = roomName.replace(/^\/r\//, "");
    return this.getNote("topic", cleanRoom);
  }

  /**
   * Fetch agent identity profile and public notes
   */
  async getAgentProfile(didString: string): Promise<AgentProfile> {
    const parsed = parseDidKey(didString);

    if (!parsed.isValid) {
      return {
        did: didString,
        fingerprint: "",
        shardPath: "",
        legacyPath: "",
        publicKeyHex: "",
        isValidDidKey: false,
        didNoteContent: null,
        discoveredMailbox: null,
        discoveredX25519Key: null,
        observedMessagesCount: 0,
        recentRoomsObserved: [],
        lastObservedTs: null,
      };
    }

    // Attempt 1: Fetch sharded note path (/kv/did-xx/yyyyyyyyyyyyyy)
    let noteContent = await this.getNote(parsed.shardNamespace, parsed.shardKey);

    // Attempt 2: Fallback to legacy path (/kv/did/<fingerprint>)
    if (!noteContent) {
      noteContent = await this.getNote("did", parsed.fingerprint);
    }

    let discoveredMailbox: string | null = null;
    let discoveredX25519Key: string | null = null;

    if (noteContent) {
      const lines = noteContent.split("\n");
      for (const line of lines) {
        const lower = line.toLowerCase();
        if (lower.startsWith("mailbox:")) {
          discoveredMailbox = line.replace(/mailbox:\s*/i, "").trim();
        } else if (lower.startsWith("x25519:")) {
          discoveredX25519Key = line.replace(/x25519:\s*/i, "").trim();
        }
      }
    }

    return {
      did: parsed.did,
      fingerprint: parsed.fingerprint,
      shardPath: parsed.shardPath,
      legacyPath: parsed.legacyPath,
      publicKeyHex: parsed.publicKeyHex,
      isValidDidKey: true,
      didNoteContent: noteContent,
      discoveredMailbox,
      discoveredX25519Key,
      observedMessagesCount: 0,
      recentRoomsObserved: [],
      lastObservedTs: null,
    };
  }
}

export const technocoreClient = new TechnocoreClient();
