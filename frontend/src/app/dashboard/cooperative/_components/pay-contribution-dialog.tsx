"use client";

import { type FormEvent, useState } from "react";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ApiError,
  type CooperativeMembership,
  initializePayment,
} from "@/lib/api";
import { getToken } from "@/lib/auth";

export function PayContributionDialog({
  membership,
}: {
  membership: CooperativeMembership;
}) {
  const monthlyAmount = Number(membership.monthlyContributionAmount);
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(String(monthlyAmount));
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const token = getToken();
    if (!token) return;

    setError(null);
    setIsSubmitting(true);
    try {
      const result = await initializePayment(token, {
        membershipId: membership.id,
        amount: Number(amount),
      });
      // Redirect to Flutterwave checkout
      window.location.href = result.checkoutUrl;
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Something went wrong. Try again.",
      );
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <CreditCard className="h-3.5 w-3.5" />
          Pay Contribution
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Make Contribution</DialogTitle>
          <DialogDescription>
            Pay your monthly contribution to{" "}
            {membership.cooperative.name}. You will be redirected to
            Flutterwave&apos;s secure checkout.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="pay-amount">Amount (₦)</Label>
            <Input
              id="pay-amount"
              type="number"
              min={1000}
              step={500}
              required
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
            <p className="text-xs text-text-tertiary-600">
              Your monthly target is ₦{monthlyAmount.toLocaleString()}
            </p>
          </div>

          {error && (
            <p className="text-sm text-text-error-primary-600">{error}</p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Redirecting…" : "Pay with Flutterwave"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
