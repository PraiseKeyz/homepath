"use client";

import { ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError, type RegistryVerification, verifyRegistry } from "@/lib/api";
import { getScoreBand } from "@/lib/trust-score";

export default function VerifyPropertyPage() {
  const [plotNumber, setPlotNumber] = useState("");
  const [surveyNumber, setSurveyNumber] = useState("");
  const [result, setResult] = useState<RegistryVerification | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setResult(null);
    setChecking(true);
    try {
      setResult(await verifyRegistry(plotNumber.trim(), surveyNumber.trim()));
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not run this check.",
      );
    } finally {
      setChecking(false);
    }
  }

  const band = result ? getScoreBand(result.score) : null;

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-text-primary-900">
        Verify a Property
      </h1>
      <p className="mt-1 text-sm text-text-tertiary-600">
        Check any plot and survey number against registry records and community
        reports — independent of whether it's listed on HomePath.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-4 rounded-2xl border border-border-secondary bg-background-bg-primary p-6"
      >
        <div className="space-y-1.5">
          <Label htmlFor="verify-plot">Plot number</Label>
          <Input
            id="verify-plot"
            value={plotNumber}
            onChange={(event) => setPlotNumber(event.target.value)}
            placeholder="e.g. PL-OJODU-001"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="verify-survey">Survey number</Label>
          <Input
            id="verify-survey"
            value={surveyNumber}
            onChange={(event) => setSurveyNumber(event.target.value)}
            placeholder="e.g. SV-OJODU-001"
            required
          />
        </div>

        {error && (
          <p className="text-sm text-text-error-primary-600">{error}</p>
        )}

        <Button type="submit" disabled={checking} className="w-full">
          <ShieldCheck className="h-4 w-4" />
          {checking ? "Checking…" : "Check property"}
        </Button>
      </form>

      {result && band && (
        <div className="mt-6 rounded-2xl border border-border-secondary bg-background-bg-primary p-6">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-5xl font-bold text-text-primary-900">
                {result.score}
              </span>
              <span className="text-lg text-text-quaternary-500">/100</span>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${band.badgeClass}`}
            >
              {band.label}
            </span>
          </div>

          <p className="mt-4 rounded-lg bg-background-bg-secondary p-4 text-sm text-text-tertiary-600">
            {result.explanationText}
          </p>

          {result.matchedProperties.length > 0 && (
            <div className="mt-4 border-t border-border-secondary pt-4">
              <p className="text-xs font-semibold tracking-wide text-text-quaternary-500 uppercase">
                Listed on HomePath
              </p>
              <ul className="mt-2 space-y-2">
                {result.matchedProperties.map((property) => (
                  <li key={property.id}>
                    <Link
                      href={`/properties/${property.id}`}
                      className="flex items-center justify-between rounded-lg bg-background-bg-secondary px-3 py-2 text-sm text-text-secondary-700 hover:bg-background-bg-secondary-hover"
                    >
                      <span className="truncate">{property.title}</span>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
