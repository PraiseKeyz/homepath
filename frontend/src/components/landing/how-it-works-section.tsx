import {
  Building2,
  Handshake,
  MapPinned,
  PiggyBank,
  ShieldCheck,
} from "lucide-react";

// Descriptions deliberately avoid claiming AI verifies documents or ownership
// — see docs/ARCHITECTURE.md §2. TrustLayer's copy in particular should never
// be "loosened" to sound more impressive; that's the whole point.
const ENGINES = [
  {
    icon: ShieldCheck,
    name: "TrustLayer",
    description:
      "Checks a self-attested plot and survey number against registry records and community reports, then explains the result in plain English — it never claims to verify ownership on its own.",
  },
  {
    icon: PiggyBank,
    name: "RentToOwn Stack",
    description:
      "Cooperative savings groups from ₦5,000/month — a digital version of Ajo/Esusu/Adashe. Contribution history becomes a portable credit profile.",
  },
  {
    icon: Handshake,
    name: "Renter Protection",
    description:
      "Verified listings, flexible monthly rent instead of years upfront, and a landlord rating system that follows every transaction.",
  },
  {
    icon: MapPinned,
    name: "Neighbourhood Intelligence",
    description:
      "Flood risk, power supply, security, nearby schools and hospitals, and commute time on every listing — the due diligence a paid consultant would produce.",
  },
  {
    icon: Building2,
    name: "BuildMatch",
    description:
      "Aggregated cooperative savings data becomes a real-time demand signal, so developers can pre-sell affordable housing instead of only building for the top of the market.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold text-text-primary-900">
          Five engines, one platform
        </h2>
        <p className="mt-4 text-text-tertiary-600">
          Each failure in Nigeria&apos;s housing market reinforces the others.
          HomePath is built to break all five at once.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {ENGINES.map((engine) => (
          <div
            key={engine.name}
            className="rounded-2xl border border-border-secondary bg-background-bg-primary p-6"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-background-bg-brand-primary text-text-brand-secondary-700">
              <engine.icon className="h-5 w-5" />
            </span>
            <h3 className="mt-4 text-lg font-semibold text-text-primary-900">
              {engine.name}
            </h3>
            <p className="mt-2 text-sm text-text-tertiary-600">
              {engine.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
