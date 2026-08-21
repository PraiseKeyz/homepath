"use client";

import {
  ArrowRight,
  Handshake,
  Home,
  MapPin,
  PiggyBank,
  Plus,
  ShieldCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ErrorState } from "@/components/error-state";
import {
  ApiError,
  type Cooperative,
  type CooperativeMembership,
  fetchCooperatives,
  fetchMyMemberships,
  fetchProperties,
  fetchRentToOwnMatches,
  getSavedPropertyIds,
  type Property,
  type RentToOwnMatch,
} from "@/lib/api";
import { getToken } from "@/lib/auth";
import { formatPrice } from "@/lib/format";
import { getScoreBand } from "@/lib/trust-score";

const QUICK_ACTIONS = [
  {
    href: "/dashboard/verify-property",
    label: "Verify a Property",
    description: "Check records & reports",
    icon: ShieldCheck,
  },
  {
    href: "/properties",
    label: "Explore Properties",
    description: "Find a home",
    icon: Home,
  },
  {
    href: "/dashboard/cooperative",
    label: "Join a Cooperative",
    description: "Start saving",
    icon: Users,
  },
  {
    href: "/properties",
    label: "Post Property",
    description: "List your property",
    icon: Plus,
  },
];

const MONTH_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  month: "short",
  year: "numeric",
});
const DUE_DATE_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

interface OverviewData {
  memberships: CooperativeMembership[];
  cooperatives: Cooperative[];
  matches: RentToOwnMatch[];
  savedProperties: Property[];
}

export function DashboardOverview() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    setError(null);
    try {
      const [memberships, cooperatives, allProperties] = await Promise.all([
        fetchMyMemberships(token),
        fetchCooperatives(token),
        fetchProperties(),
      ]);
      const matchLists = await Promise.all(
        memberships.map((m) => fetchRentToOwnMatches(m.cooperativeId, token)),
      );
      const savedIds = getSavedPropertyIds();
      setData({
        memberships,
        cooperatives,
        matches: matchLists.flat(),
        savedProperties: allProperties.filter((p) => savedIds.includes(p.id)),
      });
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

  if (!data) {
    return (
      <p className="text-sm text-text-tertiary-600">Loading your dashboard…</p>
    );
  }

  const { memberships, matches, savedProperties } = data;
  const contributions = memberships.flatMap((m) =>
    m.contributions.map((c) => ({ ...c, cooperativeName: m.cooperative.name })),
  );
  const savingsBalance = contributions.reduce(
    (sum, c) => sum + Number(c.amount),
    0,
  );
  const now = new Date();
  const thisMonthTotal = contributions
    .filter((c) => {
      const d = new Date(c.month);
      return (
        d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
      );
    })
    .reduce((sum, c) => sum + Number(c.amount), 0);

  const primaryMembership = memberships[0] ?? null;
  const primaryCooperativeCount = primaryMembership
    ? data.cooperatives.find((c) => c.id === primaryMembership.cooperativeId)
        ?._count?.memberships
    : undefined;

  const acceptedMatch = matches.find((m) => m.status === "ACCEPTED") ?? null;
  const acceptedMembership = acceptedMatch
    ? (memberships.find(
        (m) => m.cooperativeId === acceptedMatch.cooperativeId,
      ) ?? null)
    : null;
  const rentToOwnPercent =
    acceptedMatch && acceptedMembership
      ? Math.min(
          100,
          Math.round(
            (savingsBalance / Number(acceptedMatch.property.price)) * 100,
          ),
        )
      : null;
  const lastContribution = [...contributions].sort((a, b) =>
    b.month.localeCompare(a.month),
  )[0];
  const nextDueDate = lastContribution
    ? new Date(
        new Date(lastContribution.month).setMonth(
          new Date(lastContribution.month).getMonth() + 1,
        ),
      )
    : null;

  const scoredSaved = savedProperties.filter((p) => p.trustScore);
  const avgSavedScore =
    scoredSaved.length > 0
      ? Math.round(
          scoredSaved.reduce((sum, p) => sum + (p.trustScore?.score ?? 0), 0) /
            scoredSaved.length,
        )
      : null;

  const recentActivity = [...contributions]
    .sort((a, b) => b.month.localeCompare(a.month))
    .slice(0, 4);

  return (
    <div className="max-w-6xl">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={ShieldCheck}
          label="Trust Score (Saved)"
          value={avgSavedScore !== null ? `${avgSavedScore}/100` : "—"}
          badge={
            avgSavedScore !== null
              ? getScoreBand(avgSavedScore).label
              : undefined
          }
          badgeClass={
            avgSavedScore !== null
              ? getScoreBand(avgSavedScore).badgeClass
              : undefined
          }
          footnote={
            scoredSaved.length > 0
              ? `Across ${scoredSaved.length} saved propert${scoredSaved.length === 1 ? "y" : "ies"}`
              : "Save a property to see its score here"
          }
        />

        <StatCard
          icon={PiggyBank}
          label="Savings Balance"
          value={`₦${savingsBalance.toLocaleString()}`}
          footnote={
            thisMonthTotal > 0
              ? `+₦${thisMonthTotal.toLocaleString()} this month`
              : "No contributions this month yet"
          }
        />

        <StatCard
          icon={Users}
          label="Cooperative"
          value={primaryMembership?.cooperative.name ?? "Not joined"}
          badge={primaryMembership ? "Active" : undefined}
          badgeClass={
            primaryMembership
              ? "bg-utility-success-50 text-utility-success-700"
              : undefined
          }
          footnote={
            primaryCooperativeCount !== undefined
              ? `${primaryCooperativeCount} member${primaryCooperativeCount === 1 ? "" : "s"}`
              : "Join one to start saving"
          }
        />

        <StatCard
          icon={Handshake}
          label="Rent-to-Own Progress"
          value={rentToOwnPercent !== null ? `${rentToOwnPercent}%` : "—"}
          footnote={
            acceptedMatch && acceptedMembership
              ? `₦${savingsBalance.toLocaleString()} / ${formatPrice(acceptedMatch.property.price, "SALE")}`
              : "No accepted match yet"
          }
          progress={rentToOwnPercent ?? undefined}
        />
      </div>

      <div className="mt-10">
        <h2 className="text-sm font-semibold tracking-wide text-text-quaternary-500 uppercase">
          Quick actions
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="flex items-center gap-3 rounded-2xl border border-border-secondary bg-background-bg-primary p-4 transition-colors hover:bg-background-bg-secondary-hover"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background-bg-brand-primary text-text-brand-secondary-700">
                <action.icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-text-primary-900">
                  {action.label}
                </p>
                <p className="truncate text-xs text-text-tertiary-600">
                  {action.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border-secondary bg-background-bg-primary p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-text-primary-900">
              Recent Activity
            </h2>
            <Link
              href="/dashboard/cooperative"
              className="text-xs font-semibold text-text-brand-secondary-700 hover:underline"
            >
              View all
            </Link>
          </div>

          {recentActivity.length === 0 ? (
            <p className="mt-6 text-sm text-text-tertiary-600">
              No activity yet — join a cooperative to start building a savings
              history.
            </p>
          ) : (
            <ul className="mt-4 space-y-4">
              {recentActivity.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-utility-success-50 text-utility-success-600">
                      <PiggyBank className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-text-primary-900">
                        Savings contribution
                      </p>
                      <p className="truncate text-xs text-text-tertiary-600">
                        {c.cooperativeName} ·{" "}
                        {MONTH_FORMATTER.format(new Date(c.month))}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-utility-success-600">
                    +₦{Number(c.amount).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-border-secondary bg-background-bg-primary p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-text-primary-900">
              Active Rent-to-Own Deal
            </h2>
            <Link
              href="/dashboard/cooperative"
              className="text-xs font-semibold text-text-brand-secondary-700 hover:underline"
            >
              View plan
            </Link>
          </div>

          {!acceptedMatch || !acceptedMembership ? (
            <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-border-strong py-10 text-center">
              <Handshake className="mb-2 h-8 w-8 text-text-quaternary-500" />
              <p className="text-sm text-text-tertiary-600">
                No accepted rent-to-own match yet.
              </p>
              <Link
                href="/dashboard/cooperative"
                className="mt-3 flex items-center gap-1 text-xs font-semibold text-text-brand-secondary-700 hover:underline"
              >
                View cooperative matches <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          ) : (
            <div className="mt-4">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-background-bg-secondary">
                  {acceptedMatch.property.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={acceptedMatch.property.imageUrl}
                      alt={acceptedMatch.property.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <MapPin className="h-5 w-5 text-text-quaternary-500" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-text-primary-900">
                    {acceptedMatch.property.title}
                  </p>
                  <p className="truncate text-xs text-text-tertiary-600">
                    {acceptedMatch.property.address}
                  </p>
                  <p className="text-sm font-semibold text-text-primary-900">
                    {formatPrice(acceptedMatch.property.price, "SALE")}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-text-tertiary-600">
                  <span>{rentToOwnPercent}% complete</span>
                  <span>
                    ₦{savingsBalance.toLocaleString()} /{" "}
                    {formatPrice(acceptedMatch.property.price, "SALE")}
                  </span>
                </div>
                <div className="mt-1.5 h-2 w-full rounded-full bg-background-bg-secondary">
                  <div
                    className="h-2 rounded-full bg-button-primary-default"
                    style={{ width: `${rentToOwnPercent ?? 0}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-border-secondary pt-4 text-sm">
                <div>
                  <p className="text-xs text-text-quaternary-500">
                    Next Payment
                  </p>
                  <p className="font-semibold text-text-primary-900">
                    ₦
                    {Number(
                      acceptedMembership.monthlyContributionAmount,
                    ).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-text-quaternary-500">
                    Est. Due Date
                  </p>
                  <p className="font-semibold text-text-primary-900">
                    {nextDueDate ? DUE_DATE_FORMATTER.format(nextDueDate) : "—"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  badge,
  badgeClass,
  footnote,
  progress,
}: {
  icon: typeof ShieldCheck;
  label: string;
  value: string;
  badge?: string;
  badgeClass?: string;
  footnote: string;
  progress?: number;
}) {
  return (
    <div className="rounded-2xl border border-border-secondary bg-background-bg-primary p-5">
      <div className="flex items-center gap-2 text-text-quaternary-500">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-semibold tracking-wide uppercase">
          {label}
        </span>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <span className="truncate text-2xl font-bold text-text-primary-900">
          {value}
        </span>
        {badge && (
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${badgeClass}`}
          >
            {badge}
          </span>
        )}
      </div>
      <p className="mt-1 truncate text-xs text-text-tertiary-600">{footnote}</p>
      {progress !== undefined && (
        <div className="mt-3 h-1.5 w-full rounded-full bg-background-bg-secondary">
          <div
            className="h-1.5 rounded-full bg-button-primary-default"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
