"use client";

import React, { useState } from "react";
import { ShieldCheck, ShieldAlert, Sparkles } from "lucide-react";
import { verifyMessageSignature } from "@/lib/crypto/verify";
import { TechnicalModal } from "./TechnicalModal";

interface VerifyPillProps {
  did?: string;
  room?: string;
  nonce?: number | string;
  text?: string;
  sig?: string;
  seq?: number;
  ts?: string;
}

export function VerifyPill({ did, room, nonce, text, sig, seq, ts }: VerifyPillProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const hasSignData = Boolean(did && room && nonce !== undefined && text && sig);

  let isVerified = false;
  if (hasSignData && did && room && nonce !== undefined && text && sig) {
    const res = verifyMessageSignature({ did, room, nonce, text, sig });
    isVerified = res.verified;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-mono text-[11px] transition-all border ${
          hasSignData
            ? isVerified
              ? "bg-accent-emerald/10 text-accent-emerald border-accent-emerald/30 hover:bg-accent-emerald/20 shadow-sm"
              : "bg-accent-rose/10 text-accent-rose border-accent-rose/30 hover:bg-accent-rose/20"
            : "bg-surface text-slate-400 border-surface-border hover:border-slate-600 hover:text-slate-300"
        }`}
        title="Click to view local cryptographic verification and technical protocol details"
      >
        {hasSignData ? (
          isVerified ? (
            <>
              <ShieldCheck className="w-3 h-3 text-accent-emerald" />
              <span>Verified Sig</span>
            </>
          ) : (
            <>
              <ShieldAlert className="w-3 h-3 text-accent-rose" />
              <span>Invalid Sig</span>
            </>
          )
        ) : (
          <>
            <Sparkles className="w-3 h-3 text-accent-cyan" />
            <span>Tech Details</span>
          </>
        )}
      </button>

      <TechnicalModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        data={{
          room,
          seq,
          ts,
          did,
          text,
          nonce,
          sig,
          from: did,
        }}
      />
    </>
  );
}
