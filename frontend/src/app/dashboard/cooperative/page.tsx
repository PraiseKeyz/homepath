import type { Metadata } from "next";
import { CooperativeDashboard } from "./_components/cooperative-dashboard";

export const metadata: Metadata = { title: "Cooperative Savings" };

export default function CooperativePage() {
  return <CooperativeDashboard />;
}
