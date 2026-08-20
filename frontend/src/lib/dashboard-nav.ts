import type { LucideIcon } from "lucide-react";
import { Building2, Home, PiggyBank } from "lucide-react";
import type { User } from "@/lib/api";

export interface DashboardNavItem {
  href: string;
  label: string;
  section: string;
  icon: LucideIcon;
  roles: User["role"][] | null;
}

// Single source of truth for both the sidebar links and the topbar's page
// title — keeps them from drifting apart as pages get added.
export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
  {
    href: "/properties",
    label: "Properties",
    section: "Browse",
    icon: Home,
    roles: null,
  },
  {
    href: "/dashboard/cooperative",
    label: "Cooperative Savings",
    section: "Save & build",
    icon: PiggyBank,
    roles: null,
  },
  {
    href: "/dashboard/build-match",
    label: "BuildMatch",
    section: "Save & build",
    icon: Building2,
    roles: ["DEVELOPER"],
  },
];
