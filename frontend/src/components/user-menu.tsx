"use client";

import { LogOut } from "lucide-react";
import type { ReactNode } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { User } from "@/lib/api";
import { getInitials } from "@/lib/format";

export function UserMenu({
  user,
  onSignOut,
  children,
}: {
  user: User;
  onSignOut: () => void;
  children?: ReactNode;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-full py-1 pr-3 pl-1 text-sm font-medium text-text-secondary-700 outline-none hover:bg-background-bg-secondary-hover focus-visible:ring-2 focus-visible:ring-effects-focus-rings-focus-ring">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-background-bg-brand-primary text-xs font-bold text-text-brand-secondary-700">
          {getInitials(user.name)}
        </span>
        <span className="hidden sm:inline">{user.name.split(" ")[0]}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>
          <p className="truncate">{user.name}</p>
          <p className="truncate text-xs font-normal text-text-tertiary-600">
            {user.email}
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {children}
        <DropdownMenuItem onClick={onSignOut}>
          <LogOut className="h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
