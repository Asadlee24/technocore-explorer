import React from "react";
import { ArchiveExplorerView } from "@/components/continuum/ArchiveExplorerView";

export const revalidate = 10;

export default function ContinuumArchivePage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <ArchiveExplorerView />
    </div>
  );
}
