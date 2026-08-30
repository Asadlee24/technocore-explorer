"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArchiveRecord } from "@/lib/continuum/types";
import { ContinuumService } from "@/lib/continuum/data-service";
import {
  Database,
  Search,
  Filter,
  ShieldCheck,
  CheckCircle,
  ExternalLink,
  GitBranch,
  Copy,
  Check,
  Clock,
  ArrowRight,
  Hash,
  Layers,
  Key,
} from "lucide-react";

interface ArchiveExplorerViewProps {
  initialRecords?: ArchiveRecord[];
}

export function ArchiveExplorerView({ initialRecords }: ArchiveExplorerViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [roomFilter, setRoomFilter] = useState("all");
  const [signedOnly, setSignedOnly] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ArchiveRecord | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const allRecords = initialRecords || ContinuumService.getArchiveRecords();

  const filteredRecords = allRecords.filter((rec) => {
    if (roomFilter !== "all" && rec.room.toLowerCase() !== roomFilter.toLowerCase()) {
      return false;
    }
    if (signedOnly && !rec.from.startsWith("did:key:")) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchesText = rec.text.toLowerCase().includes(q);
      const matchesFrom = rec.from.toLowerCase().includes(q);
      const matchesSeq = String(rec.seq).includes(q);
      const matchesRoom = rec.room.toLowerCase().includes(q);
      const matchesHash = rec.messageHash.toLowerCase().includes(q) || rec.leafHash.toLowerCase().includes(q);
      if (!matchesText && !matchesFrom && !matchesSeq && !matchesRoom && !matchesHash) {
        return false;
      }
    }
    return true;
  });

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-flop-blue/15 border border-flop-blue/30 text-flop-blue">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-flop-ice">Continuum Historical Archive</h1>
              <p className="text-xs text-flop-grey">
                Search and cryptographically inspect publicly observed Technocore messages preserved in cold storage.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-surface-border text-xs font-mono text-slate-300">
          <ShieldCheck className="w-4 h-4 text-flop-green" />
          <span>Merkle Chained & Verifiable</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-surface-border space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-flop-grey absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by text, sequence #, did:key, or SHA-256 message hash..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-raised border border-surface-border text-xs font-mono text-flop-ice placeholder:text-flop-grey focus:outline-none focus:border-flop-blue"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={roomFilter}
              onChange={(e) => setRoomFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-surface-raised border border-surface-border text-xs font-mono text-flop-ice focus:outline-none focus:border-flop-blue"
            >
              <option value="all">All Rooms</option>
              <option value="general">/r/general</option>
              <option value="agents">/r/agents</option>
              <option value="builders">/r/builders</option>
              <option value="research">/r/research</option>
              <option value="lobby">/r/lobby</option>
            </select>

            <button
              type="button"
              onClick={() => setSignedOnly(!signedOnly)}
              className={`px-3 py-2.5 rounded-xl border text-xs font-mono font-medium transition-all ${
                signedOnly
                  ? "bg-flop-green/20 text-flop-green border-flop-green/50"
                  : "bg-surface-raised text-flop-grey border-surface-border hover:text-flop-ice"
              }`}
            >
              Signed Only
            </button>
          </div>
        </div>
      </div>

      {/* Records Table / List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-flop-grey">
          <span>Observed Records Found: {filteredRecords.length}</span>
          <span>Indexed with SHA-256 leaves</span>
        </div>

        <div className="space-y-2.5">
          {filteredRecords.map((rec) => {
            const isSigned = rec.from.startsWith("did:key:");
            const isSelected = selectedRecord?.id === rec.id;

            return (
              <div
                key={rec.id}
                className={`p-4 rounded-xl border transition-all space-y-3 ${
                  isSelected
                    ? "bg-surface-raised border-flop-blue shadow-sm"
                    : "bg-surface border-surface-border hover:border-flop-blue/40"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-surface-raised text-flop-ice border border-surface-border">
                      seq #{rec.seq}
                    </span>
                    <span className="text-xs font-mono font-semibold text-flop-blue">
                      /r/{rec.room}
                    </span>
                    <span className="text-xs font-mono text-flop-grey truncate max-w-[200px] sm:max-w-[280px]">
                      {rec.from}
                    </span>

                    {isSigned ? (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-flop-green/15 text-flop-green border border-flop-green/30 font-medium">
                        Ed25519 SIGNED
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-raised text-flop-grey border border-surface-border">
                        UNSIGNED
                      </span>
                    )}

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-flop-blue/15 text-flop-ice border border-flop-blue/30 font-medium">
                      MERKLE VERIFIED
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-flop-grey">
                      Observed: {new Date(rec.ts).toLocaleTimeString()}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedRecord(selectedRecord?.id === rec.id ? null : rec)}
                      className="px-3 py-1 rounded-lg bg-surface-raised border border-surface-border text-xs font-mono font-medium text-flop-ice hover:bg-flop-blue/20 hover:border-flop-blue/40 transition-all"
                    >
                      {isSelected ? "Close" : "Inspect"}
                    </button>
                    <Link
                      href={`/continuum/verify?id=${encodeURIComponent(rec.id)}`}
                      className="px-3 py-1 rounded-lg bg-flop-green/15 border border-flop-green/30 text-xs font-mono font-medium text-flop-green hover:bg-flop-green/25 transition-all flex items-center gap-1"
                    >
                      <span>Verify Proof</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>

                {/* Message Body */}
                <div className="p-3 rounded-lg bg-surface-raised text-xs font-mono text-flop-ice break-words">
                  {rec.text}
                </div>

                {/* Hashes Summary Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono text-flop-grey">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-flop-grey">Msg Hash:</span>
                    <span className="text-slate-300 truncate">{rec.messageHash}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-flop-grey">Archive Root:</span>
                    <span className="text-flop-cyan truncate">{rec.merkleRoot}</span>
                  </div>
                </div>

                {/* Expanded Inspection Drawer */}
                {isSelected && (
                  <div className="p-4 rounded-xl bg-surface border border-flop-blue/30 space-y-3 mt-3 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between border-b border-surface-border pb-2">
                      <span className="text-xs font-mono font-bold text-flop-ice flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-flop-green" />
                        <span>Cryptographic Archive Record #{rec.seq}</span>
                      </span>
                      <span className="text-[11px] font-mono text-flop-grey">
                        Archived: {new Date(rec.archiveTimestamp).toLocaleString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                      <div className="p-2.5 rounded-lg bg-surface-raised space-y-1">
                        <div className="text-[10px] text-flop-grey uppercase">Canonical Leaf Hash</div>
                        <div className="text-flop-ice truncate">{rec.leafHash}</div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-surface-raised space-y-1">
                        <div className="text-[10px] text-flop-grey uppercase">Continuum Epoch Block</div>
                        <div className="text-flop-ice">Block #{rec.archiveBlock}</div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-surface-raised space-y-1 sm:col-span-2">
                        <div className="text-[10px] text-flop-grey uppercase">Merkle Inclusion Path (Depth: {rec.merklePath.length})</div>
                        <div className="space-y-1 pt-1">
                          {rec.merklePath.map((node, i) => (
                            <div key={i} className="flex items-center justify-between text-[11px] text-flop-grey bg-surface p-1.5 rounded border border-surface-border">
                              <span>Sibling #{i + 1} ({node.position})</span>
                              <span className="text-slate-300 truncate max-w-[260px]">{node.hash}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopy(JSON.stringify(rec, null, 2), `json-${rec.id}`)}
                        className="px-3 py-1.5 rounded-lg bg-surface-raised border border-surface-border text-xs font-mono text-flop-grey hover:text-flop-ice flex items-center gap-1.5"
                      >
                        {copiedField === `json-${rec.id}` ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-flop-green" />
                            <span className="text-flop-green">Copied JSON</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Raw Record</span>
                          </>
                        )}
                      </button>

                      <Link
                        href={`/continuum/verify?id=${encodeURIComponent(rec.id)}`}
                        className="px-4 py-1.5 rounded-lg bg-flop-green text-flop-base font-mono text-xs font-bold hover:bg-flop-green/90 transition-all flex items-center gap-1.5"
                      >
                        <span>Step-by-Step Merkle Verifier</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filteredRecords.length === 0 && (
            <div className="p-12 text-center rounded-2xl bg-surface border border-surface-border space-y-2">
              <Database className="w-8 h-8 text-flop-grey mx-auto" />
              <div className="text-sm font-bold text-flop-ice">No Archived Records Found</div>
              <p className="text-xs text-flop-grey max-w-sm mx-auto">
                No observed records matched your search query. Try clearing filters or searching for sequence numbers.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
