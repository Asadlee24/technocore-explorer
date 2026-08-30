import React from "react";
import { ArchiveExplorerView } from "@/components/continuum/ArchiveExplorerView";
import { ContinuumService } from "@/lib/continuum/data-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Continuum Historical Archive | Technocore Explorer",
  description: "Search and cryptographically verify publicly observed Technocore messages in the Continuum cold storage archive.",
};

export default async function ContinuumArchivePage() {
  const { records, totalCount } = await ContinuumService.getArchiveRecordsWithCount({ limit: 50 });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <ArchiveExplorerView initialRecords={records} initialTotalCount={totalCount} />
    </div>
  );
}
