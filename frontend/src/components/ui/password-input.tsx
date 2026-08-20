"use client";

import { Eye, EyeOff } from "lucide-react";
import { useId, useState } from "react";
import { Input, type InputProps } from "@/components/ui/input";
import { cn } from "@/lib/cn";

export function PasswordInput({ id, className, ...props }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        id={inputId}
        type={visible ? "text" : "password"}
        className={cn("pr-10", className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        className="absolute top-1/2 right-3 inline-flex size-5 -translate-y-1/2 items-center justify-center text-text-quaternary-500 transition-colors hover:text-text-secondary-700"
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? (
          <EyeOff className="size-4" aria-hidden />
        ) : (
          <Eye className="size-4" aria-hidden />
        )}
      </button>
    </div>
  );
}
