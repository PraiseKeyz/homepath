"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/error-state";

export default function MarketingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <ErrorState onRetry={reset} homeHref="/" />;
}
