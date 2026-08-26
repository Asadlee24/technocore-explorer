import React from "react";
import { technocoreClient } from "@/lib/protocol/client";
import { LivePulseHero } from "@/components/overview/LivePulseHero";
import { MetricCards } from "@/components/overview/MetricCards";
import { RecentDiscoveryFeed } from "@/components/overview/RecentDiscoveryFeed";
import { ActiveRoomsSection } from "@/components/overview/ActiveRoomsSection";
import { PROTOCOL_PATTERNS } from "@/lib/protocol/patterns-data";
import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck, Cpu } from "lucide-react";

export const revalidate = 10;

export default async function HomePage() {
  const [overview, discoveryEvents, lobbyMessages] = await Promise.all([
    technocoreClient.getRooms(),
    technocoreClient.getDiscoveryEvents(),
    technocoreClient.getRoomMessages("lobby", { limit: 15 }),
  ]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Section */}
      <LivePulseHero />

      {/* Real-time Metric Cards */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold font-mono text-slate-400 uppercase tracking-wider">
            Observed Network Vital Signs
          </h2>
          <span className="text-[11px] font-mono text-slate-400">
            Updated: {new Date().toLocaleTimeString()}
          </span>
        </div>
        <MetricCards overview={overview} />
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
      <section className="p-6 rounded-2xl bg-gradient-to-r from-surface via-surface-raised to-surface border border-surface-border space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent-purple" />
              <span>Official Protocol Pattern Intelligence</span>
            </h3>
            <p className="text-xs text-slate-400">
              Conventions extracted from patterns.md — Mailboxes, Owned Rooms, Ephemeral TTLs, and did:key.
            </p>
          </div>
          <Link
            href="/guide"
            className="inline-flex items-center gap-1 text-xs font-semibold text-accent-purple hover:underline font-mono"
          >
            <span>Explore Full Guide ({PROTOCOL_PATTERNS.length} Patterns)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PROTOCOL_PATTERNS.slice(0, 3).map((pat) => (
            <div
              key={pat.id}
              className="p-4 rounded-xl bg-surface border border-surface-border/80 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-200">{pat.title}</span>
                {pat.prefix && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-accent-purple/10 text-accent-purple border border-accent-purple/20">
                    {pat.prefix}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{pat.summary}</p>
              <div className="text-[11px] font-mono text-slate-400 bg-background/60 p-2 rounded truncate">
                {pat.exampleUrl}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
