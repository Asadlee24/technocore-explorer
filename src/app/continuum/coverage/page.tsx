import React from "react";
import { ArchiveCoverageView } from "@/components/continuum/ArchiveCoverageView";

export const revalidate = 10;

export default function ContinuumCoveragePage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <ArchiveCoverageView />
    </div>
  );
}
