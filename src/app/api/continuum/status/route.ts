import { NextResponse } from "next/server";
import { ContinuumService } from "@/lib/continuum/data-service";
import { continuumCollector } from "@/lib/continuum/collector";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 30;

let lastAutoSweepTs = 0;

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const forceSync = url.searchParams.get("sync") === "true";
    const now = Date.now();

    // If explicit sync requested or last sweep was > 15s ago, execute/trigger collection
    if (forceSync) {
      lastAutoSweepTs = now;
      await continuumCollector.runCollectionCycle();
    } else if (now - lastAutoSweepTs > 15000) {
      lastAutoSweepTs = now;
      continuumCollector.runCollectionCycle().catch((err) => console.error("Background auto sweep error:", err));
    }

    const [status, liveStats] = await Promise.all([
      ContinuumService.getCollectorStatus(),
      ContinuumService.getLiveStats(),
    ]);

    return NextResponse.json({
      success: true,
      status,
      liveStats,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST() {
  try {
    const result = await continuumCollector.runCollectionCycle();
    const liveStats = await ContinuumService.getLiveStats();
    return NextResponse.json({
      success: true,
      result,
      liveStats,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
