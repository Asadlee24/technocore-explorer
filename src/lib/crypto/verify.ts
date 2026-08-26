import { ed25519 } from "@noble/curves/ed25519";
import { parseDidKey } from "./did";
import { canonicalizeSingleLine } from "../protocol/parser";
import { SignatureVerificationResult } from "../protocol/types";

/**
 * Decode a base64url string to Uint8Array
 */
export function base64UrlToBytes(base64url: string): Uint8Array {
  // Convert base64url to standard base64
  let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4 !== 0) {
    base64 += "=";
  }
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Offline client-side verification for a signed Technocore message
 * Payload: `<room>|<nonce>|<text>` after single-line sweep
 */
export function verifyMessageSignature(params: {
  did: string;
  room: string;
  nonce: number | string;
  text: string;
  sig: string;
}): SignatureVerificationResult {
  const { did, room, nonce, text, sig } = params;

  if (!did || !room || nonce === undefined || !text || !sig) {
    return {
      verified: false,
      reason: "Missing required parameters for signature verification",
    };
  }

  const parsedDid = parseDidKey(did);
  if (!parsedDid.isValid || !parsedDid.publicKeyBytes) {
    return {
      verified: false,
      reason: parsedDid.error || "Invalid Ed25519 DID key",
    };
  }

  try {
    const cleanRoom = room.replace(/^\/r\//, "");
    const canonicalText = canonicalizeSingleLine(text);
    const payloadString = `${cleanRoom}|${nonce}|${canonicalText}`;

    const encoder = new TextEncoder();
    const payloadBytes = encoder.encode(payloadString);
    const signatureBytes = base64UrlToBytes(sig);

    if (signatureBytes.length !== 64) {
      return {
        verified: false,
        reason: `Invalid signature byte length: ${signatureBytes.length} (expected 64 bytes)`,
        signerDid: did,
        payloadCovered: payloadString,
      };
    }

    const isValid = ed25519.verify(signatureBytes, payloadBytes, parsedDid.publicKeyBytes);

    return {
      verified: isValid,
      reason: isValid
        ? "Valid Ed25519 cryptographic signature verified offline"
        : "Signature mismatch: signature does not match the payload or key",
      signerDid: did,
      payloadCovered: payloadString,
      publicKeyHex: parsedDid.publicKeyHex,
      timestamp: new Date().toISOString(),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      verified: false,
      reason: `Verification exception: ${message}`,
      signerDid: did,
    };
  }
}

/**
 * Offline verification for signed notes (such as room ownership or allow-list)
 * Payload: `<namespace>|<key>|<nonce>|<value>`
 */
export function verifyNoteSignature(params: {
  did: string;
  namespace: string;
  key: string;
  nonce: number | string;
  value: string;
  sig: string;
}): SignatureVerificationResult {
  const { did, namespace, key, nonce, value, sig } = params;

  const parsedDid = parseDidKey(did);
  if (!parsedDid.isValid || !parsedDid.publicKeyBytes) {
    return {
      verified: false,
      reason: parsedDid.error || "Invalid Ed25519 DID key",
    };
  }

  try {
    const canonicalValue = canonicalizeSingleLine(value);
    const payloadString = `${namespace}|${key}|${nonce}|${canonicalValue}`;

    const encoder = new TextEncoder();
    const payloadBytes = encoder.encode(payloadString);
    const signatureBytes = base64UrlToBytes(sig);

    const isValid = ed25519.verify(signatureBytes, payloadBytes, parsedDid.publicKeyBytes);

    return {
      verified: isValid,
      reason: isValid ? "Valid note signature" : "Signature mismatch",
      signerDid: did,
      payloadCovered: payloadString,
      publicKeyHex: parsedDid.publicKeyHex,
      timestamp: new Date().toISOString(),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      verified: false,
      reason: `Verification error: ${message}`,
      signerDid: did,
    };
  }
}
