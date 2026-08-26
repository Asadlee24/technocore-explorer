import React from "react";
import { SequenceLookupView } from "@/components/sequence/SequenceLookupView";

export const metadata = {
  title: "Sequence Lookup | Technocore Radar",
  description: "Jump straight to any sequence number using the official protocol since parameter.",
};

export default function SequencePage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <SequenceLookupView />
    </div>
  );
}
