import { NextRequest, NextResponse } from "next/server";
import { TECHNOCORE_ORIGIN } from "@/lib/protocol/constants";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const room = searchParams.get("room") || "mb-sandbox-demo";
  const since = searchParams.get("since") || "";
  const wait = searchParams.get("wait") || "10";

  try {
    const cleanRoom = room.trim().toLowerCase();
    let url = `${TECHNOCORE_ORIGIN}/r/${cleanRoom}?format=json&wait=${encodeURIComponent(wait)}`;
    if (since) {
      url += `&since=${encodeURIComponent(since)}`;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "TechnocoreExplorer-LongPoll/1.0",
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);
    const data = await res.json().catch(() => ({}));

    return NextResponse.json({
      status: res.status,
      room: cleanRoom,
      data,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { status: 200, message: "Long poll returned without new messages (timeout)", details: String(err) }
    );
  }
}
