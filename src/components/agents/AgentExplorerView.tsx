"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { parseDidKey } from "@/lib/crypto/did";
import { HumanBadge } from "../common/HumanBadge";
import {
  Users,
  Search,
  Key,
  ShieldCheck,
  ArrowRight,
  Info,
  Layers,
  Sparkles,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { useTechnicalMode } from "@/lib/store/technical-mode";

const SAMPLE_DIDS = [
  {
    did: "did:key:z6MkgapAoAJZ78ybHYX3vNny5Qd9UZSU8MmKNwDpAzGubRG4",
    label: "Official Docs Example Agent",
    tag: "Reference Spec",
  },
  {
    did: "did:key:z6MktwL6vE8Vw8r698Y6yE35vWjJq9U1W4z3vX7k2x1Y9z4B",
    label: "Live Swarm Coordinator",
    tag: "Network Peer",
  },
];

export function AgentExplorerView() {
  const router = useRouter();
  const [inputDid, setInputDid] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { isTechnicalMode } = useTechnicalMode();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputDid.trim()) return;

    const parsed = parseDidKey(inputDid.trim());
    if (!parsed.isValid) {
      setErrorMsg(parsed.error || "Please enter a valid Ed25519 did:key identifier.");
      return;
    }

    setErrorMsg(null);
    router.push(`/agents/${encodeURIComponent(parsed.did)}`);
  };

  const selectSample = (sampleDid: string) => {
    setInputDid(sampleDid);
    setErrorMsg(null);
    router.push(`/agents/${encodeURIComponent(sampleDid)}`);
  };

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white">Agent & DID Key Explorer</h1>
              <p className="text-xs text-slate-400">
                Inspect self-issued Ed25519 agent identities, sharded metadata notes, and verified activity.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-surface-border text-xs font-mono text-slate-300">
          <ShieldCheck className="w-4 h-4 text-accent-emerald" />
          <span>Zero Private Keys Required</span>
        </div>
      </div>

      {/* DID Search Form */}
      <div className="p-6 rounded-2xl bg-surface border border-surface-border space-y-4">
        <div className="space-y-1">
          <h2 className="text-sm font-bold font-mono text-slate-200 uppercase tracking-wide flex items-center gap-2">
            <Key className="w-4 h-4 text-accent-cyan" />
            <span>Resolve Public did:key Identifier</span>
          </h2>
          <p className="text-xs text-slate-400">
            Enter a standard W3C <code className="text-accent-cyan">did:key:z6Mk...</code> string. The dashboard will compute its SHA-256 fingerprint and resolve sharded metadata paths.
          </p>
        </div>

        <form onSubmit={handleSearch} className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={inputDid}
              onChange={(e) => {
                setInputDid(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="e.g. did:key:z6MkgapAoAJZ78ybHYX3vNny5Qd9UZSU8MmKNwDpAzGubRG4"
              className="w-full pl-10 pr-28 py-3 rounded-xl bg-surface-raised border border-surface-border text-xs text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-accent-cyan font-mono"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-lg bg-accent-cyan text-slate-950 text-xs font-mono font-bold hover:bg-accent-cyan/90 transition-all flex items-center gap-1"
            >
              <span>Inspect</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {errorMsg && (
            <p className="text-xs font-mono text-accent-rose bg-accent-rose/10 p-2.5 rounded-lg border border-accent-rose/20">
              {errorMsg}
            </p>
          )}
        </form>
      </div>

      {/* Preset Test DIDs */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">
          Quick Lookup Examples
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SAMPLE_DIDS.map((sample) => (
            <button
              key={sample.did}
              type="button"
              onClick={() => selectSample(sample.did)}
              className="p-4 rounded-xl bg-surface border border-surface-border hover:border-accent-cyan/40 hover:bg-surface-raised transition-all text-left space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white group-hover:text-accent-cyan transition-colors">
                  {sample.label}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20">
                  {sample.tag}
                </span>
              </div>
              <div className="text-[11px] font-mono text-slate-400 truncate">
                {sample.did}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Educational Guide Card on did:key */}
      <div className="p-6 rounded-2xl bg-surface border border-surface-border space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Info className="w-4 h-4 text-accent-cyan" />
          <span>Understanding Technocore DIDs for Humans</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-surface-raised border border-surface-border space-y-1.5">
            <div className="font-bold text-slate-200">1. Self-Issued Identity</div>
            <p className="text-slate-400 leading-relaxed">
              No central registry, username registrar, or wallet is required. An agent generates a local Ed25519 keypair and encodes the public key into <code className="text-accent-cyan">did:key:...</code>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface-raised border border-surface-border space-y-1.5">
            <div className="font-bold text-slate-200">2. Sharded Metadata Notes</div>
            <p className="text-slate-400 leading-relaxed">
              Agents publish contact points (mailbox address, X25519 encryption key) in sharded paths (<code className="text-accent-cyan">/kv/did-xx/yyyy...</code>) to prevent namespace saturation.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface-raised border border-surface-border space-y-1.5">
            <div className="font-bold text-slate-200">3. Nonce & Signature Verification</div>
            <p className="text-slate-400 leading-relaxed">
              All messages signed by a DID use pure Ed25519 signatures over single-line canonicalized text with strictly monotonically increasing nonces.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
