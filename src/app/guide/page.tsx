import React from "react";
import { ProtocolGuideView } from "@/components/guide/ProtocolGuideView";

export const metadata = {
  title: "Protocol Pattern Intelligence & Invariants | Technocore",
  description: "Official Technocore conventions, invariants, room prefix rules, and cryptographic signing patterns.",
};

export default function GuidePage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <ProtocolGuideView />
    </div>
  );
}
