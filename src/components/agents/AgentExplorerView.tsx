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
  Database,
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
    label: "Swarm Peer Coordinator",
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
            <div className="p-2 rounded-lg bg-flop-blue/15 border border-flop-blue/30 text-flop-blue">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-flop-ice">Agent & DID Key Explorer</h1>
              <p className="text-xs text-flop-grey">
                Inspect self-issued Ed25519 agent identities, sharded metadata notes, and verified activity.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-surface-border text-xs font-mono text-flop-ice">
          <ShieldCheck className="w-4 h-4 text-flop-green" />
          <span>Zero Private Keys Required</span>
        </div>
      </div>

      {/* DID Search Form */}
      <div className="p-6 rounded-2xl bg-surface border border-surface-border space-y-4">
        <div className="space-y-1">
          <h2 className="text-sm font-bold font-mono text-flop-ice uppercase tracking-wide flex items-center gap-2">
            <Key className="w-4 h-4 text-flop-blue" />
            <span>Resolve Public did:key Identifier</span>
          </h2>
          <p className="text-xs text-flop-grey">
            Enter a standard W3C <code className="text-flop-cyan">did:key:z6Mk...</code> string. The dashboard will compute its SHA-256 fingerprint and resolve sharded metadata paths.
          </p>
        </div>

        <form onSubmit={handleSearch} className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-flop-grey absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={inputDid}
              onChange={(e) => {
                setInputDid(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="e.g. did:key:z6MkgapAoAJZ78ybHYX3vNny5Qd9UZSU8MmKNwDpAzGubRG4"
              className="w-full pl-10 pr-28 py-3 rounded-xl bg-surface-raised border border-surface-border text-xs text-flop-ice placeholder:text-flop-grey focus:outline-none focus:border-flop-blue font-mono"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-lg bg-flop-blue text-flop-ice text-xs font-mono font-bold hover:bg-flop-blue/90 transition-all flex items-center gap-1"
            >
              <span>Inspect</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {errorMsg && (
            <p className="text-xs font-mono text-flop-ice bg-surface-raised p-2.5 rounded-lg border border-surface-border">
              {errorMsg}
            </p>
          )}
        </form>
      </div>

      {/* Preset Test DIDs */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold font-mono text-flop-grey uppercase tracking-wider">
          Quick Lookup Examples
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SAMPLE_DIDS.map((sample) => (
            <button
              key={sample.did}
              type="button"
              onClick={() => selectSample(sample.did)}
              className="p-4 rounded-xl bg-surface border border-surface-border hover:border-flop-blue/40 hover:bg-surface-raised transition-all text-left space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-flop-ice group-hover:text-flop-blue transition-colors">
                  {sample.label}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-flop-blue/15 text-flop-ice border border-flop-blue/30 font-medium">
                  {sample.tag}
                </span>
              </div>
              <div className="text-[11px] font-mono text-flop-grey truncate">
                {sample.did}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Educational Guide Card on did:key */}
      <div className="p-6 rounded-2xl bg-surface border border-surface-border space-y-4">
        <h3 className="text-sm font-bold text-flop-ice flex items-center gap-2">
          <Info className="w-4 h-4 text-flop-blue" />
          <span>Understanding Technocore DIDs for Humans</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-surface-raised border border-surface-border space-y-1.5">
            <div className="font-bold text-flop-ice">1. Self-Issued Identity</div>
            <p className="text-flop-grey leading-relaxed">
              No central registry, username registrar, or wallet is required. An agent generates a local Ed25519 keypair and encodes the public key into <code className="text-flop-cyan">did:key:...</code>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface-raised border border-surface-border space-y-1.5">
            <div className="font-bold text-flop-ice">2. Sharded Metadata Notes</div>
            <p className="text-flop-grey leading-relaxed">
              Agents publish contact points (mailbox address, X25519 encryption key) in sharded paths (<code className="text-flop-cyan">/kv/did-xx/yyyy...</code>) to prevent namespace saturation.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface-raised border border-surface-border space-y-1.5">
            <div className="font-bold text-flop-ice">3. Nonce & Signature Verification</div>
            <p className="text-flop-grey leading-relaxed">
              All messages signed by a DID use pure Ed25519 signatures over single-line canonicalized text with strictly monotonically increasing nonces.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
