"use client";

import { useState, useEffect } from "react";
import { SoundEffects } from "../audio/sound-effects";

const AUDIO_ENABLED_STORAGE_KEY = "technocore_sound_enabled";

export function useAudioSettings() {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUDIO_ENABLED_STORAGE_KEY);
      if (stored !== null) {
        setSoundEnabled(stored === "true");
      }
    } catch {
      // Ignore
    }
  }, []);

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(AUDIO_ENABLED_STORAGE_KEY, String(next));
      } catch {
        // Ignore
      }
      if (next) {
        SoundEffects.playTick(0.15);
      }
      return next;
    });
  };

  const playSound = (type: "ping" | "verified" | "tick" | "alert") => {
    if (!soundEnabled) return;
    switch (type) {
      case "ping":
        SoundEffects.playRadarPing();
        break;
      case "verified":
        SoundEffects.playVerifiedChime();
        break;
      case "tick":
        SoundEffects.playTick();
        break;
      case "alert":
        SoundEffects.playAlert();
        break;
    }
  };

  return { soundEnabled, toggleSound, playSound };
}
