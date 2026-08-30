import React from "react";
import { ContinuumHero } from "@/components/continuum/ContinuumHero";
import { ContinuumMetricCards } from "@/components/continuum/ContinuumMetricCards";
import { ArchiveExplorerView } from "@/components/continuum/ArchiveExplorerView";
import { ContinuumService } from "@/lib/continuum/data-service";
import Link from "next/link";
import { ArrowRight, Database } from "lucide-react";

export const revalidate = 5;

export default async function ContinuumPage() {
  const [status, records] = await Promise.all([
    ContinuumService.getCollectorStatus(),
    ContinuumService.getArchiveRecords(),
  ]);

  const recentRecords = records.slice(0, 6);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Continuum Hero */}
      <ContinuumHero />

      {/* Continuum Vital Metrics */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-flop-grey">
            Archival Observability Telemetry
          </h2>
          <span className="text-[11px] font-mono text-flop-grey">
            Audit status: <span className="text-flop-green font-bold">{status.integrityStatus}</span>
          </span>
        </div>
        <ContinuumMetricCards status={status} />
      </section>

      {/* Recent Historical Records Preview */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-sm font-bold font-mono text-flop-ice uppercase tracking-wider flex items-center gap-2">
              <Database className="w-4 h-4 text-flop-blue" />
              <span>Recent Archived Observations</span>
            </h2>
            <p className="text-xs text-flop-grey">
              Messages preserved from ephemeral ring buffers with SHA-256 leaves.
            </p>
          </div>

          <Link
            href="/continuum/archive"
            className="text-xs font-mono text-flop-blue hover:text-flop-ice transition-colors flex items-center gap-1 font-semibold"
          >
            <span>View Full Archive</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <ArchiveExplorerView initialRecords={recentRecords.length > 0 ? recentRecords : undefined} />
      </section>
    </div>
  );
}
