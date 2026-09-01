"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Database,
  HardDrive,
  Clock,
  AlertTriangle,
  Layers,
  Calculator,
  ShieldAlert,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { PROTOCOL_LIMITS } from "@/lib/protocol/constants";

export function AnalyticsDashboard() {
  // Estimated live stats
  const [roomCount, setRoomCount] = useState(128);
  const [noteCount, setNoteCount] = useState(3840);
  const [storageBytes, setStorageBytes] = useState(48500000); // ~48 MB

  // Calculator state
  const [calcMsgRatePerMin, setCalcMsgRatePerMin] = useState(10);
  const [calcAvgMsgBytes, setCalcAvgMsgBytes] = useState(256);
  const [calcRoomType, setCalcRoomType] = useState<"standard" | "ephemeral">("standard");

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/proxy?path=/rooms");
        const text = await res.text();
        const lines = text.split("\n").filter((l) => l.trim());

        const countMatch = text.match(/rooms:\s*(\d+)/i);
        const notesMatch = text.match(/notes:\s*(\d+)/i);
        const storageMatch = text.match(/storage:\s*(\d+)/i);

        if (countMatch) setRoomCount(parseInt(countMatch[1], 10));
        if (notesMatch) setNoteCount(parseInt(notesMatch[1], 10));
        if (storageMatch) setStorageBytes(parseInt(storageMatch[1], 10));
      } catch {
        // Fallback to defaults
      }
    }
    fetchStats();
  }, []);

  // Eviction math calculation
  const bytesPerMinute = calcMsgRatePerMin * calcAvgMsgBytes;
  const roomRingLimit = PROTOCOL_LIMITS.ROOM_RING_BYTES; // 10 MiB
  const minutesToFillRing = bytesPerMinute > 0 ? roomRingLimit / bytesPerMinute : Infinity;
  const hoursToFillRing = (minutesToFillRing / 60).toFixed(1);
  const daysToFillRing = (minutesToFillRing / (60 * 24)).toFixed(1);

  // Global percentages
  const roomPercent = ((roomCount / PROTOCOL_LIMITS.MAX_ROOMS) * 100).toFixed(1);
  const notePercent = ((noteCount / PROTOCOL_LIMITS.MAX_NOTES) * 100).toFixed(1);
  const storagePercent = ((storageBytes / PROTOCOL_LIMITS.TOTAL_ROOM_STORAGE_BYTES) * 100).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl border border-surface-border bg-gradient-to-r from-flop-base via-surface-card to-flop-base p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-flop-cyan/20 text-flop-cyan border border-flop-cyan/30">
                <BarChart3 className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-flop-ice">
                Capacity Analytics & Eviction Forecaster
              </h1>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-flop-blue/15 text-flop-cyan border border-flop-blue/30">
                5.0 GiB Global Pool
              </span>
            </div>
            <p className="text-xs sm:text-sm text-flop-grey font-mono max-w-2xl">
              Real-time capacity saturation metrics, ring-buffer overwrite models, and retention forecasting.
            </p>
          </div>
        </div>
      </div>

      {/* Global Capacity Saturation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Rooms Card */}
        <div className="p-5 rounded-xl border border-surface-border bg-surface-card space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-flop-grey uppercase">Global Rooms Cap</span>
            <Database className="w-4 h-4 text-flop-cyan" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-flop-ice">
              {roomCount.toLocaleString()}
            </span>
            <span className="text-xs font-mono text-flop-grey">
              / {PROTOCOL_LIMITS.MAX_ROOMS.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-flop-base rounded-full h-2 overflow-hidden border border-surface-border">
            <div
              className="bg-flop-cyan h-full rounded-full transition-all"
              style={{ width: `${Math.min(Number(roomPercent), 100)}%` }}
            />
          </div>
          <p className="text-[11px] font-mono text-flop-grey flex justify-between">
            <span>Capacity Utilized:</span>
            <span className="text-flop-cyan font-bold">{roomPercent}%</span>
          </p>
        </div>

        {/* Notes Card */}
        <div className="p-5 rounded-xl border border-surface-border bg-surface-card space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-flop-grey uppercase">Global Notes Cap</span>
            <Layers className="w-4 h-4 text-flop-blue" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-flop-ice">
              {noteCount.toLocaleString()}
            </span>
            <span className="text-xs font-mono text-flop-grey">
              / {PROTOCOL_LIMITS.MAX_NOTES.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-flop-base rounded-full h-2 overflow-hidden border border-surface-border">
            <div
              className="bg-flop-blue h-full rounded-full transition-all"
              style={{ width: `${Math.min(Number(notePercent), 100)}%` }}
            />
          </div>
          <p className="text-[11px] font-mono text-flop-grey flex justify-between">
            <span>Capacity Utilized:</span>
            <span className="text-flop-blue font-bold">{notePercent}%</span>
          </p>
        </div>

        {/* Total Storage Card */}
        <div className="p-5 rounded-xl border border-surface-border bg-surface-card space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-flop-grey uppercase">Storage Budget</span>
            <HardDrive className="w-4 h-4 text-flop-green" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-flop-ice">
              {(storageBytes / (1024 * 1024)).toFixed(1)} MB
            </span>
            <span className="text-xs font-mono text-flop-grey">
              / 5.0 GiB
            </span>
          </div>
          <div className="w-full bg-flop-base rounded-full h-2 overflow-hidden border border-surface-border">
            <div
              className="bg-flop-green h-full rounded-full transition-all"
              style={{ width: `${Math.min(Number(storagePercent), 100)}%` }}
            />
          </div>
          <p className="text-[11px] font-mono text-flop-grey flex justify-between">
            <span>Pool Saturation:</span>
            <span className="text-flop-green font-bold">{storagePercent}%</span>
          </p>
        </div>
      </div>

      {/* Interactive Ring-Buffer Eviction Forecaster */}
      <div className="rounded-xl border border-surface-border bg-surface-card p-6 space-y-5 shadow-sm">
        <div className="flex items-center gap-2 border-b border-surface-border pb-3">
          <Calculator className="w-5 h-5 text-flop-cyan" />
          <div>
            <h2 className="text-base font-bold text-flop-ice">
              Ring-Buffer Overwrite & Eviction Predictor
            </h2>
            <p className="text-xs text-flop-grey font-mono">
              Estimate when room messages will drop off based on ingress velocity and Technocore buffer limits.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="space-y-4 md:col-span-1 border-r border-surface-border/50 pr-0 md:pr-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-flop-grey flex justify-between">
                <span>Message Velocity:</span>
                <span className="text-flop-cyan font-bold">{calcMsgRatePerMin} msgs/min</span>
              </label>
              <input
                type="range"
                min={1}
                max={120}
                value={calcMsgRatePerMin}
                onChange={(e) => setCalcMsgRatePerMin(Number(e.target.value))}
                className="w-full accent-flop-blue"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-flop-grey flex justify-between">
                <span>Avg Message Size:</span>
                <span className="text-flop-cyan font-bold">{calcAvgMsgBytes} bytes</span>
              </label>
              <input
                type="range"
                min={64}
                max={4096}
                step={64}
                value={calcAvgMsgBytes}
                onChange={(e) => setCalcAvgMsgBytes(Number(e.target.value))}
                className="w-full accent-flop-blue"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-flop-grey">Room Classification</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCalcRoomType("standard")}
                  className={`py-2 px-3 rounded-lg text-xs font-mono transition-all ${
                    calcRoomType === "standard"
                      ? "bg-flop-blue text-flop-ice font-bold border border-flop-blue"
                      : "bg-flop-base text-flop-grey border border-surface-border hover:text-flop-ice"
                  }`}
                >
                  Standard (10 MiB)
                </button>
                <button
                  type="button"
                  onClick={() => setCalcRoomType("ephemeral")}
                  className={`py-2 px-3 rounded-lg text-xs font-mono transition-all ${
                    calcRoomType === "ephemeral"
                      ? "bg-amber-500/20 text-amber-400 font-bold border border-amber-500/40"
                      : "bg-flop-base text-flop-grey border border-surface-border hover:text-flop-ice"
                  }`}
                >
                  Ephemeral `e-` (15m)
                </button>
              </div>
            </div>
          </div>

          {/* Results Output */}
          <div className="md:col-span-2 space-y-4 flex flex-col justify-center">
            {calcRoomType === "ephemeral" ? (
              <div className="p-5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm font-mono">
                  <Clock className="w-4 h-4" />
                  Ephemeral TTL Active (15-Minute Expiry)
                </div>
                <p className="text-xs font-mono text-flop-grey leading-relaxed">
                  In `e-` prefixed rooms, messages older than **15 minutes (900 seconds)** are immediately filtered out on read, regardless of ring buffer memory size.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-flop-base border border-surface-border space-y-1.5">
                  <span className="text-[11px] font-mono text-flop-grey uppercase">
                    Data Ingress Rate
                  </span>
                  <div className="text-xl font-bold font-mono text-flop-cyan">
                    {(bytesPerMinute / 1024).toFixed(2)} KB / min
                  </div>
                  <p className="text-[10px] text-flop-grey font-mono">
                    {((bytesPerMinute * 60) / (1024 * 1024)).toFixed(2)} MB per hour
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-flop-base border border-surface-border space-y-1.5">
                  <span className="text-[11px] font-mono text-flop-grey uppercase">
                    Est. Ring Overwrite Window
                  </span>
                  <div className="text-xl font-bold font-mono text-flop-green">
                    ~{hoursToFillRing} Hours ({daysToFillRing} Days)
                  </div>
                  <p className="text-[10px] text-flop-grey font-mono">
                    Time before sequence numbers roll off 10 MiB limit
                  </p>
                </div>
              </div>
            )}

            {/* Invariant Note */}
            <div className="p-4 rounded-xl bg-surface-raised border border-surface-border text-xs font-mono text-flop-grey flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-flop-cyan shrink-0 mt-0.5" />
              <span>
                <strong className="text-flop-ice">Technocore Retention Rule:</strong> Rooms inactive for &gt;7 days are automatically evicted. Single-message abandoned rooms are pruned after 24 hours. The <strong>Technocore Continuum</strong> layer archives observed messages to prevent data loss.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
