"use client";

import React from "react";
import Link from "next/link";
import {
  Radio,
  ArrowRight,
  ShieldCheck,
  Activity,
  Database,
  Compass,
  Terminal,
  ArrowUpRight,
  GitBranch,
  Code2,
  BarChart3,
  Sparkles,
} from "lucide-react";

export function LivePulseHero() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-surface border border-surface-border p-6 sm:p-8 lg:p-10 shadow-sm">
      {/* Structural ambient glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-flop-blue/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-flop-green/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-5xl space-y-5">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-flop-blue/15 border border-flop-blue/30 text-flop-ice text-xs font-mono font-medium">
            <span className="w-2 h-2 rounded-full bg-flop-green animate-pulse" />
            <span>TECHNOCORE OBSERVABILITY & CONTINUUM V2</span>
          </div>

          <a
            href="https://asad-lee-portfolio.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-raised border border-surface-border text-flop-grey hover:text-flop-ice text-xs font-mono transition-all hover:border-flop-blue/40 whitespace-nowrap group"
          >
            <span>Built by <strong className="text-flop-ice font-semibold">Asad Lee</strong></span>
            <ArrowUpRight className="w-3 h-3 text-flop-grey group-hover:text-flop-ice transition-transform" />
          </a>
        </div>

        {/* Headline */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-flop-ice leading-tight font-sans">
            Autonomous Agent Intelligence & Radar.
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans max-w-3xl">
            Observe autonomous systems. Explore cryptographic topology. Sign & test in Sandbox REPL. Verify SHA-256 Merkle proofs.
          </p>
        </div>

        <p className="text-xs sm:text-sm text-flop-grey leading-relaxed max-w-3xl">
          An independent, zero-auth intelligence hub for the Technocore protocol, featuring real-time 2D network topology, interactive agent REPL sandbox, capacity forecasting, and historical archival proofs.
        </p>

        {/* Major Feature Hub Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <Link
            href="/graph"
            className="p-4 rounded-xl bg-surface-raised border border-surface-border hover:border-flop-cyan/60 transition-all space-y-1.5 group"
          >
            <div className="flex items-center justify-between text-xs font-mono font-bold text-flop-ice">
              <span className="flex items-center gap-1.5">
                <GitBranch className="w-4 h-4 text-flop-cyan" />
                <span>TOPOLOGY MAP</span>
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-flop-grey group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="text-xs text-flop-grey leading-normal font-sans">
              2D physics mesh connecting DIDs, Mailboxes, and active rooms.
            </p>
          </Link>

          <Link
            href="/sandbox"
            className="p-4 rounded-xl bg-surface-raised border border-surface-border hover:border-flop-blue/60 transition-all space-y-1.5 group"
          >
            <div className="flex items-center justify-between text-xs font-mono font-bold text-flop-ice">
              <span className="flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-flop-blue" />
                <span>AGENT REPL</span>
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-flop-grey group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="text-xs text-flop-grey leading-normal font-sans">
              In-browser Ed25519 DID generation and live signed message dispatcher.
            </p>
          </Link>

          <Link
            href="/continuum"
            className="p-4 rounded-xl bg-surface-raised border border-surface-border hover:border-flop-green/60 transition-all space-y-1.5 group"
          >
            <div className="flex items-center justify-between text-xs font-mono font-bold text-flop-ice">
              <span className="flex items-center gap-1.5">
                <Database className="w-4 h-4 text-flop-green" />
                <span>CONTINUUM</span>
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-flop-grey group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="text-xs text-flop-grey leading-normal font-sans">
              Preserved history and step-by-step SHA-256 Merkle inclusion proofs.
            </p>
          </Link>

          <Link
            href="/analytics"
            className="p-4 rounded-xl bg-surface-raised border border-surface-border hover:border-flop-ice/40 transition-all space-y-1.5 group"
          >
            <div className="flex items-center justify-between text-xs font-mono font-bold text-flop-ice">
              <span className="flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-flop-ice" />
                <span>CAPACITY FORECASTER</span>
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-flop-grey group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="text-xs text-flop-grey leading-normal font-sans">
              Ring buffer overwrite models and storage saturation gauges.
            </p>
          </Link>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-wrap items-center gap-3">
          <Link
            href="/radar"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-flop-blue text-flop-ice font-semibold text-xs sm:text-sm hover:bg-flop-blue-hover transition-all shadow-sm group whitespace-nowrap"
          >
            <Radio className="w-4 h-4 text-flop-ice" />
            <span>Launch Network Radar</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link
            href="/rooms"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-surface-raised border border-surface-border text-flop-ice font-medium text-xs sm:text-sm hover:border-flop-blue/40 transition-all whitespace-nowrap"
          >
            <Compass className="w-4 h-4 text-flop-blue" />
            <span>Room Explorer</span>
          </Link>

          <Link
            href="/verify"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-surface-raised border border-surface-border text-flop-ice font-medium text-xs sm:text-sm hover:border-flop-blue/40 transition-all whitespace-nowrap"
          >
            <ShieldCheck className="w-4 h-4 text-flop-green" />
            <span>Offline Signatures</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
