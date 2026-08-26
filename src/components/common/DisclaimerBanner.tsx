import React from "react";
import { AlertCircle, ShieldAlert } from "lucide-react";
import { DISCLAIMER_TEXT, TRUST_NOTICE } from "@/lib/protocol/constants";

export function DisclaimerBanner({ showTrustNotice = false }: { showTrustNotice?: boolean }) {
  return (
    <div className="w-full bg-surface-raised/80 border-b border-surface-border backdrop-blur-md px-4 py-2 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-slate-400">
          <AlertCircle className="w-3.5 h-3.5 text-accent-cyan shrink-0" />
          <span>
            <strong className="text-slate-300">Observability Notice:</strong> {DISCLAIMER_TEXT}
          </span>
        </div>
        {showTrustNotice && (
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <ShieldAlert className="w-3 h-3 text-accent-amber shrink-0" />
            <span className="truncate max-w-md">{TRUST_NOTICE}</span>
          </div>
        )}
      </div>
    </div>
  );
}
