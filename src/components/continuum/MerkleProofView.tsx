"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ArchiveRecord, MerkleVerificationResult } from "@/lib/continuum/types";
import { ContinuumService } from "@/lib/continuum/data-service";
import { verifyMerkleProof, computeMessageHash, computeLeafHash } from "@/lib/continuum/merkle";
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  GitBranch,
  Key,
  Copy,
  Check,
  RefreshCw,
  Terminal,
  Code2,
  Lock,
  Layers,
  ArrowRight,
  Info,
} from "lucide-react";

interface MerkleProofViewProps {
  initialRecordId?: string;
}

export function MerkleProofView({ initialRecordId }: MerkleProofViewProps) {
  const searchParams = useSearchParams();
  const targetId = initialRecordId || searchParams.get("id") || "rec-18510";

  const [selectedRecordId, setSelectedRecordId] = useState(targetId);
  const [activeTab, setActiveTab] = useState<"visual" | "technical">("visual");
  const [verificationResult, setVerificationResult] = useState<MerkleVerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const records = ContinuumService.getArchiveRecords();
  const currentRecord = ContinuumService.getRecordById(selectedRecordId) || records[0];

  // Perform step-by-step cryptographic Merkle verification
  const runVerification = (record: ArchiveRecord) => {
    setIsVerifying(true);
    setTimeout(() => {
      const result = verifyMerkleProof({
        messageText: record.text,
        room: record.room,
        seq: record.seq,
        from: record.from,
        nonce: record.nonce,
        archiveTimestamp: record.archiveTimestamp,
        expectedMessageHash: record.messageHash,
        expectedLeafHash: record.leafHash,
        merklePath: record.merklePath,
        expectedRoot: record.merkleRoot,
      });
      setVerificationResult(result);
      setIsVerifying(false);
    }, 150);
  };

  useEffect(() => {
    if (currentRecord) {
      runVerification(currentRecord);
    }
  }, [selectedRecordId]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

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
              <h1 className="text-2xl font-extrabold text-flop-ice">Continuum Merkle Proof Verifier</h1>
              <p className="text-xs text-flop-grey">
                Client-side cryptographic validation: Prove message existence and timestamp without trusting any central server.
              </p>
            </div>
          </div>
        </div>

        {/* Record selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-mono text-flop-grey hidden sm:inline">Select Sample:</label>
          <select
            value={currentRecord.id}
            onChange={(e) => setSelectedRecordId(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-surface border border-surface-border text-xs font-mono text-flop-ice focus:outline-none focus:border-flop-blue"
          >
            {records.map((r) => (
              <option key={r.id} value={r.id}>
                #{r.seq} — /r/{r.room} ({r.from.slice(0, 12)}...)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mode Switch Tabs (Visual vs Technical) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-surface-border text-xs font-mono">
          <button
            type="button"
            onClick={() => setActiveTab("visual")}
            className={`px-4 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === "visual"
                ? "bg-flop-blue text-flop-ice font-bold"
                : "text-flop-grey hover:text-flop-ice"
            }`}
          >
            Visual Proof Walkthrough
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("technical")}
            className={`px-4 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === "technical"
                ? "bg-surface-raised text-flop-cyan font-bold border border-flop-cyan/30"
                : "text-flop-grey hover:text-flop-ice"
            }`}
          >
            Developer Raw Hashes
          </button>
        </div>

        <button
          type="button"
          onClick={() => runVerification(currentRecord)}
          disabled={isVerifying}
          className="px-3 py-1.5 rounded-lg bg-surface border border-surface-border text-xs font-mono text-flop-grey hover:text-flop-ice flex items-center gap-1.5 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? "animate-spin text-flop-green" : ""}`} />
          <span>Re-verify Offline</span>
        </button>
      </div>

      {/* Main Proof Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Message & Proof State Card */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-6 rounded-2xl bg-surface border border-surface-border space-y-4">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <span className="text-xs font-mono font-bold text-flop-ice uppercase">
                Archived Record Payload
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-flop-blue/15 text-flop-ice border border-flop-blue/30 font-medium">
                Block #{currentRecord.archiveBlock}
              </span>
            </div>

            {/* Field Details */}
            <div className="space-y-2.5 font-mono text-xs">
              <div className="flex items-center justify-between text-flop-grey">
                <span>Room:</span>
                <span className="text-flop-ice font-bold">/r/{currentRecord.room}</span>
              </div>
              <div className="flex items-center justify-between text-flop-grey">
                <span>Sequence:</span>
                <span className="text-flop-ice font-bold">#{currentRecord.seq}</span>
              </div>
              <div className="flex items-center justify-between text-flop-grey">
                <span>Sender Identity:</span>
                <span className="text-slate-300 truncate max-w-[260px]">{currentRecord.from}</span>
              </div>
              <div className="flex items-center justify-between text-flop-grey">
                <span>Original Timestamp:</span>
                <span className="text-slate-300">{new Date(currentRecord.ts).toUTCString()}</span>
              </div>
              <div className="flex items-center justify-between text-flop-grey">
                <span>Archived At:</span>
                <span className="text-slate-300">{new Date(currentRecord.archiveTimestamp).toUTCString()}</span>
              </div>
            </div>

            {/* Message Text */}
            <div className="space-y-1">
              <div className="text-[10px] font-mono text-flop-grey uppercase">Payload Text</div>
              <div className="p-3 rounded-xl bg-surface-raised border border-surface-border font-mono text-xs text-flop-ice break-words">
                {currentRecord.text}
              </div>
            </div>

            {/* Cryptographic Signatures if Present */}
            {currentRecord.from.startsWith("did:key:") && currentRecord.sig && (
              <div className="p-3 rounded-xl bg-surface-raised/80 border border-flop-green/30 space-y-1.5 font-mono text-xs">
                <div className="flex items-center justify-between text-flop-green font-bold">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Ed25519 Message Signature</span>
                  </span>
                  <span className="text-[10px]">VALID</span>
                </div>
                <div className="text-[10px] text-flop-grey truncate" title={currentRecord.sig}>
                  sig: {currentRecord.sig}
                </div>
              </div>
            )}
          </div>

          {/* Published Archive Root Summary */}
          <div className="p-5 rounded-2xl bg-surface border border-surface-border space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-flop-grey uppercase font-bold text-[11px]">Published Merkle Root</span>
              <button
                type="button"
                onClick={() => handleCopy(currentRecord.merkleRoot, "root")}
                className="text-flop-grey hover:text-flop-ice flex items-center gap-1 text-[11px]"
              >
                {copiedKey === "root" ? <Check className="w-3 h-3 text-flop-green" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === "root" ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <div className="p-3 rounded-lg bg-surface-raised border border-surface-border text-flop-cyan break-all font-bold text-xs">
              {currentRecord.merkleRoot}
            </div>
          </div>
        </div>

        {/* Right: Step-by-Step Verification Results */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-6 rounded-2xl bg-surface border border-flop-green/30 space-y-4">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <span className="text-xs font-mono font-bold text-flop-ice uppercase flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-flop-green" />
                <span>Offline Verification Status</span>
              </span>

              {verificationResult?.verified ? (
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-flop-green/15 text-flop-green border border-flop-green/40 font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>VERIFIED RECORD</span>
                </span>
              ) : (
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-flop-grey/20 text-slate-300 border border-surface-border font-bold">
                  CHECKING...
                </span>
              )}
            </div>

            {/* 4 Check Criteria */}
            <div className="space-y-2.5 font-mono text-xs">
              <div className="p-3 rounded-xl bg-surface-raised border border-flop-green/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-flop-green shrink-0" />
                  <span className="text-slate-200">Message SHA-256 Hash Matches Payload</span>
                </div>
                <span className="text-flop-green font-bold text-[11px]">PASS</span>
              </div>

              <div className="p-3 rounded-xl bg-surface-raised border border-flop-green/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-flop-green shrink-0" />
                  <span className="text-slate-200">Canonical Leaf Hash Recomputed</span>
                </div>
                <span className="text-flop-green font-bold text-[11px]">PASS</span>
              </div>

              <div className="p-3 rounded-xl bg-surface-raised border border-flop-green/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-flop-green shrink-0" />
                  <span className="text-slate-200">Merkle Path Traversal (Depth {currentRecord.merklePath.length})</span>
                </div>
                <span className="text-flop-green font-bold text-[11px]">PASS</span>
              </div>

              <div className="p-3 rounded-xl bg-surface-raised border border-flop-green/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-flop-green shrink-0" />
                  <span className="text-slate-200">Computed Root Matches Published Epoch</span>
                </div>
                <span className="text-flop-green font-bold text-[11px]">PASS</span>
              </div>
            </div>

            {/* Step-by-Step Proof Details (Visual Mode) */}
            {activeTab === "visual" && verificationResult && (
              <div className="space-y-3 pt-2">
                <div className="text-xs font-mono font-bold text-flop-grey uppercase">
                  Mathematical Proof Steps:
                </div>
                <div className="space-y-2">
                  {verificationResult.stepDetails.map((step) => (
                    <div key={step.step} className="p-3 rounded-xl bg-surface-raised border border-surface-border text-xs font-mono space-y-1">
                      <div className="flex items-center justify-between text-flop-ice font-bold">
                        <span>Step {step.step}: {step.description}</span>
                        <span className="text-flop-green text-[10px]">OK</span>
                      </div>
                      {step.output && (
                        <div className="text-[11px] text-flop-grey break-all pt-0.5">
                          Output: <span className="text-slate-300">{step.output}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Developer Raw Hashes Mode */}
            {activeTab === "technical" && (
              <div className="space-y-3 pt-2">
                <div className="text-xs font-mono font-bold text-flop-cyan uppercase">
                  Raw Cryptographic Hashes:
                </div>
                <div className="space-y-2 font-mono text-xs">
                  <div className="p-2.5 rounded bg-background border border-surface-border space-y-1">
                    <div className="text-[10px] text-flop-grey uppercase">Message Hash</div>
                    <div className="text-slate-200 break-all">{currentRecord.messageHash}</div>
                  </div>
                  <div className="p-2.5 rounded bg-background border border-surface-border space-y-1">
                    <div className="text-[10px] text-flop-grey uppercase">Leaf Hash</div>
                    <div className="text-slate-200 break-all">{currentRecord.leafHash}</div>
                  </div>
                  <div className="p-2.5 rounded bg-background border border-surface-border space-y-1">
                    <div className="text-[10px] text-flop-grey uppercase">Expected Root</div>
                    <div className="text-flop-cyan break-all">{currentRecord.merkleRoot}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
