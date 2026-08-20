import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "flex h-10 w-full rounded-lg border border-border-primary bg-background-bg-primary px-3.5 text-sm text-text-primary-900 placeholder:text-text-placeholder",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-effects-focus-rings-focus-ring",
        "disabled:cursor-not-allowed disabled:bg-background-bg-disabled disabled:text-text-disabled",
        className,
      )}
      {...props}
    />
  );
}
