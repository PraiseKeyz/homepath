"use client";

import { Droplets, ShieldAlert, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchNeighbourhood, type NeighbourhoodData } from "@/lib/api";
import { formatAreaKey } from "@/lib/format";

function scoreLabel(score: number) {
  if (score >= 70) return "Good";
  if (score >= 40) return "Fair";
  return "Poor";
}

function scoreColorClass(score: number) {
  if (score >= 70) return "bg-utility-success-500";
  if (score >= 40) return "bg-utility-warning-500";
  return "bg-utility-error-500";
}

const METRICS = [
  {
    key: "powerScore" as const,
    label: "Power supply",
    icon: Zap,
    invert: false,
  },
  {
    key: "securityScore" as const,
    label: "Security",
    icon: ShieldAlert,
    invert: false,
  },
  {
    key: "floodRiskScore" as const,
    label: "Flood risk",
    icon: Droplets,
    invert: true,
  },
];

export function NeighbourhoodCard({ areaKey }: { areaKey: string }) {
  const [data, setData] = useState<NeighbourhoodData | null | undefined>(
    undefined,
  );

  useEffect(() => {
    fetchNeighbourhood(areaKey)
      .then(setData)
      .catch(() => setData(null));
  }, [areaKey]);

  if (data === undefined) return null;

  return (
    <div className="rounded-2xl border border-border-secondary bg-background-bg-primary p-6">
      <h2 className="text-lg font-semibold text-text-primary-900">
        Neighbourhood Intelligence — {formatAreaKey(areaKey)}
      </h2>

      {data === null ? (
        <p className="mt-3 text-sm text-text-tertiary-600">
          No neighbourhood data for this area yet.
        </p>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {METRICS.map(({ key, label, icon: Icon, invert }) => {
              const rawScore = data[key];
              // Flood risk is a "risk" score — invert for display so higher bar = better.
              const displayScore = invert ? 100 - rawScore : rawScore;
              return (
                <div
                  key={key}
                  className="rounded-xl bg-background-bg-secondary p-3 text-center"
                >
                  <Icon className="mx-auto h-4 w-4 text-text-tertiary-600" />
                  <p className="mt-1 text-xs font-medium text-text-tertiary-600">
                    {label}
                  </p>
                  <p className="mt-1 text-sm font-bold text-text-primary-900">
                    {scoreLabel(displayScore)}
                  </p>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-background-bg-tertiary">
                    <div
                      className={`h-1.5 rounded-full ${scoreColorClass(displayScore)}`}
                      style={{ width: `${displayScore}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-xs text-text-quaternary-500">
            Seeded demo data standing in for live flood/power/security sources —
            see docs/ARCHITECTURE.md §5.
          </p>
        </>
      )}
    </div>
  );
}
