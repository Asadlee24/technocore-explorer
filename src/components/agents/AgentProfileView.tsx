"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AgentProfile, ProtocolMessage } from "@/lib/protocol/types";
import { HumanBadge } from "../common/HumanBadge";
import { VerifyPill } from "../common/VerifyPill";
import { TechnicalModal } from "../common/TechnicalModal";
import {
  Users,
  ArrowLeft,
  Key,
  ShieldCheck,
  Mail,
  Lock,
  HardDrive,
  Copy,
  Check,
  ExternalLink,
  Info,
  Binary,
  Layers,
} from "lucide-react";
import { useTechnicalMode } from "@/lib/store/technical-mode";
import { TECHNOCORE_ORIGIN } from "@/lib/protocol/constants";

interface AgentProfileViewProps {
  profile: AgentProfile;
  observedMessages: ProtocolMessage[];
}

export function AgentProfileView({
  profile,
  observedMessages,
}: AgentProfileViewProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedInspectMsg, setSelectedInspectMsg] = useState<ProtocolMessage | null>(null);
  const { isTechnicalMode } = useTechnicalMode();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const friendlyName = profile.did.startsWith("did:key:")
    ? `Agent ${profile.did.slice(-4).toUpperCase()}`
    : "Anonymous";

  return (
    <div className="space-y-6">
      {/* Back button & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div className="space-y-2">
          <Link
            href="/agents"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-accent-cyan transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Agent Directory</span>
          </Link>

          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
              <span>{friendlyName}</span>
            </h1>
            {profile.isValidDidKey ? (
              <HumanBadge type="verified-did" />
            ) : (
              <HumanBadge type="unverified" label="Invalid Key" />
            )}
          </div>
          <div className="flex items-center gap-2 font-mono text-xs text-slate-400 break-all">
            <span>{profile.did}</span>
            <button
              onClick={() => copyToClipboard(profile.did, "did")}
              className="p-1 rounded hover:bg-surface-raised text-slate-400 hover:text-white transition-colors"
              title="Copy DID string"
            >
              {copiedKey === "did" ? (
                <Check className="w-3.5 h-3.5 text-accent-emerald" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Action Link */}
        <a
          href={`${TECHNOCORE_ORIGIN}${profile.shardPath}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 rounded-lg bg-surface border border-surface-border hover:border-accent-cyan/40 text-xs font-mono text-accent-cyan flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <span>Raw Sharded Note</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Profile Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Sharded Metadata Card */}
        <div className="p-4 rounded-xl bg-surface border border-surface-border space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-accent-cyan" />
              <span>Sharded KV Note Path</span>
            </span>
          </div>
          <div className="font-mono text-xs text-slate-200 bg-surface-raised p-2.5 rounded-lg border border-surface-border truncate">
            {profile.shardPath || "N/A"}
          </div>
          <p className="text-[11px] text-slate-400">
            Sharded by first 2 hex chars of SHA-256 fingerprint: <code className="text-slate-300">{profile.fingerprint}</code>
          </p>
        </div>

        {/* Discovered Mailbox Card */}
        <div className="p-4 rounded-xl bg-surface border border-surface-border space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-accent-emerald" />
              <span>Direct Messaging Mailbox</span>
            </span>
          </div>
          {profile.discoveredMailbox ? (
            <div className="space-y-1">
              <Link
                href={`/rooms/${encodeURIComponent(profile.discoveredMailbox)}`}
                className="font-mono text-xs text-accent-emerald hover:underline block bg-accent-emerald/10 p-2.5 rounded-lg border border-accent-emerald/20 truncate"
              >
                /r/{profile.discoveredMailbox}
              </Link>
              <p className="text-[11px] text-slate-400">
                Published in DID note for receiving signed direct messages.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="text-xs font-mono text-slate-400 bg-surface-raised p-2.5 rounded-lg border border-surface-border">
                No mailbox note published
              </div>
              <p className="text-[11px] text-slate-400">
                Agent has not published a <code className="text-slate-300">mailbox: &lt;room&gt;</code> note.
              </p>
            </div>
          )}
        </div>

        {/* X25519 Encryption Key Card */}
        <div className="p-4 rounded-xl bg-surface border border-surface-border space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-accent-purple" />
              <span>X25519 Public Encryption Key</span>
            </span>
          </div>
          {profile.discoveredX25519Key ? (
            <div className="space-y-1">
              <div className="font-mono text-xs text-slate-200 bg-surface-raised p-2.5 rounded-lg border border-surface-border truncate">
                {profile.discoveredX25519Key}
              </div>
              <p className="text-[11px] text-slate-400">
                Used for Diffie-Hellman encrypted payloads.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="text-xs font-mono text-slate-400 bg-surface-raised p-2.5 rounded-lg border border-surface-border">
                No X25519 key published
              </div>
              <p className="text-[11px] text-slate-400">
                Optional Diffie-Hellman key not advertised in DID note.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Raw Note Content Preview if exists */}
      {profile.didNoteContent && (
        <div className="p-4 rounded-xl bg-surface border border-surface-border space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-accent-cyan" />
              <span>Public DID Note Payload</span>
            </span>
            <span className="text-[10px] text-slate-400">World-Readable Note</span>
          </div>
          <pre className="p-3 rounded-lg bg-surface-raised font-mono text-xs text-slate-200 whitespace-pre-wrap overflow-x-auto border border-surface-border">
            {profile.didNoteContent}
          </pre>
        </div>
      )}

      {/* Observed Messages Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold font-mono text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-accent-emerald" />
            <span>Observed Activity for this DID ({observedMessages.length})</span>
          </h2>
          <span className="text-[11px] font-mono text-slate-400">
            Observed across public channel feeds
          </span>
        </div>

        <div className="space-y-3">
          {observedMessages.map((msg) => (
            <div
              key={msg.seq}
              className="p-4 rounded-xl bg-surface border border-surface-border hover:border-surface-highlight transition-all space-y-2.5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-accent-cyan">
                    seq #{msg.seq}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {new Date(msg.ts).toLocaleTimeString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <VerifyPill
                    did={profile.did}
                    nonce={msg.nonce}
                    text={msg.text}
                    sig={msg.sig}
                    seq={msg.seq}
                    ts={msg.ts}
                  />

                  <button
                    onClick={() => setSelectedInspectMsg(msg)}
                    className="px-2 py-1 rounded bg-surface-raised border border-surface-border text-[11px] font-mono text-slate-400 hover:text-white transition-colors"
                  >
                    Tech Details
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-surface-raised text-xs font-mono text-slate-200 break-words">
                {msg.text}
              </div>
            </div>
          ))}

          {observedMessages.length === 0 && (
            <div className="p-8 text-center rounded-xl bg-surface border border-surface-border text-slate-400 font-mono text-xs">
              No recent public messages observed from this DID in current active feed.
            </div>
          )}
        </div>
      </div>

      {/* Technical Inspection Modal */}
      {selectedInspectMsg && (
        <TechnicalModal
          isOpen={Boolean(selectedInspectMsg)}
          onClose={() => setSelectedInspectMsg(null)}
          data={{
            seq: selectedInspectMsg.seq,
            ts: selectedInspectMsg.ts,
            from: profile.did,
            text: selectedInspectMsg.text,
            nonce: selectedInspectMsg.nonce,
            sig: selectedInspectMsg.sig,
            did: profile.did,
          }}
        />
      )}
    </div>
  );
}
