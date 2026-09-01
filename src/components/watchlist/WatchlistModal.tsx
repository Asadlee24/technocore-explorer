"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bookmark,
  Plus,
  Trash2,
  ExternalLink,
  Compass,
  Users,
  X,
  BellRing,
  Check,
} from "lucide-react";
import { useWatchlist, WatchItem } from "@/lib/store/watchlist-store";
import { useAudioSettings } from "@/lib/store/audio-settings";

export function WatchlistModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { watchlist, addItem, removeItem } = useWatchlist();
  const { playSound } = useAudioSettings();
  const [newType, setNewType] = useState<"room" | "agent">("room");
  const [newName, setNewName] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    addItem(newType, newName.trim(), newNotes.trim() || undefined);
    setNewName("");
    setNewNotes("");
    setShowAddForm(false);
    playSound("tick");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-xl bg-[#0c1636] border border-surface-border rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border bg-[#0a1128]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-flop-blue/15 text-flop-cyan border border-flop-cyan/30">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-flop-ice flex items-center gap-2">
                Watchlist & Pinned Targets
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-flop-blue/20 text-flop-cyan border border-flop-blue/30">
                  {watchlist.length}
                </span>
              </h2>
              <p className="text-xs text-flop-grey font-mono">
                Track critical rooms and autonomous agent DIDs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-flop-grey hover:text-flop-ice hover:bg-surface-raised transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Add form toggle */}
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-2.5 px-4 rounded-lg border border-dashed border-surface-border hover:border-flop-blue/50 text-flop-grey hover:text-flop-ice text-xs font-mono flex items-center justify-center gap-2 transition-all bg-surface-raised/30 hover:bg-surface-raised/60"
            >
              <Plus className="w-3.5 h-3.5 text-flop-cyan" />
              Pin New Room or Agent DID
            </button>
          ) : (
            <form
              onSubmit={handleAdd}
              className="p-4 rounded-lg bg-surface-raised/60 border border-flop-blue/40 space-y-3 animate-in fade-in duration-200"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-flop-ice font-mono">
                  Add to Watchlist
                </span>
                <div className="flex items-center gap-1 p-0.5 rounded-md bg-flop-base border border-surface-border">
                  <button
                    type="button"
                    onClick={() => setNewType("room")}
                    className={`px-2.5 py-1 rounded text-xs font-mono transition-all ${
                      newType === "room"
                        ? "bg-flop-blue text-flop-ice font-bold"
                        : "text-flop-grey hover:text-flop-ice"
                    }`}
                  >
                    Room
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewType("agent")}
                    className={`px-2.5 py-1 rounded text-xs font-mono transition-all ${
                      newType === "agent"
                        ? "bg-flop-blue text-flop-ice font-bold"
                        : "text-flop-grey hover:text-flop-ice"
                    }`}
                  >
                    Agent DID
                  </button>
                </div>
              </div>

              <div>
                <input
                  type="text"
                  placeholder={
                    newType === "room"
                      ? "e.g. mb-demo, tech-lab, d-alpha"
                      : "e.g. did:key:z6Mkw... or DID fingerprint"
                  }
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-flop-base border border-surface-border text-flop-ice placeholder-flop-grey text-xs font-mono focus:outline-none focus:border-flop-cyan"
                  required
                />
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Optional notes or label..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-flop-base border border-surface-border text-flop-ice placeholder-flop-grey text-xs font-mono focus:outline-none focus:border-flop-cyan"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 rounded-md text-xs font-mono text-flop-grey hover:text-flop-ice hover:bg-surface-raised"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-md bg-flop-blue hover:bg-flop-blue-hover text-flop-ice text-xs font-semibold font-mono flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  Save to Watchlist
                </button>
              </div>
            </form>
          )}

          {/* List items */}
          {watchlist.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-surface-border rounded-xl space-y-2">
              <BellRing className="w-8 h-8 text-flop-grey/50 mx-auto" />
              <p className="text-xs text-flop-grey font-mono">
                No rooms or agents pinned yet.
              </p>
              <p className="text-[11px] text-flop-grey/70">
                Pin target mailboxes, owned channels, or autonomous agents to monitor them easily.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {watchlist.map((item) => {
                const isRoom = item.type === "room";
                const targetHref = isRoom
                  ? `/rooms/${item.name}`
                  : `/agents/${item.name}`;

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-surface-raised/40 hover:bg-surface-raised/80 border border-surface-border hover:border-flop-blue/40 transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`p-2 rounded-lg shrink-0 ${
                          isRoom
                            ? "bg-flop-cyan/10 text-flop-cyan"
                            : "bg-flop-green/10 text-flop-green"
                        }`}
                      >
                        {isRoom ? (
                          <Compass className="w-4 h-4" />
                        ) : (
                          <Users className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Link
                            href={targetHref}
                            onClick={onClose}
                            className="font-mono text-xs font-bold text-flop-ice hover:text-flop-cyan transition-colors truncate max-w-[260px] sm:max-w-xs"
                          >
                            {item.name}
                          </Link>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface-border text-flop-grey uppercase">
                            {item.type}
                          </span>
                        </div>
                        {item.notes ? (
                          <p className="text-[11px] text-flop-grey truncate mt-0.5">
                            {item.notes}
                          </p>
                        ) : (
                          <p className="text-[10px] text-flop-grey/60 font-mono mt-0.5">
                            Pinned on {new Date(item.addedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Link
                        href={targetHref}
                        onClick={onClose}
                        className="p-1.5 rounded text-flop-grey hover:text-flop-ice hover:bg-surface-border transition-colors"
                        title="View Target Details"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => {
                          removeItem(item.id);
                          playSound("tick");
                        }}
                        className="p-1.5 rounded text-flop-grey hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Remove from Watchlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-flop-base/90 border-t border-surface-border flex items-center justify-between text-xs font-mono text-flop-grey">
          <span>Target watch persistence: LocalStorage</span>
          <button
            onClick={onClose}
            className="text-flop-ice hover:text-flop-cyan transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
