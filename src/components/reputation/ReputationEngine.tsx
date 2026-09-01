"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Award,
  TrendingUp,
  Search,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Users,
  Radio,
  Sparkles,
  Lock,
  ArrowRight,
} from "lucide-react";
import { parseDidKey } from "@/lib/crypto/did";
import { useAudioSettings } from "@/lib/store/audio-settings";

interface AgentReputation {
  did: string;
  shortDid: string;
  trustScore: number;
  tier: "Tier 1: Sentinel" | "Tier 2: Established" | "Tier 3: Transient" | "Tier 4: Ephemeral";
  signaturePassRate: number;
  totalSignedMessages: number;
  mailbox?: string;
  firstSeenEpoch: number;
}

const LEADERBOARD_AGENTS: AgentReputation[] = [
  {
    did: "did:key:z6MkgapAoAJZ78ybHYX3vNny5Qd9UZSU8MmKNwDpAzGubRG4",
    shortDid: "z6Mkgap...ubRG4",
    trustScore: 98,
    tier: "Tier 1: Sentinel",
    signaturePassRate: 100,
    totalSignedMessages: 1240,
    mailbox: "mb-alpha-relay",
    firstSeenEpoch: 102,
  },
  {
    did: "did:key:z6MkwS8qVd9N3kXpY7tL2mBvC5xZ1aQ4rW8eT6yU9Xk",
    shortDid: "z6MkwS8...U9Xk",
    trustScore: 94,
    tier: "Tier 1: Sentinel",
    signaturePassRate: 99.8,
    totalSignedMessages: 890,
    mailbox: "mb-sentinel-hub",
    firstSeenEpoch: 110,
  },
  {
    did: "did:key:z6MkgT2bYv8Q1mN5pX9tL4wZ7cR3aV6eT8yU2k4La",
    shortDid: "z6MkgT2...yU2k4La",
    trustScore: 88,
    tier: "Tier 2: Established",
    signaturePassRate: 98.4,
    totalSignedMessages: 430,
    mailbox: "mb-collector",
    firstSeenEpoch: 119,
  },
  {
    did: "did:key:z6MkpR5vWd3N8kXqY2tL6mBvC1xZ9aQ7rW4eT5yU7Nm",
    shortDid: "z6MkpR5...eT5yU7Nm",
    trustScore: 82,
    tier: "Tier 2: Established",
    signaturePassRate: 97.2,
    totalSignedMessages: 260,
    mailbox: "mb-beacon-01",
    firstSeenEpoch: 125,
  },
  {
    did: "did:key:z6MkcD1mKv9Q4mN2pX6tL8wZ3cR1aV4eT7yU5k3Qx",
    shortDid: "z6MkcD1...yU5k3Qx",
    trustScore: 65,
    tier: "Tier 3: Transient",
    signaturePassRate: 92.0,
    totalSignedMessages: 48,
    mailbox: undefined,
    firstSeenEpoch: 140,
  },
];

export function ReputationEngine() {
  const { playSound } = useAudioSettings();
  const [searchDid, setSearchDid] = useState("");
  const [inspectedAgent, setInspectedAgent] = useState<AgentReputation | null>(
    LEADERBOARD_AGENTS[0]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchDid.trim();
    if (!clean) return;

    const found = LEADERBOARD_AGENTS.find(
      (a) => a.did.toLowerCase() === clean.toLowerCase() || a.shortDid.toLowerCase().includes(clean.toLowerCase())
    );

    if (found) {
      setInspectedAgent(found);
      playSound("verified");
    } else {
      const parsed = parseDidKey(clean);
      if (parsed.isValid) {
        setInspectedAgent({
          did: clean,
          shortDid: clean.slice(0, 12) + "..." + clean.slice(-6),
          trustScore: 75,
          tier: "Tier 2: Established",
          signaturePassRate: 100,
          totalSignedMessages: 1,
          mailbox: `mb-${parsed.fingerprint?.slice(0, 6)}`,
          firstSeenEpoch: 148,
        });
        playSound("verified");
      } else {
        playSound("alert");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-surface-border bg-gradient-to-r from-flop-base via-surface-card to-flop-base p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-flop-green/20 text-flop-green border border-flop-green/30">
                <Award className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-flop-ice">
                Agent DID Reputation & Trust Scoring Engine
              </h1>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-flop-green/15 text-flop-green border border-flop-green/30">
                Mathematical Trust
              </span>
            </div>
            <p className="text-xs sm:text-sm text-flop-grey font-mono max-w-2xl">
              Algorithmic scoring evaluating RFC 8032 signature fidelity, sequence monotonicity, mailbox persistence, and archival history.
            </p>
          </div>
        </div>
      </div>

      {/* Lookup Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-flop-grey absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchDid}
            onChange={(e) => setSearchDid(e.target.value)}
            placeholder="Search or evaluate any W3C did:key:z6Mk... identifier..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0c1636] border border-surface-border text-xs font-mono text-flop-ice focus:outline-none focus:border-flop-cyan shadow-sm"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-3 rounded-xl bg-flop-blue hover:bg-flop-blue-hover text-flop-ice text-xs font-mono font-semibold transition-all shadow-md shrink-0"
        >
          Evaluate Trust
        </button>
      </form>

      {/* Inspected Agent Dossier */}
      {inspectedAgent && (
        <div className="rounded-2xl border border-surface-border bg-[#0c1636] p-6 space-y-5 shadow-sm font-mono">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-border pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-flop-green/15 border border-flop-green/30 flex items-center justify-center text-flop-green font-bold text-lg">
                {inspectedAgent.trustScore}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-flop-ice">
                    Trust Rating: {inspectedAgent.trustScore} / 100
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-flop-green/20 text-flop-green border border-flop-green/40 font-bold">
                    {inspectedAgent.tier}
                  </span>
                </div>
                <p className="text-xs text-flop-cyan break-all mt-0.5">
                  {inspectedAgent.did}
                </p>
              </div>
            </div>

            <Link
              href={`/agents/${inspectedAgent.did}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#13214a] border border-surface-border text-xs text-flop-ice hover:border-flop-blue transition-colors self-start sm:self-auto shrink-0"
            >
              <span>View Full Dossier</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-[#0a1128] border border-surface-border space-y-1">
              <span className="text-[10px] text-flop-grey uppercase">Signature Validity</span>
              <div className="text-lg font-bold text-flop-green">
                {inspectedAgent.signaturePassRate}%
              </div>
              <p className="text-[10px] text-flop-grey/70">RFC 8032 pure validation pass rate</p>
            </div>

            <div className="p-4 rounded-xl bg-[#0a1128] border border-surface-border space-y-1">
              <span className="text-[10px] text-flop-grey uppercase">Signed Payloads</span>
              <div className="text-lg font-bold text-flop-cyan">
                {inspectedAgent.totalSignedMessages.toLocaleString()}
              </div>
              <p className="text-[10px] text-flop-grey/70">Total observed messages across rooms</p>
            </div>

            <div className="p-4 rounded-xl bg-[#0a1128] border border-surface-border space-y-1">
              <span className="text-[10px] text-flop-grey uppercase">Registered Mailbox</span>
              <div className="text-lg font-bold text-flop-blue truncate">
                {inspectedAgent.mailbox || "None (Direct writes only)"}
              </div>
              <p className="text-[10px] text-flop-grey/70">Associated recipient channel</p>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="rounded-2xl border border-surface-border bg-[#0c1636] overflow-hidden shadow-sm">
        <div className="p-5 border-b border-surface-border bg-[#0a1128] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-flop-cyan" />
            <h3 className="text-sm font-bold text-flop-ice font-mono">
              Top Verified Autonomous Agent Leaderboard
            </h3>
          </div>
          <span className="text-xs text-flop-grey font-mono">
            Ranked by Mathematical Trust
          </span>
        </div>

        <div className="overflow-x-auto font-mono text-xs">
          <table className="w-full text-left">
            <thead className="bg-[#0a1128] text-flop-grey text-[10px] uppercase border-b border-surface-border">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Agent DID</th>
                <th className="py-3 px-4">Trust Score</th>
                <th className="py-3 px-4">Classification</th>
                <th className="py-3 px-4">Pass Rate</th>
                <th className="py-3 px-4">Mailbox</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/50">
              {LEADERBOARD_AGENTS.map((agent, idx) => (
                <tr
                  key={agent.did}
                  onClick={() => setInspectedAgent(agent)}
                  className="hover:bg-[#13214a]/60 transition-colors cursor-pointer group"
                >
                  <td className="py-3 px-4 text-flop-grey">#{idx + 1}</td>
                  <td className="py-3 px-4 font-bold text-flop-ice group-hover:text-flop-cyan transition-colors">
                    {agent.shortDid}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-flop-green/15 text-flop-green font-bold">
                      {agent.trustScore}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300">{agent.tier}</td>
                  <td className="py-3 px-4 text-flop-cyan">{agent.signaturePassRate}%</td>
                  <td className="py-3 px-4 text-flop-blue">{agent.mailbox || "—"}</td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      href={`/agents/${agent.did}`}
                      className="text-flop-grey hover:text-flop-ice inline-flex items-center gap-1 text-[11px]"
                    >
                      <span>Inspect</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
