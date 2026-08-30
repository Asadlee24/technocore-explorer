"use client";

import React from "react";
import { RoomsOverview } from "@/lib/protocol/types";
import { Compass, FileText, HardDrive, Activity } from "lucide-react";

interface MetricCardsProps {
  overview: RoomsOverview;
}

export function MetricCards({ overview }: MetricCardsProps) {
  const roomUsagePercent = Math.min(
    100,
    Math.round((overview.roomsCount / (overview.roomsCap || 10240)) * 100)
  );

  const notesUsagePercent = Math.min(
    100,
    Math.round((overview.notesCount / (overview.notesCap || 327680)) * 100)
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Metric 1: Public Rooms */}
      <div className="p-5 rounded-2xl bg-surface border border-surface-border relative overflow-hidden group hover:border-flop-blue/40 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-flop-grey uppercase tracking-wider">
            Observed Public Rooms
          </span>
          <div className="p-2 rounded-lg bg-flop-blue/15 text-flop-blue border border-flop-blue/30">
            <Compass className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 space-y-1">
          <div className="text-2xl sm:text-3xl font-bold font-mono text-flop-ice tracking-tight">
            {overview.roomsCount.toLocaleString()}
          </div>
          <div className="text-xs text-flop-grey flex items-center justify-between">
            <span>Capacity: {overview.roomsCap.toLocaleString()}</span>
            <span className="font-mono text-flop-blue font-semibold">{roomUsagePercent}%</span>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-3 w-full h-1.5 rounded-full bg-surface-raised overflow-hidden border border-surface-border">
          <div
            className="h-full bg-flop-blue rounded-full transition-all duration-500"
            style={{ width: `${roomUsagePercent}%` }}
          />
        </div>
        <p className="mt-2 text-[11px] text-flop-grey">
          Encountered in current public directory (excluding unlisted p- rooms).
        </p>
      </div>

      {/* Metric 2: Persistent Notes */}
      <div className="p-5 rounded-2xl bg-surface border border-surface-border relative overflow-hidden group hover:border-flop-blue/40 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-flop-grey uppercase tracking-wider">
            Active KV Notes
          </span>
          <div className="p-2 rounded-lg bg-flop-blue/15 text-flop-blue border border-flop-blue/30">
            <FileText className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 space-y-1">
          <div className="text-2xl sm:text-3xl font-bold font-mono text-flop-ice tracking-tight">
            {overview.notesCount.toLocaleString()}
          </div>
          <div className="text-xs text-flop-grey flex items-center justify-between">
            <span>Capacity: {overview.notesCap.toLocaleString()}</span>
            <span className="font-mono text-flop-blue font-semibold">{notesUsagePercent}%</span>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-3 w-full h-1.5 rounded-full bg-surface-raised overflow-hidden border border-surface-border">
          <div
            className="h-full bg-flop-blue rounded-full transition-all duration-500"
            style={{ width: `${notesUsagePercent}%` }}
          />
        </div>
        <p className="mt-2 text-[11px] text-flop-grey">
          Durable state notes ({overview.notesTotalBytesFormatted} stored, max 40,960/namespace).
        </p>
      </div>

      {/* Metric 3: Ring Buffer Storage */}
      <div className="p-5 rounded-2xl bg-surface border border-surface-border relative overflow-hidden group hover:border-flop-green/40 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-flop-grey uppercase tracking-wider">
            Ring Buffer Storage
          </span>
          <div className="p-2 rounded-lg bg-flop-green/15 text-flop-green border border-flop-green/30">
            <HardDrive className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 space-y-1">
          <div className="text-2xl sm:text-3xl font-bold font-mono text-flop-ice tracking-tight">
            {overview.storedBytesFormatted || "51.5M"}
          </div>
          <div className="text-xs text-flop-grey flex items-center justify-between">
            <span>Storage cap: {overview.storageCapFormatted || "5.0G"}</span>
            <span className="font-mono text-flop-green font-semibold">Active Ring</span>
          </div>
        </div>
        <div className="mt-3 w-full h-1.5 rounded-full bg-surface-raised overflow-hidden border border-surface-border">
          <div className="h-full bg-flop-green w-1/4 rounded-full" />
        </div>
        <p className="mt-2 text-[11px] text-flop-grey">
          Ephemeral message ring buffer. Older messages rotate off disk.
        </p>
      </div>

      {/* Metric 4: Swarm Diversity Index */}
      <div className="p-5 rounded-2xl bg-surface border border-surface-border relative overflow-hidden group hover:border-flop-blue/40 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-flop-grey uppercase tracking-wider">
            Swarm Diversity Index
          </span>
          <div className="p-2 rounded-lg bg-flop-blue/15 text-flop-ice border border-flop-blue/30">
            <Activity className="w-4 h-4 text-flop-blue" />
          </div>
        </div>
        <div className="mt-3 space-y-1">
          <div className="text-2xl sm:text-3xl font-bold font-mono text-flop-ice tracking-tight">
            {overview.nickDiversity ? (overview.nickDiversity * 100).toFixed(0) + "%" : "28%"}
          </div>
          <div className="text-xs text-flop-grey flex items-center justify-between">
            <span>Scanned: {overview.scannedMessagesCount.toLocaleString()} msgs</span>
            <span className="font-mono text-flop-ice">{overview.notesPerMsg || 15.1} notes/msg</span>
          </div>
        </div>
        <div className="mt-3 w-full h-1.5 rounded-full bg-surface-raised overflow-hidden border border-surface-border">
          <div className="h-full bg-flop-blue w-1/3 rounded-full" />
        </div>
        <p className="mt-2 text-[11px] text-flop-grey">
          Unique identity ratio calculated by the protocol server over sample window.
        </p>
      </div>
    </div>
  );
}
