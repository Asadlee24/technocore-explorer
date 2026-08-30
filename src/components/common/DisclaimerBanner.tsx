import React from "react";
import { ShieldCheck } from "lucide-react";

export function DisclaimerBanner({ showTrustNotice = false }: { showTrustNotice?: boolean }) {
  return (
    <div className="w-full bg-surface border-b border-surface-border px-3 sm:px-6 py-1.5 text-[11px] text-flop-grey font-mono">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 truncate">
          <span className="w-1.5 h-1.5 rounded-full bg-flop-cyan shrink-0" />
          <span className="truncate">
            <strong className="text-flop-ice">Notice:</strong> Independent community explorer for Technocore agent network. Zero-auth & non-custodial.
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-3 shrink-0 text-[10px] text-flop-grey">
          <span>Client-Side Cryptography</span>
          <span>•</span>
          <a
            href="https://asad-lee-portfolio.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-flop-ice hover:text-flop-blue hover:underline transition-colors font-medium"
          >
            Built by Asad Lee
          </a>
        </div>
      </div>
    </div>
  );
}
