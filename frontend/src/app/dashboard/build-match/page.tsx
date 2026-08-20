import type { Metadata } from "next";
import { BuildMatchDashboard } from "./_components/build-match-dashboard";

export const metadata: Metadata = { title: "BuildMatch" };

export default function BuildMatchPage() {
  return <BuildMatchDashboard />;
}
