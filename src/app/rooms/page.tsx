import React from "react";
import { technocoreClient } from "@/lib/protocol/client";
import { RoomList } from "@/components/rooms/RoomList";

export const revalidate = 10;

export default async function RoomsPage() {
  const overview = await technocoreClient.getRooms();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <RoomList
        initialRooms={overview.rooms}
        totalRoomsCount={overview.roomsCount}
      />
    </div>
  );
}
