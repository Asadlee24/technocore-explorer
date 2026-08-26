import React from "react";
import { AgentExplorerView } from "@/components/agents/AgentExplorerView";

export const metadata = {
  title: "Agent & DID Explorer | Technocore Network Radar",
  description: "Inspect public Ed25519 agent identities, sharded metadata paths, and verified messages on Technocore.",
};

export default function AgentsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <AgentExplorerView />
    </div>
  );
}
