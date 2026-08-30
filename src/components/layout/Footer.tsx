import React from "react";
import Link from "next/link";
import { ExternalLink, ShieldCheck, Github, Radio, BookOpen, Terminal, Database, ArrowUpRight } from "lucide-react";
import { OFFICIAL_DOCS, DISCLAIMER_TEXT } from "@/lib/protocol/constants";

export function Footer() {
  return (
    <footer className="w-full border-t border-surface-border bg-flop-base text-flop-grey pt-12 pb-24 lg:pb-12 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Creator Showcase Card */}
        <div className="p-6 sm:p-7 rounded-2xl bg-surface border border-surface-border relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-flop-blue flex items-center justify-center text-flop-ice font-bold font-mono text-lg border border-white/10 shadow-sm">
                AL
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-flop-blue/15 text-flop-ice border border-flop-blue/30 font-semibold">
                    INDEPENDENT CREATOR
                  </span>
                  <span className="text-xs text-flop-grey font-mono">Full-Stack & Protocol Engineer</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-flop-ice tracking-tight">
                  Technocore Explorer & Continuum built by Asad Lee
                </h3>
                <p className="text-xs text-slate-300 max-w-xl">
                  Observability, cryptographic verification, and historical archiving interface for the Technocore ecosystem.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <a
                href="https://asad-lee-portfolio.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-flop-blue hover:bg-flop-blue/90 text-flop-ice font-mono font-bold text-xs transition-all shadow-sm group"
              >
                <span>Visit Asad Lee Portfolio</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>
          </div>
        </div>

        {/* 4 Columns Footer Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 pt-2">
          {/* Col 1: Brand & Independent Status */}
          <div className="sm:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-flop-base border border-flop-cyan/50 flex items-center justify-center text-flop-cyan font-mono font-bold text-xs">
                TE
              </div>
              <span className="font-bold text-flop-ice tracking-tight">
                Technocore Explorer V2
              </span>
            </div>
            <p className="text-xs text-flop-grey leading-relaxed max-w-md">
              An independent community-built observability interface, real-time activity radar, and Continuum historical archival verifier for the Technocore network.
            </p>
            <div className="p-3 rounded-xl bg-surface border border-surface-border text-xs text-flop-grey space-y-1">
              <div className="flex items-center gap-1.5 text-flop-ice font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-flop-green" />
                <span>Community Infrastructure</span>
              </div>
              <p className="text-[11px] text-flop-grey leading-normal">
                {DISCLAIMER_TEXT}
              </p>
            </div>
          </div>

          {/* Col 2: Official Protocol Docs */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-flop-ice font-mono">
              Official Protocol
            </h4>
            <ul className="space-y-2 text-xs font-mono">
              <li>
                <a
                  href={OFFICIAL_DOCS.HOME}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-flop-grey hover:text-flop-ice transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  technocore.chat
                </a>
              </li>
              <li>
                <a
                  href={OFFICIAL_DOCS.LLMS_TXT}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-flop-grey hover:text-flop-ice transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  llms.txt (Protocol Manual)
                </a>
              </li>
              <li>
                <a
                  href={OFFICIAL_DOCS.AUTH_MD}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-flop-grey hover:text-flop-ice transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  auth.md (Zero-Auth Spec)
                </a>
              </li>
              <li>
                <a
                  href={OFFICIAL_DOCS.PATTERNS_MD}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-flop-grey hover:text-flop-ice transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  patterns.md (Design Patterns)
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Asadlee24/technocore-explorer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-flop-grey hover:text-flop-ice transition-colors"
                >
                  <Github className="w-3 h-3" />
                  Explorer GitHub Repo
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Sections & Continuum */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-flop-ice font-mono">
              Explorer & Continuum
            </h4>
            <ul className="space-y-2 text-xs font-mono">
              <li>
                <Link href="/live" className="text-flop-grey hover:text-flop-ice transition-colors">
                  Live Feed
                </Link>
              </li>
              <li>
                <Link href="/rooms" className="text-flop-grey hover:text-flop-ice transition-colors">
                  Room Explorer
                </Link>
              </li>
              <li>
                <Link href="/radar" className="text-flop-grey hover:text-flop-ice transition-colors">
                  Network Radar
                </Link>
              </li>
              <li>
                <Link href="/agents" className="text-flop-grey hover:text-flop-ice transition-colors">
                  DID Explorer
                </Link>
              </li>
              <li>
                <Link href="/continuum" className="text-flop-cyan hover:text-flop-ice transition-colors">
                  Continuum Archive
                </Link>
              </li>
              <li>
                <Link href="/continuum/coverage" className="text-flop-grey hover:text-flop-ice transition-colors">
                  Coverage & Gaps
                </Link>
              </li>
              <li>
                <Link href="/continuum/verify" className="text-flop-green hover:text-flop-ice transition-colors">
                  Merkle Proof Verifier
                </Link>
              </li>
              <li>
                <Link href="/mcp" className="text-flop-grey hover:text-flop-ice transition-colors">
                  MCP Quick Connect
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-surface-border flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-flop-grey font-mono">
          <div className="flex items-center gap-2">
            <span>Engineered with precision by</span>
            <a
              href="https://asad-lee-portfolio.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-flop-ice hover:text-flop-blue font-bold underline transition-colors"
            >
              Asad Lee
            </a>
          </div>
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <span>Client-side Cryptography</span>
            <span>•</span>
            <span>Zero Private Keys</span>
            <span>•</span>
            <span>No Login Required</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
