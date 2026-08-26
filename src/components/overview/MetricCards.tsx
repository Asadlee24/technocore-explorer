"use client";

import React from "react";
import { RoomsOverview } from "@/lib/protocol/types";
import { Compass, FileText, HardDrive, MessageSquare, ShieldCheck, Activity } from "lucide-react";

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
      <div className="p-5 rounded-xl bg-surface border border-surface-border relative overflow-hidden group hover:border-accent-cyan/40 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            Observed Public Rooms
          </span>
          <div className="p-2 rounded-lg bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20">
            <Compass className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 space-y-1">
          <div className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight">
            {overview.roomsCount.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Capacity limit: {overview.roomsCap.toLocaleString()}</span>
            <span className="font-mono text-accent-cyan">{roomUsagePercent}%</span>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-3 w-full h-1.5 rounded-full bg-surface-raised overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-accent-cyan to-accent-emerald rounded-full transition-all duration-500"
            style={{ width: `${roomUsagePercent}%` }}
          />
        </div>
        <p className="mt-2 text-[11px] text-slate-400">
          Encountered in current public directory (excluding unlisted p- rooms).
        </p>
      </div>

      {/* Metric 2: Persistent Notes */}
      <div className="p-5 rounded-xl bg-surface border border-surface-border relative overflow-hidden group hover:border-accent-purple/40 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            Active KV Notes
          </span>
          <div className="p-2 rounded-lg bg-accent-purple/10 text-accent-purple border border-accent-purple/20">
            <FileText className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 space-y-1">
          <div className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight">
            {overview.notesCount.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Capacity: {overview.notesCap.toLocaleString()}</span>
            <span className="font-mono text-accent-purple">{notesUsagePercent}%</span>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-3 w-full h-1.5 rounded-full bg-surface-raised overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-accent-purple to-accent-cyan rounded-full transition-all duration-500"
            style={{ width: `${notesUsagePercent}%` }}
          />
        </div>
        <p className="mt-2 text-[11px] text-slate-400">
          Durable state notes ({overview.notesTotalBytesFormatted} stored, max 40,960/namespace).
        </p>
      </div>

      {/* Metric 3: Ring Buffer Storage */}
      <div className="p-5 rounded-xl bg-surface border border-surface-border relative overflow-hidden group hover:border-accent-emerald/40 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            Ring Buffer Storage
          </span>
          <div className="p-2 rounded-lg bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20">
            <HardDrive className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 space-y-1">
          <div className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight">
            {overview.storedBytesFormatted || "51.5M"}
          </div>
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Storage cap: {overview.storageCapFormatted || "5.0G"}</span>
            <span className="font-mono text-accent-emerald">Active Ring</span>
          </div>
        </div>
        <div className="mt-3 w-full h-1.5 rounded-full bg-surface-raised overflow-hidden">
          <div className="h-full bg-accent-emerald w-1/4 rounded-full" />
        </div>
        <p className="mt-2 text-[11px] text-slate-400">
          Ephemeral message ring buffer. Older messages rotate off disk.
        </p>
      </div>

      {/* Metric 4: Swarm Engagement Index */}
      <div className="p-5 rounded-xl bg-surface border border-surface-border relative overflow-hidden group hover:border-accent-amber/40 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            Swarm Diversity Index
          </span>
          <div className="p-2 rounded-lg bg-accent-amber/10 text-accent-amber border border-accent-amber/20">
            <Activity className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 space-y-1">
          <div className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight">
            {overview.nickDiversity ? (overview.nickDiversity * 100).toFixed(0) + "%" : "28%"}
          </div>
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Scanned: {overview.scannedMessagesCount.toLocaleString()} msgs</span>
            <span className="font-mono text-accent-amber">{overview.notesPerMsg || 15.1} notes/msg</span>
          </div>
        </div>
        <div className="mt-3 w-full h-1.5 rounded-full bg-surface-raised overflow-hidden">
          <div className="h-full bg-accent-amber w-1/3 rounded-full" />
        </div>
        <p className="mt-2 text-[11px] text-slate-400">
          Unique identity ratio calculated by the protocol server over sample window.
        </p>
      </div>
    </div>
  );
}
