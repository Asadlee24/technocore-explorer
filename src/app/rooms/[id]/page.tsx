import React from "react";
import { technocoreClient } from "@/lib/protocol/client";
import { RoomDetailView } from "@/components/rooms/RoomDetailView";

interface RoomPageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 5;

export default async function SingleRoomPage({ params }: RoomPageProps) {
  const { id } = await params;
  const decodedRoom = decodeURIComponent(id);

  const [messagesRes, topic, ownerInfo] = await Promise.all([
    technocoreClient.getRoomMessages(decodedRoom, { limit: 50 }),
    technocoreClient.getRoomTopic(decodedRoom),
    decodedRoom.startsWith("d-")
      ? technocoreClient.getNote("room-owners", `d-${decodedRoom.replace(/^d-/, "")}`)
      : Promise.resolve(null),
  ]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <RoomDetailView
        roomName={decodedRoom}
        initialMessages={messagesRes.messages}
        topic={topic}
        ownerInfo={ownerInfo}
      />
    </div>
  );
}
