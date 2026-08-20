"use client";

import { Mail, Phone, ShieldCheck, User as UserIcon } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError, type User, updateProfile } from "@/lib/api";
import { getStoredUser, getToken, updateStoredUser } from "@/lib/auth";
import { getInitials } from "@/lib/format";

const ROLE_LABELS: Record<User["role"], string> = {
  BUYER_RENTER: "Buyer / Renter",
  LANDLORD: "Landlord",
  DEVELOPER: "Developer",
  AGENT: "Agent",
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const stored = getStoredUser();
    setUser(stored);
    if (stored) {
      setName(stored.name);
      setPhone(stored.phone ?? "");
    }
  }, []);

  function startEditing() {
    if (!user) return;
    setName(user.name);
    setPhone(user.phone ?? "");
    setError(null);
    setEditing(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const token = getToken();
    if (!token || !user) return;
    setError(null);
    setSaving(true);
    try {
      const updated = await updateProfile(user.id, token, {
        name,
        phone: phone || undefined,
      });
      updateStoredUser(updated);
      setUser(updated);
      setEditing(false);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not update profile.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (!user) return null;

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-text-primary-900">Profile</h1>
      <p className="mt-1 text-sm text-text-tertiary-600">
        Your HomePath account details.
      </p>

      <div className="mt-8 rounded-2xl border border-border-secondary bg-background-bg-primary p-6">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-button-primary-default text-xl font-black text-button-primary-fg">
            {getInitials(user.name)}
          </span>
          <div>
            <p className="text-lg font-semibold text-text-primary-900">
              {user.name}
            </p>
            <span className="inline-flex items-center gap-1 rounded-full bg-background-bg-brand-primary px-2.5 py-0.5 text-xs font-semibold text-text-brand-secondary-700">
              <ShieldCheck className="h-3 w-3" />
              {ROLE_LABELS[user.role]}
            </span>
          </div>
        </div>

        {editing ? (
          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-4 border-t border-border-secondary pt-6"
          >
            <div className="space-y-1.5">
              <Label htmlFor="profile-name">Name</Label>
              <Input
                id="profile-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="profile-phone">Phone</Label>
              <Input
                id="profile-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="080…"
              />
            </div>
            {error && (
              <p className="text-sm text-text-error-primary-600">{error}</p>
            )}
            <div className="flex gap-3">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setEditing(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <>
            <div className="mt-6 space-y-3 border-t border-border-secondary pt-6">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-text-quaternary-500" />
                <span className="text-text-secondary-700">{user.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-text-quaternary-500" />
                <span className="text-text-secondary-700">
                  {user.phone ?? "No phone on file"}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <UserIcon className="h-4 w-4 text-text-quaternary-500" />
                <span className="text-text-secondary-700">
                  Member since {new Date(user.createdAt).getFullYear()}
                </span>
              </div>
            </div>

            <Button
              variant="secondary"
              className="mt-6 w-full"
              onClick={startEditing}
            >
              Edit profile
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
