import React from "react";
import { LocalVerificationPlayground } from "@/components/verify/LocalVerificationPlayground";

export const metadata = {
  title: "Local Signature Verification Playground | Technocore",
  description: "Verify Ed25519 pure (RFC 8032) did:key message and note signatures 100% offline in your browser.",
};

export default function VerifyPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <LocalVerificationPlayground />
    </div>
  );
}
