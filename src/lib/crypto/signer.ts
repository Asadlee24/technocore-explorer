import { ed25519 } from "@noble/curves/ed25519";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils";
import bs58 from "bs58";
import { canonicalizeSingleLine } from "../protocol/parser";

export interface KeypairInfo {
  privateKeyHex: string;
  publicKeyHex: string;
  did: string;
}

/**
 * Convert bytes to base64url without padding
 */
export function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Encode raw Ed25519 public key bytes to W3C did:key string
 */
export function publicKeyToDidKey(pubKeyBytes: Uint8Array): string {
  const multicodec = new Uint8Array(2 + pubKeyBytes.length);
  multicodec[0] = 0xed;
  multicodec[1] = 0x01;
  multicodec.set(pubKeyBytes, 2);
  const b58 = bs58.encode(multicodec);
  return `did:key:z${b58}`;
}

/**
 * Generate a new random Ed25519 keypair
 */
export function generateKeypair(): KeypairInfo {
  const privKey = ed25519.utils.randomPrivateKey();
  const pubKey = ed25519.getPublicKey(privKey);
  const did = publicKeyToDidKey(pubKey);

  return {
    privateKeyHex: bytesToHex(privKey),
    publicKeyHex: bytesToHex(pubKey),
    did,
  };
}

/**
 * Restore an Ed25519 keypair from a private key (hex or base64)
 */
export function restoreKeypairFromPrivateKey(input: string): KeypairInfo {
  const cleaned = input.trim();
  let privBytes: Uint8Array;

  if (/^[0-9a-fA-F]{64}$/.test(cleaned)) {
    // 32-byte hex
    privBytes = hexToBytes(cleaned);
  } else {
    // Try base64 / base64url
    let base64 = cleaned.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4 !== 0) base64 += "=";
    const binary = atob(base64);
    privBytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      privBytes[i] = binary.charCodeAt(i);
    }
  }

  if (privBytes.length !== 32) {
    throw new Error(`Invalid private key length: ${privBytes.length} bytes (expected 32 bytes)`);
  }

  const pubKey = ed25519.getPublicKey(privBytes);
  const did = publicKeyToDidKey(pubKey);

  return {
    privateKeyHex: bytesToHex(privBytes),
    publicKeyHex: bytesToHex(pubKey),
    did,
  };
}

/**
 * Sign a message payload for Technocore
 * Canonical Payload: `<cleanRoom>|<nonce>|<canonicalText>`
 */
export function signMessage(
  privateKeyHex: string,
  room: string,
  nonce: number | string,
  text: string
): { sig: string; did: string; payloadString: string } {
  const privBytes = hexToBytes(privateKeyHex);
  const pubKey = ed25519.getPublicKey(privBytes);
  const did = publicKeyToDidKey(pubKey);

  const cleanRoom = room.replace(/^\/r\//, "");
  const canonicalText = canonicalizeSingleLine(text);
  const payloadString = `${cleanRoom}|${nonce}|${canonicalText}`;

  const payloadBytes = new TextEncoder().encode(payloadString);
  const signatureBytes = ed25519.sign(payloadBytes, privBytes);
  const sig = bytesToBase64Url(signatureBytes);

  return {
    sig,
    did,
    payloadString,
  };
}
