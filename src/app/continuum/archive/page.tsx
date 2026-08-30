import React from "react";
import { ArchiveExplorerView } from "@/components/continuum/ArchiveExplorerView";
import { ContinuumService } from "@/lib/continuum/data-service";

export const revalidate = 5;

export default async function ContinuumArchivePage() {
  const records = await ContinuumService.getArchiveRecords();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <ArchiveExplorerView initialRecords={records} />
    </div>
  );
}
