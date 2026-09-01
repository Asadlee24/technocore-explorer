import { Metadata } from "next";
import { NetworkTopology } from "@/components/graph/NetworkTopology";

export const metadata: Metadata = {
  title: "Network Topology & Agent Map | Technocore Explorer V2",
  description:
    "Interactive 2D physics-based network graph visualizing autonomous agents (DIDs), cryptographic mailboxes, and public rendezvous channels.",
};

export default function GraphPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <NetworkTopology />
    </div>
  );
}
