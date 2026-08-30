"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ParsedRoomSummary } from "@/lib/protocol/types";
import { HumanBadge } from "../common/HumanBadge";
import { Compass, Search, ArrowUpRight, Lock, Mail, Clock } from "lucide-react";
import { useTechnicalMode } from "@/lib/store/technical-mode";

interface ActiveRoomsSectionProps {
  rooms: ParsedRoomSummary[];
}

export function ActiveRoomsSection({ rooms }: ActiveRoomsSectionProps) {
  const [filter, setFilter] = useState<"all" | "owned" | "mailbox" | "ephemeral">("all");
  const [search, setSearch] = useState("");
  const { isTechnicalMode } = useTechnicalMode();

  const filteredRooms = rooms.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.topic && r.topic.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;
    if (filter === "owned") return r.isOwned;
    if (filter === "mailbox") return r.isMailbox;
    if (filter === "ephemeral") return r.isEphemeral;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-border pb-4">
        <div>
          <h2 className="text-lg font-bold text-flop-ice flex items-center gap-2">
            <Compass className="w-5 h-5 text-flop-blue" />
            <span>Observed Active Public Rooms</span>
          </h2>
          <p className="text-xs text-flop-grey">
            Sorted by most recent server activity. All names and topics are untrusted caller inputs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-flop-grey absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter rooms or topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg bg-surface border border-surface-border text-xs text-flop-ice placeholder:text-flop-grey focus:outline-none focus:border-flop-blue font-mono w-48 sm:w-60"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-surface-raised p-1 rounded-lg border border-surface-border text-xs font-mono">
            <button
              onClick={() => setFilter("all")}
              className={`px-2.5 py-1 rounded font-medium transition-all ${
                filter === "all"
                  ? "bg-flop-blue text-flop-ice font-bold"
                  : "text-flop-grey hover:text-flop-ice"
              }`}
            >
              All ({rooms.length})
            </button>
            <button
              onClick={() => setFilter("owned")}
              className={`px-2.5 py-1 rounded font-medium transition-all flex items-center gap-1 ${
                filter === "owned"
                  ? "bg-flop-blue/20 text-flop-ice border border-flop-blue/40"
                  : "text-flop-grey hover:text-flop-ice"
              }`}
            >
              <Lock className="w-3 h-3" />
              <span>Owned (d-)</span>
            </button>
            <button
              onClick={() => setFilter("mailbox")}
              className={`px-2.5 py-1 rounded font-medium transition-all flex items-center gap-1 ${
                filter === "mailbox"
                  ? "bg-flop-blue/20 text-flop-ice border border-flop-blue/40"
                  : "text-flop-grey hover:text-flop-ice"
              }`}
            >
              <Mail className="w-3 h-3" />
              <span>Mailbox (mb-)</span>
            </button>
            <button
              onClick={() => setFilter("ephemeral")}
              className={`px-2.5 py-1 rounded font-medium transition-all flex items-center gap-1 ${
                filter === "ephemeral"
                  ? "bg-surface text-flop-ice border border-surface-border"
                  : "text-flop-grey hover:text-flop-ice"
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>Ephemeral (e-)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredRooms.slice(0, 24).map((room) => (
          <Link
            key={room.name}
            href={`/rooms/${encodeURIComponent(room.name)}`}
            className="p-4 rounded-xl bg-surface border border-surface-border hover:border-flop-blue/40 transition-all group flex flex-col justify-between space-y-3 relative overflow-hidden"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5 font-mono text-sm font-semibold text-flop-ice group-hover:text-flop-blue transition-colors">
                  <span>/r/{room.name}</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-flop-grey group-hover:text-flop-blue group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
              </div>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-1.5">
                {room.isOwned && <HumanBadge type="owned" size="sm" />}
                {room.isMailbox && <HumanBadge type="mailbox" size="sm" />}
                {room.isEphemeral && <HumanBadge type="ephemeral" size="sm" />}
                {!room.isOwned && !room.isMailbox && !room.isEphemeral && (
                  <HumanBadge type="public" size="sm" />
                )}
              </div>

              {/* Topic Preview */}
              <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                {room.topic || (
                  <span className="text-flop-grey italic">No topic note set for this room</span>
                )}
              </p>
            </div>

            {/* Footer Stats */}
            <div className="pt-2 border-t border-surface-border/50 flex items-center justify-between text-[11px] font-mono text-flop-grey">
              <span className="text-flop-ice font-semibold">
                {isTechnicalMode ? `seq: ${room.seq}` : `${room.seq.toLocaleString()} msgs`}
              </span>
              <span>{room.sizeFormatted}</span>
              <span className="text-flop-grey">{room.relativeTime}</span>
            </div>
          </Link>
        ))}
      </div>

      {filteredRooms.length === 0 && (
        <div className="p-8 text-center rounded-xl bg-surface border border-surface-border text-flop-grey text-xs font-mono">
          No rooms matching &quot;{search}&quot; found in currently observed feed.
        </div>
      )}

      <div className="pt-2 text-center">
        <Link
          href="/rooms"
          className="inline-flex items-center gap-2 text-xs font-semibold text-flop-blue hover:text-flop-ice hover:underline font-mono transition-colors"
        >
          <span>View All Discovered Public Rooms ({rooms.length}) →</span>
        </Link>
      </div>
    </div>
  );
}
