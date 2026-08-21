import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Building2,
  Home,
  LayoutDashboard,
  MapPinned,
  Settings,
  ShieldCheck,
  User as UserIcon,
  Users,
} from "lucide-react";
import type { User } from "@/lib/api";

export interface DashboardNavItem {
  href: string;
  label: string;
  group: "main" | "account";
  icon: LucideIcon;
  roles: User["role"][] | null;
}

// Single source of truth for the sidebar links and the topbar's page title —
// keeps them from drifting apart as pages get added.
export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    group: "main",
    icon: LayoutDashboard,
    roles: null,
  },
  {
    href: "/properties",
    label: "Properties",
    group: "main",
    icon: Home,
    roles: null,
  },
  {
    href: "/dashboard/verify-property",
    label: "Verify Property",
    group: "main",
    icon: ShieldCheck,
    roles: null,
  },
  {
    href: "/dashboard/cooperative",
    label: "Cooperatives",
    group: "main",
    icon: Users,
    roles: null,
  },
  {
    href: "/dashboard/neighbourhoods",
    label: "Neighbourhoods",
    group: "main",
    icon: MapPinned,
    roles: null,
  },
  {
    href: "/dashboard/build-match",
    label: "Developer Hub",
    group: "main",
    icon: Building2,
    roles: ["DEVELOPER"],
  },
  {
    href: "/dashboard/notifications",
    label: "Notifications",
    group: "account",
    icon: Bell,
    roles: null,
  },
  {
    href: "/dashboard/profile",
    label: "Profile",
    group: "account",
    icon: UserIcon,
    roles: null,
  },
  {
    href: "/dashboard/settings",
    label: "Settings",
    group: "account",
    icon: Settings,
    roles: null,
  },
];
