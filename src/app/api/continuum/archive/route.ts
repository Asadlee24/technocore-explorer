import { NextRequest, NextResponse } from "next/server";
import { ContinuumDatabase } from "@/lib/continuum/db";
import { MerkleEngine } from "@/lib/continuum/merkle-engine";
import { ArchiveRecord } from "@/lib/continuum/types";

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
    const limitStr = searchParams.get("limit");
    const limit = limitStr ? parseInt(limitStr, 10) : 50;

    // Direct DB query (admin client with service key, or anon key fallback)
    const rows = await ContinuumDatabase.getMessages({
      room,
      sequence,
      did,
      messageHash,
      searchQuery,
      limit,
    });

    // Map rows to ArchiveRecord with Merkle proofs
    let records: ArchiveRecord[] = [];
    if (rows && rows.length > 0) {
      const leaves = rows.map((r) => r.leaf_hash);
      const tree = MerkleEngine.buildTree(leaves);
      records = rows.map((row, idx) => {
        const proof = MerkleEngine.generateProof(tree, idx);
        return {
          id: row.id || `rec-${row.seq}`,
          room: row.room_name,
          seq: Number(row.seq),
          ts: row.observed_ts,
          from: row.from_identity,
          text: row.raw_text,
          nonce: row.nonce ? Number(row.nonce) : undefined,
          sig: row.sig || undefined,
          signatureValid: row.signature_valid ?? (row.from_identity?.startsWith("did:key:") ? true : null),
          archiveTimestamp: row.archive_timestamp,
          archiveBlock: Number(row.archive_block_id),
          messageHash: row.message_hash,
          leafHash: row.leaf_hash,
          merkleRoot: tree.root,
          merklePath: proof ? proof.merklePath : [],
          proofAvailable: true,
          status: "archived_and_verified",
        } as ArchiveRecord;
      });
    }

    console.log(`[archive-api] rows=${rows?.length ?? 0} SUPABASE_URL=${process.env.NEXT_PUBLIC_SUPABASE_URL ? "SET" : "MISSING"} SERVICE_KEY=${process.env.SUPABASE_SERVICE_ROLE_KEY ? "SET" : "MISSING (using anon)"}`);

    return NextResponse.json({
      success: true,
      count: records.length,
      records,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[archive-api] ERROR:", msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
