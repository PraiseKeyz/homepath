// Sample scores mirror the real formula in backend/src/trust-layer/trust-layer.service.ts
// (registry status + community-report adjustment) — kept in sync deliberately,
// not just plausible-looking numbers. See docs/ARCHITECTURE.md §2.1.
const EXAMPLES = [
  {
    score: 85,
    band: "Likely legitimate",
    badgeClass: "bg-utility-success-50 text-utility-success-700",
    text: "This plot matches a clean registry record. No community reports have been filed yet.",
  },
  {
    score: 50,
    band: "Unverified",
    badgeClass: "bg-utility-warning-50 text-utility-warning-700",
    text: "No registry record was found for this plot — that means unverified, not clean. 1 confirmation report has been filed by the community.",
  },
  {
    score: 15,
    band: "High risk",
    badgeClass: "bg-utility-error-50 text-utility-error-700",
    text: "This plot matches a flagged registry record. 2 dispute reports have been filed by the community.",
  },
];

export function TrustScorePreview() {
  return (
    <section id="trust-layer" className="bg-background-bg-secondary">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-3xl font-bold text-text-primary-900">
              A Trust Score you can actually trust
            </h2>
            <p className="mt-4 text-text-tertiary-600">
              The score is a transparent combination of a registry lookup and
              community reports — never an AI&apos;s opinion of whether a
              document is genuine. Every score comes with its reasoning and this
              disclaimer:
            </p>
            <p className="mt-4 rounded-lg border border-border-secondary bg-background-bg-primary p-4 text-sm italic text-text-tertiary-600">
              &quot;This score is not legal proof of ownership. We recommend
              independent legal or survey verification before making any
              payment.&quot;
            </p>
          </div>

          <div className="space-y-4">
            {EXAMPLES.map((example) => (
              <div
                key={example.band}
                className="rounded-2xl border border-border-secondary bg-background-bg-primary p-5"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${example.badgeClass}`}
                  >
                    {example.band}
                  </span>
                  <span className="text-2xl font-bold text-text-primary-900">
                    {example.score}/100
                  </span>
                </div>
                <p className="mt-3 text-sm text-text-tertiary-600">
                  {example.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
