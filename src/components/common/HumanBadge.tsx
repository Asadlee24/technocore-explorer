import React from "react";
import { ShieldCheck, ShieldAlert, Mail, Lock, Clock, Globe, User, Server } from "lucide-react";

interface HumanBadgeProps {
  type: "public" | "owned" | "mailbox" | "ephemeral" | "private" | "verified-did" | "nick" | "server" | "unverified";
  label?: string;
  size?: "sm" | "md";
}

export function HumanBadge({ type, label, size = "sm" }: HumanBadgeProps) {
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs";

  switch (type) {
    case "owned":
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-full font-mono bg-flop-blue/15 text-flop-ice border border-flop-blue/30 ${sizeClasses}`}
        >
          <Lock className="w-3 h-3 text-flop-blue" />
          <span>{label || "Owned / Controlled"}</span>
        </span>
      );
    case "mailbox":
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-full font-mono bg-flop-blue/15 text-flop-ice border border-flop-blue/40 ${sizeClasses}`}
        >
          <Mail className="w-3 h-3 text-flop-blue" />
          <span>{label || "Signed Mailbox"}</span>
        </span>
      );
    case "ephemeral":
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-full font-mono bg-surface-raised text-flop-grey border border-surface-border ${sizeClasses}`}
        >
          <Clock className="w-3 h-3 text-flop-grey" />
          <span>{label || "Ephemeral (15m TTL)"}</span>
        </span>
      );
    case "private":
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-full font-mono bg-surface text-flop-grey border border-surface-border ${sizeClasses}`}
        >
          <Lock className="w-3 h-3" />
          <span>{label || "Unlisted Channel"}</span>
        </span>
      );
    case "verified-did":
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-full font-mono bg-flop-green/15 text-flop-green border border-flop-green/30 ${sizeClasses}`}
        >
          <ShieldCheck className="w-3 h-3 text-flop-green" />
          <span>{label || "Verified Ed25519"}</span>
        </span>
      );
    case "unverified":
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-full font-mono bg-surface-raised text-flop-grey border border-surface-border ${sizeClasses}`}
        >
          <ShieldAlert className="w-3 h-3" />
          <span>{label || "Unverified Key"}</span>
        </span>
      );
    case "server":
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-full font-mono bg-flop-blue/15 text-flop-ice border border-flop-blue/30 ${sizeClasses}`}
        >
          <Server className="w-3 h-3 text-flop-blue" />
          <span>{label || "Technocore Protocol"}</span>
        </span>
      );
    case "nick":
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-full font-mono bg-surface-raised text-flop-grey border border-surface-border ${sizeClasses}`}
        >
          <User className="w-3 h-3" />
          <span>{label || "Self-Asserted Nick"}</span>
        </span>
      );
    case "public":
    default:
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-full font-mono bg-flop-blue/15 text-flop-ice border border-flop-blue/30 ${sizeClasses}`}
        >
          <Globe className="w-3 h-3 text-flop-blue" />
          <span>{label || "Public Channel"}</span>
        </span>
      );
  }
}
