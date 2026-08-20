"use client";

import {
  Bath,
  Bed,
  BookmarkCheck,
  Heart,
  Home,
  MapPin,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { ErrorState } from "@/components/error-state";
import {
  ApiError,
  computeTrustScore,
  fetchLandlordProfile,
  fetchProperty,
  getSavedPropertyIds,
  type LandlordProfile,
  type PropertyDetail,
  type TrustScore,
  toggleSavedProperty,
} from "@/lib/api";
import { formatAreaKey, formatPrice } from "@/lib/format";
import { getScoreBand } from "@/lib/trust-score";
import { LandlordCard } from "./landlord-card";
import { NeighbourhoodCard } from "./neighbourhood-card";
import { PropertyGallery } from "./property-gallery";

export function PropertyDetailView({ propertyId }: { propertyId: string }) {
  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [trustScore, setTrustScore] = useState<TrustScore | null>(null);
  const [landlord, setLandlord] = useState<LandlordProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    setSavedIds(getSavedPropertyIds());

    fetchProperty(propertyId)
      .then(async (p) => {
        setProperty(p);
        setTrustScore(p.trustScore ?? null);

        // Recompute on every view so the score reflects the latest registry/
        // community data — see docs/ARCHITECTURE.md §2.1. Only possible once a
        // document has been self-attested for this property.
        if (p.document) {
          computeTrustScore(propertyId)
            .then(setTrustScore)
            .catch(() => {});
        }

        if (p.ownerId) {
          fetchLandlordProfile(p.ownerId)
            .then(setLandlord)
            .catch(() => {});
        }
      })
      .catch((err) => {
        if (err instanceof ApiError && err.statusCode === 404) {
          setNotFound(true);
        } else {
          setError(
            err instanceof ApiError ? err.message : "Something went wrong.",
          );
        }
      })
      .finally(() => setLoading(false));
  }, [propertyId]);

  function handleSave() {
    if (!property) return;
    toggleSavedProperty(property.id);
    setSavedIds(getSavedPropertyIds());
  }

  if (loading) {
    return (
      <p className="mx-auto max-w-4xl px-6 py-16 text-sm text-text-tertiary-600">
        Loading property…
      </p>
    );
  }

  if (notFound) {
    return (
      <ErrorState
        title="Property not found"
        description="This listing may have been removed."
        homeHref="/properties"
      />
    );
  }

  if (error || !property) {
    return (
      <ErrorState
        onRetry={() => window.location.reload()}
        homeHref="/properties"
      />
    );
  }

  const images = property.galleryImages?.length
    ? property.galleryImages
    : property.imageUrl
      ? [property.imageUrl]
      : [];
  const isSaved = savedIds.includes(property.id);
  const band = trustScore ? getScoreBand(trustScore.score) : null;
  const bathrooms = Math.max(1, property.bedrooms - 1);
  const monthlyPrice = Math.round(Number(property.price) / 12);

  return (
    <div>
      {images.length > 0 && (
        <PropertyGallery images={images} title={property.title} />
      )}

      <div className="mx-auto max-w-6xl px-4 py-10 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_380px]">
          {/* ── Left column ─────────────────────────────────────────── */}
          <div className="space-y-10">
            <div className="border-b border-border-secondary pb-8">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold tracking-widest uppercase ${
                    property.listingType === "RENT"
                      ? "bg-utility-success-500 text-text-white"
                      : "bg-button-primary-default text-text-primary-on-brand"
                  }`}
                >
                  {property.listingType === "RENT" ? "For rent" : "For sale"}
                </span>
                {property.status === "AVAILABLE" && (
                  <span className="rounded-full bg-utility-success-50 px-3 py-1 text-xs font-medium text-utility-success-700">
                    Available now
                  </span>
                )}
              </div>

              <h1 className="mt-4 text-4xl font-bold text-text-primary-900">
                {property.title}
              </h1>

              <div className="mt-3 flex items-center gap-1.5 text-base text-text-tertiary-600">
                <MapPin className="h-4 w-4 shrink-0" />
                {property.address}
              </div>

              <div className="mt-5 flex flex-wrap gap-2.5">
                {[
                  {
                    Icon: Bed,
                    label: `${property.bedrooms} bed${property.bedrooms > 1 ? "s" : ""}`,
                  },
                  {
                    Icon: Bath,
                    label: `${bathrooms} bath${bathrooms > 1 ? "s" : ""}`,
                  },
                  { Icon: Home, label: formatAreaKey(property.areaKey) },
                ].map(({ Icon, label }) => (
                  <span
                    key={label}
                    className="flex items-center gap-2 rounded-full bg-background-bg-secondary px-4 py-2 text-sm font-semibold text-text-secondary-700"
                  >
                    <Icon className="h-4 w-4 text-text-quaternary-500" />
                    {label}
                  </span>
                ))}
              </div>
            </div>

            <div className="border-b border-border-secondary pb-8">
              <h2 className="mb-4 text-xl font-bold text-text-primary-900">
                About this home
              </h2>
              <p className="text-[15px] leading-8 text-text-tertiary-600">
                {property.description ??
                  "No description provided by the landlord yet."}
              </p>
            </div>

            <div className="border-b border-border-secondary pb-8">
              <h2 className="mb-5 flex items-center gap-2 text-xl font-bold text-text-primary-900">
                <ShieldCheck className="h-5 w-5 text-text-brand-secondary-700" />
                Trust Score
              </h2>

              {!property.document ? (
                <p className="text-sm text-text-tertiary-600">
                  No document has been submitted for this property yet, so it
                  hasn&apos;t been checked.
                </p>
              ) : trustScore ? (
                <>
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-5xl font-bold text-text-primary-900">
                        {trustScore.score}
                      </span>
                      <span className="text-lg text-text-quaternary-500">
                        /100
                      </span>
                    </div>
                    {band && (
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${band.badgeClass}`}
                      >
                        {band.label}
                      </span>
                    )}
                  </div>
                  <p className="mt-4 rounded-lg bg-background-bg-secondary p-4 text-sm text-text-tertiary-600">
                    {trustScore.explanationText}
                  </p>
                </>
              ) : (
                <p className="text-sm text-text-tertiary-600">
                  Unable to check this property right now.
                </p>
              )}
            </div>

            {property.communityReports.length > 0 && (
              <div className="border-b border-border-secondary pb-8">
                <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-text-primary-900">
                  <Users className="h-5 w-5 text-text-tertiary-600" />
                  Community reports ({property.communityReports.length})
                </h2>
                <ul className="space-y-3">
                  {property.communityReports.map((report) => (
                    <li
                      key={report.id}
                      className="text-sm text-text-secondary-700"
                    >
                      <span className="font-semibold capitalize">
                        {report.type.replace("_", " ").toLowerCase()}
                      </span>
                      {report.description && <>: {report.description}</>}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <NeighbourhoodCard areaKey={property.areaKey} />

            <div>
              <h2 className="mb-5 text-xl font-bold text-text-primary-900">
                Meet your landlord
              </h2>
              <LandlordCard
                landlord={landlord}
                ownerName={property.owner?.name}
                ownerRole={property.owner?.role}
              />
            </div>
          </div>

          {/* ── Right sticky column ─────────────────────────────────── */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="overflow-hidden rounded-3xl border border-border-secondary bg-background-bg-primary shadow-effects-shadows-shadow-xl">
              <div className="bg-background-bg-brand-section p-6 text-text-primary-on-brand">
                <p className="text-sm font-medium text-text-tertiary-on-brand">
                  {property.listingType === "RENT"
                    ? "Annual rent"
                    : "Sale price"}
                </p>
                <p className="mt-1 text-4xl font-black tracking-tight">
                  {formatPrice(property.price, property.listingType)}
                </p>
                {property.listingType === "RENT" && (
                  <p className="mt-1 text-sm text-text-tertiary-on-brand">
                    ≈ ₦{monthlyPrice.toLocaleString()} / month
                  </p>
                )}
              </div>

              <div className="space-y-3 p-6">
                <div className="grid grid-cols-3 gap-2 rounded-2xl bg-background-bg-secondary p-3 text-center text-xs">
                  <div>
                    <p className="text-base font-bold text-text-primary-900">
                      {property.bedrooms}
                    </p>
                    <p className="text-text-quaternary-500">Beds</p>
                  </div>
                  <div className="border-x border-border-secondary">
                    <p className="text-base font-bold text-text-primary-900">
                      {bathrooms}
                    </p>
                    <p className="text-text-quaternary-500">Baths</p>
                  </div>
                  <div>
                    <p className="text-base font-bold text-utility-success-600">
                      {property.status === "AVAILABLE" ? "Open" : "Taken"}
                    </p>
                    <p className="text-text-quaternary-500">Status</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSave}
                  className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold transition-colors ${
                    isSaved
                      ? "bg-background-bg-error-primary text-utility-error-600 ring-1 ring-border-error"
                      : "bg-button-primary-default text-text-primary-on-brand hover:bg-button-primary-hover"
                  }`}
                >
                  {isSaved ? (
                    <>
                      <BookmarkCheck className="h-5 w-5" /> Saved
                    </>
                  ) : (
                    <>
                      <Heart className="h-5 w-5" /> Save
                    </>
                  )}
                </button>

                {property.document && (
                  <div className="space-y-2 rounded-2xl border border-border-secondary bg-background-bg-secondary p-4">
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-text-tertiary-600">
                      <ShieldCheck className="h-3.5 w-3.5 text-utility-success-500" />
                      Self-attested document on file
                    </p>
                    {[
                      ["Type", property.document.documentType],
                      ["Plot no.", property.document.plotNumber],
                      ["Survey", property.document.surveyNumber],
                      ["Owner", property.document.attestedOwnerName],
                    ].map(([k, v]) => (
                      <div
                        key={k}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="text-text-quaternary-500">{k}</span>
                        <span className="font-semibold text-text-secondary-700">
                          {v}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-center text-xs text-text-quaternary-500">
                  Contact the landlord through HomePath for a viewing
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
