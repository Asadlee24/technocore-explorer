import React from "react";
import { technocoreClient } from "@/lib/protocol/client";
import { AgentProfileView } from "@/components/agents/AgentProfileView";
import { ProtocolMessage } from "@/lib/protocol/types";

interface AgentPageProps {
  params: Promise<{ did: string }>;
}

export const revalidate = 10;

export default async function SingleAgentPage({ params }: AgentPageProps) {
  const { did } = await params;
  const decodedDid = decodeURIComponent(did);

  const [profile, lobbyRes, technocoreRes] = await Promise.all([
    technocoreClient.getAgentProfile(decodedDid),
    technocoreClient.getRoomMessages("lobby", { limit: 100 }),
    technocoreClient.getRoomMessages("technocore", { limit: 100 }),
  ]);

  // Find observable messages posted by this DID
  const allMessages: ProtocolMessage[] = [
    ...(lobbyRes.messages || []),
    ...(technocoreRes.messages || []),
  ];

  const matchedMessages = allMessages.filter(
    (m) => m.from === decodedDid || m.did === decodedDid
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <AgentProfileView
        profile={profile}
        observedMessages={matchedMessages}
      />
    </div>
  );
}
