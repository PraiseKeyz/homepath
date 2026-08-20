"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock,
  CreditCard,
  XCircle,
} from "lucide-react";
import { ErrorState } from "@/components/error-state";
import {
  ApiError,
  type Payment,
  type PaymentStatus,
  fetchPaymentHistory,
} from "@/lib/api";
import { getToken } from "@/lib/auth";

const STATUS_CONFIG: Record<
  PaymentStatus,
  { label: string; icon: typeof CheckCircle2; badgeClass: string }
> = {
  SUCCESS: {
    label: "Successful",
    icon: CheckCircle2,
    badgeClass: "bg-utility-success-50 text-utility-success-700",
  },
  PENDING: {
    label: "Pending",
    icon: Clock,
    badgeClass: "bg-utility-warning-50 text-utility-warning-700",
  },
  FAILED: {
    label: "Failed",
    icon: XCircle,
    badgeClass: "bg-background-bg-error-primary text-utility-error-600",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: XCircle,
    badgeClass: "bg-background-bg-error-primary text-utility-error-600",
  },
};

const DATE_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState<Payment[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    setError(null);
    try {
      setPayments(await fetchPaymentHistory(token));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (error) {
    return <ErrorState onRetry={load} homeHref="/dashboard/payments" />;
  }

  if (!payments) {
    return (
      <p className="text-sm text-text-tertiary-600">Loading payments…</p>
    );
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-text-primary-900">Payments</h1>
      <p className="mt-1 text-sm text-text-tertiary-600">
        Your Flutterwave contribution payment history.
      </p>

      {payments.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-strong bg-background-bg-primary py-16 text-center">
          <CreditCard className="mb-3 h-10 w-10 text-text-quaternary-500" />
          <p className="text-sm font-medium text-text-primary-900">
            No payments yet
          </p>
          <p className="mt-1 text-xs text-text-tertiary-600">
            Make a contribution from your cooperative dashboard to get started.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {payments.map((payment) => {
            const config = STATUS_CONFIG[payment.status];
            const StatusIcon = config.icon;

            return (
              <div
                key={payment.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-border-secondary bg-background-bg-primary p-5"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background-bg-brand-primary text-text-brand-secondary-700">
                    <CreditCard className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-text-primary-900">
                      {payment.membership?.cooperative?.name ?? "Contribution"}
                    </p>
                    <p className="truncate text-xs text-text-tertiary-600">
                      {DATE_FORMATTER.format(new Date(payment.createdAt))}
                    </p>
                    <p className="truncate text-xs text-text-quaternary-500">
                      Ref: {payment.txRef}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <span className="text-base font-bold text-text-primary-900">
                    ₦{Number(payment.amount).toLocaleString()}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${config.badgeClass}`}
                  >
                    <StatusIcon className="h-3 w-3" />
                    {config.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
