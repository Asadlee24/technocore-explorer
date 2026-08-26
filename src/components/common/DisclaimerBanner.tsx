import React from "react";
import { AlertCircle, ShieldAlert } from "lucide-react";
import { DISCLAIMER_TEXT, TRUST_NOTICE } from "@/lib/protocol/constants";

export function DisclaimerBanner({ showTrustNotice = false }: { showTrustNotice?: boolean }) {
  return (
    <div className="w-full bg-surface-raised/90 border-b border-surface-border backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs text-slate-400">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2 text-slate-400 min-w-0">
          <AlertCircle className="w-3.5 h-3.5 text-accent-cyan shrink-0" />
          <span className="truncate sm:overflow-visible">
            <strong className="text-slate-300">Notice:</strong> {DISCLAIMER_TEXT}
          </span>
        </div>
        {showTrustNotice && (
          <div className="hidden md:flex items-center gap-1.5 text-slate-400 text-[10px] sm:text-[11px] shrink-0">
            <ShieldAlert className="w-3 h-3 text-accent-amber shrink-0" />
            <span className="truncate max-w-sm">{TRUST_NOTICE}</span>
          </div>
        )}
      </div>
    </div>
  );
}
