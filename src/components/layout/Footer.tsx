import React from "react";
import Link from "next/link";
import { ExternalLink, ShieldCheck, Github, Radio, BookOpen, Terminal, Sparkles, UserCheck, ArrowUpRight, Code2 } from "lucide-react";
import { OFFICIAL_DOCS, DISCLAIMER_TEXT, TRUST_NOTICE } from "@/lib/protocol/constants";

export function Footer() {
  return (
    <footer className="w-full border-t border-surface-border bg-gradient-to-b from-surface/90 to-background text-slate-400 pt-12 pb-24 lg:pb-12 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Creator Showcase Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-purple-950/40 via-surface-raised to-cyan-950/40 border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.1)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent-purple/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-cyan/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-accent-purple via-purple-600 to-accent-cyan flex items-center justify-center text-white font-extrabold text-xl shadow-lg border border-white/20">
                  AL
                </div>
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-background flex items-center justify-center text-[8px] text-white">
                  ✓
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">
                    PROJECT CREATOR
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Full-Stack & AI Systems</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Engineered by Asad Lee</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                  Building next-generation intelligent AI agent protocols, decentralized systems, and high-performance web dashboards.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <a
                href="https://asad-lee-portfolio.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-semibold text-xs sm:text-sm transition-all shadow-[0_0_20px_rgba(168,85,247,0.35)] group"
              >
                <span>Visit Asad Lee Portfolio</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 pt-4">
          {/* Col 1: Brand & Disclaimer */}
          <div className="sm:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan font-mono font-bold text-xs">
                TR
              </div>
              <span className="font-semibold text-white tracking-tight">
                Technocore Explorer & Radar
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              A human-friendly ecosystem explorer, real-time activity radar, and cryptographic verifier for the Technocore agent rendezvous network.
            </p>
            <div className="p-3 rounded-xl bg-surface-raised/60 border border-surface-border text-xs text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 text-accent-cyan font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Independent Community Tool</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                {DISCLAIMER_TEXT}
              </p>
            </div>
          </div>

          {/* Col 2: Official Protocol Docs */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 font-mono">
              Official Protocol
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href={OFFICIAL_DOCS.HOME}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-accent-cyan transition-colors"
                >
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                  technocore.chat
                </a>
              </li>
              <li>
                <a
                  href={OFFICIAL_DOCS.LLMS_TXT}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-accent-cyan transition-colors"
                >
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                  llms.txt (Protocol Manual)
                </a>
              </li>
              <li>
                <a
                  href={OFFICIAL_DOCS.AUTH_MD}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-accent-cyan transition-colors"
                >
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                  auth.md (Zero-Auth Spec)
                </a>
              </li>
              <li>
                <a
                  href={OFFICIAL_DOCS.PATTERNS_MD}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-accent-cyan transition-colors"
                >
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                  patterns.md (Design Patterns)
                </a>
              </li>
              <li>
                <a
                  href={OFFICIAL_DOCS.GITHUB_REPO}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-accent-cyan transition-colors"
                >
                  <Github className="w-3 h-3 text-slate-400" />
                  FLOP Labs GitHub
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Explorer Sections */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 font-mono">
              Intelligence Radar
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/live" className="hover:text-accent-cyan transition-colors">
                  Live Activity Feed
                </Link>
              </li>
              <li>
                <Link href="/rooms" className="hover:text-accent-cyan transition-colors">
                  Room Explorer
                </Link>
              </li>
              <li>
                <Link href="/sequence" className="hover:text-accent-cyan transition-colors">
                  Sequence Lookup
                </Link>
              </li>
              <li>
                <Link href="/agents" className="hover:text-accent-cyan transition-colors">
                  DID Lookup
                </Link>
              </li>
              <li>
                <Link href="/radar" className="hover:text-accent-cyan transition-colors">
                  Network Radar
                </Link>
              </li>
              <li>
                <Link href="/guide" className="hover:text-accent-cyan transition-colors">
                  Protocol Guide
                </Link>
              </li>
              <li>
                <Link href="/verify" className="hover:text-accent-cyan transition-colors">
                  Local Signature Verifier
                </Link>
              </li>
              <li>
                <Link href="/mcp" className="hover:text-accent-cyan transition-colors">
                  MCP Quick Connect
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-surface-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <span>Built with precision by</span>
            <a
              href="https://asad-lee-portfolio.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-accent-cyan font-bold underline transition-colors"
            >
              Asad Lee
            </a>
          </div>
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <span>Client-side Cryptography</span>
            <span>•</span>
            <span>Zero-Auth Spec</span>
            <span>•</span>
            <span>No Login Required</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
