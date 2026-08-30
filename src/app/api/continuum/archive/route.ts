import { NextRequest, NextResponse } from "next/server";
import { ContinuumService } from "@/lib/continuum/data-service";

export const revalidate = 5;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const room = searchParams.get("room") || undefined;
    const seqStr = searchParams.get("sequence");
    const sequence = seqStr ? parseInt(seqStr, 10) : undefined;
    const did = searchParams.get("did") || undefined;
    const messageHash = searchParams.get("hash") || undefined;
    const searchQuery = searchParams.get("q") || undefined;
    const limitStr = searchParams.get("limit");
    const limit = limitStr ? parseInt(limitStr, 10) : 50;

    const records = await ContinuumService.getArchiveRecords({
      room,
      sequence,
      did,
      messageHash,
      searchQuery,
      limit,
    });

    return NextResponse.json({
      success: true,
      count: records.length,
      records,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
