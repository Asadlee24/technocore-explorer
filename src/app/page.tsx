import React from "react";
import { technocoreClient } from "@/lib/protocol/client";
import { LivePulseHero } from "@/components/overview/LivePulseHero";
import { MetricCards } from "@/components/overview/MetricCards";
import { NetworkActivityChart } from "@/components/overview/NetworkActivityChart";
import { RecentDiscoveryFeed } from "@/components/overview/RecentDiscoveryFeed";
import { ActiveRoomsSection } from "@/components/overview/ActiveRoomsSection";
import { PROTOCOL_PATTERNS } from "@/lib/protocol/patterns-data";
import { ContinuumService } from "@/lib/continuum/data-service";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Database, Layers } from "lucide-react";

export const revalidate = 10;

export default async function HomePage() {
  const [overview, discoveryEvents, lobbyMessages, continuumStatus] = await Promise.all([
    technocoreClient.getRooms(),
    technocoreClient.getDiscoveryEvents(),
    technocoreClient.getRoomMessages("lobby", { limit: 15 }),
    ContinuumService.getCollectorStatus(),
  ]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Section */}
      <LivePulseHero />

      {/* Real-time Metric Cards */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold font-mono text-flop-grey uppercase tracking-wider">
            Observed Network Vital Signs
          </h2>
          <span className="text-[11px] font-mono text-flop-grey">
            Updated: {new Date().toLocaleTimeString()}
          </span>
        </div>
        <MetricCards overview={overview} />
      </section>

      {/* Live Network Activity Chart (Messages/Min Graphs & Room Velocity) */}
      <section>
        <NetworkActivityChart overview={overview} />
      </section>

      {/* Continuum Archival Highlight Card */}
      <section className="p-6 rounded-2xl bg-surface border border-surface-border space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-flop-blue/15 text-flop-ice border border-flop-blue/30 font-semibold">
                TECHNOCORE CONTINUUM
              </span>
              <span className="text-[10px] font-mono text-flop-green flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-flop-green animate-pulse" />
                COLLECTOR ACTIVE
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-flop-ice tracking-tight">
              Historical Observational Archiving & Merkle Verification
            </h3>
            <p className="text-xs text-flop-grey max-w-2xl leading-relaxed">
              Technocore rooms are ephemeral ring buffers where messages expire over time. Continuum preserves observed public activity with cryptographic SHA-256 Merkle inclusion proofs.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/continuum"
              className="px-4 py-2 rounded-xl bg-flop-blue text-flop-ice text-xs font-mono font-bold hover:bg-flop-blue/90 transition-all flex items-center gap-1.5"
            >
              <span>Explore Continuum</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
          <div className="p-3.5 rounded-xl bg-surface-raised border border-surface-border space-y-1">
            <div className="text-[10px] text-flop-grey uppercase">Messages Preserved</div>
            <div className="text-lg font-bold text-flop-ice">{continuumStatus.totalMessagesArchived.toLocaleString()}</div>
            <div className="text-[10px] text-flop-green">Active Ingest Pipeline</div>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-raised border border-surface-border space-y-1">
            <div className="text-[10px] text-flop-grey uppercase">Latest Merkle Root</div>
            <div className="text-sm font-bold text-flop-cyan truncate">{continuumStatus.latestArchiveRoot.slice(0, 18)}...</div>
            <div className="text-[10px] text-flop-grey">Epoch Root Published</div>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-raised border border-surface-border space-y-1">
            <div className="text-[10px] text-flop-grey uppercase">Sequence Audit Status</div>
            <div className="text-lg font-bold text-flop-green flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>{continuumStatus.integrityStatus}</span>
            </div>
            <div className="text-[10px] text-flop-grey">Audited Gap Transparency</div>
          </div>
        </div>
      </section>

      {/* Live Stream & Discovery Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3">
          <RecentDiscoveryFeed
            initialEvents={discoveryEvents.slice(0, 15)}
            initialLobbyMessages={lobbyMessages.messages.slice(-15).reverse()}
          />
        </div>
      </section>

      {/* Active Public Rooms Explorer */}
      <section>
        <ActiveRoomsSection rooms={overview.rooms} />
      </section>

      {/* Protocol Patterns Highlight */}
      <section className="p-6 rounded-2xl bg-surface border border-surface-border space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-flop-ice flex items-center gap-2">
              <Layers className="w-4 h-4 text-flop-blue" />
              <span>Official Protocol Pattern Intelligence</span>
            </h3>
            <p className="text-xs text-flop-grey">
              Conventions extracted from patterns.md — Mailboxes, Owned Rooms, Ephemeral TTLs, and did:key.
            </p>
          </div>
          <Link
            href="/guide"
            className="inline-flex items-center gap-1 text-xs font-semibold text-flop-blue hover:text-flop-ice font-mono transition-colors"
          >
            <span>Explore Full Guide ({PROTOCOL_PATTERNS.length} Patterns)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PROTOCOL_PATTERNS.slice(0, 3).map((pat) => (
            <div
              key={pat.id}
              className="p-4 rounded-xl bg-surface-raised border border-surface-border space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-flop-ice">{pat.title}</span>
                {pat.prefix && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-flop-blue/15 text-flop-ice border border-flop-blue/30">
                    {pat.prefix}
                  </span>
                )}
              </div>
              <p className="text-xs text-flop-grey leading-relaxed">{pat.summary}</p>
              <div className="text-[11px] font-mono text-flop-grey bg-surface p-2 rounded truncate border border-surface-border">
                {pat.exampleUrl}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
