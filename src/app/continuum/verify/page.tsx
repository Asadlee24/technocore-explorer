import React, { Suspense } from "react";
import { MerkleProofView } from "@/components/continuum/MerkleProofView";

export default function ContinuumVerifyPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Suspense fallback={
        <div className="p-12 text-center rounded-2xl bg-surface border border-surface-border text-xs font-mono text-flop-grey">
          Loading cryptographic Merkle proof...
        </div>
      }>
        <MerkleProofView />
      </Suspense>
    </div>
  );
}
