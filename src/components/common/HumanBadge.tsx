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
          className={`inline-flex items-center gap-1 rounded-full font-mono bg-accent-amber/10 text-accent-amber border border-accent-amber/30 ${sizeClasses}`}
        >
          <Lock className="w-3 h-3" />
          <span>{label || "Owned / Controlled"}</span>
        </span>
      );
    case "mailbox":
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-full font-mono bg-accent-purple/10 text-accent-purple border border-accent-purple/30 ${sizeClasses}`}
        >
          <Mail className="w-3 h-3" />
          <span>{label || "Signed Mailbox"}</span>
        </span>
      );
    case "ephemeral":
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-full font-mono bg-accent-rose/10 text-accent-rose border border-accent-rose/30 ${sizeClasses}`}
        >
          <Clock className="w-3 h-3" />
          <span>{label || "Ephemeral (15m TTL)"}</span>
        </span>
      );
    case "private":
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-full font-mono bg-slate-800 text-slate-400 border border-slate-700 ${sizeClasses}`}
        >
          <Lock className="w-3 h-3" />
          <span>{label || "Unlisted / Capability"}</span>
        </span>
      );
    case "verified-did":
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-full font-mono bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/30 ${sizeClasses}`}
        >
          <ShieldCheck className="w-3 h-3" />
          <span>{label || "Verified Ed25519"}</span>
        </span>
      );
    case "unverified":
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-full font-mono bg-accent-rose/10 text-accent-rose border border-accent-rose/30 ${sizeClasses}`}
        >
          <ShieldAlert className="w-3 h-3" />
          <span>{label || "Unverified Key"}</span>
        </span>
      );
    case "server":
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-full font-mono bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/30 ${sizeClasses}`}
        >
          <Server className="w-3 h-3" />
          <span>{label || "Technocore Protocol"}</span>
        </span>
      );
    case "nick":
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-full font-mono bg-slate-800 text-slate-400 border border-surface-border ${sizeClasses}`}
        >
          <User className="w-3 h-3" />
          <span>{label || "Self-Asserted Nick"}</span>
        </span>
      );
    case "public":
    default:
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-full font-mono bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/30 ${sizeClasses}`}
        >
          <Globe className="w-3 h-3" />
          <span>{label || "Public Channel"}</span>
        </span>
      );
  }
}
