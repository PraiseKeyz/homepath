import type { Metadata } from "next";
import { PropertyBrowser } from "./_components/property-browser";

export const metadata: Metadata = { title: "Properties" };

export default function PropertiesPage() {
  return <PropertyBrowser />;
}
