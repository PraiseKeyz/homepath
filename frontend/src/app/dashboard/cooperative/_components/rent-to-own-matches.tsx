"use client";

import { Handshake, MapPin } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ApiError,
  fetchRentToOwnMatches,
  type RentToOwnMatch,
  respondToRentToOwnMatch,
} from "@/lib/api";
import { getToken } from "@/lib/auth";
import { formatPrice } from "@/lib/format";

const STATUS_STYLES: Record<RentToOwnMatch["status"], string> = {
  PROPOSED: "bg-utility-warning-50 text-utility-warning-700",
  ACCEPTED: "bg-utility-success-50 text-utility-success-700",
  DECLINED: "bg-background-bg-error-primary text-utility-error-600",
};

function MatchRow({
  match,
  onRespond,
}: {
  match: RentToOwnMatch;
  onRespond: (
    matchId: string,
    status: "ACCEPTED" | "DECLINED",
  ) => Promise<void>;
}) {
  const [isSubmitting, setIsSubmitting] = useState<
    "ACCEPTED" | "DECLINED" | null
  >(null);

  async function respond(status: "ACCEPTED" | "DECLINED") {
    setIsSubmitting(status);
    try {
      await onRespond(match.id, status);
    } finally {
      setIsSubmitting(null);
    }
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-border-secondary bg-background-bg-primary p-5">
      <div className="min-w-0">
        <h3 className="truncate font-semibold text-text-primary-900">
          {match.property.title}
        </h3>
        <div className="mt-1 flex items-center gap-1.5 text-xs text-text-tertiary-600">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{match.property.address}</span>
        </div>
        <p className="mt-1 text-sm font-medium text-text-secondary-700">
          {formatPrice(match.property.price, match.property.listingType)}
        </p>
      </div>

      {match.status === "PROPOSED" ? (
        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="secondary"
            disabled={isSubmitting !== null}
            onClick={() => respond("DECLINED")}
          >
            {isSubmitting === "DECLINED" ? "Declining…" : "Decline"}
          </Button>
          <Button
            disabled={isSubmitting !== null}
            onClick={() => respond("ACCEPTED")}
          >
            {isSubmitting === "ACCEPTED" ? "Accepting…" : "Accept"}
          </Button>
        </div>
      ) : (
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[match.status]}`}
        >
          {match.status === "ACCEPTED" ? "Accepted" : "Declined"}
        </span>
      )}
    </div>
  );
}

export function RentToOwnMatches({
  cooperativeIds,
}: {
  cooperativeIds: string[];
}) {
  const [matches, setMatches] = useState<RentToOwnMatch[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const token = getToken();
    if (!token || cooperativeIds.length === 0) {
      setMatches([]);
      return;
    }
    setError(null);
    try {
      const results = await Promise.all(
        cooperativeIds.map((id) => fetchRentToOwnMatches(id, token)),
      );
      setMatches(
        results.flat().sort((a, b) => (a.matchedAt < b.matchedAt ? 1 : -1)),
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    }
  }, [cooperativeIds]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleRespond(
    matchId: string,
    status: "ACCEPTED" | "DECLINED",
  ) {
    const token = getToken();
    if (!token) return;
    await respondToRentToOwnMatch(matchId, token, status);
    await load();
  }

  if (cooperativeIds.length === 0 || (matches && matches.length === 0)) {
    return null;
  }

  return (
    <div className="mt-10">
      <h2 className="flex items-center gap-2 text-sm font-semibold tracking-wide text-text-tertiary-600 uppercase">
        <Handshake className="h-4 w-4" />
        Rent-to-own matches
      </h2>

      {error && (
        <p className="mt-3 text-sm text-text-error-primary-600">{error}</p>
      )}

      {matches && (
        <div className="mt-4 space-y-3">
          {matches.map((match) => (
            <MatchRow key={match.id} match={match} onRespond={handleRespond} />
          ))}
        </div>
      )}
    </div>
  );
}
