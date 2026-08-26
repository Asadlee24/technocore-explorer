"use client";

import React, { useState } from "react";
import { verifyMessageSignature, verifyNoteSignature } from "@/lib/crypto/verify";
import { parseDidKey } from "@/lib/crypto/did";
import { canonicalizeSingleLine } from "@/lib/protocol/parser";
import {
  ShieldCheck,
  ShieldAlert,
  Key,
  CheckCircle,
  XCircle,
  Binary,
  Layers,
  ArrowRight,
  Sparkles,
  Lock,
} from "lucide-react";

export function LocalVerificationPlayground() {
  const [tab, setTab] = useState<"message" | "note">("message");

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
            <div className="p-2 rounded-lg bg-accent-emerald/10 border border-accent-emerald/30 text-accent-emerald">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white">Local Signature Verification</h1>
              <p className="text-xs text-slate-400">
                100% offline client-side Ed25519 pure (RFC 8032) cryptographic verification.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-surface-border text-xs font-mono text-slate-300">
          <Lock className="w-4 h-4 text-accent-emerald" />
          <span>Zero Server Calls • Zero Private Keys</span>
        </div>
      </div>

      {/* Verification Tool Form */}
      <div className="p-6 rounded-2xl bg-surface border border-surface-border space-y-6">
        <form onSubmit={handleVerifyMessage} className="space-y-4">
          <div>
            <label className="text-xs font-mono font-bold text-slate-300 block mb-1">
              Signer Identity (did:key)
            </label>
            <input
              type="text"
              value={msgDid}
              onChange={(e) => setMsgDid(e.target.value)}
              placeholder="did:key:z6Mk..."
              className="w-full px-3 py-2.5 rounded-xl bg-surface-raised border border-surface-border text-xs font-mono text-slate-100 focus:outline-none focus:border-accent-cyan"
            />
            {parsedDid.isValid && (
              <div className="text-[11px] font-mono text-slate-400 mt-1 flex items-center gap-2">
                <span>Public Key Hex: {parsedDid.publicKeyHex}</span>
                <span>•</span>
                <span>Fingerprint: {parsedDid.fingerprint}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono font-bold text-slate-300 block mb-1">
                Room Name
              </label>
              <input
                type="text"
                value={msgRoom}
                onChange={(e) => setMsgRoom(e.target.value)}
                placeholder="e.g. lobby"
                className="w-full px-3 py-2.5 rounded-xl bg-surface-raised border border-surface-border text-xs font-mono text-slate-100 focus:outline-none focus:border-accent-cyan"
              />
            </div>
            <div>
              <label className="text-xs font-mono font-bold text-slate-300 block mb-1">
                Nonce
              </label>
              <input
                type="text"
                value={msgNonce}
                onChange={(e) => setMsgNonce(e.target.value)}
                placeholder="e.g. 1719400000000"
                className="w-full px-3 py-2.5 rounded-xl bg-surface-raised border border-surface-border text-xs font-mono text-slate-100 focus:outline-none focus:border-accent-cyan"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-mono font-bold text-slate-300 block mb-1">
              Message Text
            </label>
            <textarea
              rows={3}
              value={msgText}
              onChange={(e) => setMsgText(e.target.value)}
              placeholder="Message payload string..."
              className="w-full px-3 py-2.5 rounded-xl bg-surface-raised border border-surface-border text-xs font-mono text-slate-100 focus:outline-none focus:border-accent-cyan"
            />
          </div>

          <div>
            <label className="text-xs font-mono font-bold text-slate-300 block mb-1">
              Base64URL Signature (86 chars unpadded)
            </label>
            <input
              type="text"
              value={msgSig}
              onChange={(e) => setMsgSig(e.target.value)}
              placeholder="e.g. 86-char base64url string"
              className="w-full px-3 py-2.5 rounded-xl bg-surface-raised border border-surface-border text-xs font-mono text-slate-100 focus:outline-none focus:border-accent-cyan"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-accent-emerald text-slate-950 font-mono text-xs font-bold hover:bg-accent-emerald/90 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,255,170,0.2)]"
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
                ? "bg-accent-emerald/10 border-accent-emerald/40 text-slate-200"
                : "bg-accent-rose/10 border-accent-rose/40 text-slate-200"
            }`}
          >
            <div className="flex items-center gap-2">
              {result.verified ? (
                <CheckCircle className="w-5 h-5 text-accent-emerald" />
              ) : (
                <XCircle className="w-5 h-5 text-accent-rose" />
              )}
              <span className="font-bold text-sm">
                {result.verified ? "Signature Cryptographically VALID" : "Signature Verification FAILED"}
              </span>
            </div>

            <div className="text-xs text-slate-300">{result.reason}</div>

            {result.payloadCovered && (
              <div className="p-3 rounded-lg bg-background/80 border border-surface-border space-y-1">
                <div className="text-[11px] text-slate-400">Canonical Payload Covered:</div>
                <div className="text-white break-all">{result.payloadCovered}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
