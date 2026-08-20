"use client";

import { useCallback, useEffect, useState } from "react";
import { ErrorState } from "@/components/error-state";
import {
  ApiError,
  type Cooperative,
  type CooperativeMembership,
  fetchCooperatives,
  fetchMyMemberships,
} from "@/lib/api";
import { getToken } from "@/lib/auth";
import { JoinCooperativeDialog } from "./join-cooperative-dialog";
import { MembershipCard } from "./membership-card";
import { RentToOwnMatches } from "./rent-to-own-matches";

export function CooperativeDashboard() {
  const [memberships, setMemberships] = useState<
    CooperativeMembership[] | null
  >(null);
  const [cooperatives, setCooperatives] = useState<Cooperative[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    setError(null);
    try {
      const [myMemberships, allCooperatives] = await Promise.all([
        fetchMyMemberships(token),
        fetchCooperatives(token),
      ]);
      setMemberships(myMemberships);
      setCooperatives(allCooperatives);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (error) {
    return <ErrorState onRetry={load} homeHref="/dashboard/cooperative" />;
  }

  if (!memberships || !cooperatives) {
    return (
      <p className="text-sm text-text-tertiary-600">Loading your savings…</p>
    );
  }

  const joinedIds = new Set(memberships.map((m) => m.cooperativeId));
  const joinable = cooperatives.filter((c) => !joinedIds.has(c.id));

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-text-primary-900">
        Cooperative Savings
      </h1>
      <p className="mt-1 text-sm text-text-tertiary-600">
        Save toward a rent-to-own home, the way Ajo/Esusu already works — just
        tracked digitally.
      </p>

      {memberships.length > 0 ? (
        <div className="mt-8 space-y-4">
          {memberships.map((membership) => (
            <MembershipCard key={membership.id} membership={membership} />
          ))}
        </div>
      ) : (
        <p className="mt-8 rounded-2xl border border-dashed border-border-strong bg-background-bg-primary p-6 text-sm text-text-tertiary-600">
          You haven&apos;t joined a cooperative yet — pick one below to start
          saving.
        </p>
      )}

      <RentToOwnMatches
        cooperativeIds={memberships.map((m) => m.cooperativeId)}
      />

      {joinable.length > 0 && (
        <div className="mt-10">
          <h2 className="text-sm font-semibold tracking-wide text-text-tertiary-600 uppercase">
            {memberships.length > 0
              ? "Other cooperatives"
              : "Cooperatives you can join"}
          </h2>
          <div className="mt-4 space-y-3">
            {joinable.map((cooperative) => (
              <div
                key={cooperative.id}
                className="flex items-center justify-between rounded-2xl border border-border-secondary bg-background-bg-primary p-5"
              >
                <div>
                  <h3 className="font-semibold text-text-primary-900">
                    {cooperative.name}
                  </h3>
                  <p className="mt-1 text-sm text-text-tertiary-600">
                    {cooperative.targetPropertyType} in{" "}
                    {cooperative.targetAreaKey.replace("-", " ")} &middot;{" "}
                    {cooperative._count?.memberships ?? 0} member
                    {cooperative._count?.memberships === 1 ? "" : "s"}
                  </p>
                </div>
                <JoinCooperativeDialog
                  cooperative={cooperative}
                  onJoined={load}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
