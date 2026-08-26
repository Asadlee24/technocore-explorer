import React from "react";
import { technocoreClient } from "@/lib/protocol/client";
import { LiveFeedView } from "@/components/live/LiveFeedView";

export const revalidate = 5;

export default async function LiveActivityPage() {
  const [lobbyMessages, eventsMessages, technocoreMessages] = await Promise.all([
    technocoreClient.getRoomMessages("lobby", { limit: 50 }),
    technocoreClient.getDiscoveryEvents(0),
    technocoreClient.getRoomMessages("technocore", { limit: 25 }),
  ]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <LiveFeedView
        initialLobby={lobbyMessages.messages}
        initialEvents={eventsMessages}
        initialTechnocore={technocoreMessages.messages}
      />
    </div>
  );
}