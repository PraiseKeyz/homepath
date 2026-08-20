"use client";

import {
  BookmarkCheck,
  Home,
  List,
  Map as MapIcon,
  Search,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ErrorState } from "@/components/error-state";
import { Select } from "@/components/ui/select";
import {
  ApiError,
  fetchProperties,
  getSavedPropertyIds,
  type Property,
  toggleSavedProperty,
} from "@/lib/api";
import { getStoredUser } from "@/lib/auth";
import { AddListingDialog } from "./add-listing-dialog";
import { PropertyCard } from "./property-card";

const PropertyMap = dynamic(
  () => import("./property-map").then((mod) => mod.PropertyMap),
  {
    ssr: false,
    loading: () => (
      <div className="mt-10 flex h-[560px] items-center justify-center rounded-2xl border border-border-secondary bg-background-bg-secondary text-sm text-text-tertiary-600">
        Loading map…
      </div>
    ),
  },
);

export function PropertyBrowser() {
  const [properties, setProperties] = useState<Property[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [canCreate, setCanCreate] = useState(false);

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "RENT" | "SALE">("ALL");
  const [filterBeds, setFilterBeds] = useState<string>("ALL");
  const [showSaved, setShowSaved] = useState(false);
  const [view, setView] = useState<"list" | "map">("list");

  const load = useCallback(async () => {
    setError(null);
    try {
      setProperties(await fetchProperties());
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not load listings.",
      );
    }
  }, []);

  useEffect(() => {
    const user = getStoredUser();
    setCanCreate(
      user?.role === "LANDLORD" ||
        user?.role === "DEVELOPER" ||
        user?.role === "AGENT",
    );
    setSavedIds(getSavedPropertyIds());
    load();
  }, [load]);

  function handleSave(id: string) {
    toggleSavedProperty(id);
    setSavedIds(getSavedPropertyIds());
  }

  const filtered = useMemo(() => {
    let list = properties ?? [];
    if (showSaved) list = list.filter((p) => savedIds.includes(p.id));
    if (filterType !== "ALL")
      list = list.filter((p) => p.listingType === filterType);
    if (filterBeds !== "ALL")
      list = list.filter((p) => String(p.bedrooms) === filterBeds);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q) ||
          p.areaKey.toLowerCase().includes(q),
      );
    }
    return list;
  }, [properties, filterType, filterBeds, search, showSaved, savedIds]);

  if (error) {
    return <ErrorState onRetry={load} homeHref="/" />;
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary-900">
            Properties
          </h1>
          <p className="mt-2 text-text-tertiary-600">
            Every listing here can be checked against real records and community
            reports before you pursue it.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {savedIds.length > 0 && (
            <button
              type="button"
              onClick={() => setShowSaved((v) => !v)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                showSaved
                  ? "bg-button-primary-default text-text-primary-on-brand"
                  : "bg-background-bg-secondary text-text-secondary-700 hover:bg-background-bg-secondary-hover"
              }`}
            >
              <BookmarkCheck className="h-4 w-4" />
              Saved ({savedIds.length})
            </button>
          )}
          {canCreate && <AddListingDialog onCreated={load} />}
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-text-quaternary-500" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title, address, or area…"
            className="h-10 w-full rounded-lg border border-border-primary bg-background-bg-primary py-2 pr-4 pl-9 text-sm text-text-primary-900 placeholder:text-text-placeholder focus-visible:ring-2 focus-visible:ring-effects-focus-rings-focus-ring focus-visible:outline-none"
          />
        </div>

        <div className="flex overflow-hidden rounded-lg border border-border-primary">
          {(["ALL", "RENT", "SALE"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                filterType === type
                  ? "bg-button-primary-default text-text-primary-on-brand"
                  : "bg-background-bg-primary text-text-secondary-700 hover:bg-background-bg-secondary-hover"
              }`}
            >
              {type === "ALL" ? "All" : type === "RENT" ? "Rent" : "Buy"}
            </button>
          ))}
        </div>

        <Select
          value={filterBeds}
          onChange={(event) => setFilterBeds(event.target.value)}
          className="w-36"
        >
          <option value="ALL">Any bedrooms</option>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={String(n)}>
              {n} bed{n > 1 ? "s" : ""}
            </option>
          ))}
        </Select>

        <div className="ml-auto flex overflow-hidden rounded-lg border border-border-primary">
          {(
            [
              { key: "list", label: "List", Icon: List },
              { key: "map", label: "Map", Icon: MapIcon },
            ] as const
          ).map(({ key, label, Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setView(key)}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors ${
                view === key
                  ? "bg-button-primary-default text-text-primary-on-brand"
                  : "bg-background-bg-primary text-text-secondary-700 hover:bg-background-bg-secondary-hover"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {properties === null ? (
        <p className="mt-10 text-sm text-text-tertiary-600">
          Loading properties…
        </p>
      ) : filtered.length === 0 ? (
        <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-strong py-24 text-center">
          <Home className="mb-3 h-10 w-10 text-text-quaternary-500" />
          <p className="text-sm font-medium text-text-tertiary-600">
            No listings found
          </p>
          <p className="mt-1 text-xs text-text-quaternary-500">
            Try adjusting your search or filters
          </p>
        </div>
      ) : view === "map" ? (
        <div className="mt-10">
          <PropertyMap properties={filtered} />
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-text-tertiary-600">
            <span className="font-semibold text-text-secondary-700">
              Trust Score:
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-utility-success-500" />
              Likely legitimate (70+)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-utility-warning-500" />
              Unverified (40–69)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-utility-error-500" />
              High risk (&lt;40)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-text-quaternary-500" />
              Not yet checked
            </span>
          </div>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              isSaved={savedIds.includes(property.id)}
              onSave={() => handleSave(property.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
