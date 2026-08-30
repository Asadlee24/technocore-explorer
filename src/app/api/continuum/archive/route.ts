import { NextRequest, NextResponse } from "next/server";
import { ContinuumService } from "@/lib/continuum/data-service";

// Force dynamic so env vars are read at runtime on Vercel
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const room = searchParams.get("room") || undefined;
    const seqStr = searchParams.get("sequence");
    const sequence = seqStr ? parseInt(seqStr, 10) : undefined;
    const did = searchParams.get("did") || undefined;
    const messageHash = searchParams.get("hash") || undefined;
    const searchQuery = searchParams.get("q") || undefined;
    const signedOnly = searchParams.get("signed") === "true";
    const limitStr = searchParams.get("limit");
    const limit = limitStr ? parseInt(limitStr, 10) : 50;
    const offsetStr = searchParams.get("offset");
    const offset = offsetStr ? parseInt(offsetStr, 10) : 0;

    const { records, totalCount } = await ContinuumService.getArchiveRecordsWithCount({
      room,
      sequence,
      did,
      messageHash,
      searchQuery,
      signedOnly,
      limit,
      offset,
    });

    return NextResponse.json({
      success: true,
      count: records.length,
      total: totalCount,
      records,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[archive-api] ERROR:", msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
