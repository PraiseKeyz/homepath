"use client";

import { XCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

const REASON_MESSAGES: Record<string, string> = {
  cancelled: "You cancelled the payment. No charges were made.",
  missing_params: "The payment callback was missing required parameters.",
  verification_failed:
    "We could not verify your payment. If you were charged, please contact support.",
};

export default function PaymentFailedPage() {
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason") ?? "unknown";
  const message =
    REASON_MESSAGES[reason] ??
    "Something went wrong with your payment. Please try again.";

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center text-center">
      <div className="rounded-2xl border border-border-secondary bg-background-bg-primary p-10">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-background-bg-error-primary">
          <XCircle className="h-8 w-8 text-utility-error-600" />
        </span>

        <h1 className="mt-6 text-2xl font-bold text-text-primary-900">
          Payment Not Completed
        </h1>
        <p className="mt-2 text-sm text-text-tertiary-600">{message}</p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/dashboard/cooperative">Try Again</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
