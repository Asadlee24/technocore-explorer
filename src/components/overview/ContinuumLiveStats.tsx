"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { LiveContinuumStats } from "@/lib/continuum/db";
import {
  Database,
  GitBranch,
  Radio,
  Compass,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Layers,
  Activity,
} from "lucide-react";

interface ContinuumLiveStatsProps {
  initialStats: LiveContinuumStats;
}

export function ContinuumLiveStats({ initialStats }: ContinuumLiveStatsProps) {
  const [stats, setStats] = useState<LiveContinuumStats>(initialStats);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>(
    new Date(initialStats.lastUpdated).toLocaleTimeString()
  );

  // Auto-poll live stats every 6 seconds
  useEffect(() => {
    let isMounted = true;

    const pollStats = async () => {
      try {
        setIsUpdating(true);
        const res = await fetch("/api/continuum/status", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && data.liveStats && isMounted) {
          setStats(data.liveStats);
          setLastSyncTime(new Date().toLocaleTimeString());
        }
      } catch {
        // silent fallback to current state
      } finally {
        if (isMounted) {
          setTimeout(() => setIsUpdating(false), 400);
        }
      }
    };

    const interval = setInterval(pollStats, 6000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const isOnline = stats.collectorStatus === "ONLINE";

  return (
    <div className="relative overflow-hidden rounded-2xl bg-surface border border-surface-border p-5 sm:p-6 space-y-5 transition-all hover:border-flop-blue/40">
      {/* Background structural ambient glow */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-flop-blue/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-flop-green/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Row */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-flop-blue/15 text-flop-ice border border-flop-blue/30 font-bold tracking-wide">
              CONTINUUM LIVE PROTOCOL ARCHIVE
            </span>
            <span className="text-[10px] font-mono text-flop-green flex items-center gap-1.5 bg-surface-raised px-2 py-0.5 rounded-full border border-flop-green/30">
              <span className="w-1.5 h-1.5 rounded-full bg-flop-green animate-pulse" />
              <span className="font-bold">{stats.collectorStatus}</span>
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-extrabold text-flop-ice tracking-tight font-sans">
            Real-Time Archival & Merkle Verification Engine
          </h2>
          <p className="text-xs text-flop-grey max-w-2xl font-sans">
            Direct PostgreSQL replication from autonomous collector daemon. All messages canonicalized and sealed into cryptographic SHA-256 binary Merkle trees.
          </p>
        </div>

        {/* Live Pulse & Navigation */}
        <div className="flex items-center gap-3 self-start sm:self-center">
          <div className="text-right hidden md:block">
            <div className="text-[10px] font-mono text-flop-grey flex items-center gap-1 justify-end">
              <RefreshCw className={`w-3 h-3 text-flop-cyan ${isUpdating ? "animate-spin" : ""}`} />
              <span>Live DB Sync:</span>
              <span className="text-flop-ice font-bold">{lastSyncTime}</span>
            </div>
            <div className="text-[10px] font-mono text-flop-grey truncate max-w-[200px]">
              Root: <span className="text-flop-cyan">{stats.latestMerkleRoot.slice(0, 12)}...</span>
            </div>
          </div>

          <Link
            href="/continuum"
            className="px-3.5 py-2 rounded-xl bg-flop-blue text-flop-ice text-xs font-mono font-bold hover:bg-flop-blue/90 transition-all flex items-center gap-1.5 shadow-sm shrink-0"
          >
            <span>Explore Archive</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 4 Compact Live Stats Cards */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 font-mono">
        {/* Card 1: Messages Archived */}
        <div className="p-4 rounded-xl bg-surface-raised border border-surface-border hover:border-flop-blue/40 transition-all space-y-2 group">
          <div className="flex items-center justify-between text-xs text-flop-grey">
            <span className="text-[10px] uppercase font-bold tracking-wider">Messages Archived</span>
            <div className="p-1.5 rounded-lg bg-flop-blue/15 text-flop-blue border border-flop-blue/30 group-hover:scale-105 transition-transform">
              <Database className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-flop-ice tracking-tight">
            {stats.messagesArchived.toLocaleString()}
          </div>
          <div className="text-[11px] text-flop-cyan flex items-center justify-between pt-0.5">
            <span>Deterministic SHA-256</span>
            <span className="text-[10px] text-flop-grey">Live DB</span>
          </div>
        </div>

        {/* Card 2: Rooms Monitored */}
        <div className="p-4 rounded-xl bg-surface-raised border border-surface-border hover:border-flop-blue/40 transition-all space-y-2 group">
          <div className="flex items-center justify-between text-xs text-flop-grey">
            <span className="text-[10px] uppercase font-bold tracking-wider">Rooms Monitored</span>
            <div className="p-1.5 rounded-lg bg-flop-cyan/15 text-flop-cyan border border-flop-cyan/30 group-hover:scale-105 transition-transform">
              <Compass className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-flop-ice tracking-tight">
            {stats.roomsMonitored.toLocaleString()}
          </div>
          <div className="text-[11px] text-flop-grey flex items-center justify-between pt-0.5">
            <span>Public, MB & Owned</span>
            <span className="text-[10px] text-flop-green font-bold">100% Sequence</span>
          </div>
        </div>

        {/* Card 3: Merkle Epochs Sealed */}
        <div className="p-4 rounded-xl bg-surface-raised border border-surface-border hover:border-flop-blue/40 transition-all space-y-2 group">
          <div className="flex items-center justify-between text-xs text-flop-grey">
            <span className="text-[10px] uppercase font-bold tracking-wider">Merkle Epochs Sealed</span>
            <div className="p-1.5 rounded-lg bg-flop-green/15 text-flop-green border border-flop-green/30 group-hover:scale-105 transition-transform">
              <GitBranch className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-flop-ice tracking-tight">
            {stats.epochsSealed.toLocaleString()}
          </div>
          <div className="text-[11px] text-flop-grey flex items-center justify-between pt-0.5">
            <span>Published Trees</span>
            <span className="text-[10px] text-flop-cyan font-bold">SHA-256 Proofs</span>
          </div>
        </div>

        {/* Card 4: Collector Status */}
        <div className="p-4 rounded-xl bg-surface-raised border border-surface-border hover:border-flop-green/40 transition-all space-y-2 group">
          <div className="flex items-center justify-between text-xs text-flop-grey">
            <span className="text-[10px] uppercase font-bold tracking-wider">Collector Status</span>
            <div className="p-1.5 rounded-lg bg-flop-green/15 text-flop-green border border-flop-green/30 group-hover:scale-105 transition-transform">
              <Activity className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-flop-green flex items-center gap-2 tracking-tight">
            <span>{stats.collectorStatus}</span>
            <span className="w-2.5 h-2.5 rounded-full bg-flop-green animate-pulse" />
          </div>
          <div className="text-[11px] text-flop-grey flex items-center justify-between pt-0.5">
            <span>Autonomous Daemon</span>
            <span className="text-[10px] text-flop-green font-bold">Active Loop</span>
          </div>
        </div>
      </div>

      {/* Quick Access Navigation Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 pt-1 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/continuum/archive"
            className="px-3 py-1.5 rounded-lg bg-surface-raised border border-surface-border text-flop-grey hover:text-flop-ice hover:border-flop-blue/40 transition-all flex items-center gap-1.5"
          >
            <Database className="w-3.5 h-3.5 text-flop-blue" />
            <span>Browse Archive</span>
          </Link>
          <Link
            href="/continuum/verify"
            className="px-3 py-1.5 rounded-lg bg-surface-raised border border-surface-border text-flop-grey hover:text-flop-ice hover:border-flop-green/40 transition-all flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-flop-green" />
            <span>Verify Merkle Proofs</span>
          </Link>
          <Link
            href="/continuum/coverage"
            className="px-3 py-1.5 rounded-lg bg-surface-raised border border-surface-border text-flop-grey hover:text-flop-ice hover:border-flop-cyan/40 transition-all flex items-center gap-1.5"
          >
            <Radio className="w-3.5 h-3.5 text-flop-cyan" />
            <span>Gap & Sequence Audit</span>
          </Link>
          <Link
            href="/continuum/status"
            className="px-3 py-1.5 rounded-lg bg-surface-raised border border-surface-border text-flop-grey hover:text-flop-ice hover:border-flop-blue/40 transition-all flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-flop-grey" />
            <span>Worker Telemetry</span>
          </Link>
        </div>

        <div className="text-[11px] text-flop-grey">
          Engine: <span className="text-slate-300">Binary SHA-256 + Supabase PostgreSQL</span>
        </div>
      </div>
    </div>
  );
}
