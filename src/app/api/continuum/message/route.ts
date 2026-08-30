import { NextRequest, NextResponse } from "next/server";
import { ContinuumService } from "@/lib/continuum/data-service";
import { ContinuumDatabase, DbMessageRow } from "@/lib/continuum/db";
import { canonicalizeSingleLine } from "@/lib/protocol/parser";
import { computeMessageHash, computeLeafHash } from "@/lib/continuum/merkle";
import { verifyMessageSignature } from "@/lib/crypto/verify";
import { ArchiveRecord } from "@/lib/continuum/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const room = (body.room || "lobby").replace(/^\/r\//, "");
    const from = (body.from || "asadlee").trim();
    const text = (body.text || "").trim();
    const nonce = body.nonce !== undefined ? body.nonce : Date.now();
    const sig = body.sig || undefined;

    if (!text) {
      return NextResponse.json({ success: false, error: "Message text is required." }, { status: 400 });
    }

    // 1. Transmit to official Technocore protocol server
    const postRes = await fetch(`https://technocore.chat/r/${encodeURIComponent(room)}`, {
      method: "POST",
      headers: {
        "User-Agent": "curl/8.4.0",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        text,
        nonce,
        sig,
      }),
    });

    const replyText = await postRes.text();
    if (!postRes.ok && postRes.status !== 200) {
      return NextResponse.json(
        { success: false, error: `Protocol responded with HTTP ${postRes.status}: ${replyText}` },
        { status: 400 }
      );
    }

    // 2. Parse sequence number from response
    // Response looks like: [11028338] 2026-08-30T09:20:17.871903Z <~asadlee> TEST...
    const match = replyText.match(/\[(\d+)\]\s+(\S+)\s+<([^>]+)>\s*(.*)/);
    const seq = match ? parseInt(match[1], 10) : undefined;
    const observedTs = match ? match[2] : new Date().toISOString();

    if (seq) {
      const canonicalText = canonicalizeSingleLine(text);
      const archiveTs = new Date().toISOString();
      const messageHash = computeMessageHash({
        room,
        seq,
        from,
        text,
        nonce,
      });
      const leafHash = computeLeafHash(seq, messageHash, archiveTs);

      let isSigValid: boolean | null = null;
      if (from.startsWith("did:key:") && sig) {
        const sigVerdict = verifyMessageSignature({
          did: from,
          room,
          nonce: nonce ?? 0,
          text,
          sig,
        });
        isSigValid = sigVerdict.verified;
      }

      const row: DbMessageRow = {
        room_name: room,
        seq,
        observed_ts: observedTs,
        from_identity: from,
        raw_text: text,
        canonical_text: canonicalText,
        nonce: nonce ?? null,
        sig: sig ?? null,
        signature_valid: isSigValid,
        message_hash: messageHash,
        leaf_hash: leafHash,
        archive_timestamp: archiveTs,
        archive_block_id: 1,
      };

      await ContinuumDatabase.insertMessages([row]);

      const record: ArchiveRecord = {
        id: `rec-${seq}`,
        room,
        seq,
        ts: observedTs,
        from,
        text,
        nonce,
        sig,
        signatureValid: isSigValid,
        archiveTimestamp: archiveTs,
        archiveBlock: 1,
        messageHash,
        leafHash,
        merkleRoot: leafHash,
        merklePath: [],
        proofAvailable: true,
        status: "archived_and_verified" as const,
      };

      return NextResponse.json({
        success: true,
        seq,
        record,
        protocolResponse: replyText,
      });
    }

    return NextResponse.json({
      success: true,
      protocolResponse: replyText,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[post-message-api] ERROR:", msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
