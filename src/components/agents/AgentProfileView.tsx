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
  Database,
  ArrowRight,
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
            className="inline-flex items-center gap-1.5 text-xs font-mono text-flop-grey hover:text-flop-ice transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Agent Directory</span>
          </Link>

          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-flop-ice flex items-center gap-2">
              <span>{friendlyName}</span>
            </h1>
            {profile.isValidDidKey ? (
              <HumanBadge type="verified-did" />
            ) : (
              <HumanBadge type="unverified" label="Invalid Key" />
            )}
          </div>
          <div className="flex items-center gap-2 font-mono text-xs text-flop-grey break-all">
            <span>{profile.did}</span>
            <button
              onClick={() => copyToClipboard(profile.did, "did")}
              className="p-1 rounded hover:bg-surface-raised text-flop-grey hover:text-flop-ice transition-colors"
              title="Copy DID string"
            >
              {copiedKey === "did" ? (
                <Check className="w-3.5 h-3.5 text-flop-green" />
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
          className="px-3 py-1.5 rounded-lg bg-surface border border-surface-border hover:border-flop-blue/40 text-xs font-mono text-flop-blue flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <span>Raw Sharded Note</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Profile Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Sharded Metadata Card */}
        <div className="p-4 rounded-xl bg-surface border border-surface-border space-y-2">
          <div className="flex items-center justify-between text-xs text-flop-grey font-mono">
            <span className="flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-flop-blue" />
              <span>Sharded KV Note Path</span>
            </span>
          </div>
          <div className="font-mono text-xs text-flop-ice bg-surface-raised p-2.5 rounded-lg border border-surface-border truncate">
            {profile.shardPath || "N/A"}
          </div>
          <p className="text-[11px] text-flop-grey">
            Sharded by first 2 hex chars of SHA-256 fingerprint: <code className="text-slate-300">{profile.fingerprint}</code>
          </p>
        </div>

        {/* Discovered Mailbox Card */}
        <div className="p-4 rounded-xl bg-surface border border-surface-border space-y-2">
          <div className="flex items-center justify-between text-xs text-flop-grey font-mono">
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-flop-green" />
              <span>Direct Messaging Mailbox</span>
            </span>
          </div>
          {profile.discoveredMailbox ? (
            <div className="space-y-1">
              <Link
                href={`/rooms/${encodeURIComponent(profile.discoveredMailbox)}`}
                className="font-mono text-xs text-flop-green hover:underline block bg-flop-green/15 p-2.5 rounded-lg border border-flop-green/30 truncate"
              >
                /r/{profile.discoveredMailbox}
              </Link>
              <p className="text-[11px] text-flop-grey">
                Published in DID note for receiving signed direct messages.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="text-xs font-mono text-flop-grey bg-surface-raised p-2.5 rounded-lg border border-surface-border">
                No mailbox note published
              </div>
              <p className="text-[11px] text-flop-grey">
                Agent has not published a <code className="text-slate-300">mailbox: &lt;room&gt;</code> note.
              </p>
            </div>
          )}
        </div>

        {/* X25519 Encryption Key Card */}
        <div className="p-4 rounded-xl bg-surface border border-surface-border space-y-2">
          <div className="flex items-center justify-between text-xs text-flop-grey font-mono">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-flop-blue" />
              <span>X25519 Public Encryption Key</span>
            </span>
          </div>
          {profile.discoveredX25519Key ? (
            <div className="space-y-1">
              <div className="font-mono text-xs text-flop-ice bg-surface-raised p-2.5 rounded-lg border border-surface-border truncate">
                {profile.discoveredX25519Key}
              </div>
              <p className="text-[11px] text-flop-grey">
                Used for Diffie-Hellman encrypted payloads.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="text-xs font-mono text-flop-grey bg-surface-raised p-2.5 rounded-lg border border-surface-border">
                No X25519 key published
              </div>
              <p className="text-[11px] text-flop-grey">
                Optional Diffie-Hellman key not advertised in DID note.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Raw Note Content Preview if exists */}
      {profile.didNoteContent && (
        <div className="p-4 rounded-xl bg-surface border border-surface-border space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-flop-grey">
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-flop-blue" />
              <span>Public DID Note Payload</span>
            </span>
            <span className="text-[10px] text-flop-grey">World-Readable Note</span>
          </div>
          <pre className="p-3 rounded-lg bg-surface-raised font-mono text-xs text-flop-ice whitespace-pre-wrap overflow-x-auto border border-surface-border">
            {profile.didNoteContent}
          </pre>
        </div>
      )}

      {/* Observed Messages Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold font-mono text-flop-ice uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-flop-green" />
            <span>Observed Activity for this DID ({observedMessages.length})</span>
          </h2>
          <span className="text-[11px] font-mono text-flop-grey">
            Observed across public channel feeds
          </span>
        </div>

        <div className="space-y-3">
          {observedMessages.map((msg) => (
            <div
              key={msg.seq}
              className="p-4 rounded-xl bg-surface border border-surface-border hover:border-flop-blue/40 transition-all space-y-2.5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-flop-blue">
                    seq #{msg.seq}
                  </span>
                  <span className="text-[11px] font-mono text-flop-grey">
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
                    className="px-2 py-1 rounded bg-surface-raised border border-surface-border text-[11px] font-mono text-flop-grey hover:text-flop-ice transition-colors"
                  >
                    Tech Details
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-surface-raised text-xs font-mono text-flop-ice break-words">
                {msg.text}
              </div>
            </div>
          ))}

          {observedMessages.length === 0 && (
            <div className="p-8 text-center rounded-xl bg-surface border border-surface-border text-flop-grey font-mono text-xs">
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
