"use client";

import {
  Bell,
  CheckCheck,
  Flag,
  Handshake,
  MessageCircle,
  Star,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useDashboardShell } from "@/components/dashboard-shell-context";
import { ErrorState } from "@/components/error-state";
import {
  ApiError,
  type AppNotification,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationType,
} from "@/lib/api";
import { getToken } from "@/lib/auth";

const TYPE_META: Record<
  NotificationType,
  { icon: typeof Bell; className: string }
> = {
  MATCH_ACCEPTED: {
    icon: Handshake,
    className: "bg-utility-success-50 text-utility-success-600",
  },
  MATCH_DECLINED: {
    icon: XCircle,
    className: "bg-utility-error-50 text-utility-error-600",
  },
  RATING_RECEIVED: {
    icon: Star,
    className: "bg-utility-warning-50 text-utility-warning-600",
  },
  COMMUNITY_REPORT_FILED: {
    icon: Flag,
    className: "bg-utility-error-50 text-utility-error-600",
  },
  NEW_MESSAGE: {
    icon: MessageCircle,
    className: "bg-background-bg-brand-primary text-text-brand-secondary-700",
  },
};

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

export function NotificationsList() {
  const { refreshNotifications } = useDashboardShell();
  const [notifications, setNotifications] = useState<AppNotification[] | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    setError(null);
    try {
      setNotifications(await fetchNotifications(token));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleMarkRead(id: string) {
    const token = getToken();
    if (!token) return;
    setNotifications((prev) =>
      prev ? prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)) : prev,
    );
    try {
      await markNotificationRead(id, token);
      refreshNotifications();
    } catch {
      load();
    }
  }

  async function handleMarkAllRead() {
    const token = getToken();
    if (!token) return;
    setNotifications((prev) =>
      prev ? prev.map((n) => ({ ...n, isRead: true })) : prev,
    );
    try {
      await markAllNotificationsRead(token);
      refreshNotifications();
    } catch {
      load();
    }
  }

  if (error) {
    return <ErrorState onRetry={load} homeHref="/dashboard" />;
  }

  if (!notifications) {
    return (
      <p className="text-sm text-text-tertiary-600">Loading notifications…</p>
    );
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary-900">
            Notifications
          </h1>
          <p className="mt-1 text-sm text-text-tertiary-600">
            Match responses, ratings, and reports on your properties.
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 text-xs font-semibold text-text-brand-secondary-700 hover:underline"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-strong py-24 text-center">
          <Bell className="mb-3 h-10 w-10 text-text-quaternary-500" />
          <p className="text-sm font-medium text-text-tertiary-600">
            No notifications yet
          </p>
          <p className="mt-1 max-w-xs text-xs text-text-quaternary-500">
            You'll see updates here when something real happens — a match
            response, a rating, a report, or a new message.
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-2">
          {notifications.map((notification) => {
            const meta = TYPE_META[notification.type];
            return (
              <li key={notification.id}>
                <button
                  type="button"
                  onClick={() =>
                    !notification.isRead && handleMarkRead(notification.id)
                  }
                  className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-colors ${
                    notification.isRead
                      ? "border-border-secondary bg-background-bg-primary"
                      : "border-border-brand bg-background-bg-brand-primary"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${meta.className}`}
                  >
                    <meta.icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-text-primary-900">
                        {notification.title}
                      </p>
                      <span className="shrink-0 text-xs text-text-quaternary-500">
                        {timeAgo(notification.createdAt)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-text-tertiary-600">
                      {notification.body}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-button-primary-default" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
