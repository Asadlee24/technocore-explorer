"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DiscoveryEvent, ProtocolMessage } from "@/lib/protocol/types";
import { formatAgentName, classifyRoom } from "@/lib/protocol/parser";
import { HumanBadge } from "../common/HumanBadge";
import { VerifyPill } from "../common/VerifyPill";
import {
  Radio,
  Activity,
  ShieldCheck,
  PlusCircle,
  MessageSquare,
  Sparkles,
  Zap,
  Clock,
  ArrowUpRight,
  Filter,
} from "lucide-react";

interface RadarBlip {
  id: string;
  type: "room" | "signed" | "chat";
  label: string;
  room: string;
  from: string;
  seq: number;
  ts: string;
  angle: number; // 0 to 360 deg
  distance: number; // 20% to 85%
  isNew: boolean;
}

interface NetworkRadarViewProps {
  initialEvents: DiscoveryEvent[];
  initialMessages: ProtocolMessage[];
}

export function NetworkRadarView({
  initialEvents,
  initialMessages,
}: NetworkRadarViewProps) {
  const [blips, setBlips] = useState<RadarBlip[]>([]);
  const [activeFilter, setActiveFilter] = useState<"all" | "room" | "signed">("all");
  const [selectedBlip, setSelectedBlip] = useState<RadarBlip | null>(null);

  // Initialize radar blips from events & messages
  useEffect(() => {
    const newBlips: RadarBlip[] = [];

    initialEvents.slice(0, 12).forEach((evt, idx) => {
      newBlips.push({
        id: `evt-${evt.seq}`,
        type: "room",
        label: `Room: /r/${evt.roomName}`,
        room: evt.roomName,
        from: "server",
        seq: evt.seq,
        ts: evt.ts,
        angle: (idx * 30 + 15) % 360,
        distance: 35 + (idx % 4) * 12,
        isNew: idx < 3,
      });
    });

    initialMessages.slice(0, 16).forEach((msg, idx) => {
      const isSigned = msg.from.startsWith("did:key:");
      newBlips.push({
        id: `msg-${msg.seq}`,
        type: isSigned ? "signed" : "chat",
        label: isSigned ? `Signed by ${msg.from.slice(0, 14)}...` : `Msg in lobby`,
        room: "lobby",
        from: msg.from,
        seq: msg.seq,
        ts: msg.ts,
        angle: (idx * 22.5 + 45) % 360,
        distance: 25 + (idx % 5) * 11,
        isNew: idx < 2,
      });
    });

    setBlips(newBlips);
    if (newBlips.length > 0) {
      setSelectedBlip(newBlips[0]);
    }
  }, [initialEvents, initialMessages]);

  // Polling for live radar pulses
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/proxy?path=/r/events?format=json");
        if (res.ok) {
          const data = await res.json();
          if (data.messages && data.messages.length > 0) {
            const latest = data.messages[data.messages.length - 1];
            setBlips((prev) => {
              if (prev.some((b) => b.id === `evt-${latest.seq}`)) return prev;
              const isRoomCreated = latest.text.startsWith("created ");
              const roomName = isRoomCreated ? latest.text.replace("created ", "").trim() : "unknown";
              const newBlip: RadarBlip = {
                id: `evt-${latest.seq}`,
                type: "room",
                label: `New: /r/${roomName}`,
                room: roomName,
                from: "server",
                seq: latest.seq,
                ts: latest.ts,
                angle: Math.floor(Math.random() * 360),
                distance: 30 + Math.floor(Math.random() * 50),
                isNew: true,
              };
              return [newBlip, ...prev.slice(0, 24)];
            });
          }
        }
      } catch (err) {
        console.error("Radar sweep error:", err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const filteredBlips = blips.filter((b) => {
    if (activeFilter === "room") return b.type === "room";
    if (activeFilter === "signed") return b.type === "signed";
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-accent-emerald/10 border border-accent-emerald/30 text-accent-emerald">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white">Live Network Radar</h1>
              <p className="text-xs text-slate-400">
                Real-time observational radar tracking room creation pulses, signed agent streams, and protocol frequency.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-surface-border text-xs font-mono text-slate-300">
          <span className="w-2 h-2 rounded-full bg-accent-emerald animate-ping" />
          <span>RADAR SWEEP: 360° ACTIVE</span>
        </div>
      </div>

      {/* Main Radar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Visual Radar Scope Screen */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-surface border border-surface-border flex flex-col items-center justify-center relative overflow-hidden min-h-[460px]">
          {/* Radar Background Circles */}
          <div className="relative w-72 h-72 sm:w-96 sm:h-96 rounded-full border border-accent-emerald/20 flex items-center justify-center bg-radial from-accent-emerald/5 to-transparent">
            {/* Concentric rings */}
            <div className="w-3/4 h-3/4 rounded-full border border-accent-emerald/15 flex items-center justify-center">
              <div className="w-2/3 h-2/3 rounded-full border border-accent-emerald/15 flex items-center justify-center">
                <div className="w-1/2 h-1/2 rounded-full border border-accent-emerald/20 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-accent-emerald shadow-[0_0_10px_#00ffaa]" />
                </div>
              </div>
            </div>

            {/* Crosshairs */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-full h-px bg-accent-emerald/15" />
              <div className="h-full w-px bg-accent-emerald/15 absolute" />
            </div>

            {/* Rotating Radar Sweep Beam */}
            <div className="absolute inset-0 rounded-full animate-[spin_4s_linear_infinite] pointer-events-none origin-center bg-gradient-to-r from-accent-emerald/20 via-transparent to-transparent [clip-path:polygon(50%_50%,_100%_0,_100%_50%)]" />

            {/* Radar Blips */}
            {filteredBlips.map((blip) => {
              const rad = (blip.angle * Math.PI) / 180;
              const x = Math.cos(rad) * blip.distance;
              const y = Math.sin(rad) * blip.distance;

              const isSelected = selectedBlip?.id === blip.id;

              return (
                <button
                  key={blip.id}
                  type="button"
                  onClick={() => setSelectedBlip(blip)}
                  style={{
                    transform: `translate(${x}%, ${y}%)`,
                  }}
                  className={`absolute w-3.5 h-3.5 rounded-full transition-all group z-10 ${
                    blip.type === "room"
                      ? "bg-accent-cyan shadow-[0_0_8px_#00f0ff]"
                      : blip.type === "signed"
                      ? "bg-accent-emerald shadow-[0_0_8px_#00ffaa]"
                      : "bg-accent-purple shadow-[0_0_6px_#b026ff]"
                  } ${isSelected ? "ring-2 ring-white scale-150" : "hover:scale-125"}`}
                  title={`${blip.label} (${new Date(blip.ts).toLocaleTimeString()})`}
                >
                  {blip.isNew && (
                    <span className="absolute -inset-1 rounded-full bg-white/60 animate-ping" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Radar Legend */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-accent-cyan shadow-[0_0_6px_#00f0ff]" />
              <span className="text-slate-300">Room Creation (/r/events)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-accent-emerald shadow-[0_0_6px_#00ffaa]" />
              <span className="text-slate-300">Signed Agent Msg</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-accent-purple shadow-[0_0_6px_#b026ff]" />
              <span className="text-slate-300">Broadcast Channel</span>
            </div>
          </div>
        </div>

        {/* Selected Target Inspector & Live Stream */}
        <div className="lg:col-span-5 space-y-4">
          {/* Target Inspector Card */}
          {selectedBlip ? (
            <div className="p-5 rounded-2xl bg-surface border border-accent-emerald/30 shadow-[0_0_20px_rgba(0,255,170,0.08)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-accent-emerald flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Target Locked</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {new Date(selectedBlip.ts).toLocaleTimeString()}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-base text-white font-mono">
                  {selectedBlip.label}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedBlip.type === "room"
                    ? "Discovered in official server events stream."
                    : "Cryptographic payload detected in channel buffer."}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-surface-raised font-mono text-xs text-slate-300 space-y-1">
                <div>Room: <span className="text-white">/r/{selectedBlip.room}</span></div>
                <div>seq: <span className="text-accent-cyan">#{selectedBlip.seq}</span></div>
                <div>from: <span className="text-slate-400 truncate block">{selectedBlip.from}</span></div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <Link
                  href={`/rooms/${encodeURIComponent(selectedBlip.room)}`}
                  className="flex-1 py-2 px-3 rounded-lg bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30 hover:bg-accent-cyan/25 transition-all text-xs font-mono font-bold flex items-center justify-center gap-1.5"
                >
                  <span>Open Room /r/{selectedBlip.room}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>

                {selectedBlip.from.startsWith("did:key:") && (
                  <Link
                    href={`/agents/${encodeURIComponent(selectedBlip.from)}`}
                    className="py-2 px-3 rounded-lg bg-surface-raised border border-surface-border hover:border-slate-500 text-xs font-mono text-slate-200 transition-all"
                  >
                    DID Profile
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl bg-surface border border-surface-border text-slate-400 text-xs font-mono">
              Click any blip on the radar scope to lock target.
            </div>
          )}

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-surface-border text-xs">
            <button
              onClick={() => setActiveFilter("all")}
              className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                activeFilter === "all"
                  ? "bg-white text-slate-900 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              All Signals ({blips.length})
            </button>
            <button
              onClick={() => setActiveFilter("room")}
              className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                activeFilter === "room"
                  ? "bg-accent-cyan/20 text-accent-cyan font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Creations
            </button>
            <button
              onClick={() => setActiveFilter("signed")}
              className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                activeFilter === "signed"
                  ? "bg-accent-emerald/20 text-accent-emerald font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Signatures
            </button>
          </div>

          {/* Mini Stream List */}
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {filteredBlips.slice(0, 10).map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setSelectedBlip(b)}
                className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between gap-2 ${
                  selectedBlip?.id === b.id
                    ? "bg-surface-raised border-accent-cyan"
                    : "bg-surface border-surface-border hover:border-slate-600"
                }`}
              >
                <div className="truncate">
                  <div className="text-xs font-mono font-bold text-slate-200 truncate">
                    {b.label}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    seq #{b.seq} • {new Date(b.ts).toLocaleTimeString()}
                  </div>
                </div>

                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    b.type === "room"
                      ? "bg-accent-cyan"
                      : b.type === "signed"
                      ? "bg-accent-emerald"
                      : "bg-accent-purple"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
