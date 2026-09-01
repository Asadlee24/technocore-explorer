"use client";

import { useState, useEffect } from "react";

export interface WatchItem {
  id: string;
  type: "room" | "agent";
  name: string;
  addedAt: number;
  lastSeenSeq?: number;
  notes?: string;
}

const WATCHLIST_STORAGE_KEY = "technocore_watchlist_v1";

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<WatchItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(WATCHLIST_STORAGE_KEY);
      if (stored) {
        setWatchlist(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load watchlist", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const saveWatchlist = (items: WatchItem[]) => {
    setWatchlist(items);
    try {
      localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error("Failed to save watchlist", e);
    }
  };

  const addItem = (type: "room" | "agent", name: string, notes?: string) => {
    const id = `${type}:${name.trim()}`;
    if (watchlist.some((item) => item.id === id)) return;
    const newItem: WatchItem = {
      id,
      type,
      name: name.trim(),
      addedAt: Date.now(),
      notes,
    };
    saveWatchlist([newItem, ...watchlist]);
  };

  const removeItem = (id: string) => {
    saveWatchlist(watchlist.filter((item) => item.id !== id));
  };

  const isWatching = (type: "room" | "agent", name: string) => {
    const id = `${type}:${name.trim()}`;
    return watchlist.some((item) => item.id === id);
  };

  const toggleWatch = (type: "room" | "agent", name: string) => {
    const id = `${type}:${name.trim()}`;
    if (isWatching(type, name)) {
      removeItem(id);
      return false;
    } else {
      addItem(type, name);
      return true;
    }
  };

  return {
    watchlist,
    isLoaded,
    addItem,
    removeItem,
    isWatching,
    toggleWatch,
  };
}
