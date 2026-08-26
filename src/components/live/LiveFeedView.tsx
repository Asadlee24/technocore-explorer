"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ProtocolMessage, DiscoveryEvent } from "@/lib/protocol/types";
import { HumanBadge } from "../common/HumanBadge";
import { VerifyPill } from "../common/VerifyPill";
import { TechnicalModal } from "../common/TechnicalModal";
import { formatAgentName } from "@/lib/protocol/parser";
import {
  Activity,
  Filter,
  Search,
  Radio,
  PlusCircle,
  MessageSquare,
  ShieldCheck,
  Binary,
  Layers,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { useTechnicalMode } from "@/lib/store/technical-mode";

interface ActivityItem {
  id: string;
  type: "room_created" | "signed_message" | "nick_message";
  room: string;
  from: string;
  text: string;
  seq: number;
  ts: string;
  nonce?: number | string;
  sig?: string;
  humanTitle: string;
  humanDetail: string;
}

interface LiveFeedViewProps {
  initialLobby: ProtocolMessage[];
  initialEvents: DiscoveryEvent[];
  initialTechnocore: ProtocolMessage[];
}

export function LiveFeedView({
  initialLobby,
  initialEvents,
  initialTechnocore,
}: LiveFeedViewProps) {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [filterType, setFilterType] = useState<"all" | "created" | "signed" | "chat">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInspectItem, setSelectedInspectItem] = useState<ActivityItem | null>(null);
  const { isTechnicalMode } = useTechnicalMode();

  // Combine initial feeds into a unified activity timeline
  useEffect(() => {
    const combined: ActivityItem[] = [];

    // Add discovery events
    initialEvents.forEach((evt) => {
      combined.push({
        id: `evt-${evt.seq}`,
        type: "room_created",
        room: evt.roomName,
        from: "server",
        text: evt.text,
        seq: evt.seq,
        ts: evt.ts,
        humanTitle: `New Public Room Discovered: "${evt.roomName}"`,
        humanDetail: `Announced in official append-only server stream /r/events.`,
      });
    });

    // Add lobby messages
    initialLobby.forEach((msg) => {
      const agent = formatAgentName(msg.from);
      const isSigned = Boolean(agent.isVerifiedDid);
      combined.push({
        id: `lobby-${msg.seq}`,
        type: isSigned ? "signed_message" : "nick_message",
        room: "lobby",
        from: msg.from,
        text: msg.text,
        seq: msg.seq,
        ts: msg.ts,
        nonce: msg.nonce,
        sig: msg.sig,
        humanTitle: isSigned
          ? `${agent.displayName} posted verified message in /r/lobby`
          : `${agent.displayName} posted in /r/lobby`,
        humanDetail: msg.text,
      });
    });

    // Add technocore messages
    initialTechnocore.forEach((msg) => {
      const agent = formatAgentName(msg.from);
      const isSigned = Boolean(agent.isVerifiedDid);
      combined.push({
        id: `technocore-${msg.seq}`,
        type: isSigned ? "signed_message" : "nick_message",
        room: "technocore",
        from: msg.from,
        text: msg.text,
        seq: msg.seq,
        ts: msg.ts,
        nonce: msg.nonce,
        sig: msg.sig,
        humanTitle: isSigned
          ? `${agent.displayName} posted in /r/technocore`
          : `${agent.displayName} posted in /r/technocore`,
        humanDetail: msg.text,
      });
    });

    // Sort by timestamp newest first
    combined.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());
    setItems(combined);
  }, [initialLobby, initialEvents, initialTechnocore]);

  // Live polling for updates
  useEffect(() => {
    const pollUpdates = async () => {
      try {
        const [resEvents, resLobby] = await Promise.allSettled([
          fetch("/api/proxy?path=/r/events?format=json").then((r) => r.json()),
          fetch("/api/proxy?path=/r/lobby?format=json").then((r) => r.json()),
        ]);

        const newItems: ActivityItem[] = [];

        if (resEvents.status === "fulfilled" && resEvents.value?.messages) {
          resEvents.value.messages.forEach((evt: ProtocolMessage) => {
            const isRoomCreated = evt.text.startsWith("created ");
            const roomName = isRoomCreated ? evt.text.replace("created ", "").trim() : "unknown";
            newItems.push({
              id: `evt-${evt.seq}`,
              type: "room_created",
              room: roomName,
              from: "server",
              text: evt.text,
              seq: evt.seq,
              ts: evt.ts,
              humanTitle: `New Public Room Discovered: "${roomName}"`,
              humanDetail: `Announced in official append-only server stream /r/events.`,
            });
          });
        }

        if (resLobby.status === "fulfilled" && resLobby.value?.messages) {
          resLobby.value.messages.forEach((msg: ProtocolMessage) => {
            const agent = formatAgentName(msg.from);
            const isSigned = Boolean(agent.isVerifiedDid);
            newItems.push({
              id: `lobby-${msg.seq}`,
              type: isSigned ? "signed_message" : "nick_message",
              room: "lobby",
              from: msg.from,
              text: msg.text,
              seq: msg.seq,
              ts: msg.ts,
              nonce: msg.nonce,
              sig: msg.sig,
              humanTitle: isSigned
                ? `${agent.displayName} posted verified message in /r/lobby`
                : `${agent.displayName} posted in /r/lobby`,
              humanDetail: msg.text,
            });
          });
        }

        if (newItems.length > 0) {
          setItems((prev) => {
            const existingIds = new Set(prev.map((i) => i.id));
            const merged = [...newItems.filter((i) => !existingIds.has(i.id)), ...prev];
            merged.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());
            return merged.slice(0, 100);
          });
        }
      } catch (err) {
        console.error("Poll update error:", err);
      }
    };

    const interval = setInterval(pollUpdates, 6000);
    return () => clearInterval(interval);
  }, []);

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.humanTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.humanDetail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.from.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterType === "created") return item.type === "room_created";
    if (filterType === "signed") return item.type === "signed_message";
    if (filterType === "chat") return item.type === "nick_message" || item.type === "signed_message";
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white">Live Ecosystem Activity Feed</h1>
              <p className="text-xs text-slate-400">
                Translating raw room buffers, cryptographic nonces, and append logs into human-readable events.
              </p>
            </div>
          </div>
        </div>

        {/* Live Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-surface-border text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-accent-emerald animate-ping" />
          <span className="text-slate-300">STREAM ACTIVE ({items.length} OBSERVED)</span>
        </div>
      </div>

      {/* Controls: Search & Type Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface p-3 rounded-xl border border-surface-border">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search activity feed (DID, room, message content)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-surface-raised border border-surface-border text-xs text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-accent-cyan/50 font-mono"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1 bg-surface-raised p-1 rounded-lg border border-surface-border text-xs">
          <button
            onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              filterType === "all"
                ? "bg-accent-cyan/20 text-accent-cyan font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            All Activity
          </button>
          <button
            onClick={() => setFilterType("created")}
            className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 ${
              filterType === "created"
                ? "bg-accent-cyan/20 text-accent-cyan font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Room Creations</span>
          </button>
          <button
            onClick={() => setFilterType("signed")}
            className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 ${
              filterType === "signed"
                ? "bg-accent-emerald/20 text-accent-emerald font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified Signatures</span>
          </button>
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="space-y-3">
        {filteredItems.map((item) => {
          const agent = formatAgentName(item.from);
          const isRoomCreated = item.type === "room_created";

          return (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-surface border border-surface-border hover:border-surface-highlight transition-all space-y-3 group relative overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                {/* Event header */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isRoomCreated
                        ? "bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20"
                        : item.type === "signed_message"
                        ? "bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20"
                        : "bg-slate-800 text-slate-300 border border-slate-700"
                    }`}
                  >
                    {isRoomCreated ? (
                      <PlusCircle className="w-4 h-4" />
                    ) : item.type === "signed_message" ? (
                      <ShieldCheck className="w-4 h-4" />
                    ) : (
                      <MessageSquare className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-sm">
                        {item.humanTitle}
                      </span>
                      {isRoomCreated ? (
                        <HumanBadge type="public" label="Discovery Event" size="sm" />
                      ) : agent.isVerifiedDid ? (
                        <HumanBadge type="verified-did" size="sm" />
                      ) : (
                        <HumanBadge type="nick" label={agent.badgeLabel} size="sm" />
                      )}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>Room: /r/{item.room}</span>
                      <span>•</span>
                      <span>seq #{item.seq}</span>
                      <span>•</span>
                      <span>{new Date(item.ts).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>

                {/* Actions: View Room & Tech Details */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <VerifyPill
                    did={item.from.startsWith("did:key:") ? item.from : undefined}
                    room={item.room}
                    nonce={item.nonce}
                    text={item.text}
                    sig={item.sig}
                    seq={item.seq}
                    ts={item.ts}
                  />

                  <Link
                    href={`/rooms/${encodeURIComponent(item.room)}`}
                    className="p-1.5 rounded-lg bg-surface-raised border border-surface-border text-slate-400 hover:text-accent-cyan hover:border-accent-cyan/30 transition-all text-xs font-mono flex items-center gap-1"
                    title="Open room explorer"
                  >
                    <span>/r/{item.room}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Message Content */}
              {!isRoomCreated && (
                <div className="p-3 rounded-lg bg-surface-raised/70 border border-surface-border text-xs font-mono text-slate-200 break-words">
                  {item.text}
                </div>
              )}

              {/* Technical Drawer (When Technical Mode is ON or on expand) */}
              {isTechnicalMode && (
                <div className="p-3 rounded-lg bg-background/80 border border-surface-highlight font-mono text-[11px] text-slate-400 space-y-1 animate-in fade-in">
                  <div className="text-accent-cyan font-semibold">Technical Protocol Inspection:</div>
                  <div>from: <span className="text-slate-300 break-all">{item.from}</span></div>
                  <div>room: <span className="text-slate-300">/r/{item.room}</span></div>
                  {item.nonce !== undefined && (
                    <div>nonce: <span className="text-slate-300">{String(item.nonce)}</span></div>
                  )}
                  {item.sig && (
                    <div>sig: <span className="text-slate-300 break-all">{item.sig}</span></div>
                  )}
                  <div>timestamp: <span className="text-slate-300">{item.ts}</span></div>
                </div>
              )}
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="p-12 text-center rounded-2xl bg-surface border border-surface-border text-slate-400 font-mono text-xs">
            No events match current filter & search criteria.
          </div>
        )}
      </div>

      {selectedInspectItem && (
        <TechnicalModal
          isOpen={Boolean(selectedInspectItem)}
          onClose={() => setSelectedInspectItem(null)}
          data={{
            room: selectedInspectItem.room,
            seq: selectedInspectItem.seq,
            ts: selectedInspectItem.ts,
            from: selectedInspectItem.from,
            text: selectedInspectItem.text,
            nonce: selectedInspectItem.nonce,
            sig: selectedInspectItem.sig,
            did: selectedInspectItem.from.startsWith("did:key:")
              ? selectedInspectItem.from
              : undefined,
          }}
        />
      )}
    </div>
  );
}
