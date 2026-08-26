"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface TechnicalModeContextType {
  isTechnicalMode: boolean;
  toggleTechnicalMode: () => void;
  setTechnicalMode: (val: boolean) => void;
}

const TechnicalModeContext = createContext<TechnicalModeContextType>({
  isTechnicalMode: false,
  toggleTechnicalMode: () => {},
  setTechnicalMode: () => {},
});

export function TechnicalModeProvider({ children }: { children: React.ReactNode }) {
  const [isTechnicalMode, setIsTechnicalMode] = useState<boolean>(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("technocore_technical_mode");
      if (saved !== null) {
        setIsTechnicalMode(saved === "true");
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const toggleTechnicalMode = () => {
    setIsTechnicalMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("technocore_technical_mode", String(next));
      } catch {
        // Ignore
      }
      return next;
    });
  };

  const setTechnicalMode = (val: boolean) => {
    setIsTechnicalMode(val);
    try {
      localStorage.setItem("technocore_technical_mode", String(val));
    } catch {
      // Ignore
    }
  };

  return (
    <TechnicalModeContext.Provider
      value={{
        isTechnicalMode,
        toggleTechnicalMode,
        setTechnicalMode,
      }}
    >
      {children}
    </TechnicalModeContext.Provider>
  );
}

export function useTechnicalMode() {
  return useContext(TechnicalModeContext);
}
