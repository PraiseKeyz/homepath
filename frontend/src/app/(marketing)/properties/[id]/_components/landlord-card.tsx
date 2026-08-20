"use client";

import { CheckCircle2, Star } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
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
import { Label } from "@/components/ui/label";
import {
  ApiError,
  fetchLandlordRatings,
  type LandlordProfile,
  type LandlordRatingsSummary,
  rateLandlord,
} from "@/lib/api";
import { getStoredUser, getToken } from "@/lib/auth";
import { getInitials } from "@/lib/format";

function RateLandlordDialog({
  landlordId,
  onRated,
}: {
  landlordId: string;
  onRated: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const token = getToken();
    if (!token) return;

    setError(null);
    setIsSubmitting(true);
    try {
      await rateLandlord(landlordId, token, {
        rating,
        comment: comment || undefined,
      });
      setOpen(false);
      setComment("");
      onRated();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not submit rating.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="text-xs font-semibold text-text-brand-secondary-700 hover:underline"
        >
          Rate this landlord
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rate this landlord</DialogTitle>
          <DialogDescription>
            Based on your experience — this is visible to future renters.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Rating</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  aria-label={`${value} star${value > 1 ? "s" : ""}`}
                  className="p-0.5"
                >
                  <Star
                    className={`h-6 w-6 ${
                      value <= rating
                        ? "fill-utility-warning-500 text-utility-warning-500"
                        : "text-border-strong"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rating-comment">Comment (optional)</Label>
            <textarea
              id="rating-comment"
              rows={3}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              className="min-h-20 w-full rounded-lg border border-border-primary bg-background-bg-primary px-3.5 py-2 text-sm text-text-primary-900 placeholder:text-text-placeholder focus-visible:ring-2 focus-visible:ring-effects-focus-rings-focus-ring focus-visible:outline-none"
              placeholder="How was your experience?"
            />
          </div>

          {error && (
            <p className="text-sm text-text-error-primary-600">{error}</p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting…" : "Submit rating"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function LandlordCard({
  landlord,
  ownerName,
  ownerRole,
}: {
  landlord: LandlordProfile | null;
  ownerName?: string;
  ownerRole?: string;
}) {
  const [ratings, setRatings] = useState<LandlordRatingsSummary | null>(null);
  const currentUser = getStoredUser();
  const canRate = landlord && currentUser && currentUser.id !== landlord.id;

  const name = landlord?.name ?? ownerName ?? "Verified landlord";
  const role = landlord?.role ?? ownerRole ?? "LANDLORD";
  const joinYear = landlord ? new Date(landlord.createdAt).getFullYear() : null;

  function loadRatings() {
    if (!landlord) return;
    fetchLandlordRatings(landlord.id)
      .then(setRatings)
      .catch(() => {});
  }

  useEffect(loadRatings, [landlord]);

  return (
    <div className="rounded-2xl border border-border-secondary bg-background-bg-primary p-6">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-button-primary-default text-2xl font-black text-text-primary-on-brand">
            {getInitials(name)}
          </div>
          <span className="absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full bg-utility-success-500 ring-2 ring-background-bg-primary">
            <CheckCircle2 className="h-3 w-3 text-text-white" />
          </span>
        </div>
        <div>
          <p className="text-lg font-bold text-text-primary-900">{name}</p>
          <span
            className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide uppercase ${
              role === "DEVELOPER"
                ? "bg-utility-warning-50 text-utility-warning-700"
                : "bg-background-bg-brand-primary text-text-brand-secondary-700"
            }`}
          >
            {role === "DEVELOPER" ? "Developer" : "Landlord"}
          </span>
        </div>
      </div>

      {landlord && (
        <div className="mt-5 grid grid-cols-3 gap-2">
          {[
            { val: landlord.totalListings, label: "Listings" },
            { val: landlord.propertiesSoldOrRented, label: "Closed deals" },
            { val: landlord.availableListings, label: "Available" },
          ].map(({ val, label }) => (
            <div
              key={label}
              className="rounded-xl bg-background-bg-secondary py-3 text-center"
            >
              <p className="text-2xl font-black text-text-primary-900">{val}</p>
              <p className="mt-0.5 text-[11px] text-text-tertiary-600">
                {label}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between text-sm text-text-tertiary-600">
        <span className="flex items-center gap-1.5">
          {ratings && ratings.ratingCount > 0 ? (
            <>
              <Star className="h-4 w-4 fill-utility-warning-500 text-utility-warning-500" />
              {ratings.averageRating?.toFixed(1)} ({ratings.ratingCount} rating
              {ratings.ratingCount === 1 ? "" : "s"})
            </>
          ) : (
            "No ratings yet"
          )}
        </span>
        {canRate && landlord && (
          <RateLandlordDialog landlordId={landlord.id} onRated={loadRatings} />
        )}
      </div>

      {joinYear && (
        <p className="mt-3 text-xs text-text-quaternary-500">
          Listing on HomePath since {joinYear}
        </p>
      )}
    </div>
  );
}
