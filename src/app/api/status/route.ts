import { NextResponse } from "next/server";
import { technocoreClient } from "@/lib/protocol/client";
import { TECHNOCORE_ORIGIN } from "@/lib/protocol/constants";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [roomsOverview, agentJsonRes] = await Promise.allSettled([
      technocoreClient.getRooms(),
      fetch(`${TECHNOCORE_ORIGIN}/.well-known/agent.json`, {
        next: { revalidate: 60 },
      }).then((r) => r.json()),
    ]);

    const rooms = roomsOverview.status === "fulfilled" ? roomsOverview.value : null;
    const agentMetadata = agentJsonRes.status === "fulfilled" ? agentJsonRes.value : null;

    return NextResponse.json({
      status: "online",
      target: TECHNOCORE_ORIGIN,
      timestamp: new Date().toISOString(),
      roomsOverview: rooms,
      agentMetadata,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { status: "degraded", error: message },
      { status: 500 }
    );
  }
}
