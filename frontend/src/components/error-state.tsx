"use client";

import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load this. This is usually temporary — try again in a moment.",
  onRetry,
  homeHref = "/",
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  homeHref?: string;
}) {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center px-6 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-background-bg-error-primary text-utility-error-600">
        <AlertTriangle className="h-6 w-6" />
      </span>
      <h1 className="mt-4 text-xl font-bold text-text-primary-900">{title}</h1>
      <p className="mt-2 text-sm text-text-tertiary-600">{description}</p>
      <div className="mt-6 flex gap-3">
        {onRetry && <Button onClick={onRetry}>Try again</Button>}
        <Button asChild variant="secondary">
          <Link href={homeHref}>Go home</Link>
        </Button>
      </div>
    </div>
  );
}
