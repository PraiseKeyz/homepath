import {
  ArrowRight,
  Building2,
  Check,
  Handshake,
  House,
  MapPin,
  MapPinned,
  PiggyBank,
  ShieldCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="bg-dotted-grid relative">
      <div className="relative mx-auto grid max-w-6xl gap-16 px-6 py-20 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:py-28">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border-brand bg-background-bg-brand-primary px-4 py-1.5 text-xs font-semibold tracking-wide text-text-brand-secondary-700 uppercase">
            <ShieldCheck className="h-3.5 w-3.5" />
            Real records. Real reports. No AI guesswork.
          </span>

          <h1 className="mt-6 text-5xl leading-[1.05] font-bold tracking-tight text-text-primary-900 sm:text-6xl">
            Before you pay for that plot,
            <br />
            <span className="text-text-brand-secondary-700">
              check what&apos;s actually true.
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-lg text-text-tertiary-600">
            HomePath checks land records and real community reports on any
            property — plus a savings path that actually gets you to ownership,
            not another year of rent.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-6">
            <Button asChild size="lg">
              <Link href="/properties">
                Check a property
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <a
              href="#trust-layer"
              className="text-sm font-semibold text-text-secondary-700 hover:text-text-primary-900"
            >
              See how the score works
            </a>
          </div>

          <div className="mt-8 flex items-center gap-2 text-xs text-text-quaternary-500">
            <div className="flex h-4 w-4 items-center justify-center rounded-full border border-border-secondary bg-background-bg-primary">
              <Check className="h-2.5 w-2.5" />
            </div>
            Every score comes with its reasoning — never just a verdict.
          </div>
        </div>

        <HeroVisual />
      </div>
    </section>
  );
}

// The right-hand visual has to say "HomePath" at a glance, not just "TrustLayer":
// a house silhouette grounds it as a housing product, the Trust Score card is the
// flagship feature front and center, and the other four pillars orbit it as
// floating chips — the same five engines from HowItWorksSection, previewed here.
function HeroVisual() {
  return (
    <div className="relative mx-auto flex h-[30rem] max-w-md items-center justify-center lg:h-[34rem]">
      <House
        className="pointer-events-none absolute inset-0 h-full w-full text-utility-brand-100"
        strokeWidth={0.6}
        aria-hidden
      />

      <PillarChip
        icon={PiggyBank}
        label="RentToOwn Stack"
        className="top-4 -left-4 hidden -rotate-6 lg:flex"
      />
      <PillarChip
        icon={MapPinned}
        label="Neighbourhood Intel"
        className="top-10 -right-6 hidden rotate-6 lg:flex"
      />
      <PillarChip
        icon={Handshake}
        label="Renter Protection"
        className="-bottom-2 -left-8 hidden rotate-3 lg:flex"
      />
      <PillarChip
        icon={Building2}
        label="BuildMatch"
        className="-right-4 bottom-8 hidden -rotate-3 lg:flex"
      />

      <TrustScoreDemoCard />
    </div>
  );
}

function PillarChip({
  icon: Icon,
  label,
  className = "",
}: {
  icon: typeof PiggyBank;
  label: string;
  className?: string;
}) {
  return (
    <div
      className={`absolute z-10 items-center gap-2 rounded-2xl border border-border-secondary bg-background-bg-primary px-3 py-2 shadow-dropdown-panel ${className}`}
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-background-bg-brand-primary text-text-brand-secondary-700">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <span className="text-xs font-semibold text-text-secondary-700">
        {label}
      </span>
    </div>
  );
}

// A realistic preview of the Trust Score card a user sees on a property page —
// showing the actual product in the hero, not just describing it.
function TrustScoreDemoCard() {
  return (
    <div className="relative z-20 w-full max-w-xs">
      <div
        className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-background-bg-brand-secondary to-background-bg-brand-primary opacity-70 blur-2xl"
        aria-hidden
      />
      <div className="rounded-2xl border border-border-secondary bg-background-bg-primary p-6 shadow-dropdown-panel">
        <div className="flex items-center gap-2 text-sm text-text-tertiary-600">
          <MapPin className="h-4 w-4" />
          12 Ogunlana Street, Ojodu, Lagos
        </div>

        <div className="mt-4 flex items-end justify-between">
          <div>
            <span className="text-5xl font-bold text-text-primary-900">85</span>
            <span className="text-lg text-text-quaternary-500">/100</span>
          </div>
          <span className="rounded-full bg-utility-success-50 px-3 py-1 text-xs font-semibold text-utility-success-700">
            Likely legitimate
          </span>
        </div>

        <div className="mt-5 space-y-2 border-t border-border-secondary pt-5">
          <div className="flex items-center gap-2 text-sm text-text-secondary-700">
            <ShieldCheck className="h-4 w-4 text-utility-success-500" />
            Matches a clean registry record
          </div>
          <div className="flex items-center gap-2 text-sm text-text-secondary-700">
            <Users className="h-4 w-4 text-text-quaternary-500" />3 community
            confirmations · 0 disputes
          </div>
        </div>

        <p className="mt-4 rounded-lg bg-background-bg-secondary p-3 text-sm text-text-tertiary-600 italic">
          &quot;This plot matches a clean registry record. No community reports
          have been filed yet.&quot;
        </p>

        <p className="mt-3 text-xs text-text-quaternary-500">
          Not legal proof of ownership — always verify independently.
        </p>
      </div>
    </div>
  );
}
