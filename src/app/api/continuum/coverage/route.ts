import { NextResponse } from "next/server";
import { ContinuumService } from "@/lib/continuum/data-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const [coverage, gaps] = await Promise.all([
      ContinuumService.getCoverage(),
      ContinuumService.getDetectedGaps(),
    ]);

    return NextResponse.json({
      success: true,
      coverage,
      gaps,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
