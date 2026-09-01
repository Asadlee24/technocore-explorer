"use client";

import React from "react";
import { ContinuumCollectorStatus } from "@/lib/continuum/types";
import {
  Server,
  Activity,
  Cpu,
  Layers,
  Database,
  GitBranch,
} from "lucide-react";

interface CollectorStatusViewProps {
  status: ContinuumCollectorStatus;
}

export function CollectorStatusView({ status }: CollectorStatusViewProps) {
  const isOnline = status.collectorStatus === "ONLINE";
  const isStandby = status.collectorStatus === "STANDBY";
  const statusColor = isOnline ? "text-flop-green" : isStandby ? "text-amber-400" : "text-rose-400";
  const statusBorder = isOnline ? "border-flop-green/30" : isStandby ? "border-amber-400/30" : "border-rose-400/30";
  const statusDot = isOnline ? "bg-flop-green" : isStandby ? "bg-amber-400" : "bg-rose-400";
  const statusBg = isOnline ? "bg-flop-green/15" : isStandby ? "bg-amber-400/15" : "bg-rose-400/15";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${statusBg} ${statusBorder} ${statusColor} border`}>
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-flop-ice">Continuum Collector Infrastructure</h1>
              <p className="text-xs text-flop-grey">
                Real-time telemetry, archival daemon status, and independent worker architecture.
              </p>
            </div>
          </div>
        </div>

        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border ${statusBorder} text-xs font-mono ${statusColor}`}>
          <span className={`w-2 h-2 rounded-full ${statusDot} animate-pulse`} />
          <span>COLLECTOR {status.collectorStatus}</span>
        </div>
      </div>

      {/* Main Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-5 rounded-2xl bg-surface border border-surface-border hover:${statusBorder} transition-all space-y-2 font-mono`}>
          <div className="flex items-center justify-between text-xs text-flop-grey">
            <span>COLLECTOR STATUS</span>
            <Activity className={`w-4 h-4 ${statusColor}`} />
          </div>
          <div className={`text-2xl font-extrabold ${statusColor} flex items-center gap-2`}>
            <span>{status.collectorStatus}</span>
            <span className={`text-xs px-2 py-0.5 rounded ${statusBg} ${statusColor}`}>
              {status.uptimePercent}% Uptime
            </span>
          </div>
          <div className="text-[11px] text-flop-grey">
            Last observation: <span className="text-flop-ice">{new Date(status.lastObservationTs).toLocaleTimeString()}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-surface-border space-y-2 font-mono">
          <div className="flex items-center justify-between text-xs text-flop-grey">
            <span>INGEST VELOCITY</span>
            <Cpu className="w-4 h-4 text-flop-blue" />
          </div>
          <div className="text-2xl font-extrabold text-flop-ice">
            {status.ingestRateMsgPerSec} <span className="text-sm font-normal text-flop-grey">msg/sec</span>
          </div>
          <div className="text-[11px] text-flop-grey">
            Total archived: <span className="text-slate-200">{status.totalMessagesArchived.toLocaleString()} messages</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-surface-border space-y-2 font-mono">
          <div className="flex items-center justify-between text-xs text-flop-grey">
            <span>MERKLE AGGREGATION</span>
            <GitBranch className="w-4 h-4 text-flop-cyan" />
          </div>
          <div className="text-base font-extrabold text-flop-cyan truncate" title={status.latestArchiveRoot}>
            {status.latestArchiveRoot.slice(0, 16)}...
          </div>
          <div className="text-[11px] text-flop-grey">
            Leaves computed: <span className="text-slate-200">{status.totalLeavesComputed.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Backend Architecture Flow */}
      <div className="p-6 rounded-2xl bg-surface border border-surface-border space-y-6">
        <div className="space-y-1">
          <h2 className="text-base font-bold text-flop-ice flex items-center gap-2">
            <Database className="w-4 h-4 text-flop-blue" />
            <span>Independent Ingestion & Merkle Chaining Architecture</span>
          </h2>
          <p className="text-xs text-flop-grey">
            Continuum runs as a decoupled collector worker to prevent long-running loops on serverless edge functions.
          </p>
        </div>

        {/* Architectural Flow Diagram */}
        <div className="p-4 rounded-xl bg-surface-raised border border-surface-border space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center text-xs font-mono">
            <div className="p-3 rounded-lg bg-surface border border-surface-border space-y-1">
              <div className="text-flop-grey text-[10px]">SOURCE</div>
              <div className="font-bold text-flop-ice">Technocore</div>
              <div className="text-[10px] text-flop-grey">HTTP /since long-poll</div>
            </div>

            <div className="p-3 rounded-lg bg-surface border border-flop-blue/40 space-y-1">
              <div className="text-flop-grey text-[10px]">INGESTION</div>
              <div className="font-bold text-flop-blue">Collector Daemon</div>
              <div className="text-[10px] text-flop-grey">Cursor & Gap Detection</div>
            </div>

            <div className="p-3 rounded-lg bg-surface border border-flop-blue/40 space-y-1">
              <div className="text-flop-grey text-[10px]">STORAGE</div>
              <div className="font-bold text-flop-blue">Archive Database</div>
              <div className="text-[10px] text-flop-grey">PostgreSQL / Relational</div>
            </div>

            <div className="p-3 rounded-lg bg-surface border border-flop-green/40 space-y-1">
              <div className="text-flop-grey text-[10px]">CRYPTOGRAPHY</div>
              <div className="font-bold text-flop-green">Merkle Pipeline</div>
              <div className="text-[10px] text-flop-grey">SHA-256 Root Publishing</div>
            </div>

            <div className="p-3 rounded-lg bg-surface border border-surface-border space-y-1">
              <div className="text-flop-grey text-[10px]">FRONTEND</div>
              <div className="font-bold text-flop-ice">Explorer V2</div>
              <div className="text-[10px] text-flop-grey">Vercel UI & Verifier</div>
            </div>
          </div>
        </div>

        {/* Database Specification Notice */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-4 rounded-xl bg-surface-raised border border-surface-border space-y-2">
            <div className="text-flop-ice font-bold">Relational Schema Ready</div>
            <p className="text-flop-grey leading-relaxed">
              Continuum database models support queries by room + sequence, message hash, DID, timestamp, archive root, and Merkle path indexing.
            </p>
            <div className="text-[11px] text-flop-cyan pt-1">
              Schema file: <code className="text-flop-ice">src/lib/continuum/schema.sql</code>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface-raised border border-surface-border space-y-2">
            <div className="text-flop-ice font-bold">Independent Deployment Ready</div>
            <p className="text-flop-grey leading-relaxed">
              Frontend deployed on Vercel; Collector runs on lightweight worker / VPS without blocking serverless web requests.
            </p>
            <div className="text-[11px] text-flop-green pt-1">
              Collector provider: {status.backendProvider}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
