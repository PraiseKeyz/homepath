import { MapPin, Search, ShieldCheck } from "lucide-react";

export function HeroSection() {
  return (
    <section className="bg-background-bg-secondary">
      <div className="mx-auto flex max-w-6xl flex-col items-center px-6 py-24 text-center">
        <span className="mb-5 rounded-full bg-background-bg-brand-primary px-4 py-1 text-sm font-medium text-text-brand-secondary-700">
          Built for Nigeria&apos;s housing crisis
        </span>

        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-text-primary-900 sm:text-5xl">
          Inclusive housing access for every Nigerian
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-text-tertiary-600">
          HomePath connects housing-deficit households to verified land,
          cooperative savings, and demand-matched developers — turning the
          housing crisis into a solvable logistics problem.
        </p>

        {/* Property search UI — not yet wired to GET /properties, see backend/src/properties */}
        <form className="mt-10 flex w-full max-w-3xl flex-col gap-3 rounded-2xl border border-border-secondary bg-background-bg-primary p-3 shadow-dropdown-panel sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-2 px-3">
            <MapPin className="h-4 w-4 shrink-0 text-text-quaternary-500" />
            <input
              type="text"
              placeholder="Search by area — e.g. Ojodu, Mowe-Ofada"
              className="w-full bg-transparent py-2 text-sm text-text-primary-900 placeholder:text-text-placeholder focus:outline-none"
            />
          </div>
          <select className="rounded-lg border border-border-primary bg-background-bg-primary px-3 py-2 text-sm text-text-secondary-700 sm:w-32">
            <option>Rent</option>
            <option>Buy</option>
          </select>
          <select className="rounded-lg border border-border-primary bg-background-bg-primary px-3 py-2 text-sm text-text-secondary-700 sm:w-40">
            <option>Any bedrooms</option>
            <option>1 bedroom</option>
            <option>2 bedrooms</option>
            <option>3+ bedrooms</option>
          </select>
          <button
            type="submit"
            className="flex items-center justify-center gap-2 rounded-lg bg-button-primary-default px-5 py-2.5 text-sm font-semibold text-text-primary-on-brand hover:bg-button-primary-hover"
          >
            <Search className="h-4 w-4" />
            Search
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-text-quaternary-500">
          <ShieldCheck className="h-4 w-4 text-utility-success-500" />
          Every listing carries a Trust Score before you pursue it
        </div>
      </div>
    </section>
  );
}
