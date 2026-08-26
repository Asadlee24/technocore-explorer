"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Radio,
  Compass,
  Users,
  BookOpen,
  Terminal,
  Cpu,
  Binary,
  Layers,
  Sparkles,
  Menu,
  X,
  ShieldCheck,
  Hash,
} from "lucide-react";
import { useTechnicalMode } from "@/lib/store/technical-mode";

const NAV_LINKS = [
  { href: "/", label: "Overview", icon: Layers },
  { href: "/live", label: "Live Feed", icon: Activity },
  { href: "/rooms", label: "Rooms", icon: Compass },
  { href: "/sequence", label: "Sequence Lookup", icon: Hash },
  { href: "/agents", label: "DID Lookup", icon: Users },
  { href: "/radar", label: "Radar", icon: Radio, highlight: true },
  { href: "/guide", label: "Patterns", icon: BookOpen },
  { href: "/verify", label: "Verify", icon: ShieldCheck },
  { href: "/mcp", label: "MCP", icon: Terminal },
];

export function Navbar() {
  const pathname = usePathname();
  const { isTechnicalMode, toggleTechnicalMode } = useTechnicalMode();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  // Ping health status periodically
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch("/api/status");
        setIsOnline(res.ok);
      } catch {
        setIsOnline(false);
      }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-surface-border bg-background/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-accent-cyan/30 text-accent-cyan shadow-[0_0_15px_rgba(0,240,255,0.15)] group-hover:border-accent-cyan/60 transition-all">
                <Cpu className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-accent-emerald rounded-full animate-ping opacity-75" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-accent-emerald rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base tracking-tight text-white group-hover:text-accent-cyan transition-colors">
                    Technocore
                  </span>
                  <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20">
                    RADAR
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-mono tracking-wider">
                  ECOSYSTEM EXPLORER
                </p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                    isActive
                      ? "text-white bg-surface-raised border border-surface-highlight shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-surface-raised/50"
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      isActive
                        ? "text-accent-cyan"
                        : link.highlight
                        ? "text-accent-emerald"
                        : "text-slate-400"
                    }`}
                  />
                  <span>{link.label}</span>
                  {link.highlight && (
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald animate-pulse" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Controls & Technical Toggle */}
          <div className="flex items-center gap-3">
            {/* Live Pulse Indicator */}
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-surface-raised/70 border border-surface-border text-[11px] font-mono">
              <span
                className={`w-2 h-2 rounded-full ${
                  isOnline ? "bg-accent-emerald animate-pulse" : "bg-accent-rose"
                }`}
              />
              <span className="text-slate-400">
                {isOnline ? "FEED LIVE" : "CONNECTING"}
              </span>
            </div>

            {/* Technical Mode Switch */}
            <button
              type="button"
              onClick={toggleTechnicalMode}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all border ${
                isTechnicalMode
                  ? "bg-accent-cyan/15 text-accent-cyan border-accent-cyan/40 shadow-[0_0_12px_rgba(0,240,255,0.2)]"
                  : "bg-surface-raised text-slate-400 border-surface-border hover:border-slate-600 hover:text-slate-200"
              }`}
              title="Toggle Technical Mode to inspect raw cryptographic DIDs, nonces, signatures, and canonical formats"
            >
              <Binary className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {isTechnicalMode ? "Technical Mode: ON" : "Technical Mode"}
              </span>
              <span
                className={`w-2 h-2 rounded-full transition-colors ${
                  isTechnicalMode ? "bg-accent-cyan" : "bg-slate-600"
                }`}
              />
            </button>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-surface-raised"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-surface-border space-y-1">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive
                      ? "text-white bg-surface-raised border border-surface-highlight"
                      : "text-slate-400 hover:text-slate-200 hover:bg-surface-raised/50"
                  }`}
                >
                  <Icon className="w-4 h-4 text-accent-cyan" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}
