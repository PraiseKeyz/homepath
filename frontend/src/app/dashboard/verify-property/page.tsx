"use client";

import { ShieldCheck } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function VerifyPropertyPage() {
  const [plotNumber, setPlotNumber] = useState("");
  const [surveyNumber, setSurveyNumber] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
  }

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
            placeholder="e.g. LKI/2024/0182"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="verify-survey">Survey number</Label>
          <Input
            id="verify-survey"
            value={surveyNumber}
            onChange={(event) => setSurveyNumber(event.target.value)}
            placeholder="e.g. SV/LA/2024/4471"
          />
        </div>

        <Button type="submit" disabled className="w-full">
          <ShieldCheck className="h-4 w-4" />
          Check property
        </Button>

        <p className="text-center text-xs text-text-quaternary-500">
          Coming soon — standalone registry checks are being wired up. Today,
          every listing on{" "}
          <a
            href="/properties"
            className="font-semibold text-text-brand-secondary-700 hover:underline"
          >
            /properties
          </a>{" "}
          already shows its Trust Score.
        </p>
      </form>
    </div>
  );
}
