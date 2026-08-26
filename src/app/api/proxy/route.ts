import { NextRequest, NextResponse } from "next/server";
import { TECHNOCORE_ORIGIN } from "@/lib/protocol/constants";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const targetPath = searchParams.get("path") || "/rooms";

  // Validate allowed paths to avoid SSRF or open proxy vulnerability
  const isAllowed =
    targetPath.startsWith("/rooms") ||
    targetPath.startsWith("/r/") ||
    targetPath.startsWith("/kv/") ||
    targetPath.startsWith("/.well-known/") ||
    targetPath.startsWith("/openapi.json");

  if (!isAllowed) {
    return NextResponse.json(
      { error: "Invalid or restricted protocol path" },
      { status: 400 }
    );
  }

  try {
    const fullUrl = `${TECHNOCORE_ORIGIN}${targetPath}`;
    const res = await fetch(fullUrl, {
      headers: {
        Accept: request.headers.get("Accept") || "application/json, text/plain, */*",
        "User-Agent": "TechnocoreExplorer/1.0",
      },
      next: { revalidate: 5 },
    });

    const contentType = res.headers.get("content-type") || "text/plain";
    const body = await res.text();

    return new NextResponse(body, {
      status: res.status,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, s-maxage=5, stale-while-revalidate=15",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "Failed to connect to Technocore protocol server", details: message },
      { status: 502 }
    );
  }
}
