import { Building2, LineChart, MapPinned, PiggyBank } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "For Developers — HomePath",
};

const STEPS = [
  {
    icon: PiggyBank,
    title: "Renters save toward a target",
    description:
      "Buyers and renters join a cooperative savings group tied to a specific area and property type — e.g. a 2-bedroom in Ojodu — and contribute monthly, the way Ajo/Esusu already works.",
  },
  {
    icon: LineChart,
    title: "HomePath aggregates it",
    description:
      "Every cooperative's membership count and total monthly contribution rolls up into a demand cluster, grouped by area and property type. No survey, no guesswork — it's a live read of committed savings.",
  },
  {
    icon: Building2,
    title: "You see it before you build",
    description:
      "Your dashboard shows exactly where demand is concentrated and how much monthly capital is already committed, so you can size a development — or decide not to — before breaking ground.",
  },
];

const DASHBOARD_ITEMS = [
  "A map of demand clusters across Lagos, sized by total monthly savings in that area",
  "Member count and monthly contribution total per cooperative",
  "Target property type per cluster (e.g. 2-bedroom, 3-bedroom)",
  "The same underlying data renters see on their own savings progress — nothing hidden or estimated separately for developers",
];

export default function DevelopersPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-20">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-background-bg-brand-primary px-3 py-1 text-xs font-semibold tracking-wide text-text-brand-secondary-700 uppercase">
          <Building2 className="h-3.5 w-3.5" />
          BuildMatch, for developers
        </span>
        <h1 className="mt-5 text-4xl font-bold text-text-primary-900">
          Build where demand is already committed, not where you're guessing.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-text-tertiary-600">
          Market research tells you what people say they want. BuildMatch tells
          you what they're already putting money toward — households in a
          cooperative, saving monthly, toward a specific unit type in a specific
          area.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/register?role=developer">
              Get started as a developer
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/login">I already have an account</Link>
          </Button>
        </div>
      </div>

      <div className="mt-24">
        <h2 className="text-center text-2xl font-bold text-text-primary-900">
          How BuildMatch works
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <div
              key={step.title}
              className="rounded-2xl border border-border-secondary bg-background-bg-primary p-6"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-background-bg-brand-primary text-sm font-bold text-text-brand-secondary-700">
                  {i + 1}
                </span>
                <step.icon className="h-5 w-5 text-text-quaternary-500" />
              </div>
              <h3 className="mt-4 font-semibold text-text-primary-900">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-text-tertiary-600">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-24 overflow-hidden rounded-3xl border border-border-secondary bg-background-bg-brand-section">
        <div className="grid gap-8 p-10 sm:grid-cols-[auto_1fr] sm:items-center">
          <MapPinned className="h-10 w-10 text-text-primary-on-brand" />
          <div>
            <h2 className="text-xl font-bold text-text-primary-on-brand">
              What's in your dashboard
            </h2>
            <ul className="mt-4 space-y-2.5">
              {DASHBOARD_ITEMS.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-sm text-text-secondary-on-brand"
                >
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-text-secondary-on-brand" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <p className="mx-auto mt-10 max-w-2xl text-center text-xs text-text-quaternary-500">
        For this build, cooperative contribution history is seeded demo data
        standing in for real savings activity — the aggregation you'd see in a
        live dashboard is the same deterministic query, just run against real,
        ongoing contributions. See docs/ARCHITECTURE.md §5.
      </p>

      <div className="mt-16 text-center">
        <Button asChild size="lg">
          <Link href="/register?role=developer">
            Get started as a developer
          </Link>
        </Button>
      </div>
    </div>
  );
}
