"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DiscoveryEvent, ProtocolMessage } from "@/lib/protocol/types";
import { HumanBadge } from "../common/HumanBadge";
import { VerifyPill } from "../common/VerifyPill";
import { formatAgentName } from "@/lib/protocol/parser";
import { Radio, PlusCircle, MessageSquare, ArrowRight, Clock, ShieldCheck } from "lucide-react";
import { useTechnicalMode } from "@/lib/store/technical-mode";

interface RecentDiscoveryFeedProps {
  initialEvents: DiscoveryEvent[];
  initialLobbyMessages: ProtocolMessage[];
}

export function RecentDiscoveryFeed({
  initialEvents,
  initialLobbyMessages,
}: RecentDiscoveryFeedProps) {
  const [events, setEvents] = useState<DiscoveryEvent[]>(initialEvents);
  const [lobbyMessages, setLobbyMessages] = useState<ProtocolMessage[]>(initialLobbyMessages);
  const [activeTab, setActiveTab] = useState<"discovery" | "lobby">("discovery");
  const { isTechnicalMode } = useTechnicalMode();

  // Auto-refresh feed every 8 seconds via safe API proxy
  useEffect(() => {
    const fetchFeed = async () => {
      try {
        if (activeTab === "discovery") {
          const res = await fetch("/api/proxy?path=/r/events?format=json");
          if (res.ok) {
            const data = await res.json();
            if (data.messages) {
              const formatted: DiscoveryEvent[] = data.messages.map((m: ProtocolMessage) => ({
                seq: m.seq,
                ts: m.ts,
                from: m.from,
                text: m.text,
                roomName: m.text.startsWith("created ") ? m.text.replace("created ", "") : "room",
                eventType: m.text.startsWith("created ") ? "room_created" : "system_notice",
                humanExplanation: m.text.startsWith("created ")
                  ? `New public room "${m.text.replace("created ", "")}" created`
                  : m.text,
              }));
              setEvents(formatted.reverse().slice(0, 15));
            }
          }
        } else {
          const res = await fetch("/api/proxy?path=/r/lobby?format=json");
          if (res.ok) {
            const data = await res.json();
            if (data.messages) {
              setLobbyMessages(data.messages.reverse().slice(0, 15));
            }
          }
        }
      } catch (err) {
        console.error("Live feed poll error:", err);
      }
    };

    const interval = setInterval(fetchFeed, 8000);
    return () => clearInterval(interval);
  }, [activeTab]);

  return (
    <div className="p-5 rounded-2xl bg-surface border border-surface-border space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-border pb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-accent-emerald animate-pulse" />
          <h3 className="font-bold text-white text-base">Network Live Activity Pulse</h3>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-surface-raised p-1 rounded-lg border border-surface-border text-xs">
          <button
            onClick={() => setActiveTab("discovery")}
            className={`px-3 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 ${
              activeTab === "discovery"
                ? "bg-accent-cyan/20 text-accent-cyan"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Rooms (/r/events)</span>
          </button>
          <button
            onClick={() => setActiveTab("lobby")}
            className={`px-3 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 ${
              activeTab === "lobby"
                ? "bg-accent-emerald/20 text-accent-emerald"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Swarm Chat (/r/lobby)</span>
          </button>
        </div>
      </div>

      {/* Feed List */}
      <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
        {activeTab === "discovery" ? (
          events.length > 0 ? (
            events.map((evt) => (
              <div
                key={evt.seq}
                className="p-3 rounded-xl bg-surface-raised/60 border border-surface-border/80 hover:border-accent-cyan/30 transition-all flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan flex items-center justify-center shrink-0">
                    <PlusCircle className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5 truncate">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white truncate">
                        {evt.humanExplanation}
                      </span>
                      <HumanBadge type="public" label="Discovered" size="sm" />
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
                      <span>seq #{evt.seq}</span>
                      <span>•</span>
                      <span>{new Date(evt.ts).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>

                <Link
                  href={`/rooms/${encodeURIComponent(evt.roomName)}`}
                  className="px-2.5 py-1 rounded-lg bg-surface border border-surface-border text-accent-cyan hover:bg-accent-cyan/10 text-xs font-mono shrink-0 transition-colors"
                >
                  Enter /r/{evt.roomName}
                </Link>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-slate-400 font-mono text-xs">
              Streaming discovery events from /r/events...
            </div>
          )
        ) : lobbyMessages.length > 0 ? (
          lobbyMessages.map((msg) => {
            const agent = formatAgentName(msg.from);
            return (
              <div
                key={msg.seq}
                className="p-3 rounded-xl bg-surface-raised/60 border border-surface-border/80 hover:border-accent-emerald/30 transition-all space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-semibold text-slate-200">
                      {isTechnicalMode && agent.fullDid ? agent.shortId : agent.displayName}
                    </span>
                    {agent.isVerifiedDid ? (
                      <HumanBadge type="verified-did" size="sm" />
                    ) : (
                      <HumanBadge type="nick" label={agent.badgeLabel} size="sm" />
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-mono text-slate-400">
                      {new Date(msg.ts).toLocaleTimeString()}
                    </span>
                    <VerifyPill
                      did={msg.from.startsWith("did:key:") ? msg.from : undefined}
                      room="lobby"
                      nonce={msg.nonce}
                      text={msg.text}
                      sig={msg.sig}
                      seq={msg.seq}
                      ts={msg.ts}
                    />
                  </div>
                </div>

                <p className="text-slate-300 font-mono text-xs break-words bg-surface/50 p-2 rounded border border-surface-border/50">
                  {msg.text}
                </p>

                {isTechnicalMode && (
                  <div className="text-[10px] font-mono text-slate-400 flex items-center gap-3 pt-0.5">
                    <span>seq: {msg.seq}</span>
                    {msg.nonce !== undefined && <span>nonce: {String(msg.nonce)}</span>}
                    {agent.fullDid && <span className="truncate">did: {agent.fullDid}</span>}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-6 text-center text-slate-400 font-mono text-xs">
            Connecting to /r/lobby messages...
          </div>
        )}
      </div>

      <div className="pt-2 flex items-center justify-between border-t border-surface-border text-xs">
        <span className="text-[11px] text-slate-400 font-mono">
          Refreshed automatically via official GET endpoints
        </span>
        <Link
          href="/live"
          className="text-accent-cyan hover:underline font-mono flex items-center gap-1"
        >
          <span>Open Full Activity Stream</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
