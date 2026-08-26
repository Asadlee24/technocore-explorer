"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ProtocolMessage } from "@/lib/protocol/types";
import { HumanBadge } from "../common/HumanBadge";
import { VerifyPill } from "../common/VerifyPill";
import { TechnicalModal } from "../common/TechnicalModal";
import { formatAgentName, classifyRoom } from "@/lib/protocol/parser";
import {
  Compass,
  ArrowLeft,
  RefreshCw,
  Hash,
  Clock,
  ShieldCheck,
  HardDrive,
  Info,
  Terminal,
  ExternalLink,
  Lock,
} from "lucide-react";
import { useTechnicalMode } from "@/lib/store/technical-mode";
import { TECHNOCORE_ORIGIN } from "@/lib/protocol/constants";

interface RoomDetailViewProps {
  roomName: string;
  initialMessages: ProtocolMessage[];
  topic: string | null;
  ownerInfo: string | null;
}

export function RoomDetailView({
  roomName,
  initialMessages,
  topic,
  ownerInfo,
}: RoomDetailViewProps) {
  const [messages, setMessages] = useState<ProtocolMessage[]>(initialMessages);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedInspectMsg, setSelectedInspectMsg] = useState<ProtocolMessage | null>(null);
  const { isTechnicalMode } = useTechnicalMode();

  const classification = classifyRoom(roomName);

  // Poll room messages every 5 seconds
  const fetchLatest = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/proxy?path=/r/${encodeURIComponent(roomName)}?format=json`);
      if (res.ok) {
        const data = await res.json();
        if (data.messages) {
          setMessages(data.messages);
        }
      }
    } catch (err) {
      console.error("Refresh error:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(fetchLatest, 5000);
    return () => clearInterval(interval);
  }, [roomName]);

  return (
    <div className="space-y-6">
      {/* Back button & Room header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div className="space-y-2">
          <Link
            href="/rooms"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-accent-cyan transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Room Directory</span>
          </Link>

          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
              /r/{roomName}
            </h1>
            {classification.isMailbox ? (
              <HumanBadge type="mailbox" />
            ) : classification.isOwned ? (
              <HumanBadge type="owned" />
            ) : classification.isEphemeral ? (
              <HumanBadge type="ephemeral" />
            ) : (
              <HumanBadge type="public" />
            )}
          </div>
          <p className="text-xs text-slate-400">
            {classification.humanType} • Category: {classification.humanCategory}
          </p>
        </div>

        {/* Live Refresh & Official Endpoint */}
        <div className="flex items-center gap-2">
          <button
            onClick={fetchLatest}
            disabled={isRefreshing}
            className="px-3 py-1.5 rounded-lg bg-surface border border-surface-border hover:border-slate-600 text-xs font-mono text-slate-300 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-accent-cyan" : ""}`} />
            <span>{isRefreshing ? "Polling..." : "Refresh Feed"}</span>
          </button>

          <a
            href={`${TECHNOCORE_ORIGIN}/r/${roomName}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-surface border border-surface-border hover:border-accent-cyan/40 text-xs font-mono text-accent-cyan flex items-center gap-1.5 transition-all"
          >
            <span>Raw Endpoint</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Room Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Topic Card */}
        <div className="md:col-span-2 p-4 rounded-xl bg-surface border border-surface-border space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-accent-cyan" />
              <span>Room Topic (/kv/topic/{roomName})</span>
            </span>
            <span className="text-[10px] text-slate-400">Public Note</span>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed font-mono">
            {topic || "No descriptive topic note has been set for this room."}
          </p>
        </div>

        {/* Ownership Card if d- room */}
        <div className="p-4 rounded-xl bg-surface border border-surface-border space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-accent-amber" />
              <span>Room Ownership</span>
            </span>
          </div>
          {classification.isOwned ? (
            <div className="space-y-1">
              <div className="text-xs text-accent-amber font-mono font-bold">
                {ownerInfo ? "Claimed / Controlled" : "Unclaimed (Open to claim)"}
              </div>
              <p className="text-[11px] text-slate-400">
                {ownerInfo
                  ? `Owner DID: ${ownerInfo.slice(0, 16)}...`
                  : "Can be claimed by posting signed note to /kv/room-owners/d-" + roomName}
              </p>
            </div>
          ) : (
            <div className="text-xs text-slate-400 font-mono">
              Open Public Channel (Cannot be claimed; only d- rooms support ownership).
            </div>
          )}
        </div>
      </div>

      {/* Messages Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold font-mono text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Hash className="w-4 h-4 text-accent-cyan" />
            <span>Observable Room Messages ({messages.length})</span>
          </h2>
          <span className="text-[11px] font-mono text-slate-400">
            Ring buffer window: newest 50 messages
          </span>
        </div>

        {/* Message Feed */}
        <div className="space-y-3">
          {messages.map((msg) => {
            const agent = formatAgentName(msg.from);
            const isSigned = Boolean(agent.isVerifiedDid);

            return (
              <div
                key={msg.seq}
                className="p-4 rounded-xl bg-surface border border-surface-border hover:border-surface-highlight transition-all space-y-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {agent.isVerifiedDid ? (
                      <Link
                        href={`/agents/${encodeURIComponent(msg.from)}`}
                        className="text-xs font-mono font-bold text-accent-cyan hover:underline flex items-center gap-1"
                      >
                        <span>{agent.displayName}</span>
                        <span className="text-[10px] text-slate-400">({agent.shortId})</span>
                      </Link>
                    ) : (
                      <span className="text-xs font-mono font-bold text-slate-300">
                        {agent.displayName}
                      </span>
                    )}

                    {agent.isVerifiedDid ? (
                      <HumanBadge type="verified-did" size="sm" />
                    ) : (
                      <HumanBadge type="nick" label={agent.badgeLabel} size="sm" />
                    )}

                    <span className="text-[11px] font-mono text-slate-400">
                      seq #{msg.seq} • {new Date(msg.ts).toLocaleTimeString()}
                    </span>
                  </div>

                  {/* Verification Pill & Tech Inspection */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <VerifyPill
                      did={msg.from.startsWith("did:key:") ? msg.from : undefined}
                      room={roomName}
                      nonce={msg.nonce}
                      text={msg.text}
                      sig={msg.sig}
                      seq={msg.seq}
                      ts={msg.ts}
                    />

                    <button
                      onClick={() => setSelectedInspectMsg(msg)}
                      className="px-2 py-1 rounded bg-surface-raised border border-surface-border text-[11px] font-mono text-slate-400 hover:text-white transition-colors"
                      title="Inspect technical cryptography"
                    >
                      Tech Details
                    </button>
                  </div>
                </div>

                {/* Message Text */}
                <div className="p-3 rounded-lg bg-surface-raised text-xs font-mono text-slate-200 break-words leading-relaxed">
                  {msg.text}
                </div>

                {/* Technical Mode Inspection Box */}
                {isTechnicalMode && (
                  <div className="p-2.5 rounded bg-background/90 border border-surface-highlight text-[10px] font-mono text-slate-400 space-y-1">
                    <div>from: {msg.from}</div>
                    {msg.nonce !== undefined && <div>nonce: {String(msg.nonce)}</div>}
                    {msg.sig && <div>sig: {msg.sig}</div>}
                    <div>ts: {msg.ts}</div>
                  </div>
                )}
              </div>
            );
          })}

          {messages.length === 0 && (
            <div className="p-12 text-center rounded-2xl bg-surface border border-surface-border text-slate-400 font-mono text-xs">
              No observable messages currently in this room buffer.
            </div>
          )}
        </div>
      </div>

      {selectedInspectMsg && (
        <TechnicalModal
          isOpen={Boolean(selectedInspectMsg)}
          onClose={() => setSelectedInspectMsg(null)}
          data={{
            room: roomName,
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
