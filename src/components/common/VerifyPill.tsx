"use client";

import React, { useState } from "react";
import { ShieldCheck, ShieldAlert, Binary } from "lucide-react";
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
              ? "bg-flop-green/15 text-flop-green border-flop-green/30 hover:bg-flop-green/25 shadow-sm"
              : "bg-surface-raised text-flop-grey border-surface-border hover:text-flop-ice"
            : "bg-surface-raised text-flop-grey border-surface-border hover:border-flop-blue/40 hover:text-flop-ice"
        }`}
        title="Click to view local cryptographic verification and technical protocol details"
      >
        {hasSignData ? (
          isVerified ? (
            <>
              <ShieldCheck className="w-3 h-3 text-flop-green" />
              <span>Verified Sig</span>
            </>
          ) : (
            <>
              <ShieldAlert className="w-3 h-3 text-flop-grey" />
              <span>Invalid Sig</span>
            </>
          )
        ) : (
          <>
            <Binary className="w-3 h-3 text-flop-blue" />
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
