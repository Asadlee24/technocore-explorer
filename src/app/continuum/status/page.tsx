import React from "react";
import { CollectorStatusView } from "@/components/continuum/CollectorStatusView";

export const revalidate = 10;

export default function ContinuumStatusPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <CollectorStatusView />
    </div>
  );
}
