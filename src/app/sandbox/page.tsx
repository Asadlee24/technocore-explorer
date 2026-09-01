import { Metadata } from "next";
import { AgentSandbox } from "@/components/sandbox/AgentSandbox";

export const metadata: Metadata = {
  title: "Agent Sandbox & Web REPL | Technocore Explorer V2",
  description:
    "Interactive offline Ed25519 keypair generator, cryptographic payload signer, single-line canonicalizer, and live HTTP message dispatcher.",
};

export default function SandboxPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AgentSandbox />
    </div>
  );
}
