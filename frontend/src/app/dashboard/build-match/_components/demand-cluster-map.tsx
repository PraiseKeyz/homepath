"use client";

import "leaflet/dist/leaflet.css";

import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import type { DemandCluster, Property } from "@/lib/api";
import { formatAreaKey } from "@/lib/format";

const LAGOS_CENTER: [number, number] = [6.5244, 3.3792];
const BRAND_COLOR = "#5b21b6";

function areaCentroid(
  areaKey: string,
  properties: Property[],
): [number, number] | null {
  const inArea = properties.filter((p) => p.areaKey === areaKey);
  if (inArea.length === 0) return null;
  return [
    inArea.reduce((sum, p) => sum + p.lat, 0) / inArea.length,
    inArea.reduce((sum, p) => sum + p.lng, 0) / inArea.length,
  ];
}

export function DemandClusterMap({
  clusters,
  properties,
}: {
  clusters: DemandCluster[];
  properties: Property[];
}) {
  const maxSavings = Math.max(...clusters.map((c) => c.totalMonthlySavings), 1);
  const points = clusters
    .map((cluster) => ({
      cluster,
      center: areaCentroid(cluster.targetAreaKey, properties),
    }))
    .filter(
      (p): p is { cluster: DemandCluster; center: [number, number] } =>
        p.center !== null,
    );

  const center: [number, number] =
    points.length > 0
      ? [
          points.reduce((sum, p) => sum + p.center[0], 0) / points.length,
          points.reduce((sum, p) => sum + p.center[1], 0) / points.length,
        ]
      : LAGOS_CENTER;

  return (
    <MapContainer
      center={center}
      zoom={11}
      scrollWheelZoom
      className="h-[480px] w-full rounded-2xl"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {points.map(({ cluster, center: markerCenter }) => {
        const radius = 12 + (cluster.totalMonthlySavings / maxSavings) * 20;
        return (
          <CircleMarker
            key={cluster.cooperativeId}
            center={markerCenter}
            radius={radius}
            pathOptions={{
              color: "#ffffff",
              weight: 2,
              fillColor: BRAND_COLOR,
              fillOpacity: 0.55,
            }}
          >
            <Popup>
              <div className="min-w-40">
                <p className="text-sm font-semibold text-text-primary-900">
                  {formatAreaKey(cluster.targetAreaKey)}
                </p>
                <p className="mt-0.5 text-xs text-text-tertiary-600">
                  {cluster.name}
                </p>
                <p className="mt-1 text-sm font-bold text-text-primary-900">
                  ₦{cluster.totalMonthlySavings.toLocaleString()}/month
                </p>
                <p className="mt-1 text-xs text-text-tertiary-600">
                  {cluster.memberCount} member
                  {cluster.memberCount === 1 ? "" : "s"} saving toward a{" "}
                  {cluster.targetPropertyType.toLowerCase()}
                </p>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
