"use client";

import { Mail, Phone, ShieldCheck, User as UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { User } from "@/lib/api";
import { getStoredUser } from "@/lib/auth";
import { getInitials } from "@/lib/format";

const ROLE_LABELS: Record<User["role"], string> = {
  BUYER_RENTER: "Buyer / Renter",
  LANDLORD: "Landlord",
  DEVELOPER: "Developer",
  AGENT: "Agent",
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

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

        <Button variant="secondary" disabled className="mt-6 w-full">
          Edit profile — coming soon
        </Button>
      </div>
    </div>
  );
}
