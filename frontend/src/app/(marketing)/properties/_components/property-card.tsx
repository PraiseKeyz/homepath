import { MapPin } from "lucide-react";
import Link from "next/link";
import type { Property } from "@/lib/api";
import { getScoreBand } from "@/lib/trust-score";

export function PropertyCard({ property }: { property: Property }) {
  const band = property.trustScore
    ? getScoreBand(property.trustScore.score)
    : null;
  const price = Number(property.price);

  return (
    <Link
      href={`/properties/${property.id}`}
      className="block rounded-2xl border border-border-secondary bg-background-bg-primary p-5 transition-colors hover:border-border-brand"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-text-primary-900">
            {property.title}
          </h3>
          <div className="mt-1 flex items-center gap-1.5 text-sm text-text-tertiary-600">
            <MapPin className="h-3.5 w-3.5" />
            {property.address}
          </div>
        </div>

        {band && property.trustScore ? (
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${band.badgeClass}`}
          >
            {property.trustScore.score}/100
          </span>
        ) : (
          <span className="shrink-0 rounded-full bg-background-bg-secondary px-2.5 py-1 text-xs font-semibold text-text-quaternary-500">
            Not yet checked
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-text-secondary-700">
        <span>
          {property.bedrooms} bed ·{" "}
          {property.listingType === "RENT" ? "Rent" : "Sale"}
        </span>
        <span className="font-semibold text-text-primary-900">
          ₦{price.toLocaleString()}
          {property.listingType === "RENT" ? "/mo" : ""}
        </span>
      </div>
    </Link>
  );
}
