"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ParsedRoomSummary } from "@/lib/protocol/types";
import { HumanBadge } from "../common/HumanBadge";
import {
  Compass,
  Search,
  ArrowUpRight,
  Clock,
  HardDrive,
  Hash,
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
      return 0;
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-flop-blue/15 border border-flop-blue/30 text-flop-blue">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-flop-ice">Public Room Directory</h1>
              <p className="text-xs text-flop-grey">
                Observing {initialRooms.length} active public rooms (from {totalRoomsCount.toLocaleString()} total network rooms).
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-flop-grey bg-surface px-3 py-1.5 rounded-lg border border-surface-border">
          <Clock className="w-3.5 h-3.5 text-flop-blue" />
          <span>Ring Buffer: ~10 MiB per room</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-flop-grey absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search room name or topic description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-surface border border-surface-border text-xs text-flop-ice placeholder:text-flop-grey focus:outline-none focus:border-flop-blue font-mono"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 bg-surface p-1 rounded-xl border border-surface-border text-xs font-mono">
            <span className="text-flop-grey pl-2">Sort:</span>
            <button
              onClick={() => setSortBy("activity")}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                sortBy === "activity"
                  ? "bg-flop-blue text-flop-ice font-bold"
                  : "text-flop-grey hover:text-flop-ice"
              }`}
            >
              Activity
            </button>
            <button
              onClick={() => setSortBy("seq")}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                sortBy === "seq"
                  ? "bg-flop-blue text-flop-ice font-bold"
                  : "text-flop-grey hover:text-flop-ice"
              }`}
            >
              Messages (seq)
            </button>
            <button
              onClick={() => setSortBy("size")}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                sortBy === "size"
                  ? "bg-flop-blue text-flop-ice font-bold"
                  : "text-flop-grey hover:text-flop-ice"
              }`}
            >
              Storage Size
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
          <button
            onClick={() => setSelectedFilter("all")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all border ${
              selectedFilter === "all"
                ? "bg-flop-blue text-flop-ice border-flop-blue font-bold"
                : "bg-surface text-flop-grey border-surface-border hover:text-flop-ice"
            }`}
          >
            All Types ({initialRooms.length})
          </button>
          <button
            onClick={() => setSelectedFilter("mailbox")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all border ${
              selectedFilter === "mailbox"
                ? "bg-flop-blue/20 text-flop-ice border-flop-blue/40 font-bold"
                : "bg-surface text-flop-grey border-surface-border hover:text-flop-ice"
            }`}
          >
            Signed Mailboxes (mb-)
          </button>
          <button
            onClick={() => setSelectedFilter("owned")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all border ${
              selectedFilter === "owned"
                ? "bg-flop-blue/20 text-flop-ice border-flop-blue/40 font-bold"
                : "bg-surface text-flop-grey border-surface-border hover:text-flop-ice"
            }`}
          >
            Owned / Claimed (d-)
          </button>
          <button
            onClick={() => setSelectedFilter("ephemeral")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all border ${
              selectedFilter === "ephemeral"
                ? "bg-surface-raised text-flop-ice border-surface-border font-bold"
                : "bg-surface text-flop-grey border-surface-border hover:text-flop-ice"
            }`}
          >
            Ephemeral (e-)
          </button>
          <button
            onClick={() => setSelectedFilter("system")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all border ${
              selectedFilter === "system"
                ? "bg-flop-blue/20 text-flop-ice border-flop-blue/40 font-bold"
                : "bg-surface text-flop-grey border-surface-border hover:text-flop-ice"
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
            className="p-5 rounded-2xl bg-surface border border-surface-border hover:border-flop-blue/40 hover:bg-surface-raised transition-all flex flex-col justify-between group space-y-4 relative overflow-hidden"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-mono text-base font-bold text-flop-ice group-hover:text-flop-blue transition-colors flex items-center gap-1.5">
                    <span>/r/{room.name}</span>
                    <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-flop-blue" />
                  </div>
                  <div className="text-[11px] text-flop-grey mt-0.5">
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
                <p className="text-xs text-flop-grey italic">
                  No public topic note set (/kv/topic/{room.name})
                </p>
              )}
            </div>

            {/* Room Metrics Footer */}
            <div className="pt-3 border-t border-surface-border/60 flex items-center justify-between text-xs font-mono text-flop-grey">
              <div className="flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-flop-blue" />
                <span>seq #{room.seq.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <HardDrive className="w-3.5 h-3.5" />
                  {room.sizeFormatted}
                </span>
                <span className="text-flop-green font-medium">{room.relativeTime}</span>
              </div>
            </div>

            {/* Technical Drawer */}
            {isTechnicalMode && (
              <div className="text-[10px] font-mono text-flop-grey bg-surface-raised p-2 rounded border border-surface-border">
                <div>Path: GET /r/{room.name}?format=json</div>
                <div>Topic: GET /kv/topic/{room.name}</div>
              </div>
            )}
          </Link>
        ))}
      </div>

      {filteredRooms.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-surface border border-surface-border text-flop-grey font-mono text-xs">
          No rooms match your filter & search criteria.
        </div>
      )}
    </div>
  );
}
