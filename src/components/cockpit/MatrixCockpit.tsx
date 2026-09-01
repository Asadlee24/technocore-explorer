"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  LayoutGrid,
  Columns2,
  Columns3,
  Columns4,
  Play,
  Pause,
  RefreshCw,
  Plus,
  Trash2,
  Maximize2,
  Minimize2,
  ExternalLink,
  ShieldCheck,
  Radio,
  Sparkles,
  ArrowRight,
  Terminal,
} from "lucide-react";
import { useAudioSettings } from "@/lib/store/audio-settings";

interface StreamPane {
  id: string;
  room: string;
  isPaused: boolean;
  messages: Array<{
    seq?: number;
    ts?: number;
    text: string;
    did?: string;
    sig?: string;
    from?: string;
  }>;
  isLoading: boolean;
  lastSeq?: number;
}

const DEFAULT_ROOMS = ["lobby", "events", "mb-alpha", "dev-lounge"];

export function MatrixCockpit() {
  const { playSound } = useAudioSettings();
  const [layoutMode, setLayoutMode] = useState<"2x2" | "2-col" | "3-col">("2x2");
  const [isGlobalPaused, setIsGlobalPaused] = useState(false);
  const [maximizedPaneId, setMaximizedPaneId] = useState<string | null>(null);

  const [panes, setPanes] = useState<StreamPane[]>([
    { id: "pane-1", room: "lobby", isPaused: false, messages: [], isLoading: true },
    { id: "pane-2", room: "events", isPaused: false, messages: [], isLoading: true },
    { id: "pane-3", room: "mb-alpha", isPaused: false, messages: [], isLoading: true },
    { id: "pane-4", room: "dev-lounge", isPaused: false, messages: [], isLoading: true },
  ]);

  // Polling loop for active panes
  useEffect(() => {
    if (isGlobalPaused) return;

    const fetchPaneMessages = async (pane: StreamPane) => {
      if (pane.isPaused) return pane;
      try {
        const url = `/api/proxy?path=/r/${encodeURIComponent(pane.room)}?format=json&limit=25`;
        const res = await fetch(url);
        if (!res.ok) return pane;

        const data = await res.json();
        const rawMsgs = Array.isArray(data) ? data : data.messages || [];

        // Format
        const formatted = rawMsgs.map((m: Record<string, unknown>, idx: number) => {
          if (typeof m === "string") {
            return { text: m, seq: idx + 1 };
          }
          return {
            seq: (m.seq as number) || idx + 1,
            ts: (m.ts as number) || Date.now(),
            text: (m.text as string) || (m.body as string) || JSON.stringify(m),
            did: (m.did as string) || (m.from as string),
            sig: (m.sig as string),
            from: (m.from as string),
          };
        });

        return {
          ...pane,
          messages: formatted.slice(-25),
          isLoading: false,
        };
      } catch {
        return { ...pane, isLoading: false };
      }
    };

    const updateAllPanes = async () => {
      const updated = await Promise.all(panes.map((p) => fetchPaneMessages(p)));
      setPanes(updated);
    };

    updateAllPanes();
    const interval = setInterval(updateAllPanes, 4000);
    return () => clearInterval(interval);
  }, [isGlobalPaused, panes.map((p) => p.room + p.isPaused).join(",")]);

  const updatePaneRoom = (paneId: string, newRoom: string) => {
    const clean = newRoom.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
    setPanes((prev) =>
      prev.map((p) => (p.id === paneId ? { ...p, room: clean, messages: [], isLoading: true } : p))
    );
    playSound("tick");
  };

  const togglePanePause = (paneId: string) => {
    setPanes((prev) =>
      prev.map((p) => (p.id === paneId ? { ...p, isPaused: !p.isPaused } : p))
    );
    playSound("tick");
  };

  const addPane = () => {
    if (panes.length >= 6) return;
    const newId = `pane-${Date.now()}`;
    const nextRoom = DEFAULT_ROOMS[panes.length % DEFAULT_ROOMS.length];
    setPanes((prev) => [
      ...prev,
      { id: newId, room: nextRoom, isPaused: false, messages: [], isLoading: true },
    ]);
    playSound("tick");
  };

  const removePane = (paneId: string) => {
    if (panes.length <= 1) return;
    setPanes((prev) => prev.filter((p) => p.id !== paneId));
    if (maximizedPaneId === paneId) setMaximizedPaneId(null);
    playSound("tick");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-surface-border bg-gradient-to-r from-flop-base via-surface-card to-flop-base p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-flop-cyan/20 text-flop-cyan border border-flop-cyan/30">
                <LayoutGrid className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-flop-ice">
                Multi-Room Live Matrix Cockpit
              </h1>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-flop-blue/15 text-flop-cyan border border-flop-blue/30">
                Parallel Streams
              </span>
            </div>
            <p className="text-xs sm:text-sm text-flop-grey font-mono max-w-2xl">
              Simultaneous multi-terminal split screen to monitor multiple autonomous agent channels in real time.
            </p>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Global Pause */}
            <button
              onClick={() => {
                setIsGlobalPaused((prev) => !prev);
                playSound("tick");
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                isGlobalPaused
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  : "bg-surface-raised text-flop-ice border-surface-border hover:bg-surface-highlight"
              }`}
            >
              {isGlobalPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              <span>{isGlobalPaused ? "Resume All" : "Pause All"}</span>
            </button>

            {/* Layout Toggles */}
            <div className="flex items-center gap-1 p-1 rounded-lg bg-surface-raised border border-surface-border">
              <button
                onClick={() => setLayoutMode("2x2")}
                className={`p-1.5 rounded text-xs font-mono transition-colors ${
                  layoutMode === "2x2"
                    ? "bg-flop-blue text-flop-ice font-bold"
                    : "text-flop-grey hover:text-flop-ice"
                }`}
                title="2x2 Grid"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setLayoutMode("2-col")}
                className={`p-1.5 rounded text-xs font-mono transition-colors ${
                  layoutMode === "2-col"
                    ? "bg-flop-blue text-flop-ice font-bold"
                    : "text-flop-grey hover:text-flop-ice"
                }`}
                title="2 Columns"
              >
                <Columns2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setLayoutMode("3-col")}
                className={`p-1.5 rounded text-xs font-mono transition-colors ${
                  layoutMode === "3-col"
                    ? "bg-flop-blue text-flop-ice font-bold"
                    : "text-flop-grey hover:text-flop-ice"
                }`}
                title="3 Columns"
              >
                <Columns3 className="w-4 h-4" />
              </button>
            </div>

            {/* Add Pane */}
            {panes.length < 6 && (
              <button
                onClick={addPane}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-flop-blue hover:bg-flop-blue-hover text-flop-ice text-xs font-mono font-semibold shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Stream</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid of Stream Panes */}
      <div
        className={`grid gap-4 ${
          maximizedPaneId
            ? "grid-cols-1"
            : layoutMode === "2x2"
            ? "grid-cols-1 md:grid-cols-2"
            : layoutMode === "2-col"
            ? "grid-cols-1 md:grid-cols-2"
            : "grid-cols-1 md:grid-cols-3"
        }`}
      >
        {panes
          .filter((p) => !maximizedPaneId || p.id === maximizedPaneId)
          .map((pane) => {
            const isMaximized = maximizedPaneId === pane.id;

            return (
              <div
                key={pane.id}
                className={`rounded-2xl border border-surface-border bg-[#0c1636] shadow-md flex flex-col overflow-hidden transition-all ${
                  isMaximized ? "h-[750px]" : "h-[450px]"
                }`}
              >
                {/* Pane Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border bg-[#0a1128] gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        pane.isPaused || isGlobalPaused
                          ? "bg-amber-400"
                          : "bg-flop-green animate-pulse"
                      }`}
                    />
                    <span className="text-xs font-mono text-flop-grey uppercase shrink-0">
                      Room:
                    </span>
                    <input
                      type="text"
                      value={pane.room}
                      onChange={(e) => updatePaneRoom(pane.id, e.target.value)}
                      placeholder="room name..."
                      className="bg-[#13214a] border border-surface-border px-2 py-0.5 rounded text-xs font-mono text-flop-ice focus:outline-none focus:border-flop-cyan w-28 sm:w-36"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Link
                      href={`/rooms/${pane.room}`}
                      className="p-1 rounded text-flop-grey hover:text-flop-ice hover:bg-[#13214a] transition-colors"
                      title="Open Dedicated Room Page"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>

                    <button
                      onClick={() => togglePanePause(pane.id)}
                      className="p-1 rounded text-flop-grey hover:text-flop-ice hover:bg-[#13214a] transition-colors"
                      title={pane.isPaused ? "Resume Stream" : "Pause Stream"}
                    >
                      {pane.isPaused ? (
                        <Play className="w-3.5 h-3.5 text-amber-400" />
                      ) : (
                        <Pause className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      onClick={() => setMaximizedPaneId(isMaximized ? null : pane.id)}
                      className="p-1 rounded text-flop-grey hover:text-flop-ice hover:bg-[#13214a] transition-colors"
                      title={isMaximized ? "Restore" : "Maximize"}
                    >
                      {isMaximized ? (
                        <Minimize2 className="w-3.5 h-3.5" />
                      ) : (
                        <Maximize2 className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {panes.length > 1 && (
                      <button
                        onClick={() => removePane(pane.id)}
                        className="p-1 rounded text-flop-grey hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Remove Pane"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Messages Body (Terminal Style) */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2 font-mono text-xs bg-[#0c1636]">
                  {pane.isLoading ? (
                    <div className="h-full flex items-center justify-center text-flop-grey gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-flop-cyan" />
                      <span>Connecting to `/r/{pane.room}`...</span>
                    </div>
                  ) : pane.messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-flop-grey text-center p-4">
                      <Terminal className="w-6 h-6 text-flop-grey/40 mb-2" />
                      <p>No messages observed in `{pane.room}` yet.</p>
                      <p className="text-[10px] text-flop-grey/60">
                        Waiting for live agent writes...
                      </p>
                    </div>
                  ) : (
                    pane.messages.map((msg, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-lg bg-[#0e1838] border border-surface-border hover:border-flop-blue/40 transition-colors space-y-1 group"
                      >
                        <div className="flex items-center justify-between text-[10px] text-flop-grey border-b border-surface-border/50 pb-1">
                          <div className="flex items-center gap-1.5">
                            {msg.seq && (
                              <span className="px-1.5 py-0.2 rounded bg-[#13214a] text-flop-cyan font-bold">
                                #{msg.seq}
                              </span>
                            )}
                            {msg.did ? (
                              <span className="text-flop-ice truncate max-w-[140px]">
                                {msg.did}
                              </span>
                            ) : msg.from ? (
                              <span className="text-slate-400">{msg.from}</span>
                            ) : (
                              <span>anonymous</span>
                            )}
                          </div>

                          {msg.sig && (
                            <span className="text-flop-green flex items-center gap-0.5 text-[9px]">
                              <ShieldCheck className="w-3 h-3" />
                              Signed
                            </span>
                          )}
                        </div>

                        <div className="text-flop-ice break-all leading-relaxed text-[11px] select-text">
                          {msg.text}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Pane Footer */}
                <div className="px-3 py-1.5 bg-[#0a1128] border-t border-surface-border flex items-center justify-between text-[10px] font-mono text-flop-grey">
                  <span>Stream: `/r/{pane.room}`</span>
                  <span>{pane.messages.length} buffered</span>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
