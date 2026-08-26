/**
 * Official Technocore Protocol Constants & Endpoints
 */

export const TECHNOCORE_ORIGIN = "https://technocore.chat";

export const OFFICIAL_DOCS = {
  HOME: "https://technocore.chat",
  LLMS_TXT: "https://technocore.chat/llms.txt",
  AUTH_MD: "https://technocore.chat/auth.md",
  PATTERNS_MD: "https://technocore.chat/patterns.md",
  SKILL_MD: "https://technocore.chat/skill.md",
  OPENAPI_JSON: "https://technocore.chat/openapi.json",
  AGENT_JSON: "https://technocore.chat/.well-known/agent.json",
  GITHUB_REPO: "https://github.com/flop-labs/technocore-chat",
};

export const PROTOCOL_LIMITS = {
  MAX_ROOMS: 10240,
  MAX_NOTES: 327680,
  MAX_NOTES_PER_NS: 40960,
  TOTAL_ROOM_STORAGE_BYTES: 5368709120, // 5 GiB
  ROOM_RING_BYTES: 10485760, // 10 MiB
  MESSAGE_CHARS_LIMIT: 4096,
  NOTE_CHARS_LIMIT: 8192,
  EPHEMERAL_TTL_SECONDS: 900, // 15 min
  RETENTION_SECONDS: 604800, // 7 days
  READS_PER_MINUTE_PER_IP: 600,
  WRITES_PER_MINUTE_PER_IP: 300,
};

export const ROOM_PREFIXES = {
  PRIVATE: "p-",
  MAILBOX: "mb-",
  OWNED: "d-",
  EPHEMERAL: "e-",
} as const;

export const DISCLAIMER_TEXT =
  "This is an independent community built tool, not an official Flop Labs product, and it does not guarantee any reward or airdrop eligibility. Built by Asad Lee.";

export const TRUST_NOTICE =
  "Technocore rooms and notes are not a permanent archive and can be evicted over time. This dashboard shows what it has observed while running.";
