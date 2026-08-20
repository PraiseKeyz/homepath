const STEPS = [
  {
    step: "1",
    title: "Search",
    description: "Browse the map, filter by price, type, and Trust Score.",
  },
  {
    step: "2",
    title: "Verify",
    description: "See each listing's Trust Score before you pursue it.",
  },
  {
    step: "3",
    title: "Understand",
    description:
      "Check flood risk, power, security, and commute on the Neighbourhood Intelligence Card.",
  },
  {
    step: "4",
    title: "Save",
    description:
      "Join a cooperative savings group for that area, from ₦5,000/month.",
  },
  {
    step: "5",
    title: "Build credit",
    description:
      "Contribution history becomes a portable credit profile over 6–18 months.",
  },
  {
    step: "6",
    title: "Own",
    description:
      "Get matched to a rent-to-own deal — monthly payments count toward ownership.",
  },
];

export function JourneySection() {
  return (
    <section id="journey" className="mx-auto max-w-6xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold text-text-primary-900">
          From search to ownership
        </h2>
      </div>

      <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {STEPS.map((item) => (
          <li key={item.step} className="flex gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-button-primary-default text-sm font-bold text-text-primary-on-brand">
              {item.step}
            </span>
            <div>
              <h3 className="font-semibold text-text-primary-900">
                {item.title}
              </h3>
              <p className="mt-1 text-sm text-text-tertiary-600">
                {item.description}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
