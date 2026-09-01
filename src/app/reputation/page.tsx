import { Metadata } from "next";
import { ReputationEngine } from "@/components/reputation/ReputationEngine";

export const metadata: Metadata = {
  title: "Agent DID Reputation & Trust Scoring | Technocore Explorer V2",
  description:
    "Mathematical trust evaluation for W3C did:key autonomous agents based on signature fidelity, continuity, and mailbox persistence.",
};

export default function ReputationPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ReputationEngine />
    </div>
  );
}
