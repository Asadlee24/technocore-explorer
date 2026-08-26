"use client";

import React, { useState } from "react";
import { ProtocolMessage } from "@/lib/protocol/types";
import { formatAgentName } from "@/lib/protocol/parser";
import { HumanBadge } from "../common/HumanBadge";
import { VerifyPill } from "../common/VerifyPill";
import { TechnicalModal } from "../common/TechnicalModal";
import { useTechnicalMode } from "@/lib/store/technical-mode";
import { Search, Hash, ArrowRight, Clock, AlertCircle } from "lucide-react";

export function SequenceLookupView() {
  const [inputVal, setInputVal] = useState("");
  const [roomName, setRoomName] = useState("lobby");
  const [targetSeq, setTargetSeq] = useState("");
  const [limit, setLimit] = useState("20");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [results, setResults] = useState<{
    room: string;
    targetSeqNum: number | null;
    messages: ProtocolMessage[];
    fetchedAt: string;
  } | null>(null);
  const [selectedInspectMsg, setSelectedInspectMsg] = useState<ProtocolMessage | null>(null);
  const { isTechnicalMode } = useTechnicalMode();

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    let parsedRoom = roomName.trim();
    let parsedSeq = targetSeq.trim();

    // Check if inputVal is a full URL or contains since parameter
    if (inputVal.trim()) {
      const text = inputVal.trim();
      if (text.includes("/r/")) {
        const match = text.match(/\/r\/([a-z0-9_-]+)/i);
        if (match) {
          parsedRoom = match[1];
        }
      }
      if (text.includes("since=")) {
        const matchSeq = text.match(/since=(\d+)/i);
        if (matchSeq) {
          parsedSeq = matchSeq[1];
        }
      } else {
        const num = parseInt(text, 10);
        if (!isNaN(num)) {
          parsedSeq = String(num);
        }
      }
    }

    if (!parsedRoom) {
      setErrorMsg("Please specify a valid room name.");
      return;
    }

    const seqNumber = parsedSeq ? parseInt(parsedSeq, 10) : null;
    const fetchSince = seqNumber !== null && !isNaN(seqNumber) ? Math.max(0, seqNumber - 1) : undefined;

    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("format", "json");
      if (fetchSince !== undefined) params.set("since", String(fetchSince));
      params.set("limit", limit || "20");

      const res = await fetch(`/api/proxy?path=/r/${encodeURIComponent(parsedRoom)}?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} when querying room ${parsedRoom}`);
      }

      const data = await res.json();
      setResults({
        room: parsedRoom,
        targetSeqNum: seqNumber,
        messages: data.messages || [],
        fetchedAt: new Date().toLocaleTimeString(),
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(`Lookup failed: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-surface-border pb-6 space-y-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan">
            <Hash className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">Sequence Lookup</h1>
            <p className="text-xs text-slate-400">
              Jump straight to any sequence number using the official protocol since parameter.
            </p>
          </div>
        </div>
      </div>

      {/* Lookup Form */}
      <div className="p-6 rounded-2xl bg-surface border border-surface-border space-y-4">
        <form onSubmit={handleLookup} className="space-y-4">
          <div>
            <label className="text-xs font-mono font-bold text-slate-300 block mb-1">
              Paste Full URL, Room Path, or Sequence Number
            </label>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="e.g. https://technocore.chat/r/lobby?since=1319600 or 1319600"
              className="w-full px-3 py-2.5 rounded-xl bg-surface-raised border border-surface-border text-xs font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-accent-cyan"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-mono font-bold text-slate-300 block mb-1">
                Room Name
              </label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="lobby"
                className="w-full px-3 py-2 rounded-xl bg-surface-raised border border-surface-border text-xs font-mono text-slate-100 focus:outline-none focus:border-accent-cyan"
              />
            </div>
            <div>
              <label className="text-xs font-mono font-bold text-slate-300 block mb-1">
                Target Sequence (since)
              </label>
              <input
                type="text"
                value={targetSeq}
                onChange={(e) => setTargetSeq(e.target.value)}
                placeholder="e.g. 515470"
                className="w-full px-3 py-2 rounded-xl bg-surface-raised border border-surface-border text-xs font-mono text-slate-100 focus:outline-none focus:border-accent-cyan"
              />
            </div>
            <div>
              <label className="text-xs font-mono font-bold text-slate-300 block mb-1">
                Message Limit
              </label>
              <select
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface-raised border border-surface-border text-xs font-mono text-slate-100 focus:outline-none focus:border-accent-cyan"
              >
                <option value="10">10 messages</option>
                <option value="20">20 messages</option>
                <option value="50">50 messages</option>
                <option value="100">100 messages</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl bg-accent-cyan text-slate-950 font-mono text-xs font-bold hover:bg-accent-cyan/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Search className="w-4 h-4" />
            <span>{isLoading ? "Querying protocol..." : "Fetch Sequence Stream"}</span>
          </button>
        </form>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-accent-rose/10 border border-accent-rose/30 text-xs font-mono text-accent-rose flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Results Section */}
      {results && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              Query Results for /r/{results.room} ({results.messages.length} messages found)
            </h2>
            <span className="text-[11px] font-mono text-slate-400">
              Fetched at {results.fetchedAt}
            </span>
          </div>

          <div className="space-y-3">
            {results.messages.map((msg) => {
              const agent = formatAgentName(msg.from);
              const isMatch = results.targetSeqNum !== null && msg.seq === results.targetSeqNum;

              return (
                <div
                  key={msg.seq}
                  className={`p-4 rounded-xl border transition-all space-y-2.5 ${
                    isMatch
                      ? "bg-accent-cyan/10 border-accent-cyan shadow-[0_0_15px_rgba(0,240,255,0.15)]"
                      : "bg-surface border-surface-border hover:border-surface-highlight"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                        isMatch ? "bg-accent-cyan text-slate-950" : "bg-surface-raised text-accent-cyan"
                      }`}>
                        seq #{msg.seq}
                      </span>
                      {isMatch && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent-cyan text-slate-950 font-bold">
                          Exact Target Match
                        </span>
                      )}
                      <span className="text-xs font-mono text-slate-300">
                        {agent.displayName} ({agent.shortId})
                      </span>
                      {agent.isVerifiedDid ? (
                        <HumanBadge type="verified-did" size="sm" />
                      ) : (
                        <HumanBadge type="nick" label={agent.badgeLabel} size="sm" />
                      )}
                      <span className="text-[11px] font-mono text-slate-400">
                        {new Date(msg.ts).toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <VerifyPill
                        did={msg.from.startsWith("did:key:") ? msg.from : undefined}
                        room={results.room}
                        nonce={msg.nonce}
                        text={msg.text}
                        sig={msg.sig}
                        seq={msg.seq}
                        ts={msg.ts}
                      />
                      <button
                        onClick={() => setSelectedInspectMsg(msg)}
                        className="px-2 py-1 rounded bg-surface-raised border border-surface-border text-[11px] font-mono text-slate-400 hover:text-white"
                      >
                        Details
                      </button>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-surface-raised text-xs font-mono text-slate-200 break-words">
                    {msg.text}
                  </div>

                  {isTechnicalMode && (
                    <div className="p-2.5 rounded bg-background/90 border border-surface-highlight text-[10px] font-mono text-slate-400 space-y-1">
                      <div>from: {msg.from}</div>
                      {msg.nonce !== undefined && <div>nonce: {String(msg.nonce)}</div>}
                      {msg.sig && <div>sig: {msg.sig}</div>}
                    </div>
                  )}
                </div>
              );
            })}

            {results.messages.length === 0 && (
              <div className="p-12 text-center rounded-2xl bg-surface border border-surface-border text-slate-400 font-mono text-xs">
                No messages found at or after sequence in room /r/{results.room}. The message may have expired from the ring buffer.
              </div>
            )}
          </div>
        </div>
      )}

      {selectedInspectMsg && (
        <TechnicalModal
          isOpen={Boolean(selectedInspectMsg)}
          onClose={() => setSelectedInspectMsg(null)}
          data={{
            room: results?.room || "lobby",
            seq: selectedInspectMsg.seq,
            ts: selectedInspectMsg.ts,
            from: selectedInspectMsg.from,
            text: selectedInspectMsg.text,
            nonce: selectedInspectMsg.nonce,
            sig: selectedInspectMsg.sig,
            did: selectedInspectMsg.from.startsWith("did:key:")
              ? selectedInspectMsg.from
              : undefined,
          }}
        />
      )}
    </div>
  );
}
