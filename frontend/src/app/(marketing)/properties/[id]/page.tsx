import type { Metadata } from "next";
import { fetchProperty } from "@/lib/api";
import { PropertyDetailView } from "./_components/property-detail-view";

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
  return <PropertyDetailView propertyId={id} />;
}
