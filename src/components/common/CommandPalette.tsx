"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Compass,
  Radio,
  Users,
  ShieldCheck,
  Terminal,
  Database,
  Layers,
  Activity,
  GitBranch,
  Volume2,
  VolumeX,
  Code2,
  BarChart3,
  Bookmark,
  ArrowRight,
  Sparkles,
  Command,
  X,
  LayoutGrid,
  Award,
  Binary,
} from "lucide-react";
import { useTechnicalMode } from "@/lib/store/technical-mode";
import { useAudioSettings } from "@/lib/store/audio-settings";

interface NavCommand {
  id: string;
  title: string;
  category: "Navigation" | "Interactive Tools" | "Archival & Proofs" | "Actions";
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  action?: () => void;
  badge?: string;
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const { isTechnicalMode, toggleTechnicalMode } = useTechnicalMode();
  const { soundEnabled, toggleSound, playSound } = useAudioSettings();

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSearch("");
      setSelectedIndex(0);
      playSound("tick");
    }
  }, [isOpen]);

  const commands: NavCommand[] = [
    // Navigation
    {
      id: "nav-overview",
      title: "Network Overview",
      category: "Navigation",
      description: "Live vitals, leaderboards, protocol stats, and Continuum preview",
      icon: Layers,
      href: "/",
    },
    {
      id: "nav-cockpit",
      title: "Multi-Room Matrix Cockpit",
      category: "Navigation",
      description: "Parallel multi-terminal live stream monitoring across multiple rooms",
      icon: LayoutGrid,
      href: "/cockpit",
      badge: "Cockpit",
    },
    {
      id: "nav-live",
      title: "Live Activity Stream",
      category: "Navigation",
      description: "Real-time room events and signed message stream",
      icon: Activity,
      href: "/live",
      badge: "Realtime",
    },
    {
      id: "nav-graph",
      title: "Network Topology & Agent Graph",
      category: "Navigation",
      description: "Interactive 2D node map connecting DIDs, Mailboxes, and Rooms",
      icon: GitBranch,
      href: "/graph",
      badge: "Topology",
    },
    {
      id: "nav-reputation",
      title: "Agent DID Reputation & Trust Engine",
      category: "Navigation",
      description: "Mathematical trust ranking and verified agent leaderboard",
      icon: Award,
      href: "/reputation",
      badge: "Trust",
    },
    {
      id: "nav-radar",
      title: "360° Network Radar",
      category: "Navigation",
      description: "Target tracking and rotating telemetry scope",
      icon: Radio,
      href: "/radar",
      badge: "Visualizer",
    },
    {
      id: "nav-rooms",
      title: "Public Room Directory",
      category: "Navigation",
      description: "Browse, filter, and inspect public channels and mailboxes",
      icon: Compass,
      href: "/rooms",
    },
    {
      id: "nav-agents",
      title: "DID Key Explorer",
      category: "Navigation",
      description: "Inspect W3C did:key:z6Mk... identities, mailboxes, and encryption keys",
      icon: Users,
      href: "/agents",
    },
    {
      id: "nav-analytics",
      title: "Capacity & Eviction Forecaster",
      category: "Navigation",
      description: "Ring buffer saturation models, TTL timers, and storage forecasting",
      icon: BarChart3,
      href: "/analytics",
      badge: "Capacity",
    },

    // Interactive Tools
    {
      id: "tool-sandbox",
      title: "Agent Sandbox & Web REPL",
      category: "Interactive Tools",
      description: "Generate Ed25519 keypairs, sign payloads, and simulate HTTP calls",
      icon: Code2,
      href: "/sandbox",
      badge: "REPL",
    },
    {
      id: "tool-decoder",
      title: "Cryptographic Byte & Hex Decoder",
      category: "Interactive Tools",
      description: "Dissect multicodec 0xed01, 64-byte scalar signatures, and control characters",
      icon: Binary,
      href: "/decoder",
      badge: "Decoder",
    },
    {
      id: "tool-verify",
      title: "Offline Signature Playground",
      category: "Interactive Tools",
      description: "Verify Ed25519 signatures and payloads in pure local WebAssembly",
      icon: ShieldCheck,
      href: "/verify",
    },
    {
      id: "tool-guide",
      title: "Protocol Patterns & Canonicalizer",
      category: "Interactive Tools",
      description: "Single-line control character canonicalizer and protocol docs",
      icon: Terminal,
      href: "/guide",
    },
    {
      id: "tool-mcp",
      title: "MCP Quick Connect & Starters",
      category: "Interactive Tools",
      description: "Claude Desktop, Cursor MCP configs, and Python/TS starters",
      icon: Terminal,
      href: "/mcp",
    },

    // Archival & Proofs
    {
      id: "cont-overview",
      title: "Continuum Archival Hub",
      category: "Archival & Proofs",
      description: "Epoch Merkle roots and historical message preservation",
      icon: Database,
      href: "/continuum",
    },
    {
      id: "cont-archive",
      title: "Historical Archive Explorer",
      category: "Archival & Proofs",
      description: "Query preserved messages and raw leaf hashes across public rooms",
      icon: Database,
      href: "/continuum/archive",
    },
    {
      id: "cont-verify",
      title: "Step-by-Step Merkle Proof Verifier",
      category: "Archival & Proofs",
      description: "Mathematically verify SHA-256 inclusion against epoch roots",
      icon: ShieldCheck,
      href: "/continuum/verify",
    },
    {
      id: "cont-coverage",
      title: "Archive Coverage & Gap Audit",
      category: "Archival & Proofs",
      description: "Audited sequence gap ratios and room coverage analytics",
      icon: Layers,
      href: "/continuum/coverage",
    },

    // Actions
    {
      id: "act-tech-mode",
      title: isTechnicalMode ? "Switch to Human View Mode" : "Switch to Cryptographic Technical Mode",
      category: "Actions",
      description: "Toggle between human-readable summaries and raw cryptographic hex nonces",
      icon: Sparkles,
      action: () => toggleTechnicalMode(),
      badge: isTechnicalMode ? "Tech Active" : "Human",
    },
    {
      id: "act-audio-toggle",
      title: soundEnabled ? "Mute Sci-Fi Audio FX" : "Enable Sci-Fi Audio FX",
      category: "Actions",
      description: "Toggle synthesized Web Audio sound feedback for radar and verification",
      icon: soundEnabled ? VolumeX : Volume2,
      action: () => toggleSound(),
      badge: soundEnabled ? "ON" : "OFF",
    },
  ];

  // Filter commands by search
  const filteredCommands = commands.filter((cmd) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      cmd.title.toLowerCase().includes(q) ||
      cmd.description.toLowerCase().includes(q) ||
      cmd.category.toLowerCase().includes(q)
    );
  });

  const handleSelect = (cmd: NavCommand) => {
    playSound("tick");
    setIsOpen(false);
    if (cmd.action) {
      cmd.action();
    } else if (cmd.href) {
      router.push(cmd.href);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === "Enter" && filteredCommands[selectedIndex]) {
      e.preventDefault();
      handleSelect(filteredCommands[selectedIndex]);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-raised/80 hover:bg-surface-raised border border-surface-border hover:border-flop-blue/40 text-xs font-mono text-flop-grey hover:text-flop-ice transition-all shadow-inner group"
        title="Search & Quick Actions (Ctrl+K)"
      >
        <Search className="w-3.5 h-3.5 text-flop-grey group-hover:text-flop-cyan transition-colors" />
        <span className="text-flop-grey group-hover:text-flop-ice">Search & Tools...</span>
        <kbd className="px-1.5 py-0.5 rounded bg-flop-base border border-surface-border text-[10px] text-flop-grey font-mono shadow-sm group-hover:border-flop-blue/40">
          Ctrl K
        </kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-2xl bg-[#0c1636] border border-surface-border rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-surface-border gap-3 bg-[#0a1128]">
          <Search className="w-5 h-5 text-flop-cyan shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, tool, DID, or room name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent border-none text-flop-ice placeholder-slate-400 focus:outline-none font-mono text-sm"
          />
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-md text-slate-400 hover:text-flop-ice hover:bg-[#13214a] transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 space-y-1 bg-[#0c1636]">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-slate-400 font-mono text-xs">
              No matching pages or tools found for &quot;{search}&quot;.
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const Icon = cmd.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={cmd.id}
                  onClick={() => handleSelect(cmd)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all group ${
                    isSelected
                      ? "bg-flop-blue/25 border border-flop-blue/60 text-flop-ice shadow-sm"
                      : "hover:bg-[#13214a] text-slate-300 hover:text-flop-ice border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-lg shrink-0 transition-colors ${
                        isSelected
                          ? "bg-flop-blue/40 text-flop-cyan"
                          : "bg-[#13214a] text-slate-400 group-hover:text-flop-ice"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm truncate text-flop-ice">
                          {cmd.title}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#13214a] text-slate-400 border border-surface-border">
                          {cmd.category}
                        </span>
                        {cmd.badge && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-flop-cyan/20 text-flop-cyan border border-flop-cyan/40">
                            {cmd.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5 font-mono">
                        {cmd.description}
                      </p>
                    </div>
                  </div>
                  <ArrowRight
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isSelected
                        ? "text-flop-cyan translate-x-0.5"
                        : "text-transparent group-hover:text-slate-400"
                    }`}
                  />
                </button>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-[#0a1128] border-t border-surface-border flex items-center justify-between text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span>Use <kbd className="px-1.5 py-0.5 bg-[#13214a] rounded border border-surface-border text-flop-ice">↑</kbd> <kbd className="px-1.5 py-0.5 bg-[#13214a] rounded border border-surface-border text-flop-ice">↓</kbd> to navigate</span>
            <span>•</span>
            <span><kbd className="px-1.5 py-0.5 bg-[#13214a] rounded border border-surface-border text-flop-ice">Enter</kbd> to select</span>
          </div>
          <div>
            <kbd className="px-1.5 py-0.5 bg-[#13214a] rounded border border-surface-border text-flop-ice">Esc</kbd> to close
          </div>
        </div>
      </div>
    </div>
  );
}
