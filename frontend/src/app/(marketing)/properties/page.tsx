import type { Metadata } from "next";
import { fetchProperties } from "@/lib/api";
import { PropertyCard } from "./_components/property-card";

export const metadata: Metadata = { title: "Properties" };
export const dynamic = "force-dynamic";

export default async function PropertiesPage() {
  const properties = await fetchProperties();

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-3xl font-bold text-text-primary-900">Properties</h1>
      <p className="mt-2 text-text-tertiary-600">
        Every listing here can be checked against real records and community
        reports before you pursue it.
      </p>

      {properties.length === 0 ? (
        <p className="mt-10 text-text-tertiary-600">No properties yet.</p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}
