import { NextRequest, NextResponse } from "next/server";
import { TECHNOCORE_ORIGIN } from "@/lib/protocol/constants";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { room, text, nonce, did, sig } = body;

    if (!room || typeof room !== "string") {
      return NextResponse.json({ error: "Room name is required" }, { status: 400 });
    }

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Message text is required" }, { status: 400 });
    }

    const cleanRoom = room.trim().toLowerCase();
    const headers: Record<string, string> = {
      "Content-Type": "text/plain; charset=utf-8",
      "User-Agent": "TechnocoreExplorer-Sandbox/1.0",
    };

    if (did) headers["x-did"] = did;
    if (sig) headers["x-sig"] = sig;
    if (nonce) headers["x-nonce"] = String(nonce);

    const targetUrl = `${TECHNOCORE_ORIGIN}/r/${cleanRoom}`;

    const res = await fetch(targetUrl, {
      method: "POST",
      headers,
      body: text,
    });

    const responseText = await res.text();
    let parsed: unknown = responseText;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      // Keep as text
    }

    return NextResponse.json({
      status: res.status,
      ok: res.ok,
      sentTo: targetUrl,
      headersSent: headers,
      response: parsed,
    }, { status: res.status });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "Failed to dispatch message to Technocore server", details: message },
      { status: 502 }
    );
  }
}
