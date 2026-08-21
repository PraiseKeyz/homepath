"use client";

import { KeyRound, Settings as SettingsIcon } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { ApiError, changePassword, type User } from "@/lib/api";
import { getStoredUser, getToken } from "@/lib/auth";

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  async function handleChangePassword(event: FormEvent) {
    event.preventDefault();
    const token = getToken();
    if (!token || !user) return;

    setError(null);
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError("New passwords don't match.");
      return;
    }

    setSaving(true);
    try {
      await changePassword(user.id, token, { currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not change password.",
      );
    } finally {
      setSaving(false);
    }
  }

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

      <div className="mt-6 rounded-2xl border border-border-secondary bg-background-bg-primary p-6">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-text-primary-900">
          <KeyRound className="h-4 w-4 text-text-quaternary-500" />
          Change password
        </h2>

        <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="current-password">Current password</Label>
            <PasswordInput
              id="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-password">New password</Label>
            <PasswordInput
              id="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm-password">Confirm new password</Label>
            <PasswordInput
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>

          {error && (
            <p className="text-sm text-text-error-primary-600">{error}</p>
          )}
          {success && (
            <p className="text-sm text-utility-success-600">
              Password updated.
            </p>
          )}

          <Button type="submit" disabled={saving}>
            {saving ? "Updating…" : "Update password"}
          </Button>
        </form>
      </div>

      <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-strong py-16 text-center">
        <SettingsIcon className="mb-3 h-10 w-10 text-text-quaternary-500" />
        <p className="text-sm font-medium text-text-tertiary-600">
          More settings coming soon
        </p>
        <p className="mt-1 max-w-xs text-xs text-text-quaternary-500">
          Notification preferences and account deletion will live here.
        </p>
      </div>
    </div>
  );
}
