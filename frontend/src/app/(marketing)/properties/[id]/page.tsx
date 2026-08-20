import { MapPin, ShieldCheck, Users } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ApiError, computeTrustScore, fetchProperty } from "@/lib/api";
import { getScoreBand } from "@/lib/trust-score";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const property = await fetchProperty(id);
    return { title: property.title };
  } catch {
    return { title: "Property" };
  }
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let property: Awaited<ReturnType<typeof fetchProperty>>;
  try {
    property = await fetchProperty(id);
  } catch (err) {
    if (err instanceof ApiError && err.statusCode === 404) notFound();
    throw err;
  }

  // Recompute on every view so the score reflects the latest registry/community
  // data — cheap, deterministic, see docs/ARCHITECTURE.md §2.1. Only possible
  // once a document has been self-attested for this property.
  let trustScore = property.trustScore ?? null;
  if (property.document) {
    try {
      trustScore = await computeTrustScore(id);
    } catch {
      // fall back to whatever was already on the property, if anything
    }
  }

  const band = trustScore ? getScoreBand(trustScore.score) : null;
  const price = Number(property.price);

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="flex items-center gap-1.5 text-sm text-text-tertiary-600">
        <MapPin className="h-4 w-4" />
        {property.address}
      </div>

      <h1 className="mt-2 text-3xl font-bold text-text-primary-900">
        {property.title}
      </h1>

      <div className="mt-2 text-lg font-semibold text-text-primary-900">
        ₦{price.toLocaleString()}
        {property.listingType === "RENT" ? "/month" : ""}
        <span className="ml-2 text-sm font-normal text-text-tertiary-600">
          {property.bedrooms} bedroom{property.bedrooms === 1 ? "" : "s"} ·{" "}
          {property.listingType === "RENT" ? "For rent" : "For sale"}
        </span>
      </div>

      <div className="mt-10 rounded-2xl border border-border-secondary bg-background-bg-primary p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-text-primary-900">
          <ShieldCheck className="h-4 w-4 text-text-brand-secondary-700" />
          Trust Score
        </h2>

        {!property.document ? (
          <p className="mt-3 text-sm text-text-tertiary-600">
            No document has been submitted for this property yet, so it
            hasn&apos;t been checked.
          </p>
        ) : trustScore ? (
          <>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <span className="text-5xl font-bold text-text-primary-900">
                  {trustScore.score}
                </span>
                <span className="text-lg text-text-quaternary-500">/100</span>
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
          <p className="mt-3 text-sm text-text-tertiary-600">
            Unable to check this property right now.
          </p>
        )}
      </div>

      {property.communityReports.length > 0 && (
        <div className="mt-6 rounded-2xl border border-border-secondary bg-background-bg-primary p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-text-primary-900">
            <Users className="h-4 w-4 text-text-tertiary-600" />
            Community reports ({property.communityReports.length})
          </h2>
          <ul className="mt-4 space-y-3">
            {property.communityReports.map((report) => (
              <li key={report.id} className="text-sm text-text-secondary-700">
                <span className="font-semibold capitalize">
                  {report.type.replace("_", " ").toLowerCase()}
                </span>
                {report.description && <>: {report.description}</>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
