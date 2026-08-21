"use client";

import { Droplets, MapPinned, ShieldAlert, Zap } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ErrorState } from "@/components/error-state";
import {
  ApiError,
  fetchAllNeighbourhoods,
  type NeighbourhoodData,
} from "@/lib/api";
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
  { key: "powerScore" as const, label: "Power", icon: Zap, invert: false },
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

function AreaCard({ data }: { data: NeighbourhoodData }) {
  return (
    <div className="rounded-2xl border border-border-secondary bg-background-bg-primary p-6">
      <div className="flex items-center gap-2 text-text-brand-secondary-700">
        <MapPinned className="h-4 w-4" />
        <h3 className="text-base font-semibold text-text-primary-900">
          {formatAreaKey(data.areaKey)}
        </h3>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {METRICS.map(({ key, label, icon: Icon, invert }) => {
          const rawScore = data[key];
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

      <Link
        href="/properties"
        className="mt-4 inline-block text-xs font-semibold text-text-brand-secondary-700 hover:underline"
      >
        Browse properties →
      </Link>
    </div>
  );
}

export function NeighbourhoodsDirectory() {
  const [areas, setAreas] = useState<NeighbourhoodData[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setAreas(await fetchAllNeighbourhoods());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (error) {
    return <ErrorState onRetry={load} homeHref="/dashboard" />;
  }

  return (
    <div className="max-w-6xl">
      <h1 className="text-2xl font-bold text-text-primary-900">
        Neighbourhoods
      </h1>
      <p className="mt-1 text-sm text-text-tertiary-600">
        Flood risk, power reliability, and security for every area we track.
      </p>

      {areas === null ? (
        <p className="mt-10 text-sm text-text-tertiary-600">
          Loading neighbourhoods…
        </p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {areas.map((area) => (
            <AreaCard key={area.areaKey} data={area} />
          ))}
        </div>
      )}
    </div>
  );
}
