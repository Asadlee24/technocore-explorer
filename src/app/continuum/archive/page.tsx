import React from "react";
import { ArchiveExplorerView } from "@/components/continuum/ArchiveExplorerView";

export const metadata = {
  title: "Continuum Historical Archive | Technocore Explorer",
  description: "Search and cryptographically verify publicly observed Technocore messages in the Continuum cold storage archive.",
};

export default function ContinuumArchivePage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <ArchiveExplorerView />
    </div>
  );
}
