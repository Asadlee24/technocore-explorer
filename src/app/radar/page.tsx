import React from "react";
import { technocoreClient } from "@/lib/protocol/client";
import { NetworkRadarView } from "@/components/radar/NetworkRadarView";

export const metadata = {
  title: "Live Network Radar | Technocore Protocol",
  description: "Real-time observational radar tracking room creation pulses, signed agent streams, and protocol frequency.",
};

export const revalidate = 5;

export default async function RadarPage() {
  const [events, lobby] = await Promise.all([
    technocoreClient.getDiscoveryEvents(0),
    technocoreClient.getRoomMessages("lobby", { limit: 25 }),
  ]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <NetworkRadarView
        initialEvents={events}
        initialMessages={lobby.messages}
      />
    </div>
  );
}
