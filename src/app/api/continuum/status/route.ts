import { NextResponse } from "next/server";
import { ContinuumService } from "@/lib/continuum/data-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
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
