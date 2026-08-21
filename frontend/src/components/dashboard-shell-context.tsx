"use client";

import { createContext, type ReactNode, useContext, useState } from "react";

interface DashboardShellContextValue {
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
}

const DashboardShellContext = createContext<DashboardShellContextValue | null>(
  null,
);

export function DashboardShellProvider({ children }: { children: ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  return (
    <DashboardShellContext.Provider value={{ mobileNavOpen, setMobileNavOpen }}>
      {children}
    </DashboardShellContext.Provider>
  );
}

export function useDashboardShell() {
  const ctx = useContext(DashboardShellContext);
  if (!ctx) {
    throw new Error(
      "useDashboardShell must be used within a DashboardShellProvider",
    );
  }
  return ctx;
}
