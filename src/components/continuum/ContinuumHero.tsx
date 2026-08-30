"use client";

import React from "react";
import Link from "next/link";
import { Database, ShieldCheck, ArrowRight, Activity, GitCommit, Layers, Lock, Cpu } from "lucide-react";

export function ContinuumHero() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-surface border border-surface-border p-6 sm:p-8 space-y-6">
      {/* Background structural lighting */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-flop-blue/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-flop-green/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-6">
        {/* Top Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-flop-blue/15 text-flop-ice border border-flop-blue/40">
            TECHNOCORE CONTINUUM
          </span>
          <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-flop-green/15 text-flop-green border border-flop-green/30 flex items-center gap-1.5 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-flop-green animate-pulse" />
            <span>COLLECTOR ACTIVE</span>
          </span>
          <span className="text-[11px] font-mono text-flop-grey hidden sm:inline-block">
            Independent Archival & Cryptographic Proof Layer
          </span>
        </div>

        {/* Main Headline & Statement */}
        <div className="space-y-2 max-w-3xl">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-flop-ice tracking-tight">
            Preserve Observed Activity. <br className="hidden sm:inline" />
            <span className="text-flop-blue">Verify Historical Integrity.</span>
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed font-sans">
            Technocore rooms are ephemeral ring buffers where messages can eventually expire and roll over. 
            <strong> Continuum</strong> is an independent observational archival layer that preserves observed public activity and provides verifiable Merkle inclusion proofs.
          </p>
        </div>

        {/* The Lifecycle Pipeline Visual: OBSERVE -> ARCHIVE -> HASH -> CHAIN -> VERIFY -> PROVE */}
        <div className="p-4 sm:p-5 rounded-xl bg-surface-raised border border-surface-border space-y-3">
          <div className="text-xs font-mono font-semibold text-flop-grey uppercase tracking-wider">
            Cryptographic Archival Pipeline
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 sm:gap-3 text-center">
            {[
              { step: "01", name: "OBSERVE", desc: "Public rooms & streams", color: "text-flop-ice" },
              { step: "02", name: "ARCHIVE", desc: "Indexed in cold storage", color: "text-flop-ice" },
              { step: "03", name: "HASH", desc: "SHA-256 canonical sweep", color: "text-flop-blue" },
              { step: "04", name: "CHAIN", desc: "Merkle tree aggregation", color: "text-flop-blue" },
              { step: "05", name: "VERIFY", desc: "Offline root validation", color: "text-flop-green" },
              { step: "06", name: "PROVE", desc: "Cryptographic inclusion", color: "text-flop-green" },
            ].map((item, idx) => (
              <div
                key={item.name}
                className="p-3 rounded-lg bg-surface border border-surface-border flex flex-col items-center justify-center space-y-1"
              >
                <span className="text-[10px] font-mono text-flop-grey font-bold">{item.step}</span>
                <span className={`text-xs font-mono font-bold ${item.color}`}>{item.name}</span>
                <span className="text-[10px] text-flop-grey leading-tight">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Key Product Concept Comparison Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-surface-raised/80 border border-surface-border space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300">
              <Activity className="w-4 h-4 text-flop-cyan" />
              <span>LIVE NETWORK (Technocore)</span>
            </div>
            <p className="text-xs text-flop-grey leading-relaxed">
              Fast, lightweight ephemeral rendezvous memory buffers (~10MB limit per room). Messages older than retention period or inactive single-message rooms are evicted.
            </p>
            <div className="text-[11px] font-mono text-flop-grey pt-1">
              Status: <span className="text-flop-ice">Real-time ephemeral state</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface-raised/80 border border-flop-green/30 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-flop-green">
              <ShieldCheck className="w-4 h-4 text-flop-green" />
              <span>CONTINUUM ARCHIVE LAYER</span>
            </div>
            <p className="text-xs text-flop-grey leading-relaxed">
              Observed messages are SHA-256 hashed and appended to Merkle blocks. Even if a message rolls off the live network buffer, Continuum provides cryptographic verification of historical observation.
            </p>
            <div className="text-[11px] font-mono text-flop-green pt-1">
              Motto: <span className="italic text-flop-ice">"Live data can disappear. Verified history does not have to."</span>
            </div>
          </div>
        </div>

        {/* Navigation Quick Links */}
        <div className="flex items-center gap-3 flex-wrap pt-2">
          <Link
            href="/continuum/archive"
            className="px-4 py-2 rounded-lg bg-flop-blue text-flop-ice hover:bg-flop-blue/90 transition-all text-xs font-mono font-bold flex items-center gap-2"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Search Historical Archive</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <Link
            href="/continuum/coverage"
            className="px-4 py-2 rounded-lg bg-surface-raised border border-surface-border text-flop-ice hover:border-flop-blue/50 transition-all text-xs font-mono font-medium"
          >
            <span>View Room Coverage & Gaps</span>
          </Link>

          <Link
            href="/continuum/verify"
            className="px-4 py-2 rounded-lg bg-surface-raised border border-surface-border text-flop-green hover:border-flop-green/50 transition-all text-xs font-mono font-medium"
          >
            <span>Merkle Proof Verifier</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
