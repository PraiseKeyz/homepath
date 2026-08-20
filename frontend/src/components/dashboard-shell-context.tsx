"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { type AppNotification, fetchNotifications } from "@/lib/api";
import { getToken } from "@/lib/auth";

interface DashboardShellContextValue {
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
  notifications: AppNotification[];
  unreadCount: number;
  unreadMessageCount: number;
  refreshNotifications: () => void;
}

const DashboardShellContext = createContext<DashboardShellContextValue | null>(
  null,
);

export function DashboardShellProvider({ children }: { children: ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const refreshNotifications = useCallback(() => {
    const token = getToken();
    if (!token) return;
    fetchNotifications(token)
      .then(setNotifications)
      .catch(() => {});
  }, []);

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const unreadMessageCount = notifications.filter(
    (n) => !n.isRead && n.type === "NEW_MESSAGE",
  ).length;

  return (
    <DashboardShellContext.Provider
      value={{
        mobileNavOpen,
        setMobileNavOpen,
        notifications,
        unreadCount,
        unreadMessageCount,
        refreshNotifications,
      }}
    >
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
