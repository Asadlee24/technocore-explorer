"use client";

import React, { useState } from "react";
import {
  Binary,
  Key,
  ShieldCheck,
  Eye,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Code2,
} from "lucide-react";
import { parseDidKey } from "@/lib/crypto/did";
import { canonicalizeSingleLine } from "@/lib/protocol/parser";
import { useAudioSettings } from "@/lib/store/audio-settings";
import bs58 from "bs58";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils";

export function PayloadDecoder() {
  const { playSound } = useAudioSettings();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Tab
  const [activeTab, setActiveTab] = useState<"did" | "sig" | "canonical" | "converter">("did");

  // DID Input
  const [inputDid, setInputDid] = useState(
    "did:key:z6MkgapAoAJZ78ybHYX3vNny5Qd9UZSU8MmKNwDpAzGubRG4"
  );

  // Signature Input
  const [inputSig, setInputSig] = useState(
    "3j4k9L0mNoPqRsTuVwXyZ1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUV_12345678"
  );

  // Canonicalizer Input
  const [inputRawText, setInputRawText] = useState(
    "Line 1 with \n line break and \t tab and \u200B zero-width space!"
  );

  // Converter inputs
  const [convHex, setConvHex] = useState("0466c800b4d832d74b");
  const [convText, setConvText] = useState("");

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    playSound("tick");
    setTimeout(() => setCopiedField(null), 2000);
  };

  // DID Dissection
  const parsedDid = parseDidKey(inputDid.trim());

  // Signature Dissection
  const dissectSignature = (base64url: string) => {
    try {
      let b64 = base64url.trim().replace(/-/g, "+").replace(/_/g, "/");
      while (b64.length % 4 !== 0) b64 += "=";
      const binary = atob(b64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      if (bytes.length !== 64) {
        return { valid: false, error: `Invalid signature length: ${bytes.length} bytes (expected 64 bytes)` };
      }
      const rBytes = bytes.slice(0, 32);
      const sBytes = bytes.slice(32, 64);
      return {
        valid: true,
        totalBytes: 64,
        hexFull: bytesToHex(bytes),
        rHex: bytesToHex(rBytes),
        sHex: bytesToHex(sBytes),
      };
    } catch {
      return { valid: false, error: "Failed to decode Base64URL string" };
    }
  };

  const sigDissection = dissectSignature(inputSig);
  const canonicalOutput = canonicalizeSingleLine(inputRawText);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-surface-border bg-gradient-to-r from-flop-base via-surface-card to-flop-base p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-flop-cyan/20 text-flop-cyan border border-flop-cyan/30">
                <Binary className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-flop-ice">
                Cryptographic Byte & Payload Hex Decoder
              </h1>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-flop-blue/15 text-flop-cyan border border-flop-blue/30">
                Low-Level Inspector
              </span>
            </div>
            <p className="text-xs sm:text-sm text-flop-grey font-mono max-w-2xl">
              Inspect multicodec byte prefixes, dissect Ed25519 64-byte scalar points, and visualize invisible control character canonicalization.
            </p>
          </div>
        </div>
      </div>

      {/* Tab Selectors */}
      <div className="flex items-center gap-2 border-b border-surface-border pb-2 overflow-x-auto">
        {[
          { id: "did", label: "W3C DID Dissector", icon: Key },
          { id: "sig", label: "Ed25519 Sig Dissector", icon: ShieldCheck },
          { id: "canonical", label: "Control Byte Inspector", icon: Eye },
          { id: "converter", label: "Base58 / Hex Converter", icon: Code2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as typeof activeTab);
                playSound("tick");
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all whitespace-nowrap ${
                isActive
                  ? "bg-flop-blue text-flop-ice font-bold shadow-sm"
                  : "bg-surface-raised text-flop-grey hover:text-flop-ice hover:bg-surface-highlight"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: DID Dissector */}
      {activeTab === "did" && (
        <div className="rounded-2xl border border-surface-border bg-[#0c1636] p-6 space-y-5 shadow-sm">
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-flop-ice">
              Enter W3C `did:key:z6Mk...` string
            </label>
            <input
              type="text"
              value={inputDid}
              onChange={(e) => setInputDid(e.target.value)}
              placeholder="did:key:z6Mk..."
              className="w-full px-4 py-2.5 rounded-xl bg-[#0a1128] border border-surface-border text-xs font-mono text-flop-ice focus:outline-none focus:border-flop-cyan"
            />
          </div>

          {parsedDid.isValid ? (
            <div className="space-y-4 pt-2 border-t border-surface-border font-mono text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#0a1128] border border-surface-border space-y-1">
                  <span className="text-[10px] text-flop-grey uppercase">Multicodec Identifier</span>
                  <p className="text-flop-cyan font-bold">0xed01 (Ed25519 Public Key)</p>
                  <p className="text-[10px] text-flop-grey/70">W3C DID prefix for Ed25519 keys</p>
                </div>

                <div className="p-4 rounded-xl bg-[#0a1128] border border-surface-border space-y-1">
                  <span className="text-[10px] text-flop-grey uppercase">SHA-256 Fingerprint (16 hex)</span>
                  <p className="text-flop-green font-bold break-all">{parsedDid.fingerprint}</p>
                  <p className="text-[10px] text-flop-grey/70">First 16 hex chars of SHA-256(did:key)</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0a1128] border border-surface-border space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-flop-grey uppercase">32-Byte Raw Public Key (Hex):</span>
                  <button
                    onClick={() => copyToClipboard(parsedDid.publicKeyHex || "", "pub")}
                    className="text-[10px] text-flop-cyan hover:underline"
                  >
                    {copiedField === "pub" ? "Copied!" : "Copy Hex"}
                  </button>
                </div>
                <p className="text-flop-ice break-all bg-[#13214a] p-2 rounded border border-surface-border">
                  {parsedDid.publicKeyHex}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0a1128] border border-surface-border space-y-1">
                <span className="text-[10px] text-flop-grey uppercase">Sharded KV Note Route:</span>
                <p className="text-flop-blue break-all font-bold">
                  /kv/did-{parsedDid.fingerprint?.slice(0, 2)}/{parsedDid.fingerprint?.slice(2, 16)}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-mono">
              Invalid or unparseable `did:key` string. Ensure it starts with `did:key:z6Mk`.
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Signature Dissector */}
      {activeTab === "sig" && (
        <div className="rounded-2xl border border-surface-border bg-[#0c1636] p-6 space-y-5 shadow-sm">
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-flop-ice">
              Enter 86-character Base64URL Signature
            </label>
            <input
              type="text"
              value={inputSig}
              onChange={(e) => setInputSig(e.target.value)}
              placeholder="Base64url signature..."
              className="w-full px-4 py-2.5 rounded-xl bg-[#0a1128] border border-surface-border text-xs font-mono text-flop-ice focus:outline-none focus:border-flop-cyan"
            />
          </div>

          {sigDissection.valid ? (
            <div className="space-y-4 pt-2 border-t border-surface-border font-mono text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#0a1128] border border-surface-border space-y-1.5">
                  <span className="text-[10px] text-flop-grey uppercase">`R` Point (First 32 Bytes)</span>
                  <p className="text-flop-cyan break-all bg-[#13214a] p-2 rounded border border-surface-border">
                    {sigDissection.rHex}
                  </p>
                  <p className="text-[10px] text-flop-grey/70">Compressed Edwards curve point</p>
                </div>

                <div className="p-4 rounded-xl bg-[#0a1128] border border-surface-border space-y-1.5">
                  <span className="text-[10px] text-flop-grey uppercase">`S` Scalar (Second 32 Bytes)</span>
                  <p className="text-flop-green break-all bg-[#13214a] p-2 rounded border border-surface-border">
                    {sigDissection.sHex}
                  </p>
                  <p className="text-[10px] text-flop-grey/70">Integer scalar modulo L (2^252 + ...)</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0a1128] border border-surface-border space-y-1">
                <span className="text-[10px] text-flop-grey uppercase">Complete 64-Byte Raw Hex:</span>
                <p className="text-flop-ice break-all bg-[#13214a] p-2 rounded border border-surface-border text-[11px]">
                  {sigDissection.hexFull}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
              {sigDissection.error}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Control Character Inspector */}
      {activeTab === "canonical" && (
        <div className="rounded-2xl border border-surface-border bg-[#0c1636] p-6 space-y-5 shadow-sm">
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-flop-ice">
              Test Raw String (with newlines, tabs, control characters)
            </label>
            <textarea
              rows={3}
              value={inputRawText}
              onChange={(e) => setInputRawText(e.target.value)}
              placeholder="Paste raw string..."
              className="w-full px-4 py-2.5 rounded-xl bg-[#0a1128] border border-surface-border text-xs font-mono text-flop-ice focus:outline-none focus:border-flop-cyan resize-none"
            />
          </div>

          <div className="space-y-4 pt-2 border-t border-surface-border font-mono text-xs">
            <div className="p-4 rounded-xl bg-[#0a1128] border border-surface-border space-y-2">
              <span className="text-[10px] text-flop-grey uppercase">
                Single-Line Canonicalized Output (Covered by Signature):
              </span>
              <p className="text-flop-cyan break-all bg-[#13214a] p-3 rounded-lg border border-surface-border">
                {canonicalOutput}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface-raised border border-surface-border text-xs text-flop-grey space-y-1">
              <span className="text-flop-ice font-bold">Technocore Rule:</span>
              <p className="text-[11px] leading-relaxed">
                Invisible control characters (including `\r`, `\n`, ANSI sequences, formatting marks) are replaced with a single ASCII space `0x20` before cryptographic signing and storage.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Format Converter */}
      {activeTab === "converter" && (
        <div className="rounded-2xl border border-surface-border bg-[#0c1636] p-6 space-y-5 shadow-sm font-mono text-xs">
          <div className="space-y-2">
            <label className="font-bold text-flop-ice">Hex to Base58 / UTF-8</label>
            <input
              type="text"
              value={convHex}
              onChange={(e) => setConvHex(e.target.value)}
              placeholder="Hex bytes e.g. 0466c8..."
              className="w-full px-4 py-2 rounded-xl bg-[#0a1128] border border-surface-border text-flop-ice focus:outline-none focus:border-flop-cyan"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#0a1128] border border-surface-border space-y-1">
              <span className="text-[10px] text-flop-grey uppercase">Base58BTC:</span>
              <p className="text-flop-cyan break-all">
                {(() => {
                  try {
                    return bs58.encode(hexToBytes(convHex.trim()));
                  } catch {
                    return "Invalid hex string";
                  }
                })()}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#0a1128] border border-surface-border space-y-1">
              <span className="text-[10px] text-flop-grey uppercase">Base64URL:</span>
              <p className="text-flop-green break-all">
                {(() => {
                  try {
                    const bytes = hexToBytes(convHex.trim());
                    let bin = "";
                    bytes.forEach((b) => (bin += String.fromCharCode(b)));
                    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
                  } catch {
                    return "Invalid hex string";
                  }
                })()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
