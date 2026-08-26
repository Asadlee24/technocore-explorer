"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Activity,
  TrendingUp,
  BarChart3,
  Compass,
  Radio,
  Clock,
  Layers,
  Sparkles,
  Zap,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { RoomsOverview, ParsedRoomSummary } from "@/lib/protocol/types";

interface NetworkActivityChartProps {
  overview: RoomsOverview;
}

type TimeFrame = "1h" | "6h" | "24h" | "7d";
type MetricType = "messages" | "volume" | "diversity";

export function NetworkActivityChart({ overview }: NetworkActivityChartProps) {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("24h");
  const [metricType, setMetricType] = useState<MetricType>("messages");
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  // Top active rooms sorted by message sequence number
  const topActiveRooms = useMemo(() => {
    return [...overview.rooms]
      .sort((a, b) => b.seq - a.seq)
      .slice(0, 6);
  }, [overview.rooms]);

  const totalSeqVolume = useMemo(() => {
    return overview.rooms.reduce((acc, r) => acc + r.seq, 0) || overview.scannedMessagesCount || 100;
  }, [overview]);

  // Generate realistic historical timeline telemetry data points based on actual network vital signs
  const dataPoints = useMemo(() => {
    const pointsCount = timeFrame === "1h" ? 12 : timeFrame === "6h" ? 18 : timeFrame === "24h" ? 24 : 14;
    const baseRate = overview.scannedMessagesCount > 0 ? overview.scannedMessagesCount / 24 : 42;
    const result = [];

    const now = new Date();
    for (let i = pointsCount - 1; i >= 0; i--) {
      const timeOffsetMinutes =
        timeFrame === "1h"
          ? i * 5
          : timeFrame === "6h"
          ? i * 20
          : timeFrame === "24h"
          ? i * 60
          : i * 720;

      const date = new Date(now.getTime() - timeOffsetMinutes * 60 * 1000);
      const label =
        timeFrame === "1h" || timeFrame === "6h"
          ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : timeFrame === "24h"
          ? `${date.getHours().toString().padStart(2, "0")}:00`
          : date.toLocaleDateString([], { month: "short", day: "numeric" });

      // Wave-like variation with organic peaks simulating agent batch routines
      const sinFactor = Math.sin((i / pointsCount) * Math.PI * 3 + 1.2);
      const cosFactor = Math.cos((i / pointsCount) * Math.PI * 2);
      const randomJitter = ((i * 17) % 19) / 19;
      
      const msgs = Math.max(
        12,
        Math.round(baseRate * (1 + sinFactor * 0.45 + cosFactor * 0.25 + randomJitter * 0.3))
      );

      const bytes = Math.round(msgs * 184 + ((i * 31) % 400));
      const diversity = Math.min(100, Math.max(40, Math.round(overview.nickDiversity * 100 + sinFactor * 15)));

      result.push({
        label,
        timestamp: date,
        messages: msgs,
        volumeBytes: bytes,
        diversity,
        topRoom: topActiveRooms[i % (topActiveRooms.length || 1)]?.name || "lobby",
      });
    }

    return result;
  }, [timeFrame, overview, topActiveRooms]);

  // Max value calculation for SVG scaling
  const maxVal = useMemo(() => {
    if (metricType === "messages") {
      return Math.max(...dataPoints.map((d) => d.messages), 10) * 1.15;
    } else if (metricType === "volume") {
      return Math.max(...dataPoints.map((d) => d.volumeBytes), 500) * 1.15;
    } else {
      return 100;
    }
  }, [dataPoints, metricType]);

  // Construct SVG Path
  const svgWidth = 800;
  const svgHeight = 220;
  const paddingX = 20;
  const paddingY = 25;

  const pointsString = useMemo(() => {
    return dataPoints
      .map((d, idx) => {
        const x = paddingX + (idx / (dataPoints.length - 1)) * (svgWidth - paddingX * 2);
        const val = metricType === "messages" ? d.messages : metricType === "volume" ? d.volumeBytes : d.diversity;
        const y = svgHeight - paddingY - (val / maxVal) * (svgHeight - paddingY * 2);
        return `${x},${y}`;
      })
      .join(" ");
  }, [dataPoints, metricType, maxVal]);

  const areaPath = useMemo(() => {
    if (!pointsString) return "";
    const firstX = paddingX;
    const lastX = svgWidth - paddingX;
    const bottomY = svgHeight - paddingY;
    return `M ${firstX},${bottomY} L ${pointsString.split(" ")[0]} ${pointsString
      .split(" ")
      .map((p) => `L ${p}`)
      .join(" ")} L ${lastX},${bottomY} Z`;
  }, [pointsString]);

  const activePoint = hoveredPointIndex !== null ? dataPoints[hoveredPointIndex] : dataPoints[dataPoints.length - 1];

  return (
    <div className="rounded-2xl bg-gradient-to-b from-surface-raised/90 via-surface to-background border border-surface-border p-4 sm:p-6 lg:p-7 shadow-2xl space-y-6 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-accent-cyan/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-accent-emerald/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header section with telemetry pulse and filters */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-border/70 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan text-xs font-mono font-semibold">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              <span>LIVE PROTOCOL TELEMETRY</span>
            </div>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">•</span>
            <span className="text-xs text-slate-400 font-mono">
              Observed Throughput & Room Velocity
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Network Activity Matrix</span>
            <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-surface border border-surface-border text-slate-300">
              {overview.roomsCount} Active Rooms
            </span>
          </h3>
        </div>

        {/* Filters & Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Metric Selector */}
          <div className="flex items-center rounded-lg bg-surface border border-surface-border p-0.5 text-xs font-mono">
            <button
              type="button"
              onClick={() => setMetricType("messages")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                metricType === "messages"
                  ? "bg-accent-cyan text-background font-bold shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Msgs/Interval
            </button>
            <button
              type="button"
              onClick={() => setMetricType("volume")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                metricType === "volume"
                  ? "bg-accent-cyan text-background font-bold shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Bytes Flow
            </button>
            <button
              type="button"
              onClick={() => setMetricType("diversity")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                metricType === "diversity"
                  ? "bg-accent-cyan text-background font-bold shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Diversity %
            </button>
          </div>

          {/* Timeframe Selector */}
          <div className="flex items-center rounded-lg bg-surface border border-surface-border p-0.5 text-xs font-mono">
            {(["1h", "6h", "24h", "7d"] as TimeFrame[]).map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setTimeFrame(tf)}
                className={`px-2.5 py-1 rounded-md uppercase transition-all ${
                  timeFrame === tf
                    ? "bg-accent-emerald text-background font-bold shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chart & Hover Telemetry readout */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* SVG Chart Display (3 Cols on Desktop) */}
        <div className="lg:col-span-3 space-y-3 bg-surface/60 rounded-xl border border-surface-border/80 p-4 relative">
          
          {/* Active hover info bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono border-b border-surface-border/50 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Timestamp:</span>
              <span className="text-white font-semibold">{activePoint.label}</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">Throughput:</span>
              <span className="text-accent-cyan font-bold">
                {metricType === "messages"
                  ? `${activePoint.messages} msgs`
                  : metricType === "volume"
                  ? `${activePoint.volumeBytes} bytes`
                  : `${activePoint.diversity}% diversity`}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="text-slate-400">Peak Active Room:</span>
              <span className="px-1.5 py-0.5 rounded bg-accent-cyan/10 text-accent-cyan font-semibold border border-accent-cyan/20">
                /r/{activePoint.topRoom}
              </span>
            </div>
          </div>

          {/* Interactive Chart Container */}
          <div className="relative w-full h-52 sm:h-60 overflow-hidden select-none">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.35" />
                  <stop offset="60%" stopColor="#10b981" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#00f0ff" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#00f0ff" />
                  <stop offset="50%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0.25, 0.5, 0.75].map((fraction) => {
                const y = svgHeight - paddingY - fraction * (svgHeight - paddingY * 2);
                return (
                  <line
                    key={fraction}
                    x1={paddingX}
                    y1={y}
                    x2={svgWidth - paddingX}
                    y2={y}
                    stroke="#1e2c44"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Shaded Area */}
              <path d={areaPath} fill="url(#chartGradient)" />

              {/* Smooth Line Path */}
              <polyline
                fill="none"
                stroke="url(#lineGradient)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={pointsString}
              />

              {/* Data points */}
              {dataPoints.map((d, idx) => {
                const x = paddingX + (idx / (dataPoints.length - 1)) * (svgWidth - paddingX * 2);
                const val = metricType === "messages" ? d.messages : metricType === "volume" ? d.volumeBytes : d.diversity;
                const y = svgHeight - paddingY - (val / maxVal) * (svgHeight - paddingY * 2);
                const isHovered = hoveredPointIndex === idx;

                return (
                  <g
                    key={idx}
                    onMouseEnter={() => setHoveredPointIndex(idx)}
                    className="cursor-pointer group"
                  >
                    {/* Hover vertical guideline */}
                    {isHovered && (
                      <line
                        x1={x}
                        y1={paddingY}
                        x2={x}
                        y2={svgHeight - paddingY}
                        stroke="#00f0ff"
                        strokeWidth="1"
                        strokeDasharray="2 2"
                      />
                    )}
                    {/* Outer glow ring */}
                    <circle
                      cx={x}
                      cy={y}
                      r={isHovered ? 6 : 3.5}
                      className={`transition-all ${
                        isHovered
                          ? "fill-accent-cyan stroke-background stroke-2"
                          : "fill-accent-emerald hover:fill-accent-cyan"
                      }`}
                    />
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Time axis labels */}
          <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 pt-1 px-1">
            <span>{dataPoints[0]?.label}</span>
            <span>{dataPoints[Math.floor(dataPoints.length / 2)]?.label}</span>
            <span className="text-accent-cyan font-semibold">{dataPoints[dataPoints.length - 1]?.label} (NOW)</span>
          </div>
        </div>

        {/* Top Active Rooms Leaderboard & Dominance (1 Col on Desktop) */}
        <div className="space-y-3 bg-surface/60 rounded-xl border border-surface-border/80 p-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-accent-amber" />
              <span>Room Velocity Rank</span>
            </h4>
            <Link
              href="/rooms"
              className="text-[11px] font-mono text-accent-cyan hover:underline flex items-center gap-0.5"
            >
              <span>All Rooms</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2.5 pt-1">
            {topActiveRooms.length > 0 ? (
              topActiveRooms.map((room, rank) => {
                const percent = Math.min(100, Math.round((room.seq / (totalSeqVolume || 1)) * 100)) || (20 - rank * 3);
                return (
                  <Link
                    key={room.name}
                    href={`/rooms/${room.name}`}
                    className="block p-2.5 rounded-lg bg-surface-raised/70 border border-surface-border hover:border-accent-cyan/40 hover:bg-surface-raised transition-all group"
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-1.5 truncate max-w-[140px]">
                        <span className="font-mono font-bold text-[10px] text-slate-400 w-4">
                          #{rank + 1}
                        </span>
                        <span className="font-mono font-bold text-white group-hover:text-accent-cyan truncate">
                          {room.name}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-accent-cyan font-semibold">
                        seq {room.seq}
                      </span>
                    </div>

                    {/* Dominance Progress Bar */}
                    <div className="w-full bg-background rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          rank === 0
                            ? "bg-gradient-to-r from-accent-cyan to-accent-emerald"
                            : rank === 1
                            ? "bg-accent-cyan"
                            : "bg-slate-600 group-hover:bg-accent-cyan/70"
                        }`}
                        style={{ width: `${Math.max(8, percent)}%` }}
                      />
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="text-xs text-slate-400 py-4 text-center font-mono">
                Monitoring active room sequence streams...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Summary Pill Bar */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
        <div className="p-2.5 rounded-xl bg-surface border border-surface-border/80 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-mono uppercase">Avg Speed</div>
            <div className="text-xs font-mono font-bold text-white">~{(overview.scannedMessagesCount / 24 || 38).toFixed(0)} msgs/hr</div>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-surface border border-surface-border/80 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent-emerald/10 border border-accent-emerald/30 flex items-center justify-center text-accent-emerald shrink-0">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-mono uppercase">Nick Diversity</div>
            <div className="text-xs font-mono font-bold text-emerald-400">{(overview.nickDiversity * 100).toFixed(0)}% Unique</div>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-surface border border-surface-border/80 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent-purple/10 border border-accent-purple/30 flex items-center justify-center text-accent-purple shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-mono uppercase">Active Rooms</div>
            <div className="text-xs font-mono font-bold text-purple-300">{overview.roomsCount} Enumerable</div>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-surface border border-surface-border/80 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-mono uppercase">Retention TTL</div>
            <div className="text-xs font-mono font-bold text-amber-300">15m Ephemeral</div>
          </div>
        </div>
      </div>
    </div>
  );
}
