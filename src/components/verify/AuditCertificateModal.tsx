"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Download,
  Copy,
  Check,
  X,
  FileCheck,
  QrCode,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { useAudioSettings } from "@/lib/store/audio-settings";

export interface AuditCertificateData {
  title?: string;
  signerDid: string;
  roomOrNs: string;
  nonce: string | number;
  rawPayload: string;
  signature: string;
  verifiedAt: string;
  status: "VALID" | "INVALID";
  merkleRoot?: string;
}

export function AuditCertificateModal({
  isOpen,
  onClose,
  data,
}: {
  isOpen: boolean;
  onClose: () => void;
  data: AuditCertificateData | null;
}) {
  const [copied, setCopied] = useState(false);
  const { playSound } = useAudioSettings();

  if (!isOpen || !data) return null;

  const certificateJson = {
    standard: "Technocore-Audit-Certificate-v1",
    issuer: "Technocore Explorer V2 Forensic Engine",
    spec: "RFC 8032 / SHA-256 Merkle Layer",
    verificationStatus: data.status,
    timestamp: data.verifiedAt,
    target: {
      signerDid: data.signerDid,
      room: data.roomOrNs,
      nonce: data.nonce,
      canonicalPayload: data.rawPayload,
      signatureBase64url: data.signature,
      merkleRoot: data.merkleRoot || null,
    },
    verificationNotice:
      "This document certifies that the above payload was verified cryptographically against the designated Ed25519 public key in accordance with the Technocore protocol specification.",
  };

  const jsonString = JSON.stringify(certificateJson, null, 2);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    playSound("tick");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `technocore-audit-${data.nonce}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    playSound("tick");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-xl bg-[#0c1636] border border-surface-border rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Certificate Card Header */}
        <div className="p-5 border-b border-surface-border bg-[#0a1128] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-flop-green/15 text-flop-green border border-flop-green/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-flop-ice">
                  Cryptographic Audit Certificate
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-flop-green/20 text-flop-green border border-flop-green/40 font-bold">
                  {data.status}
                </span>
              </div>
              <p className="text-xs text-flop-grey font-mono">
                RFC 8032 Pure Ed25519 & SHA-256 Verification Receipt
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-flop-grey hover:text-flop-ice hover:bg-surface-raised transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Body (Visual Receipt) */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Certificate Box */}
          <div className="p-5 rounded-xl bg-flop-base border border-flop-cyan/30 space-y-3 relative overflow-hidden shadow-inner font-mono text-xs">
            <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none">
              <ShieldCheck className="w-32 h-32 text-flop-cyan" />
            </div>

            <div className="flex items-center justify-between border-b border-surface-border pb-2">
              <span className="text-flop-grey uppercase text-[10px]">Document Type</span>
              <span className="text-flop-cyan font-bold">Technocore Audit Receipt</span>
            </div>

            <div className="space-y-1">
              <span className="text-flop-grey text-[10px] uppercase">Signer W3C DID:</span>
              <p className="text-flop-ice break-all bg-surface-raised/60 p-2 rounded border border-surface-border">
                {data.signerDid}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-flop-grey text-[10px] uppercase">Target Room:</span>
                <p className="text-flop-ice font-bold">{data.roomOrNs}</p>
              </div>
              <div>
                <span className="text-flop-grey text-[10px] uppercase">Nonce:</span>
                <p className="text-flop-cyan font-bold">{data.nonce}</p>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-flop-grey text-[10px] uppercase">Canonical Payload:</span>
              <p className="text-flop-ice break-all bg-surface-raised/60 p-2 rounded border border-surface-border">
                {data.rawPayload}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-flop-grey text-[10px] uppercase">Ed25519 Signature (Base64url):</span>
              <p className="text-flop-cyan break-all bg-surface-raised/60 p-2 rounded border border-surface-border text-[11px]">
                {data.signature}
              </p>
            </div>

            {data.merkleRoot && (
              <div className="space-y-1">
                <span className="text-flop-grey text-[10px] uppercase">Epoch Merkle Archive Root:</span>
                <p className="text-flop-green break-all bg-surface-raised/60 p-2 rounded border border-surface-border text-[11px]">
                  {data.merkleRoot}
                </p>
              </div>
            )}

            <div className="pt-2 border-t border-surface-border flex items-center justify-between text-[10px] text-flop-grey">
              <span>Verified: {data.verifiedAt}</span>
              <span className="text-flop-green">Local Pure Engine</span>
            </div>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="p-4 bg-surface-raised/60 border-t border-surface-border flex items-center justify-between gap-3">
          <button
            onClick={handleCopyJson}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-surface-raised hover:bg-surface-border text-flop-ice text-xs font-mono border border-surface-border transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-flop-green" />
                <span>Copied JSON</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Certificate JSON</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadJson}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-flop-blue hover:bg-flop-blue-hover text-flop-ice text-xs font-mono font-semibold shadow-md transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .JSON</span>
          </button>
        </div>
      </div>
    </div>
  );
}
