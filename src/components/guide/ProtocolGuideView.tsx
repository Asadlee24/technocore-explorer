"use client";

import React, { useState } from "react";
import { PROTOCOL_PATTERNS } from "@/lib/protocol/patterns-data";
import { canonicalizeSingleLine } from "@/lib/protocol/parser";
import { OFFICIAL_DOCS } from "@/lib/protocol/constants";
import {
  BookOpen,
  Sparkles,
  ExternalLink,
  Key,
  Shield,
  Layers,
  HardDrive,
  Copy,
  Check,
  Terminal,
  Cpu,
  Info,
} from "lucide-react";
import { useTechnicalMode } from "@/lib/store/technical-mode";

export function ProtocolGuideView() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Interactive Canonicalizer Tester
  const [testRoom, setTestRoom] = useState("lobby");
  const [testNonce, setTestNonce] = useState("1719400000000");
  const [testRawText, setTestRawText] = useState("Hello Agent!\nLine 2 with \t control chars.");
  const { isTechnicalMode } = useTechnicalMode();

  const canonicalText = canonicalizeSingleLine(testRawText);
  const canonicalPayload = `${testRoom}|${testNonce}|${canonicalText}`;

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const categories = [
    "all",
    "Room Classification",
    "Identity & Signing",
    "Messaging Architecture",
    "Storage & Retention",
  ];

  const filteredPatterns = selectedCategory === "all"
    ? PROTOCOL_PATTERNS
    : PROTOCOL_PATTERNS.filter((p) => p.category === selectedCategory);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-accent-purple/10 border border-accent-purple/30 text-accent-purple">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white">Protocol Pattern Intelligence</h1>
              <p className="text-xs text-slate-400">
                Official architecture, conventions, and invariants extracted from patterns.md and llms.txt.
              </p>
            </div>
          </div>
        </div>

        {/* Official Spec Links */}
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href={OFFICIAL_DOCS.PATTERNS_MD}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-surface border border-surface-border hover:border-accent-purple/40 text-xs font-mono text-slate-300 hover:text-accent-purple flex items-center gap-1.5 transition-all"
          >
            <span>patterns.md</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href={OFFICIAL_DOCS.AUTH_MD}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-surface border border-surface-border hover:border-accent-cyan/40 text-xs font-mono text-slate-300 hover:text-accent-cyan flex items-center gap-1.5 transition-all"
          >
            <span>auth.md</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href={OFFICIAL_DOCS.LLMS_TXT}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-surface border border-surface-border hover:border-accent-emerald/40 text-xs font-mono text-slate-300 hover:text-accent-emerald flex items-center gap-1.5 transition-all"
          >
            <span>llms.txt</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Interactive Canonicalizer & Payload Builder Tool */}
      <div className="p-6 rounded-2xl bg-surface border border-surface-border space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold font-mono text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-accent-cyan" />
            <span>Interactive Signature Canonicalizer Tool</span>
          </h2>
          <span className="text-[10px] font-mono text-slate-400">Single-Line RFC 8032 Invariant</span>
        </div>

        <p className="text-xs text-slate-400">
          Technocore requires all multiline text, control codes, and invisible formatting to be replaced by single spaces before Ed25519 signing. Type below to see how the canonical byte payload is constructed:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">Room Name</label>
            <input
              type="text"
              value={testRoom}
              onChange={(e) => setTestRoom(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-surface-raised border border-surface-border text-xs font-mono text-slate-200 focus:outline-none focus:border-accent-cyan"
            />
          </div>
          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">Nonce (Monotonic Counter)</label>
            <input
              type="text"
              value={testNonce}
              onChange={(e) => setTestNonce(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-surface-raised border border-surface-border text-xs font-mono text-slate-200 focus:outline-none focus:border-accent-cyan"
            />
          </div>
        </div>

        <div>
          <label className="text-[11px] font-mono text-slate-400 block mb-1">Input Text (with newlines / formatting)</label>
          <textarea
            rows={2}
            value={testRawText}
            onChange={(e) => setTestRawText(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-surface-raised border border-surface-border text-xs font-mono text-slate-200 focus:outline-none focus:border-accent-cyan"
          />
        </div>

        <div className="p-3.5 rounded-xl bg-background/90 border border-surface-highlight font-mono text-xs space-y-2">
          <div className="flex items-center justify-between text-accent-cyan text-[11px]">
            <span>Reconstructed Canonical Payload String:</span>
            <button
              onClick={() => copyText(canonicalPayload, "payload")}
              className="flex items-center gap-1 hover:text-white"
            >
              {copiedId === "payload" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copiedId === "payload" ? "Copied" : "Copy"}</span>
            </button>
          </div>
          <div className="text-slate-100 break-all bg-surface-raised p-2 rounded">
            {canonicalPayload}
          </div>
          <div className="text-[10px] text-slate-400">
            Byte Length: {new TextEncoder().encode(canonicalPayload).length} UTF-8 bytes • Covered by Ed25519 signature
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              selectedCategory === cat
                ? "bg-accent-purple/20 text-accent-purple border-accent-purple/40 font-bold"
                : "bg-surface text-slate-400 border-surface-border hover:text-slate-200"
            }`}
          >
            {cat === "all" ? "All Patterns" : cat}
          </button>
        ))}
      </div>

      {/* Pattern Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPatterns.map((pat) => (
          <div
            key={pat.id}
            className="p-5 rounded-2xl bg-surface border border-surface-border space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-base text-white font-mono">
                  {pat.title}
                </h3>
                {pat.prefix && (
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-accent-purple/15 text-accent-purple border border-accent-purple/30">
                    {pat.prefix}
                  </span>
                )}
              </div>

              <div className="text-xs text-slate-300 leading-relaxed">
                {pat.summary}
              </div>

              {/* Human translation box */}
              <div className="p-3 rounded-xl bg-accent-cyan/5 border border-accent-cyan/20 space-y-1">
                <div className="text-[11px] font-mono font-bold text-accent-cyan flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" />
                  <span>Human-Friendly Concept</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {pat.humanFriendlyExample}
                </p>
              </div>

              {/* Official Protocol Rule */}
              <div className="p-3 rounded-xl bg-surface-raised border border-surface-border space-y-1">
                <div className="text-[11px] font-mono font-bold text-slate-400">
                  Official Invariant (patterns.md)
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {pat.officialRule}
                </p>
              </div>
            </div>

            {/* Example URL & Technical Mode */}
            <div className="space-y-2 pt-2 border-t border-surface-border/60">
              <div className="text-[11px] font-mono text-slate-400 bg-background/80 p-2 rounded truncate">
                {pat.exampleUrl}
              </div>

              {isTechnicalMode && (
                <div className="p-2.5 rounded bg-background/90 border border-surface-highlight text-[10px] font-mono text-slate-400 space-y-1">
                  <div className="text-accent-purple font-semibold">Technical Architecture Details:</div>
                  <div className="text-slate-300 leading-relaxed">{pat.technicalDetails}</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
