"use client";

import { Building2, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { ApiError, type DemandCluster, fetchDemandClusters } from "@/lib/api";
import { getStoredUser, getToken } from "@/lib/auth";

export function BuildMatchDashboard() {
  const [clusters, setClusters] = useState<DemandCluster[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    const user = getStoredUser();
    const token = getToken();
    if (!user || !token) return;

    if (user.role !== "DEVELOPER") {
      setAllowed(false);
      return;
    }
    setAllowed(true);

    fetchDemandClusters(token)
      .then(setClusters)
      .catch((err) =>
        setError(
          err instanceof ApiError ? err.message : "Something went wrong.",
        ),
      );
  }, []);

  if (allowed === false) {
    return (
      <p className="max-w-md rounded-2xl border border-border-secondary bg-background-bg-primary p-6 text-sm text-text-tertiary-600">
        BuildMatch is only available to developer accounts. Register with the
        developer role to see verified demand clusters.
      </p>
    );
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-text-primary-900">BuildMatch</h1>
      <p className="mt-1 text-sm text-text-tertiary-600">
        Verified, committed demand from cooperative savings groups — not a
        survey estimate.
      </p>

      {error && (
        <p className="mt-6 text-sm text-text-error-primary-600">{error}</p>
      )}

      {clusters && (
        <div className="mt-8 space-y-4">
          {clusters.length === 0 ? (
            <p className="text-sm text-text-tertiary-600">
              No cooperative demand yet.
            </p>
          ) : (
            clusters.map((cluster) => (
              <div
                key={cluster.cooperativeId}
                className="rounded-2xl border border-border-secondary bg-background-bg-primary p-6"
              >
                <div className="flex items-center gap-2 text-text-brand-secondary-700">
                  <Building2 className="h-4 w-4" />
                  <span className="text-xs font-semibold tracking-wide uppercase">
                    {cluster.targetAreaKey.replace("-", " ")}
                  </span>
                </div>
                <p className="mt-2 text-lg font-semibold text-text-primary-900">
                  In {cluster.targetAreaKey.replace("-", " ")},{" "}
                  {cluster.memberCount} cooperative member
                  {cluster.memberCount === 1 ? "" : "s"} are saving ₦
                  {cluster.totalMonthlySavings.toLocaleString()}/month toward a{" "}
                  {cluster.targetPropertyType}.
                </p>
                <div className="mt-4 flex items-center gap-6 border-t border-border-secondary pt-4 text-sm text-text-secondary-700">
                  <span className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-text-quaternary-500" />
                    {cluster.memberCount} member
                    {cluster.memberCount === 1 ? "" : "s"}
                  </span>
                  <span>{cluster.name}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
