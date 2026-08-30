import { NextResponse } from "next/server";
import { ContinuumCollector } from "@/lib/continuum/collector";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Allow up to 60s for serverless execution

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    // Allow Vercel Cron or direct trigger
    const collector = new ContinuumCollector();
    const result = await collector.runCollectionCycle();

    return NextResponse.json({
      success: true,
      result,
      timestamp: new Date().toISOString(),
      source: "Vercel 24/7 Cloud Ingestion Node",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
