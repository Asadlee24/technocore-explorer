"use client";

import React from "react";
import { ContinuumCollectorStatus } from "@/lib/continuum/types";
import { Database, ShieldCheck, Layers, Radio, Activity, AlertTriangle, Key, GitBranch } from "lucide-react";

interface ContinuumMetricCardsProps {
  status: ContinuumCollectorStatus;
}

export function ContinuumMetricCards({ status }: ContinuumMetricCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* 1. Messages Archived */}
      <div className="p-4 sm:p-5 rounded-xl bg-surface border border-surface-border space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-medium text-flop-grey uppercase">
            Messages Archived
          </span>
          <Database className="w-4 h-4 text-flop-blue" />
        </div>
        <div className="text-xl sm:text-2xl font-mono font-extrabold text-flop-ice">
          {status.totalMessagesArchived.toLocaleString()}
        </div>
        <div className="text-[11px] font-mono text-flop-grey">
          Ingest rate: <span className="text-flop-green font-medium">+{status.ingestRateMsgPerSec} msg/sec</span>
        </div>
      </div>

      {/* 2. Monitored Rooms */}
      <div className="p-4 sm:p-5 rounded-xl bg-surface border border-surface-border space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-medium text-flop-grey uppercase">
            Rooms Monitored
          </span>
          <Layers className="w-4 h-4 text-flop-blue" />
        </div>
        <div className="text-xl sm:text-2xl font-mono font-extrabold text-flop-ice">
          {status.roomsMonitored}
        </div>
        <div className="text-[11px] font-mono text-flop-grey">
          Public directory & events stream
        </div>
      </div>

      {/* 3. Latest Archive Merkle Root */}
      <div className="p-4 sm:p-5 rounded-xl bg-surface border border-surface-border space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-medium text-flop-grey uppercase">
            Latest Archive Root
          </span>
          <GitBranch className="w-4 h-4 text-flop-cyan" />
        </div>
        <div className="text-sm sm:text-base font-mono font-bold text-flop-cyan truncate" title={status.latestArchiveRoot}>
          {status.latestArchiveRoot.slice(0, 16)}...
        </div>
        <div className="text-[11px] font-mono text-flop-grey">
          Epoch root published & chained
        </div>
      </div>

      {/* 4. Collector Health & Gaps */}
      <div className="p-4 sm:p-5 rounded-xl bg-surface border border-surface-border space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-medium text-flop-grey uppercase">
            Collector Integrity
          </span>
          <ShieldCheck className="w-4 h-4 text-flop-green" />
        </div>
        <div className="text-xl sm:text-2xl font-mono font-extrabold text-flop-green flex items-center gap-2">
          <span>{status.collectorStatus}</span>
          <span className="w-2.5 h-2.5 rounded-full bg-flop-green animate-pulse" />
        </div>
        <div className="text-[11px] font-mono text-flop-grey flex items-center justify-between">
          <span>Uptime: {status.uptimePercent}%</span>
          <span className="text-flop-grey">({status.collectionGapsDetected} audited gaps)</span>
        </div>
      </div>
    </div>
  );
}
