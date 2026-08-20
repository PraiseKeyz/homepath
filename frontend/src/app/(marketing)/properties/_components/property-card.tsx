import { Bath, Bed, Heart, MapPin, ShieldCheck } from "lucide-react";
import Link from "next/link";
import type { Property } from "@/lib/api";
import { formatPrice, getInitials } from "@/lib/format";
import { getScoreBand } from "@/lib/trust-score";

export function PropertyCard({
  property,
  isSaved,
  onSave,
}: {
  property: Property;
  isSaved: boolean;
  onSave: () => void;
}) {
  const image = property.imageUrl ?? null;
  const band = property.trustScore
    ? getScoreBand(property.trustScore.score)
    : null;

  return (
    <Link
      href={`/properties/${property.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border-secondary bg-background-bg-primary shadow-effects-shadows-shadow-xs transition-all hover:-translate-y-1 hover:shadow-effects-shadows-shadow-lg"
    >
      <div className="relative h-52 overflow-hidden bg-background-bg-secondary">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={property.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-text-quaternary-500">
            <MapPin className="h-8 w-8" />
          </div>
        )}

        <span
          className={`absolute top-3 left-3 rounded-full px-2.5 py-0.5 text-xs font-bold tracking-wide uppercase ${
            property.listingType === "RENT"
              ? "bg-utility-success-500 text-text-white"
              : "bg-button-primary-default text-text-primary-on-brand"
          }`}
        >
          {property.listingType === "RENT" ? "For Rent" : "For Sale"}
        </span>

        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            onSave();
          }}
          className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-background-bg-primary/90 shadow-effects-shadows-shadow-xs backdrop-blur-sm transition-transform hover:scale-110"
          aria-label={isSaved ? "Remove from saved" : "Save listing"}
        >
          <Heart
            className={`h-4 w-4 ${isSaved ? "fill-utility-error-500 text-utility-error-500" : "text-text-quaternary-500"}`}
          />
        </button>

        <div className="absolute bottom-3 left-3">
          <span className="rounded-lg bg-background-bg-overlay/70 px-2.5 py-1 text-sm font-bold text-text-white backdrop-blur-sm">
            {formatPrice(property.price, property.listingType)}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-1 text-[15px] font-semibold text-text-primary-900">
          {property.title}
        </h3>

        <div className="flex items-center gap-1 text-xs text-text-tertiary-600">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="line-clamp-1">{property.address}</span>
        </div>

        <div className="flex items-center gap-3 text-xs text-text-secondary-700">
          <span className="flex items-center gap-1">
            <Bed className="h-3.5 w-3.5 text-text-quaternary-500" />
            {property.bedrooms} bed{property.bedrooms !== 1 ? "s" : ""}
          </span>
          <span className="flex items-center gap-1">
            <Bath className="h-3.5 w-3.5 text-text-quaternary-500" />
            {Math.max(1, property.bedrooms - 1)} bath
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-border-tertiary pt-2">
          {band && property.trustScore ? (
            <span
              className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${band.badgeClass}`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              {property.trustScore.score}/100
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs font-medium text-text-quaternary-500">
              <ShieldCheck className="h-3.5 w-3.5" />
              Not yet checked
            </span>
          )}

          <span className="flex items-center gap-1.5 text-xs text-text-tertiary-600">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-background-bg-brand-primary text-[10px] font-bold text-text-brand-secondary-700">
              {getInitials(property.owner?.name ?? "LL")}
            </span>
            {property.owner?.name ?? "Landlord"}
          </span>
        </div>
      </div>
    </Link>
  );
}
