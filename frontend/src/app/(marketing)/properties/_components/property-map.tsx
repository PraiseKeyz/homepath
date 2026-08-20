"use client";

import "leaflet/dist/leaflet.css";

import Link from "next/link";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import type { Property } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { getScoreBand, UNCHECKED_MARKER_COLOR } from "@/lib/trust-score";

const LAGOS_CENTER: [number, number] = [6.5244, 3.3792];

function markerColor(property: Property) {
  return property.trustScore
    ? getScoreBand(property.trustScore.score).color
    : UNCHECKED_MARKER_COLOR;
}

export function PropertyMap({ properties }: { properties: Property[] }) {
  const center: [number, number] =
    properties.length > 0
      ? [
          properties.reduce((sum, p) => sum + p.lat, 0) / properties.length,
          properties.reduce((sum, p) => sum + p.lng, 0) / properties.length,
        ]
      : LAGOS_CENTER;

  return (
    <MapContainer
      center={center}
      zoom={12}
      scrollWheelZoom
      className="h-[560px] w-full rounded-2xl"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {properties.map((property) => (
        <CircleMarker
          key={property.id}
          center={[property.lat, property.lng]}
          radius={11}
          pathOptions={{
            color: "#ffffff",
            weight: 2,
            fillColor: markerColor(property),
            fillOpacity: 0.85,
          }}
        >
          <Popup>
            <div className="min-w-40">
              <p className="text-sm font-semibold text-text-primary-900">
                {property.title}
              </p>
              <p className="mt-0.5 text-xs text-text-tertiary-600">
                {property.address}
              </p>
              <p className="mt-1 text-sm font-bold text-text-primary-900">
                {formatPrice(property.price, property.listingType)}
              </p>
              <p className="mt-1 text-xs font-medium text-text-tertiary-600">
                {property.trustScore
                  ? `Trust score: ${property.trustScore.score}/100`
                  : "Not yet checked"}
              </p>
              <Link
                href={`/properties/${property.id}`}
                className="mt-2 inline-block text-xs font-semibold text-text-brand-secondary-700 hover:underline"
              >
                View listing →
              </Link>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
