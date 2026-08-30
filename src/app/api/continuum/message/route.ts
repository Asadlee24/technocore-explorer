import { NextRequest, NextResponse } from "next/server";
import { ContinuumService } from "@/lib/continuum/data-service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const room = searchParams.get("room") || undefined;

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing required 'id' parameter." }, { status: 400 });
    }

    const record = await ContinuumService.getRecordById(id, room);
    if (!record) {
      return NextResponse.json({ success: false, error: "Record not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      record,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
