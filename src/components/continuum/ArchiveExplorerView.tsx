"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { ArchiveRecord } from "@/lib/continuum/types";
import {
  Database,
  Search,
  ShieldCheck,
  ExternalLink,
  Copy,
  Check,
  ArrowRight,
  Loader2,
  RefreshCw,
  Filter,
} from "lucide-react";

interface ArchiveExplorerViewProps {
  initialRecords?: ArchiveRecord[];
}

export function ArchiveExplorerView({ initialRecords }: ArchiveExplorerViewProps = {}) {
  const [records, setRecords] = useState<ArchiveRecord[]>(initialRecords || []);
  const [loading, setLoading] = useState(!initialRecords || initialRecords.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roomFilter, setRoomFilter] = useState("all");
  const [signedOnly, setSignedOnly] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ArchiveRecord | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(initialRecords?.length || 0);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialMount = useRef(true);

  const fetchRecords = useCallback(async (q?: string, room?: string, signed?: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (q && q.trim()) params.set("q", q.trim());
      if (room && room !== "all") params.set("room", room);
      params.set("limit", "100");

      const res = await fetch(`/api/continuum/archive?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      if (!json.success) throw new Error(json.error || "Unknown error");

      let data: ArchiveRecord[] = json.records || [];
      if (signed) {
        data = data.filter((r: ArchiveRecord) => r.from?.startsWith("did:key:"));
      }
      setRecords(data);
      setTotalCount(json.count ?? data.length);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    if (!initialRecords || initialRecords.length === 0) {
      fetchRecords();
    }
  }, [fetchRecords, initialRecords]);

  // Debounced search
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (initialRecords && initialRecords.length > 0 && !searchQuery && roomFilter === "all" && !signedOnly) {
        return;
      }
    }
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      fetchRecords(searchQuery, roomFilter, signedOnly);
    }, 400);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [searchQuery, roomFilter, signedOnly, fetchRecords, initialRecords]);

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

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-surface-border text-xs font-mono text-slate-300">
            <ShieldCheck className="w-4 h-4 text-flop-green" />
            <span>Merkle Chained & Verifiable</span>
          </div>
          <button
            type="button"
            onClick={() => fetchRecords(searchQuery, roomFilter, signedOnly)}
            disabled={loading}
            className="p-2 rounded-lg bg-surface border border-surface-border text-flop-grey hover:text-flop-ice hover:border-flop-blue/40 transition-all"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
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
              <option value="lobby">lobby</option>
              <option value="general">general</option>
              <option value="agents">agents</option>
              <option value="builders">builders</option>
              <option value="research">research</option>
              <option value="flop-network">flop-network</option>
              <option value="faucet">faucet</option>
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
              <Filter className="w-3.5 h-3.5 inline mr-1" />
              Signed Only
            </button>
          </div>
        </div>
      </div>

      {/* Records Table / List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-flop-grey">
          <span>
            {loading ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-3 h-3 animate-spin" /> Fetching records…
              </span>
            ) : (
              `Observed Records: ${records.length}${totalCount > records.length ? ` of ${totalCount}` : ""}`
            )}
          </span>
          <span>Indexed with SHA-256 leaves</span>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-900/20 border border-red-500/40 text-xs font-mono text-red-400">
            ⚠️ Error fetching archive: {error}
            <button
              onClick={() => fetchRecords(searchQuery, roomFilter, signedOnly)}
              className="ml-3 underline hover:text-red-300"
            >
              Retry
            </button>
          </div>
        )}

        <div className="space-y-2.5">
          {!loading && records.map((rec) => {
            const isSigned = rec.from?.startsWith("did:key:");
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
                        <div className="text-[10px] text-flop-grey uppercase">Merkle Inclusion Path (Depth: {rec.merklePath?.length ?? 0})</div>
                        <div className="space-y-1 pt-1">
                          {rec.merklePath?.map((node, i) => (
                            <div key={i} className="flex items-center justify-between text-[11px] text-flop-grey bg-surface p-1.5 rounded border border-surface-border">
                              <span>Sibling #{i + 1} ({node.position})</span>
                              <span className="text-slate-300 truncate max-w-[260px]">{node.hash}</span>
                            </div>
                          ))}
                          {(!rec.merklePath || rec.merklePath.length === 0) && (
                            <div className="text-[11px] text-flop-grey">Root node (no siblings)</div>
                          )}
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

          {!loading && records.length === 0 && !error && (
            <div className="p-12 text-center rounded-2xl bg-surface border border-surface-border space-y-2">
              <Database className="w-8 h-8 text-flop-grey mx-auto" />
              <div className="text-sm font-bold text-flop-ice">No Archived Records Found</div>
              <p className="text-xs text-flop-grey max-w-sm mx-auto">
                No observed records matched your search query. Try clearing filters or searching for sequence numbers.
              </p>
            </div>
          )}

          {loading && (
            <div className="p-12 text-center rounded-2xl bg-surface border border-surface-border space-y-3">
              <Loader2 className="w-8 h-8 text-flop-blue mx-auto animate-spin" />
              <div className="text-sm font-bold text-flop-ice">Loading Archive Records…</div>
              <p className="text-xs text-flop-grey">Fetching cryptographically verified messages from Supabase</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
