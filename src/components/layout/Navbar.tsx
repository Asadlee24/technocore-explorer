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
  Database,
  Layers,
  Menu,
  X,
  ShieldCheck,
  Hash,
  ExternalLink,
  Binary,
  GitBranch,
} from "lucide-react";
import { useTechnicalMode } from "@/lib/store/technical-mode";

const NAV_ITEMS = [
  { href: "/", label: "Overview", icon: Layers },
  { href: "/live", label: "Live Feed", icon: Activity },
  { href: "/rooms", label: "Rooms", icon: Compass },
  { href: "/agents", label: "DID Explorer", icon: Users },
  { href: "/radar", label: "Radar", icon: Radio, highlight: true },
  { href: "/continuum", label: "Continuum", icon: Database, isContinuum: true },
  { href: "/sequence", label: "Sequence", icon: Hash },
  { href: "/verify", label: "Verify", icon: ShieldCheck },
  { href: "/guide", label: "Protocol", icon: BookOpen },
  { href: "/mcp", label: "MCP", icon: Terminal },
];

export function Navbar() {
  const pathname = usePathname();
  const { isTechnicalMode, toggleTechnicalMode } = useTechnicalMode();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  // Health ping
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
      <header className="sticky top-0 z-50 w-full border-b border-surface-border bg-flop-base/95 backdrop-blur-xl transition-all shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            
            {/* Brand Wordmark & Chip */}
            <div className="flex items-center gap-3 shrink-0">
              <Link href="/" className="flex items-center gap-2.5 group">
                {/* Official FLOP Chip (Cyan) */}
                <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-flop-base border border-flop-cyan/50 text-flop-cyan group-hover:border-flop-cyan transition-all">
                  <div className="w-3.5 h-3.5 border-2 border-flop-cyan rounded-sm rotate-45 group-hover:rotate-90 transition-transform duration-300" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm sm:text-base tracking-tight text-flop-ice group-hover:text-flop-blue transition-colors">
                      Technocore
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-flop-blue/15 text-flop-ice border border-flop-blue/40 font-semibold">
                      V2
                    </span>
                  </div>
                  <p className="text-[9px] text-flop-grey font-mono tracking-wider uppercase">
                    Independent Explorer
                  </p>
                </div>
              </Link>

              {/* Creator Credit Pill */}
              <a
                href="https://asad-lee-portfolio.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-raised border border-surface-border text-xs font-mono text-flop-grey hover:text-flop-ice hover:border-flop-blue/40 transition-all shrink-0 ml-1"
                title="Independent project built by Asad Lee"
              >
                <span>Built by <strong className="font-semibold text-flop-ice">Asad Lee</strong></span>
                <ExternalLink className="w-3 h-3 text-flop-grey" />
              </a>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
              {NAV_ITEMS.map((link) => {
                const Icon = link.icon;
                const isActive =
                  pathname === link.href ||
                  (link.href === "/continuum" && pathname.startsWith("/continuum"));

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                      isActive
                        ? "text-flop-ice bg-surface-raised border border-flop-blue/40 shadow-sm"
                        : "text-flop-grey hover:text-flop-ice hover:bg-surface-raised/60"
                    }`}
                  >
                    <Icon
                      className={`w-3.5 h-3.5 ${
                        isActive
                          ? "text-flop-blue"
                          : link.isContinuum
                          ? "text-flop-cyan"
                          : link.highlight
                          ? "text-flop-green"
                          : "text-flop-grey"
                      }`}
                    />
                    <span>{link.label}</span>
                    {link.highlight && (
                      <span className="w-1.5 h-1.5 rounded-full bg-flop-green animate-pulse" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right Controls: Live Status, Tech Toggle, Mobile Menu */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Live Status */}
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-raised border border-surface-border text-[11px] font-mono whitespace-nowrap">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isOnline ? "bg-flop-green animate-pulse" : "bg-flop-grey"
                  }`}
                />
                <span className="text-flop-ice font-medium">
                  {isOnline ? "LIVE" : "OFFLINE"}
                </span>
              </div>

              {/* Technical Mode Switch */}
              <button
                type="button"
                onClick={toggleTechnicalMode}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all border whitespace-nowrap ${
                  isTechnicalMode
                    ? "bg-flop-blue/20 text-flop-ice border-flop-blue shadow-sm"
                    : "bg-surface-raised text-flop-grey border-surface-border hover:border-flop-grey/50 hover:text-flop-ice"
                }`}
                title="Toggle Technical Mode to inspect raw cryptographic DIDs, nonces, and signatures"
              >
                <Binary className="w-3.5 h-3.5" />
                <span>{isTechnicalMode ? "Tech: ON" : "Tech Mode"}</span>
              </button>

              {/* Mobile Menu Toggle */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-flop-ice bg-surface-raised border border-surface-border hover:border-flop-blue/40 transition-colors"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Drawer */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-surface-border space-y-3 animate-in slide-in-from-top-3 duration-200">
              {/* Creator Card */}
              <div className="p-3 rounded-xl bg-surface-raised border border-surface-border flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-flop-blue flex items-center justify-center text-flop-ice font-bold font-mono text-xs">
                    AL
                  </div>
                  <div>
                    <div className="text-xs font-bold text-flop-ice">Built by Asad Lee</div>
                    <div className="text-[10px] text-flop-grey">Independent Infrastructure</div>
                  </div>
                </div>
                <a
                  href="https://asad-lee-portfolio.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-surface border border-surface-border text-flop-ice text-[11px] font-mono font-medium flex items-center gap-1 hover:border-flop-blue"
                >
                  <span>Portfolio</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Grid of Navigation Items */}
              <div className="grid grid-cols-2 gap-1.5">
                {NAV_ITEMS.map((link) => {
                  const Icon = link.icon;
                  const isActive =
                    pathname === link.href ||
                    (link.href === "/continuum" && pathname.startsWith("/continuum"));

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? "text-flop-ice bg-surface-raised border border-flop-blue font-bold shadow-sm"
                          : "text-slate-300 bg-surface border border-surface-border hover:bg-surface-raised hover:text-flop-ice"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive
                            ? "text-flop-blue"
                            : link.isContinuum
                            ? "text-flop-cyan"
                            : link.highlight
                            ? "text-flop-green"
                            : "text-flop-grey"
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

      {/* Floating Mobile Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-flop-base/95 backdrop-blur-xl border-t border-surface-border px-2 py-1.5 shadow-2xl">
        <div className="grid grid-cols-5 gap-1 max-w-md mx-auto">
          {[
            { href: "/", label: "Home", icon: Layers },
            { href: "/live", label: "Live", icon: Activity },
            { href: "/radar", label: "Radar", icon: Radio, highlight: true },
            { href: "/continuum", label: "Continuum", icon: Database },
            { href: "/rooms", label: "Rooms", icon: Compass },
          ].map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href === "/continuum" && pathname.startsWith("/continuum"));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center py-1 px-1 rounded-lg text-[10px] font-medium transition-all ${
                  isActive
                    ? "text-flop-ice bg-surface-raised font-bold border border-flop-blue/40"
                    : "text-flop-grey hover:text-slate-200"
                }`}
              >
                <Icon
                  className={`w-4 h-4 mb-0.5 ${
                    isActive
                      ? "text-flop-blue"
                      : item.highlight
                      ? "text-flop-green"
                      : "text-flop-grey"
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
