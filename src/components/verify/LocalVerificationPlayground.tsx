"use client";

import React, { useState } from "react";
import { verifyMessageSignature } from "@/lib/crypto/verify";
import { parseDidKey } from "@/lib/crypto/did";
import { canonicalizeSingleLine } from "@/lib/protocol/parser";
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Key,
  Lock,
  ArrowRight,
  Database,
} from "lucide-react";
import Link from "next/link";

export function LocalVerificationPlayground() {
  // Message Form State
  const [msgDid, setMsgDid] = useState("did:key:z6MkgapAoAJZ78ybHYX3vNny5Qd9UZSU8MmKNwDpAzGubRG4");
  const [msgRoom, setMsgRoom] = useState("lobby");
  const [msgNonce, setMsgNonce] = useState("1719400000000");
  const [msgText, setMsgText] = useState("Hello Technocore network!");
  const [msgSig, setMsgSig] = useState("");

  // Result State
  const [result, setResult] = useState<{
    tested: boolean;
    verified: boolean;
    reason: string;
    payloadCovered?: string;
    publicKeyHex?: string;
  } | null>(null);

  const handleVerifyMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgDid || !msgRoom || !msgText) {
      setResult({
        tested: true,
        verified: false,
        reason: "Please fill in all required fields (DID, room, nonce, text).",
      });
      return;
    }

    const res = verifyMessageSignature({
      did: msgDid.trim(),
      room: msgRoom.trim(),
      nonce: msgNonce.trim(),
      text: msgText,
      sig: msgSig.trim(),
    });

    setResult({
      tested: true,
      verified: res.verified,
      reason: res.reason,
      payloadCovered: res.payloadCovered,
      publicKeyHex: res.publicKeyHex,
    });
  };

  const parsedDid = parseDidKey(msgDid);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-flop-green/15 border border-flop-green/30 text-flop-green">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-flop-ice">Local Signature Verification</h1>
              <p className="text-xs text-flop-grey">
                100% offline client-side Ed25519 pure (RFC 8032) cryptographic verification.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-surface-border text-xs font-mono text-flop-ice">
          <Lock className="w-4 h-4 text-flop-green" />
          <span>Zero Server Calls • Zero Private Keys</span>
        </div>
      </div>

      {/* Verification Tool Form */}
      <div className="p-6 rounded-2xl bg-surface border border-surface-border space-y-6">
        <form onSubmit={handleVerifyMessage} className="space-y-4">
          <div>
            <label className="text-xs font-mono font-bold text-flop-ice block mb-1">
              Signer Identity (did:key)
            </label>
            <input
              type="text"
              value={msgDid}
              onChange={(e) => setMsgDid(e.target.value)}
              placeholder="did:key:z6Mk..."
              className="w-full px-3 py-2.5 rounded-xl bg-surface-raised border border-surface-border text-xs font-mono text-flop-ice focus:outline-none focus:border-flop-blue"
            />
            {parsedDid.isValid && (
              <div className="text-[11px] font-mono text-flop-grey mt-1 flex items-center gap-2">
                <span>Public Key Hex: {parsedDid.publicKeyHex}</span>
                <span>•</span>
                <span>Fingerprint: {parsedDid.fingerprint}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono font-bold text-flop-ice block mb-1">
                Room Name
              </label>
              <input
                type="text"
                value={msgRoom}
                onChange={(e) => setMsgRoom(e.target.value)}
                placeholder="e.g. lobby"
                className="w-full px-3 py-2.5 rounded-xl bg-surface-raised border border-surface-border text-xs font-mono text-flop-ice focus:outline-none focus:border-flop-blue"
              />
            </div>
            <div>
              <label className="text-xs font-mono font-bold text-flop-ice block mb-1">
                Nonce
              </label>
              <input
                type="text"
                value={msgNonce}
                onChange={(e) => setMsgNonce(e.target.value)}
                placeholder="e.g. 1719400000000"
                className="w-full px-3 py-2.5 rounded-xl bg-surface-raised border border-surface-border text-xs font-mono text-flop-ice focus:outline-none focus:border-flop-blue"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-mono font-bold text-flop-ice block mb-1">
              Message Text
            </label>
            <textarea
              rows={3}
              value={msgText}
              onChange={(e) => setMsgText(e.target.value)}
              placeholder="Message payload string..."
              className="w-full px-3 py-2.5 rounded-xl bg-surface-raised border border-surface-border text-xs font-mono text-flop-ice focus:outline-none focus:border-flop-blue"
            />
          </div>

          <div>
            <label className="text-xs font-mono font-bold text-flop-ice block mb-1">
              Base64URL Signature (86 chars unpadded)
            </label>
            <input
              type="text"
              value={msgSig}
              onChange={(e) => setMsgSig(e.target.value)}
              placeholder="e.g. 86-char base64url string"
              className="w-full px-3 py-2.5 rounded-xl bg-surface-raised border border-surface-border text-xs font-mono text-flop-ice focus:outline-none focus:border-flop-blue"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-flop-green text-flop-base font-mono text-xs font-bold hover:bg-flop-green/90 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Verify Signature Offline</span>
          </button>
        </form>

        {/* Verification Result Display */}
        {result && (
          <div
            className={`p-5 rounded-xl border font-mono text-xs space-y-3 animate-in fade-in ${
              result.verified
                ? "bg-flop-green/15 border-flop-green/40 text-flop-ice"
                : "bg-surface-raised border-surface-border text-flop-grey"
            }`}
          >
            <div className="flex items-center gap-2">
              {result.verified ? (
                <CheckCircle className="w-5 h-5 text-flop-green" />
              ) : (
                <XCircle className="w-5 h-5 text-flop-grey" />
              )}
              <span className="font-bold text-sm text-flop-ice">
                {result.verified ? "Signature Cryptographically VALID" : "Signature Verification FAILED"}
              </span>
            </div>

            <div className="text-xs text-slate-300">{result.reason}</div>

            {result.payloadCovered && (
              <div className="p-3 rounded-lg bg-surface border border-surface-border space-y-1">
                <div className="text-[11px] text-flop-grey">Canonical Payload Covered:</div>
                <div className="text-flop-ice break-all">{result.payloadCovered}</div>
              </div>
            )}
          </div>
        )}

        {/* Link to Continuum Merkle Proof Verifier */}
        <div className="p-4 rounded-xl bg-surface-raised border border-surface-border flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="text-xs font-mono font-bold text-flop-ice flex items-center gap-2">
              <Database className="w-4 h-4 text-flop-blue" />
              <span>Looking for Continuum Merkle Proof Verification?</span>
            </div>
            <p className="text-[11px] text-flop-grey font-sans">
              Verify historical inclusion proofs in published Continuum archive block roots.
            </p>
          </div>

          <Link
            href="/continuum/verify"
            className="px-3.5 py-1.5 rounded-lg bg-flop-blue text-flop-ice font-mono text-xs font-bold hover:bg-flop-blue/90 transition-all flex items-center gap-1 shrink-0"
          >
            <span>Merkle Verifier</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
