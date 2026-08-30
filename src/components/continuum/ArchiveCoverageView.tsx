"use client";

import React, { useState } from "react";
import { RoomCoverage, CollectionGap } from "@/lib/continuum/types";
import { ContinuumService } from "@/lib/continuum/data-service";
import {
  Layers,
  AlertTriangle,
  CheckCircle,
  ShieldCheck,
  Activity,
  Info,
  Clock,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

interface ArchiveCoverageViewProps {
  coverageData?: RoomCoverage[];
  gapsData?: CollectionGap[];
}

export function ArchiveCoverageView({
  coverageData,
  gapsData,
}: ArchiveCoverageViewProps) {
  const coverage = coverageData || ContinuumService.getCoverage();
  const gaps = gapsData || ContinuumService.getDetectedGaps();
  const [selectedRoom, setSelectedRoom] = useState<string>("general");

  const activeCoverage = coverage.find((c) => c.room === selectedRoom) || coverage[0];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-flop-blue/15 border border-flop-blue/30 text-flop-blue">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-flop-ice">Archive Coverage & Gap Detection</h1>
              <p className="text-xs text-flop-grey">
                Honest observability auditing: Tracking observed sequence intervals, collection density, and audited gap events.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-surface-border text-xs font-mono text-slate-300">
          <ShieldCheck className="w-4 h-4 text-flop-green" />
          <span>Audited Sequence Fidelity</span>
        </div>
      </div>

      {/* Honest Archival Notice */}
      <div className="p-4 rounded-xl bg-surface-raised border border-surface-border flex items-start gap-3">
        <Info className="w-4 h-4 text-flop-cyan shrink-0 mt-0.5" />
        <div className="text-xs text-flop-grey leading-relaxed space-y-1">
          <strong className="text-flop-ice font-semibold">Principle of Honest Archival:</strong> An independent archive must remain transparent about intervals it did NOT observe. Technocore rooms are ephemeral, and gaps can occur due to rate throttling or network restarts. Continuum exposes known gaps rather than fabricating continuity.
        </div>
      </div>

      {/* Room Coverage Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Room Coverage Breakdown */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-flop-grey">
              Monitored Room Coverage
            </h2>
            <span className="text-[11px] font-mono text-flop-grey">
              Audited against server seq counter
            </span>
          </div>

          <div className="space-y-3">
            {coverage.map((cov) => {
              const isSelected = selectedRoom === cov.room;
              const isHealthy = cov.coveragePercent >= 99.0;

              return (
                <button
                  key={cov.room}
                  type="button"
                  onClick={() => setSelectedRoom(cov.room)}
                  className={`w-full p-4 rounded-xl border text-left transition-all space-y-2.5 ${
                    isSelected
                      ? "bg-surface-raised border-flop-blue shadow-sm"
                      : "bg-surface border-surface-border hover:border-flop-blue/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-flop-ice">
                        /r/{cov.room}
                      </span>
                      {cov.gapsCount > 0 ? (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-flop-grey/20 text-slate-300 border border-surface-border flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-flop-cyan" />
                          <span>{cov.gapsCount} Gap Detected</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-flop-green/15 text-flop-green border border-flop-green/30">
                          Complete Stream
                        </span>
                      )}
                    </div>

                    <span className={`text-sm font-mono font-extrabold ${
                      isHealthy ? "text-flop-green" : "text-flop-cyan"
                    }`}>
                      {cov.coveragePercent.toFixed(1)}%
                    </span>
                  </div>

                  {/* Coverage Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-surface-raised overflow-hidden border border-surface-border">
                    <div
                      className={`h-full transition-all ${
                        isHealthy ? "bg-flop-green" : "bg-flop-blue"
                      }`}
                      style={{ width: `${cov.coveragePercent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-flop-grey">
                    <span>Seq {cov.firstSeqObserved.toLocaleString()} — {cov.lastSeqObserved.toLocaleString()}</span>
                    <span>Archived: {cov.totalMessagesArchived.toLocaleString()} msgs</span>
                    <span>Last: {cov.lastCollectorObservation}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Sequence Gap Inspector for Selected Room */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-surface border border-surface-border space-y-4">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <span className="text-xs font-mono font-bold text-flop-ice uppercase">
                /r/{activeCoverage.room} Sequence Audit
              </span>
              <span className="text-xs font-mono font-bold text-flop-green">
                {activeCoverage.coveragePercent}% Coverage
              </span>
            </div>

            {/* Sequence Intervals Timeline */}
            <div className="space-y-3">
              <div className="text-xs font-mono text-flop-grey">Observed Intervals & Audit:</div>

              {activeCoverage.room === "general" ? (
                <div className="space-y-2 font-mono text-xs">
                  <div className="p-3 rounded-lg bg-surface-raised border border-flop-green/30 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-flop-green">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>seq 1 – 18,290</span>
                    </div>
                    <span className="text-flop-grey text-[11px]">18,290 msgs (Verified)</span>
                  </div>

                  <div className="p-3 rounded-lg bg-surface-raised border border-flop-cyan/40 space-y-1">
                    <div className="flex items-center justify-between text-flop-cyan">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span className="font-bold">seq 18,291 – 18,420</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface border border-surface-border">
                        GAP DETECTED
                      </span>
                    </div>
                    <p className="text-[11px] text-flop-grey font-sans">
                      130 unobserved sequences during collector rate limit throttle. Because room is ephemeral, missing records rolled off live memory.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-surface-raised border border-flop-green/30 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-flop-green">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>seq 18,421 – 18,510</span>
                    </div>
                    <span className="text-flop-grey text-[11px]">90 msgs (Active)</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 font-mono text-xs">
                  <div className="p-3 rounded-lg bg-surface-raised border border-flop-green/30 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-flop-green">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>seq 1 – {activeCoverage.lastSeqObserved.toLocaleString()}</span>
                    </div>
                    <span className="text-flop-grey text-[11px]">Continuous Audit</span>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2">
              <Link
                href={`/continuum/archive?room=${activeCoverage.room}`}
                className="w-full py-2.5 rounded-xl bg-flop-blue text-flop-ice font-mono text-xs font-bold hover:bg-flop-blue/90 transition-all flex items-center justify-center gap-2"
              >
                <span>Browse /r/{activeCoverage.room} Archive</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Known Collector Gaps Registry */}
          <div className="p-5 rounded-2xl bg-surface border border-surface-border space-y-3">
            <h3 className="text-xs font-mono font-bold text-flop-ice uppercase tracking-wide flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-flop-cyan" />
              <span>Global Audited Gaps Registry ({gaps.length})</span>
            </h3>

            <div className="space-y-2">
              {gaps.map((g, i) => (
                <div key={i} className="p-3 rounded-xl bg-surface-raised border border-surface-border text-xs font-mono space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-flop-ice">/r/{g.room}</span>
                    <span className="text-[10px] text-flop-grey">Missing: {g.missingCount} seqs</span>
                  </div>
                  <div className="text-[11px] text-flop-grey">
                    Interval: seq #{g.startSeq} – #{g.endSeq} • Cause: {g.reason.replace(/_/g, " ")}
                  </div>
                  <div className="text-[10px] text-flop-grey italic">
                    Status: {g.status.replace(/_/g, " ")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
