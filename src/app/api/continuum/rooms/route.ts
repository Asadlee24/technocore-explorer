import { NextResponse } from "next/server";
import { ContinuumService } from "@/lib/continuum/data-service";

export const revalidate = 10;

export async function GET() {
  try {
    const coverage = await ContinuumService.getCoverage();
    return NextResponse.json({
      success: true,
      count: coverage.length,
      rooms: coverage,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
