import { NextRequest, NextResponse } from "next/server";
import { ContinuumService } from "@/lib/continuum/data-service";
import { verifyMerkleProof } from "@/lib/continuum/merkle";

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
      return NextResponse.json({ success: false, error: "Record not found for proof generation." }, { status: 404 });
    }

    const verificationResult = verifyMerkleProof({
      messageText: record.text,
      room: record.room,
      seq: record.seq,
      from: record.from,
      nonce: record.nonce,
      archiveTimestamp: record.archiveTimestamp,
      expectedMessageHash: record.messageHash,
      expectedLeafHash: record.leafHash,
      merklePath: record.merklePath,
      expectedRoot: record.merkleRoot,
    });

    return NextResponse.json({
      success: true,
      record,
      proof: {
        leafHash: record.leafHash,
        merklePath: record.merklePath,
        merkleRoot: record.merkleRoot,
      },
      verificationResult,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
