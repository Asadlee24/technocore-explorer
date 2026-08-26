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
  ExternalLink,
  UserCheck,
} from "lucide-react";
import { useTechnicalMode } from "@/lib/store/technical-mode";

const NAV_LINKS = [
  { href: "/", label: "Overview", icon: Layers },
  { href: "/live", label: "Live Feed", icon: Activity },
  { href: "/rooms", label: "Rooms", icon: Compass },
  { href: "/sequence", label: "Sequence", icon: Hash },
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
    <>
      <header className="sticky top-0 z-50 w-full border-b border-surface-border bg-background/90 backdrop-blur-xl transition-all shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            
            {/* Left: Brand + Creator Tag */}
            <div className="flex items-center gap-3 shrink-0">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500/20 via-emerald-500/15 to-purple-500/20 border border-accent-cyan/40 text-accent-cyan shadow-[0_0_15px_rgba(0,240,255,0.2)] group-hover:border-accent-cyan/80 transition-all">
                  <Cpu className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-accent-emerald rounded-full animate-ping opacity-75" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-accent-emerald rounded-full" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-base tracking-tight text-white group-hover:text-accent-cyan transition-colors">
                      Technocore
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30 font-semibold">
                      RADAR
                    </span>
                  </div>
                  <p className="text-[9px] text-slate-400 font-mono tracking-wider">
                    ECOSYSTEM EXPLORER
                  </p>
                </div>
              </Link>

              {/* Creator Pill on Desktop - Single Line & Clean */}
              <a
                href="https://asad-lee-portfolio.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 hover:border-accent-purple text-xs font-mono text-purple-300 hover:text-white transition-all shadow-sm whitespace-nowrap shrink-0 group ml-1"
                title="Built by Asad Lee"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-accent-purple group-hover:bg-accent-cyan transition-colors" />
                <span>By <strong className="font-semibold text-white group-hover:text-accent-cyan">Asad Lee</strong></span>
                <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-accent-cyan" />
              </a>
            </div>

            {/* Middle: Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 overflow-x-auto no-scrollbar py-1">
              {NAV_LINKS.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
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

            {/* Right: Controls & Technical Toggle & Mobile Toggle */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              {/* Live Status Indicator */}
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-raised/70 border border-surface-border text-[11px] font-mono whitespace-nowrap">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isOnline ? "bg-accent-emerald animate-pulse" : "bg-accent-rose"
                  }`}
                />
                <span className="text-slate-300 font-medium">
                  {isOnline ? "LIVE" : "OFFLINE"}
                </span>
              </div>

              {/* Technical Mode Switch */}
              <button
                type="button"
                onClick={toggleTechnicalMode}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all border whitespace-nowrap ${
                  isTechnicalMode
                    ? "bg-accent-cyan/20 text-accent-cyan border-accent-cyan/50 shadow-[0_0_12px_rgba(0,240,255,0.25)]"
                    : "bg-surface-raised text-slate-400 border-surface-border hover:border-slate-600 hover:text-slate-200"
                }`}
                title="Toggle Technical Mode to inspect raw cryptographic DIDs, nonces, and signatures"
              >
                <Binary className="w-3.5 h-3.5" />
                <span>{isTechnicalMode ? "Tech: ON" : "Tech Mode"}</span>
              </button>

              {/* Mobile Menu Toggle Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white bg-surface-raised border border-surface-border transition-colors"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Dropdown Drawer */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-surface-border space-y-3 animate-in slide-in-from-top-3 duration-200">
              {/* Creator card inside mobile menu */}
              <div className="p-3 rounded-xl bg-gradient-to-r from-purple-950/40 via-surface-raised to-cyan-950/40 border border-purple-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-accent-purple to-accent-cyan flex items-center justify-center text-white font-bold font-mono text-xs">
                    AL
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Built by Asad Lee</div>
                    <div className="text-[10px] text-slate-400">Full Stack & AI Engineer</div>
                  </div>
                </div>
                <a
                  href="https://asad-lee-portfolio.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-accent-purple/20 border border-accent-purple/40 text-accent-purple text-[11px] font-mono font-medium flex items-center gap-1 hover:bg-accent-purple/30 transition-all"
                >
                  <span>Portfolio</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Grid of Navigation items */}
              <div className="grid grid-cols-2 gap-1.5">
                {NAV_LINKS.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? "text-white bg-accent-cyan/15 border border-accent-cyan/40 shadow-sm"
                          : "text-slate-300 hover:text-white bg-surface-raised/60 border border-surface-border/60 hover:bg-surface-raised"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive
                            ? "text-accent-cyan"
                            : link.highlight
                            ? "text-accent-emerald"
                            : "text-slate-400"
                        }`}
                      />
                      <span className="truncate">{link.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Floating Mobile Bottom Navigation Bar for quick 1-tap switching */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-xl border-t border-surface-border px-2 py-1.5 shadow-2xl">
        <div className="grid grid-cols-5 gap-1 max-w-md mx-auto">
          {[
            { href: "/", label: "Home", icon: Layers },
            { href: "/live", label: "Live", icon: Activity },
            { href: "/radar", label: "Radar", icon: Radio, highlight: true },
            { href: "/rooms", label: "Rooms", icon: Compass },
            { href: "/mcp", label: "MCP", icon: Terminal },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center py-1 px-1 rounded-lg text-[10px] font-medium transition-all ${
                  isActive
                    ? "text-accent-cyan bg-accent-cyan/10 font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Icon className={`w-4 h-4 mb-0.5 ${isActive ? "text-accent-cyan" : item.highlight ? "text-accent-emerald" : "text-slate-400"}`} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
