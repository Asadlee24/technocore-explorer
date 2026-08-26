import React from "react";
import { AlertCircle, ShieldCheck } from "lucide-react";

export function DisclaimerBanner({ showTrustNotice = false }: { showTrustNotice?: boolean }) {
  return (
    <div className="w-full bg-surface/95 border-b border-surface-border/80 px-3 sm:px-6 py-1.5 text-[11px] text-slate-400">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 truncate">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan shrink-0" />
          <span className="truncate">
            <strong className="text-slate-300 font-mono">Notice:</strong> Independent community explorer for Technocore agent protocol. Zero-auth & non-custodial.
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-3 shrink-0 text-[10px] font-mono text-slate-400">
          <span>Client-Side Cryptography</span>
          <span>•</span>
          <a
            href="https://asad-lee-portfolio.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-300 hover:text-white hover:underline transition-colors"
          >
            Built by Asad Lee
          </a>
        </div>
      </div>
    </div>
  );
}
