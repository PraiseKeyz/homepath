"use client";

import { type FormEvent, useState } from "react";
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
import { ApiError, type Cooperative, joinCooperative } from "@/lib/api";
import { getToken } from "@/lib/auth";

export function JoinCooperativeDialog({
  cooperative,
  onJoined,
}: {
  cooperative: Cooperative;
  onJoined: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("5000");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const token = getToken();
    if (!token) return;

    setError(null);
    setIsSubmitting(true);
    try {
      await joinCooperative(cooperative.id, token, {
        monthlyContributionAmount: Number(amount),
      });
      setOpen(false);
      onJoined();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Something went wrong. Try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Join</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join {cooperative.name}</DialogTitle>
          <DialogDescription>
            Saving toward a {cooperative.targetPropertyType} in{" "}
            {cooperative.targetAreaKey.replace("-", " ")}. Start from
            ₦5,000/month.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="amount">Monthly contribution (₦)</Label>
            <Input
              id="amount"
              type="number"
              min={5000}
              step={500}
              required
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </div>

          {error && (
            <p className="text-sm text-text-error-primary-600">{error}</p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Joining…" : "Confirm"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
