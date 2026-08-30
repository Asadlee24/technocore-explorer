import React from "react";
import { ArchiveCoverageView } from "@/components/continuum/ArchiveCoverageView";
import { ContinuumService } from "@/lib/continuum/data-service";

export const revalidate = 5;

export default async function ContinuumCoveragePage() {
  const [coverageData, gapsData] = await Promise.all([
    ContinuumService.getCoverage(),
    ContinuumService.getDetectedGaps(),
  ]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <ArchiveCoverageView coverageData={coverageData} gapsData={gapsData} />
    </div>
  );
}
