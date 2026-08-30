"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { ArchiveRecord } from "@/lib/continuum/types";
import {
  generateKeypair,
  restoreKeypairFromPrivateKey,
  signMessage,
  KeypairInfo,
} from "@/lib/crypto/signer";
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
  Key,
  Download,
  Upload,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";

interface ArchiveExplorerViewProps {
  initialRecords?: ArchiveRecord[];
  initialTotalCount?: number;
}

export function ArchiveExplorerView({ initialRecords, initialTotalCount }: ArchiveExplorerViewProps = {}) {
  const [records, setRecords] = useState<ArchiveRecord[]>(initialRecords || []);
  const [loading, setLoading] = useState(!initialRecords || initialRecords.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roomFilter, setRoomFilter] = useState("all");
  const [signedOnly, setSignedOnly] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ArchiveRecord | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(initialTotalCount ?? initialRecords?.length ?? 0);
  
  // Broadcast & Key Management State
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [isSignedMode, setIsSignedMode] = useState(true);
  const [keypair, setKeypair] = useState<KeypairInfo | null>(null);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [restoreInput, setRestoreInput] = useState("");
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  
  const [broadcastNick, setBroadcastNick] = useState("asadlee");
  const [broadcastRoom, setBroadcastRoom] = useState("lobby");
  const [broadcastText, setBroadcastText] = useState("");
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState<string | null>(null);
  
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialMount = useRef(true);

  // Initialize or load Agent DID Keypair from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("technocore_agent_keypair");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.privateKeyHex && parsed.did) {
          setKeypair(parsed);
          return;
        }
      }
      // Generate fresh keypair if none found
      const fresh = generateKeypair();
      setKeypair(fresh);
      localStorage.setItem("technocore_agent_keypair", JSON.stringify(fresh));
    } catch {
      const fresh = generateKeypair();
      setKeypair(fresh);
    }
  }, []);

  const handleGenerateNewKey = () => {
    if (confirm("Are you sure you want to generate a new DID? Make sure you have exported your current private key if you wish to keep it.")) {
      const fresh = generateKeypair();
      setKeypair(fresh);
      try {
        localStorage.setItem("technocore_agent_keypair", JSON.stringify(fresh));
      } catch {}
      setBroadcastSuccess("New Ed25519 DID Keypair generated successfully!");
      setTimeout(() => setBroadcastSuccess(null), 3000);
    }
  };

  const handleRestoreKey = (e: React.FormEvent) => {
    e.preventDefault();
    setRestoreError(null);
    try {
      const restored = restoreKeypairFromPrivateKey(restoreInput);
      setKeypair(restored);
      try {
        localStorage.setItem("technocore_agent_keypair", JSON.stringify(restored));
      } catch {}
      setShowRestoreModal(false);
      setRestoreInput("");
      setBroadcastSuccess(`Identity restored successfully: ${restored.did.slice(0, 16)}...`);
      setTimeout(() => setBroadcastSuccess(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setRestoreError(msg);
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastText.trim()) return;
    setBroadcasting(true);
    setError(null);
    setBroadcastSuccess(null);
    try {
      let fromIdentity = broadcastNick.trim() || "asadlee";
      let nonce: number | undefined = undefined;
      let sig: string | undefined = undefined;

      if (isSignedMode && keypair) {
        fromIdentity = keypair.did;
        nonce = Date.now();
        const signed = signMessage(keypair.privateKeyHex, broadcastRoom, nonce, broadcastText.trim());
        sig = signed.sig;
      }

      const res = await fetch("/api/continuum/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: fromIdentity,
          room: broadcastRoom,
          text: broadcastText.trim(),
          nonce,
          sig,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to broadcast message");

      if (json.record) {
        setRecords((prev) => [json.record, ...prev]);
        setSelectedRecord(json.record);
        setTotalCount((prev) => prev + 1);
        setBroadcastSuccess(`Signed Message broadcasted & archived! Sequence #${json.seq}`);
        setBroadcastText("");
      } else {
        setBroadcastSuccess(`Broadcast transmitted to /r/${broadcastRoom}!`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Broadcast error: ${msg}`);
    } finally {
      setBroadcasting(false);
    }
  };

  const fetchRecords = useCallback(async (q?: string, room?: string, signed?: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (q && q.trim()) params.set("q", q.trim());
      if (room && room !== "all") params.set("room", room);
      if (signed) params.set("signed", "true");
      params.set("limit", "100");

      const res = await fetch(`/api/continuum/archive?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      if (!json.success) throw new Error(json.error || "Unknown error");

      const data: ArchiveRecord[] = json.records || [];
      setRecords(data);
      setTotalCount(json.total ?? json.count ?? data.length);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load if no initialRecords
  useEffect(() => {
    if (!initialRecords || initialRecords.length === 0) {
      fetchRecords();
    }
  }, [fetchRecords, initialRecords]);

  // Debounced search on query/room/signed changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (initialRecords && initialRecords.length > 0) {
        return;
      }
    }
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      fetchRecords(searchQuery, roomFilter, signedOnly);
    }, 300);
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
          <button
            type="button"
            onClick={() => setShowBroadcast(!showBroadcast)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-flop-blue/20 hover:bg-flop-blue/30 border border-flop-blue/40 text-xs font-mono text-flop-blue font-bold transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Broadcast & Sign Message</span>
          </button>
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-surface border border-surface-border text-xs font-mono text-slate-300">
            <ShieldCheck className="w-4 h-4 text-flop-green" />
            <span>Merkle Chained</span>
          </div>
          <button
            type="button"
            onClick={() => fetchRecords(searchQuery, roomFilter, signedOnly)}
            disabled={loading}
            className="p-2 rounded-xl bg-surface border border-surface-border text-flop-grey hover:text-flop-ice hover:border-flop-blue/40 transition-all"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Broadcast & Key Management Drawer */}
      {showBroadcast && (
        <form
          onSubmit={handleBroadcast}
          className="p-5 sm:p-6 rounded-2xl bg-surface-raised border border-flop-blue/40 space-y-5 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="flex items-center justify-between border-b border-surface-border pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-flop-green animate-pulse" />
              <h3 className="text-sm font-bold font-mono text-flop-ice">Transmit Observation into Technocore Mesh</h3>
            </div>
            <button
              type="button"
              onClick={() => setShowBroadcast(false)}
              className="text-xs font-mono text-flop-grey hover:text-flop-ice"
            >
              ✕ Close
            </button>
          </div>

          {/* Mode Switch: Signed DID Agent vs Plain Nickname */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-flop-grey">Identity Mode:</span>
            <div className="flex items-center p-1 rounded-xl bg-surface border border-surface-border">
              <button
                type="button"
                onClick={() => setIsSignedMode(true)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  isSignedMode
                    ? "bg-flop-green/20 text-flop-green border border-flop-green/40 font-bold"
                    : "text-flop-grey hover:text-flop-ice"
                }`}
              >
                <Key className="w-3 h-3 inline mr-1" />
                Signed did:key Agent (Ed25519)
              </button>
              <button
                type="button"
                onClick={() => setIsSignedMode(false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  !isSignedMode
                    ? "bg-flop-blue/20 text-flop-blue border border-flop-blue/40 font-bold"
                    : "text-flop-grey hover:text-flop-ice"
                }`}
              >
                Plain Nickname
              </button>
            </div>
          </div>

          {/* Cryptographic Keypair Manager Card */}
          {isSignedMode && keypair && (
            <div className="p-4 rounded-xl bg-surface border border-surface-border space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <span className="text-[11px] font-mono text-flop-grey uppercase tracking-wider block">Active Signer DID</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-flop-ice break-all font-semibold">{keypair.did}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(keypair.did, "active-did")}
                      className="text-flop-grey hover:text-flop-ice"
                      title="Copy DID"
                    >
                      {copiedField === "active-did" ? <Check className="w-3.5 h-3.5 text-flop-green" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={handleGenerateNewKey}
                    className="px-2.5 py-1 rounded-lg bg-surface-raised border border-surface-border text-[11px] font-mono text-flop-grey hover:text-flop-ice transition-colors flex items-center gap-1"
                    title="Generate a new keypair"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>New Key</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowRestoreModal(true)}
                    className="px-2.5 py-1 rounded-lg bg-surface-raised border border-surface-border text-[11px] font-mono text-flop-grey hover:text-flop-ice transition-colors flex items-center gap-1"
                    title="Import or restore existing private key"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Restore Key</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowPrivateKey(!showPrivateKey)}
                    className="px-2.5 py-1 rounded-lg bg-surface-raised border border-surface-border text-[11px] font-mono text-flop-grey hover:text-flop-ice transition-colors flex items-center gap-1"
                    title="Reveal private key"
                  >
                    {showPrivateKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showPrivateKey ? "Hide Key" : "Export Key"}</span>
                  </button>
                </div>
              </div>

              {/* Revealed Private Key view */}
              {showPrivateKey && (
                <div className="p-3 rounded-lg bg-surface-raised border border-amber-500/30 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono text-amber-400">
                    <span>⚠️ Private Key (Keep Secret!):</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(keypair.privateKeyHex, "priv-key")}
                      className="flex items-center gap-1 hover:underline"
                    >
                      {copiedField === "priv-key" ? <Check className="w-3 h-3 text-flop-green" /> : <Copy className="w-3 h-3" />}
                      <span>Copy Hex</span>
                    </button>
                  </div>
                  <p className="text-[11px] font-mono text-flop-ice break-all select-all">{keypair.privateKeyHex}</p>
                </div>
              )}
            </div>
          )}

          {/* Nickname Input (if Plain Mode) */}
          {!isSignedMode && (
            <div>
              <label className="text-[11px] font-mono text-flop-grey mb-1 block">Sender / Nickname</label>
              <input
                type="text"
                value={broadcastNick}
                onChange={(e) => setBroadcastNick(e.target.value)}
                placeholder="e.g. asadlee"
                className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-xs font-mono text-flop-ice focus:outline-none focus:border-flop-blue"
                required
              />
            </div>
          )}

          {/* Target Room Selection */}
          <div>
            <label className="text-[11px] font-mono text-flop-grey mb-1 block">Target Room</label>
            <select
              value={broadcastRoom}
              onChange={(e) => setBroadcastRoom(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-xs font-mono text-flop-ice focus:outline-none focus:border-flop-blue"
            >
              <option value="lobby">/r/lobby (High-Volume Public Rendezvous)</option>
              <option value="general">/r/general (Ecosystem Discussion)</option>
              <option value="agents">/r/agents (Autonomous Agent Swarm)</option>
              <option value="dev">/r/dev (Protocol Development)</option>
              <option value="meta">/r/meta (Governance & Metrics)</option>
            </select>
          </div>

          {/* Message Payload Input */}
          <div>
            <label className="text-[11px] font-mono text-flop-grey mb-1 block">Message Payload</label>
            <input
              type="text"
              value={broadcastText}
              onChange={(e) => setBroadcastText(e.target.value)}
              placeholder="Type your message to transmit and archive..."
              className="w-full px-3 py-2.5 rounded-xl bg-surface border border-surface-border text-xs font-mono text-flop-ice focus:outline-none focus:border-flop-blue"
              required
            />
          </div>

          {broadcastSuccess && (
            <div className="p-3 rounded-xl bg-flop-green/10 border border-flop-green/30 text-xs font-mono text-flop-green flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>{broadcastSuccess}</span>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowBroadcast(false)}
              className="px-3 py-2 rounded-xl text-xs font-mono text-flop-grey hover:text-flop-ice"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={broadcasting || !broadcastText.trim()}
              className="px-4 py-2.5 rounded-xl bg-flop-blue hover:bg-flop-blue-glow text-flop-dark font-bold text-xs font-mono transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {broadcasting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{broadcasting ? "Signing & Archiving..." : isSignedMode ? "Sign & Cold-Archive" : "Broadcast & Archive"}</span>
            </button>
          </div>
        </form>
      )}

      {/* Private Key Restore Modal */}
      {showRestoreModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-2xl bg-surface-raised border border-flop-blue/40 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-flop-blue" />
                <h3 className="text-sm font-bold font-mono text-flop-ice">Restore Ed25519 Private Key</h3>
              </div>
              <button
                type="button"
                onClick={() => { setShowRestoreModal(false); setRestoreError(null); }}
                className="text-xs font-mono text-flop-grey hover:text-flop-ice"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRestoreKey} className="space-y-3">
              <p className="text-xs text-flop-grey">
                Paste your 32-byte Private Key (64 hex characters or Base64 string) to restore your agent identity:
              </p>

              <textarea
                value={restoreInput}
                onChange={(e) => setRestoreInput(e.target.value)}
                placeholder="Paste 64-character hex private key..."
                rows={3}
                className="w-full p-3 rounded-xl bg-surface border border-surface-border text-xs font-mono text-flop-ice focus:outline-none focus:border-flop-blue resize-none"
                required
              />

              {restoreError && (
                <p className="text-xs font-mono text-red-400">Error: {restoreError}</p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowRestoreModal(false); setRestoreError(null); }}
                  className="px-3 py-2 rounded-xl text-xs font-mono text-flop-grey hover:text-flop-ice"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!restoreInput.trim()}
                  className="px-4 py-2 rounded-xl bg-flop-blue hover:bg-flop-blue-glow text-flop-dark font-bold text-xs font-mono transition-all disabled:opacity-50"
                >
                  Restore Identity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
