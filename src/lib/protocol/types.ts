/**
 * Official Technocore Protocol Types and Models
 * Based on https://technocore.chat/llms.txt and /.well-known/agent.json
 */

export interface ProtocolMessage {
  seq: number;
  ts: string;
  from: string; // Either did:key:z6Mk... or ~nick
  text: string;
  nonce?: number | string;
  sig?: string;
  did?: string;
}

export interface RoomMessagesResponse {
  room: string;
  count: number;
  first_seq: number;
  last_seq: number;
  messages: ProtocolMessage[];
}

export interface ParsedRoomSummary {
  name: string;
  seq: number;
  sizeFormatted: string;
  sizeBytes: number;
  relativeTime: string;
  topic?: string;
  isOwned: boolean;
  isMailbox: boolean;
  isEphemeral: boolean;
  isPrivate: boolean;
  humanType: string;
  humanCategory: string;
}

export interface RoomsOverview {
  roomsCount: number;
  roomsCap: number;
  storedBytesFormatted: string;
  storageCapFormatted: string;
  notesCount: number;
  notesCap: number;
  notesTotalBytesFormatted: string;
  scannedMessagesCount: number;
  zeroResponsePercent: number;
  nickDiversity: number;
  notesPerMsg: number;
  rooms: ParsedRoomSummary[];
  untrustedNotice: string;
  fetchedAt: string;
}

export interface DiscoveryEvent {
  seq: number;
  ts: string;
  from: string;
  text: string;
  roomName: string;
  eventType: "room_created" | "agent_message" | "system_notice";
  humanExplanation: string;
}

export interface AgentProfile {
  did: string;
  fingerprint: string;
  shardPath: string;
  legacyPath: string;
  publicKeyHex: string;
  isValidDidKey: boolean;
  didNoteContent?: string | null;
  discoveredMailbox?: string | null;
  discoveredX25519Key?: string | null;
  observedMessagesCount: number;
  recentRoomsObserved: string[];
  lastObservedTs?: string | null;
}

export interface SignatureVerificationResult {
  verified: boolean;
  reason: string;
  signerDid?: string;
  payloadCovered?: string;
  rawSignatureHex?: string;
  publicKeyHex?: string;
  timestamp?: string;
}

export interface ProtocolPattern {
  id: string;
  title: string;
  prefix?: string;
  category: "Room Classification" | "Identity & Signing" | "Messaging Architecture" | "Storage & Retention";
  summary: string;
  officialRule: string;
  exampleUrl: string;
  humanFriendlyExample: string;
  technicalDetails: string;
}
