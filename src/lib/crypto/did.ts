import bs58 from "bs58";
import { sha256 } from "@noble/hashes/sha2";
import { bytesToHex } from "@noble/hashes/utils";

export interface ParsedDidKey {
  isValid: boolean;
  did: string;
  multibase: string;
  multicodecPrefix: number[];
  publicKeyBytes: Uint8Array | null;
  publicKeyHex: string;
  fingerprint: string;
  shardNamespace: string;
  shardKey: string;
  shardPath: string;
  legacyPath: string;
  error?: string;
}

/**
 * Parse an Ed25519 did:key identifier according to W3C did:key and Technocore specs
 * e.g., did:key:z6MkgapAoAJZ78ybHYX3vNny5Qd9UZSU8MmKNwDpAzGubRG4
 */
export function parseDidKey(did: string): ParsedDidKey {
  if (!did || typeof did !== "string") {
    return {
      isValid: false,
      did: did || "",
      multibase: "",
      multicodecPrefix: [],
      publicKeyBytes: null,
      publicKeyHex: "",
      fingerprint: "",
      shardNamespace: "",
      shardKey: "",
      shardPath: "",
      legacyPath: "",
      error: "Empty or invalid DID input",
    };
  }

  const cleanDid = did.trim();
  if (!cleanDid.startsWith("did:key:")) {
    return {
      isValid: false,
      did: cleanDid,
      multibase: "",
      multicodecPrefix: [],
      publicKeyBytes: null,
      publicKeyHex: "",
      fingerprint: "",
      shardNamespace: "",
      shardKey: "",
      shardPath: "",
      legacyPath: "",
      error: "DID must start with 'did:key:'",
    };
  }

  const multibasePart = cleanDid.replace("did:key:", "");
  if (!multibasePart.startsWith("z")) {
    return {
      isValid: false,
      did: cleanDid,
      multibase: multibasePart,
      multicodecPrefix: [],
      publicKeyBytes: null,
      publicKeyHex: "",
      fingerprint: "",
      shardNamespace: "",
      shardKey: "",
      shardPath: "",
      legacyPath: "",
      error: "Expected multibase prefix 'z' (base58btc)",
    };
  }

  try {
    // Base58 decode without the leading 'z'
    const decoded = bs58.decode(multibasePart.slice(1));

    // For ed25519-pub, multicodec is 0xed01 (0xed, 0x01 in varint)
    if (decoded.length < 34 || decoded[0] !== 0xed || decoded[1] !== 0x01) {
      return {
        isValid: false,
        did: cleanDid,
        multibase: multibasePart,
        multicodecPrefix: Array.from(decoded.slice(0, 2)),
        publicKeyBytes: null,
        publicKeyHex: "",
        fingerprint: "",
        shardNamespace: "",
        shardKey: "",
        shardPath: "",
        legacyPath: "",
        error: "Not a valid Ed25519 multicodec key (expected 0xed01 prefix)",
      };
    }

    const publicKeyBytes = decoded.slice(2, 34);
    const publicKeyHex = bytesToHex(publicKeyBytes);

    // Fingerprint: first 16 lowercase hex characters of SHA-256(did:key string)
    const encoder = new TextEncoder();
    const hash = sha256(encoder.encode(cleanDid));
    const fullHex = bytesToHex(hash);
    const fingerprint = fullHex.slice(0, 16).toLowerCase();

    const shardNamespace = `did-${fingerprint.slice(0, 2)}`;
    const shardKey = fingerprint.slice(2, 16);
    const shardPath = `/kv/${shardNamespace}/${shardKey}`;
    const legacyPath = `/kv/did/${fingerprint}`;

    return {
      isValid: true,
      did: cleanDid,
      multibase: multibasePart,
      multicodecPrefix: [0xed, 0x01],
      publicKeyBytes,
      publicKeyHex,
      fingerprint,
      shardNamespace,
      shardKey,
      shardPath,
      legacyPath,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      isValid: false,
      did: cleanDid,
      multibase: multibasePart,
      multicodecPrefix: [],
      publicKeyBytes: null,
      publicKeyHex: "",
      fingerprint: "",
      shardNamespace: "",
      shardKey: "",
      shardPath: "",
      legacyPath: "",
      error: `Base58 decode error: ${message}`,
    };
  }
}
