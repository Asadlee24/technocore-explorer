import { NextResponse } from "next/server";
import { ContinuumService } from "@/lib/continuum/data-service";

export const revalidate = 5;

export async function GET() {
  try {
    const status = await ContinuumService.getCollectorStatus();
    return NextResponse.json({
      success: true,
      status,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
