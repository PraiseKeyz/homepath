const STATS = [
  { value: "14.9M", label: "unit housing deficit" },
  { value: "$4B", label: "lost to land fraud yearly" },
  { value: "<1%", label: "mortgage-to-GDP ratio" },
  { value: "3%", label: "of Nigerians hold valid title" },
  { value: "25–30%", label: "annual mortgage interest rate" },
  { value: "95%", label: "of land titles contestable" },
];

export function StatsSection() {
  return (
    <section className="border-y border-border-secondary bg-background-bg-primary">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-center text-sm font-semibold uppercase tracking-wide text-text-quaternary-500">
          Five interlocking failures. One platform.
        </h2>
        <div className="mt-8 grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold text-text-brand-primary-900">
                {stat.value}
              </p>
              <p className="mt-2 text-xs text-text-tertiary-600">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
