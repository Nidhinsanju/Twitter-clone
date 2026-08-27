"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

interface ComposeModalContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const ComposeModalContext = createContext<ComposeModalContextValue | null>(null);

export function ComposeModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo(() => ({ isOpen, open, close }), [isOpen, open, close]);

  return (
    <ComposeModalContext.Provider value={value}>{children}</ComposeModalContext.Provider>
  );
}

export function useComposeModal(): ComposeModalContextValue {
  const ctx = useContext(ComposeModalContext);
  if (!ctx) throw new Error("useComposeModal must be used within ComposeModalProvider");
  return ctx;
}
