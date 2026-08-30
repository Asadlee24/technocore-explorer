import React from "react";
import { CollectorStatusView } from "@/components/continuum/CollectorStatusView";
import { ContinuumService } from "@/lib/continuum/data-service";

export const revalidate = 5;

export default async function ContinuumStatusPage() {
  const status = await ContinuumService.getCollectorStatus();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <CollectorStatusView status={status} />
    </div>
  );
}
