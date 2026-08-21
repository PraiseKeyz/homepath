"use client";

import { Settings as SettingsIcon } from "lucide-react";
import { useEffect, useState } from "react";
import type { User } from "@/lib/api";
import { getStoredUser } from "@/lib/auth";

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-text-primary-900">Settings</h1>
      <p className="mt-1 text-sm text-text-tertiary-600">
        Account and preferences.
      </p>

      <div className="mt-8 rounded-2xl border border-border-secondary bg-background-bg-primary p-6">
        <h2 className="text-sm font-semibold text-text-primary-900">Account</h2>
        <p className="mt-2 text-sm text-text-tertiary-600">
          Signed in as{" "}
          <span className="font-medium text-text-secondary-700">
            {user?.email}
          </span>
        </p>
      </div>

      <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-strong py-16 text-center">
        <SettingsIcon className="mb-3 h-10 w-10 text-text-quaternary-500" />
        <p className="text-sm font-medium text-text-tertiary-600">
          More settings coming soon
        </p>
        <p className="mt-1 max-w-xs text-xs text-text-quaternary-500">
          Notification preferences, password change, and account deletion will
          live here.
        </p>
      </div>
    </div>
  );
}
