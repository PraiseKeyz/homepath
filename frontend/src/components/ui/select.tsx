import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "flex h-10 w-full rounded-lg border border-border-primary bg-background-bg-primary px-3.5 text-sm text-text-primary-900",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-effects-focus-rings-focus-ring",
        "disabled:cursor-not-allowed disabled:bg-background-bg-disabled disabled:text-text-disabled",
        className,
      )}
      {...props}
    />
  );
}
