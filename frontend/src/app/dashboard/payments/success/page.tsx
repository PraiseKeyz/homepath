"use client";

import { CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const txRef = searchParams.get("tx_ref");
  const amount = searchParams.get("amount");

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center text-center">
      <div className="rounded-2xl border border-border-secondary bg-background-bg-primary p-10">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-utility-success-50">
          <CheckCircle2 className="h-8 w-8 text-utility-success-600" />
        </span>

        <h1 className="mt-6 text-2xl font-bold text-text-primary-900">
          Payment Successful!
        </h1>
        <p className="mt-2 text-sm text-text-tertiary-600">
          Your contribution has been recorded and your savings balance has been
          updated.
        </p>

        {amount && (
          <div className="mt-6 rounded-xl bg-utility-success-50 px-6 py-4">
            <p className="text-xs font-semibold tracking-wide text-utility-success-700 uppercase">
              Amount Paid
            </p>
            <p className="mt-1 text-3xl font-bold text-utility-success-700">
              ₦{Number(amount).toLocaleString()}
            </p>
          </div>
        )}

        {txRef && (
          <p className="mt-4 text-xs text-text-quaternary-500">
            Reference: {txRef}
          </p>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/dashboard/cooperative">
              Back to Cooperatives
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/dashboard/payments">Payment History</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
