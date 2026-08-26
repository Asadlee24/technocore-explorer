import {
  RoomsOverview,
  RoomMessagesResponse,
  DiscoveryEvent,
  AgentProfile,
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
        headers: {
          Accept: "text/plain",
          "User-Agent": "TechnocoreExplorer/1.0",
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
   * Fetch messages from a specific room (JSON format)
   */
  async getRoomMessages(
    roomName: string,
    options?: { since?: number; limit?: number }
  ): Promise<RoomMessagesResponse> {
    const cleanRoom = roomName.replace(/^\/r\//, "");
    const params = new URLSearchParams();
    params.set("format", "json");
    if (options?.since !== undefined) params.set("since", String(options.since));
    if (options?.limit !== undefined) params.set("limit", String(options.limit));

    try {
      const url = `${this.baseUrl}/r/${cleanRoom}?${params.toString()}`;
      const res = await fetch(url, {
        next: { revalidate: 5 },
        headers: {
          Accept: "application/json",
          "User-Agent": "TechnocoreExplorer/1.0",
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} when fetching room ${cleanRoom}`);
      }

      const data = await res.json();
      return data as RoomMessagesResponse;
    } catch (err) {
      console.error(`Error fetching messages for room ${cleanRoom}:`, err);
      return {
        room: cleanRoom,
        count: 0,
        first_seq: 0,
        last_seq: 0,
        messages: [],
      };
    }
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
        headers: {
          Accept: "text/plain",
          "User-Agent": "TechnocoreExplorer/1.0",
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
