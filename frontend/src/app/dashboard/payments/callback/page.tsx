"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { ApiError, verifyPayment } from "@/lib/api";
import { getToken } from "@/lib/auth";

export default function PaymentCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const verifiedRef = useRef(false);

  const verify = useCallback(async () => {
    if (verifiedRef.current) return;
    verifiedRef.current = true;

    const status = searchParams.get("status");
    const transactionId = searchParams.get("transaction_id");
    const txRef = searchParams.get("tx_ref");

    if (!transactionId || !txRef) {
      router.replace("/dashboard/payments/failed?reason=missing_params");
      return;
    }

    if (status === "cancelled") {
      router.replace("/dashboard/payments/failed?reason=cancelled");
      return;
    }

    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      const result = await verifyPayment(token, { transactionId, txRef });
      router.replace(
        `/dashboard/payments/success?tx_ref=${txRef}&amount=${result.amount}`,
      );
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Verification failed";
      setError(message);
      setTimeout(() => {
        router.replace(
          `/dashboard/payments/failed?reason=verification_failed`,
        );
      }, 2000);
    }
  }, [searchParams, router]);

  useEffect(() => {
    verify();
  }, [verify]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center text-center">
      {error ? (
        <>
          <p className="text-sm text-text-error-primary-600">{error}</p>
          <p className="mt-2 text-xs text-text-tertiary-600">
            Redirecting…
          </p>
        </>
      ) : (
        <>
          <Loader2 className="h-8 w-8 animate-spin text-text-brand-secondary-700" />
          <p className="mt-4 text-sm text-text-tertiary-600">
            Verifying your payment…
          </p>
        </>
      )}
    </div>
  );
}
