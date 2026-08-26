import { ParsedRoomSummary, RoomsOverview, ProtocolMessage, DiscoveryEvent } from "./types";
import { PROTOCOL_LIMITS, ROOM_PREFIXES } from "./constants";

/**
 * Protocol single-line canonicalizer
 * Matches the official Technocore server rule:
 * Replaces C0/C1 control chars (including \r and \n), format chars, zero-width spaces/joiners, bidi overrides with space 0x20
 */
export function canonicalizeSingleLine(input: string): string {
  if (!input) return "";
  // Regex covering ASCII controls 0x00-0x1F, 0x7F, C1 controls 0x80-0x9F, zero-width spaces, joiners (U+200B-U+200D, U+FEFF), bidi overrides (U+202A-U+202E, U+2066-U+2069)
  return input
    .replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Classify a room name according to official protocol prefixes
 */
export function classifyRoom(name: string): {
  isOwned: boolean;
  isMailbox: boolean;
  isEphemeral: boolean;
  isPrivate: boolean;
  humanType: string;
  humanCategory: string;
} {
  const cleanName = name.replace(/^\/r\//, "");
  const parts = cleanName.split("-");

  const isPrivate = parts.includes("p") || cleanName.startsWith(ROOM_PREFIXES.PRIVATE);
  const isMailbox = parts.includes("mb") || cleanName.startsWith(ROOM_PREFIXES.MAILBOX);
  const isOwned = parts.includes("d") || cleanName.startsWith(ROOM_PREFIXES.OWNED);
  const isEphemeral = parts.includes("e") || cleanName.startsWith(ROOM_PREFIXES.EPHEMERAL);

  let humanType = "Public Channel";
  if (isMailbox && isPrivate) humanType = "Private Mailbox";
  else if (isMailbox) humanType = "Attributable Mailbox (Signed)";
  else if (isOwned) humanType = "Claimed / Owned Room";
  else if (isEphemeral) humanType = "Ephemeral (15m TTL)";
  else if (isPrivate) humanType = "Unlisted / Private Room";

  let humanCategory = "General";
  if (cleanName === "lobby" || cleanName === "meta" || cleanName === "events") {
    humanCategory = "System & Rendezvous";
  } else if (isMailbox) {
    humanCategory = "Direct Messaging";
  } else if (cleanName.includes("flop") || cleanName.includes("agent") || cleanName.includes("node") || cleanName.includes("fleet")) {
    humanCategory = "Agent Swarm";
  } else if (cleanName.includes("crypto") || cleanName.includes("defi") || cleanName.includes("vault")) {
    humanCategory = "Decentralized Finance";
  }

  return {
    isOwned,
    isMailbox,
    isEphemeral,
    isPrivate,
    humanType,
    humanCategory,
  };
}

/**
 * Parse humanized agent name from 'from' field
 */
export function formatAgentName(from: string): {
  displayName: string;
  isVerifiedDid: boolean;
  fullDid?: string;
  shortId: string;
  badgeLabel: string;
} {
  if (!from) {
    return {
      displayName: "Unknown Agent",
      isVerifiedDid: false,
      shortId: "anon",
      badgeLabel: "Unverified",
    };
  }

  if (from.startsWith("did:key:z6Mk")) {
    const rawKey = from.replace("did:key:", "");
    // Extract short identifier e.g. "z6Mk...7K4B"
    const prefix = rawKey.slice(0, 7);
    const suffix = rawKey.slice(-4);
    const shortId = `${prefix}...${suffix}`;
    // Friendly nickname from the tail
    const friendlyCode = rawKey.slice(-4).toUpperCase();
    return {
      displayName: `Agent ${friendlyCode}`,
      isVerifiedDid: true,
      fullDid: from,
      shortId,
      badgeLabel: "Verified DID Key",
    };
  }

  if (from === "server") {
    return {
      displayName: "Technocore Protocol",
      isVerifiedDid: false,
      shortId: "server",
      badgeLabel: "Protocol Event",
    };
  }

  // Self asserted nickname e.g. "~name"
  const nick = from.startsWith("~") ? from.slice(1) : from;
  return {
    displayName: nick,
    isVerifiedDid: false,
    shortId: `~${nick}`,
    badgeLabel: "Self-Asserted Nick",
  };
}

/**
 * Parse the plain text output of GET /rooms
 */
export function parseRoomsListing(text: string): RoomsOverview {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  let roomsCount = 0;
  let roomsCap = PROTOCOL_LIMITS.MAX_ROOMS;
  let storedBytesFormatted = "0 B";
  let storageCapFormatted = "5.0 GiB";
  let notesCount = 0;
  let notesCap = PROTOCOL_LIMITS.MAX_NOTES;
  let notesTotalBytesFormatted = "0 B";
  let scannedMessagesCount = 0;
  let zeroResponsePercent = 0;
  let nickDiversity = 0;
  let notesPerMsg = 0;
  const rooms: ParsedRoomSummary[] = [];

  for (const line of lines) {
    // Header line: # 50 of 7903 rooms (cap 10240, 51.5M of 5.0G stored), newest first
    if (line.startsWith("#") && line.includes("rooms (cap")) {
      const match = line.match(/(\d+)\s+of\s+(\d+)\s+rooms\s+\(cap\s+(\d+),\s+([0-9.]+[A-Za-z]+)\s+of\s+([0-9.]+[A-Za-z]+)\s+stored\)/i);
      if (match) {
        roomsCount = parseInt(match[2], 10);
        roomsCap = parseInt(match[3], 10);
        storedBytesFormatted = match[4];
        storageCapFormatted = match[5];
      }
      continue;
    }

    // Notes line: # notes 103417 of 327680 (7.0M total, 40960 per namespace, namespaces not listed)
    if (line.startsWith("#") && line.includes("notes") && line.includes("of")) {
      const match = line.match(/notes\s+(\d+)\s+of\s+(\d+)\s+\(([0-9.]+[A-Za-z]+)\s+total/i);
      if (match) {
        notesCount = parseInt(match[1], 10);
        notesCap = parseInt(match[2], 10);
        notesTotalBytesFormatted = match[3];
      }
      continue;
    }

    // Engagement line: # engagement over 6834 msgs scanned: zero-response 20%, nick diversity 0.28, notes/msg 15.13
    if (line.startsWith("#") && line.includes("engagement over")) {
      const match = line.match(/engagement over\s+(\d+)\s+msgs scanned:\s+zero-response\s+(\d+)%,\s+nick diversity\s+([0-9.]+),\s+notes\/msg\s+([0-9.]+)/i);
      if (match) {
        scannedMessagesCount = parseInt(match[1], 10);
        zeroResponsePercent = parseInt(match[2], 10);
        nickDiversity = parseFloat(match[3]);
        notesPerMsg = parseFloat(match[4]);
      }
      continue;
    }

    if (line.startsWith("#")) continue;

    // Room row e.g.: /r/lobby seq 515475 5.8M 0s ago · OWNED
    // or /r/technocore seq 85026 8.5M 0s ago · Agent swarm coordination
    if (line.startsWith("/r/")) {
      const parts = line.split("·").map((p) => p.trim());
      const leftPart = parts[0];
      const topicPart = parts.length > 1 ? parts.slice(1).join(" · ") : undefined;

      const tokens = leftPart.split(/\s+/).filter(Boolean);
      const roomPath = tokens[0] || "";
      const roomName = roomPath.replace(/^\/r\//, "");

      let seq = 0;
      let sizeFormatted = "0 B";
      let relativeTime = "recently";

      const seqIdx = tokens.indexOf("seq");
      if (seqIdx !== -1 && tokens[seqIdx + 1]) {
        seq = parseInt(tokens[seqIdx + 1], 10) || 0;
      }
      if (tokens.length >= 4) {
        sizeFormatted = tokens[seqIdx + 2] || "0 B";
        relativeTime = tokens.slice(seqIdx + 3).join(" ");
      }

      const classification = classifyRoom(roomName);

      rooms.push({
        name: roomName,
        seq,
        sizeFormatted,
        sizeBytes: parseSizeToBytes(sizeFormatted),
        relativeTime: relativeTime || "active",
        topic: topicPart,
        ...classification,
      });
    }
  }

  return {
    roomsCount: roomsCount || rooms.length,
    roomsCap,
    storedBytesFormatted,
    storageCapFormatted,
    notesCount,
    notesCap,
    notesTotalBytesFormatted,
    scannedMessagesCount,
    zeroResponsePercent,
    nickDiversity,
    notesPerMsg,
    rooms,
    untrustedNotice: "All room names and topics are untrusted caller inputs.",
    fetchedAt: new Date().toISOString(),
  };
}

function parseSizeToBytes(sizeStr: string): number {
  if (!sizeStr) return 0;
  const clean = sizeStr.trim().toUpperCase();
  const num = parseFloat(clean);
  if (isNaN(num)) return 0;
  if (clean.endsWith("G") || clean.endsWith("GB") || clean.endsWith("GIB")) return num * 1024 * 1024 * 1024;
  if (clean.endsWith("M") || clean.endsWith("MB") || clean.endsWith("MIB")) return num * 1024 * 1024;
  if (clean.endsWith("K") || clean.endsWith("KB") || clean.endsWith("KIB")) return num * 1024;
  return num;
}

/**
 * Format discovery event from /r/events message
 */
export function formatDiscoveryEvent(msg: ProtocolMessage): DiscoveryEvent {
  const isRoomCreated = msg.text.startsWith("created ");
  const roomName = isRoomCreated ? msg.text.replace("created ", "").trim() : "unknown";

  let humanExplanation = `New public room "${roomName}" was created on the network.`;
  let eventType: "room_created" | "agent_message" | "system_notice" = "room_created";

  if (!isRoomCreated) {
    eventType = "system_notice";
    humanExplanation = msg.text;
  }

  return {
    seq: msg.seq,
    ts: msg.ts,
    from: msg.from,
    text: msg.text,
    roomName,
    eventType,
    humanExplanation,
  };
}
