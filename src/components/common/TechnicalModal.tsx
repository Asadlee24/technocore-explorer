"use client";

import React, { useState } from "react";
import { X, Check, Copy, Shield, Key, Binary, FileJson } from "lucide-react";
import { parseDidKey } from "@/lib/crypto/did";
import { canonicalizeSingleLine } from "@/lib/protocol/parser";
import { verifyMessageSignature } from "@/lib/crypto/verify";

interface TechnicalModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    room?: string;
    seq?: number;
    ts?: string;
    from?: string;
    text?: string;
    nonce?: number | string;
    sig?: string;
    did?: string;
    rawPayload?: Record<string, unknown>;
  };
}

export function TechnicalModal({ isOpen, onClose, data }: TechnicalModalProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const didString = data.did || (data.from?.startsWith("did:key:") ? data.from : undefined);
  const parsedDid = didString ? parseDidKey(didString) : null;
  const canonicalText = data.text ? canonicalizeSingleLine(data.text) : "";
  const coveredPayload =
    data.room && data.nonce !== undefined && data.text
      ? `${data.room.replace(/^\/r\//, "")}|${data.nonce}|${canonicalText}`
      : null;

  let verificationResult = null;
  if (didString && data.room && data.nonce !== undefined && data.text && data.sig) {
    verificationResult = verifyMessageSignature({
      did: didString,
      room: data.room,
      nonce: data.nonce,
      text: data.text,
      sig: data.sig,
    });
  }

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-surface-raised border border-surface-highlight rounded-xl shadow-2xl p-6 space-y-6 text-slate-200 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan">
              <Binary className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">Technical Protocol Inspection</h3>
              <p className="text-xs text-slate-400 font-mono">
                Sequence #{data.seq ?? "N/A"} · {data.room ? `/r/${data.room.replace(/^\/r\//, "")}` : "Event"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Verification Status Banner if signed */}
        {verificationResult && (
          <div
            className={`p-3.5 rounded-lg border flex items-center gap-3 font-mono text-xs ${
              verificationResult.verified
                ? "bg-accent-emerald/10 border-accent-emerald/30 text-accent-emerald"
                : "bg-accent-rose/10 border-accent-rose/30 text-accent-rose"
            }`}
          >
            <Shield className="w-4 h-4 shrink-0" />
            <div className="space-y-0.5">
              <div className="font-bold">
                {verificationResult.verified
                  ? "✓ Local Ed25519 Cryptographic Verification PASSED"
                  : "✗ Verification FAILED"}
              </div>
              <p className="text-[11px] text-slate-300">{verificationResult.reason}</p>
            </div>
          </div>
        )}

        {/* Cryptographic DID Breakdown */}
        {parsedDid && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-accent-cyan font-mono flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5" /> Ed25519 Identity (did:key)
              </span>
              <button
                onClick={() => copyToClipboard(parsedDid.did, "did")}
                className="text-[11px] font-mono text-slate-400 hover:text-white flex items-center gap-1"
              >
                {copiedSection === "did" ? <Check className="w-3 h-3 text-accent-emerald" /> : <Copy className="w-3 h-3" />}
                Copy Full DID
              </button>
            </div>
            <div className="p-3 rounded-lg bg-surface border border-surface-border font-mono text-xs space-y-2">
              <div>
                <span className="text-slate-400">Full DID: </span>
                <span className="text-slate-200 break-all">{parsedDid.did}</span>
              </div>
              <div>
                <span className="text-slate-400">Public Key (Hex): </span>
                <span className="text-accent-cyan break-all">{parsedDid.publicKeyHex}</span>
              </div>
              <div>
                <span className="text-slate-400">Fingerprint (SHA-256): </span>
                <span className="text-accent-purple">{parsedDid.fingerprint}</span>
              </div>
              <div>
                <span className="text-slate-400">Sharded Note Path: </span>
                <span className="text-accent-emerald">{parsedDid.shardPath}</span>
              </div>
            </div>
          </div>
        )}

        {/* Covered Payload Breakdown */}
        {coveredPayload && (
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-accent-amber font-mono">
              Canonical Signature Payload
            </span>
            <div className="p-3 rounded-lg bg-surface border border-surface-border font-mono text-xs space-y-2">
              <div>
                <span className="text-slate-400">Payload Pattern: </span>
                <span className="text-slate-300">&lt;room&gt;|&lt;nonce&gt;|&lt;canonical_text&gt;</span>
              </div>
              <div className="p-2 rounded bg-surface-raised border border-surface-highlight text-accent-amber break-all">
                {coveredPayload}
              </div>
              {data.nonce !== undefined && (
                <div>
                  <span className="text-slate-400">Nonce: </span>
                  <span className="text-slate-200">{String(data.nonce)}</span>
                </div>
              )}
              {data.sig && (
                <div>
                  <span className="text-slate-400">Raw Signature (base64url): </span>
                  <span className="text-slate-400 break-all">{data.sig}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Raw JSON Payload */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
              <FileJson className="w-3.5 h-3.5" /> Raw Protocol JSON
            </span>
            <button
              onClick={() =>
                copyToClipboard(
                  JSON.stringify(data.rawPayload || data, null, 2),
                  "raw"
                )
              }
              className="text-[11px] font-mono text-slate-400 hover:text-white flex items-center gap-1"
            >
              {copiedSection === "raw" ? <Check className="w-3 h-3 text-accent-emerald" /> : <Copy className="w-3 h-3" />}
              Copy JSON
            </button>
          </div>
          <pre className="p-3 rounded-lg bg-surface border border-surface-border font-mono text-[11px] text-slate-300 overflow-x-auto max-h-48">
            {JSON.stringify(data.rawPayload || data, null, 2)}
          </pre>
        </div>

        {/* Footer info */}
        <div className="pt-2 text-[11px] font-mono text-slate-400 border-t border-surface-border flex items-center justify-between">
          <span>Verification performed locally using noble-ed25519</span>
          <span>Zero Server Secrets</span>
        </div>
      </div>
    </div>
  );
}
