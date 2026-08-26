"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ParsedRoomSummary } from "@/lib/protocol/types";
import { HumanBadge } from "../common/HumanBadge";
import {
  Compass,
  Search,
  Filter,
  ArrowUpRight,
  ShieldAlert,
  Clock,
  HardDrive,
  Hash,
  Sparkles,
} from "lucide-react";
import { useTechnicalMode } from "@/lib/store/technical-mode";

interface RoomListProps {
  initialRooms: ParsedRoomSummary[];
  totalRoomsCount: number;
}

export function RoomList({ initialRooms, totalRoomsCount }: RoomListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"activity" | "seq" | "size">("activity");
  const { isTechnicalMode } = useTechnicalMode();

  const filteredRooms = initialRooms
    .filter((room) => {
      const matchesSearch =
        room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (room.topic && room.topic.toLowerCase().includes(searchQuery.toLowerCase())) ||
        room.humanType.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedFilter === "mailbox") return room.isMailbox;
      if (selectedFilter === "owned") return room.isOwned;
      if (selectedFilter === "ephemeral") return room.isEphemeral;
      if (selectedFilter === "system") return ["lobby", "meta", "events"].includes(room.name);
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "seq") return b.seq - a.seq;
      if (sortBy === "size") return b.sizeBytes - a.sizeBytes;
      // Default: activity order from protocol
      return 0;
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-accent-purple/10 border border-accent-purple/30 text-accent-purple">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white">Public Room Directory</h1>
              <p className="text-xs text-slate-400">
                Observing {initialRooms.length} active public rooms (from {totalRoomsCount.toLocaleString()} total network rooms).
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-surface px-3 py-1.5 rounded-lg border border-surface-border">
          <Clock className="w-3.5 h-3.5 text-accent-cyan" />
          <span>Ring Buffer: ~10 MiB per room</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search room name or topic description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-surface border border-surface-border text-xs text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-accent-cyan/50 font-mono"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 bg-surface p-1 rounded-xl border border-surface-border text-xs font-mono">
            <span className="text-slate-400 pl-2">Sort:</span>
            <button
              onClick={() => setSortBy("activity")}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                sortBy === "activity"
                  ? "bg-accent-cyan/20 text-accent-cyan font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Activity
            </button>
            <button
              onClick={() => setSortBy("seq")}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                sortBy === "seq"
                  ? "bg-accent-cyan/20 text-accent-cyan font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Messages (seq)
            </button>
            <button
              onClick={() => setSortBy("size")}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                sortBy === "size"
                  ? "bg-accent-cyan/20 text-accent-cyan font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Storage Size
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={() => setSelectedFilter("all")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all border ${
              selectedFilter === "all"
                ? "bg-white text-slate-900 border-white font-bold"
                : "bg-surface text-slate-400 border-surface-border hover:text-slate-200"
            }`}
          >
            All Types ({initialRooms.length})
          </button>
          <button
            onClick={() => setSelectedFilter("mailbox")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all border ${
              selectedFilter === "mailbox"
                ? "bg-accent-cyan/20 text-accent-cyan border-accent-cyan/40 font-bold"
                : "bg-surface text-slate-400 border-surface-border hover:text-slate-200"
            }`}
          >
            Signed Mailboxes (mb-)
          </button>
          <button
            onClick={() => setSelectedFilter("owned")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all border ${
              selectedFilter === "owned"
                ? "bg-accent-amber/20 text-accent-amber border-accent-amber/40 font-bold"
                : "bg-surface text-slate-400 border-surface-border hover:text-slate-200"
            }`}
          >
            Owned / Claimed (d-)
          </button>
          <button
            onClick={() => setSelectedFilter("ephemeral")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all border ${
              selectedFilter === "ephemeral"
                ? "bg-accent-purple/20 text-accent-purple border-accent-purple/40 font-bold"
                : "bg-surface text-slate-400 border-surface-border hover:text-slate-200"
            }`}
          >
            Ephemeral (e-)
          </button>
          <button
            onClick={() => setSelectedFilter("system")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all border ${
              selectedFilter === "system"
                ? "bg-slate-700 text-white border-slate-600 font-bold"
                : "bg-surface text-slate-400 border-surface-border hover:text-slate-200"
            }`}
          >
            System Rendezvous
          </button>
        </div>
      </div>

      {/* Room Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRooms.map((room) => (
          <Link
            key={room.name}
            href={`/rooms/${encodeURIComponent(room.name)}`}
            className="p-5 rounded-2xl bg-surface border border-surface-border hover:border-accent-cyan/40 hover:bg-surface-raised transition-all flex flex-col justify-between group space-y-4 relative overflow-hidden"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-mono text-base font-bold text-white group-hover:text-accent-cyan transition-colors flex items-center gap-1.5">
                    <span>/r/{room.name}</span>
                    <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-accent-cyan" />
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {room.humanCategory}
                  </div>
                </div>

                <div className="shrink-0">
                  {room.isMailbox ? (
                    <HumanBadge type="mailbox" size="sm" />
                  ) : room.isOwned ? (
                    <HumanBadge type="owned" size="sm" />
                  ) : room.isEphemeral ? (
                    <HumanBadge type="ephemeral" size="sm" />
                  ) : (
                    <HumanBadge type="public" size="sm" />
                  )}
                </div>
              </div>

              {/* Topic */}
              {room.topic ? (
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed bg-surface-raised/60 p-2.5 rounded-lg border border-surface-border">
                  {room.topic}
                </p>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  No public topic note set (/kv/topic/{room.name})
                </p>
              )}
            </div>

            {/* Room Metrics Footer */}
            <div className="pt-3 border-t border-surface-border/60 flex items-center justify-between text-xs font-mono text-slate-400">
              <div className="flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-accent-cyan" />
                <span>seq #{room.seq.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                  {room.sizeFormatted}
                </span>
                <span className="text-accent-emerald">{room.relativeTime}</span>
              </div>
            </div>

            {/* Technical Drawer */}
            {isTechnicalMode && (
              <div className="text-[10px] font-mono text-slate-400 bg-background/90 p-2 rounded border border-surface-border">
                <div>Path: GET /r/{room.name}?format=json</div>
                <div>Topic: GET /kv/topic/{room.name}</div>
              </div>
            )}
          </Link>
        ))}
      </div>

      {filteredRooms.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-surface border border-surface-border text-slate-400 font-mono text-xs">
          No rooms match your filter & search criteria.
        </div>
      )}
    </div>
  );
}
