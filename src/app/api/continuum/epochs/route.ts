import { NextResponse } from "next/server";
import { ContinuumDatabase } from "@/lib/continuum/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const blocks = await ContinuumDatabase.getMerkleBlocks(20);
    return NextResponse.json({
      success: true,
      count: blocks.length,
      epochs: blocks,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
