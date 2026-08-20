// Score bands from docs/ARCHITECTURE.md §2.1 — the single shared source so
// every place that renders a score agrees on the same thresholds and colors.
export function getScoreBand(score: number) {
  if (score >= 70) {
    return {
      label: "Likely legitimate",
      badgeClass: "bg-utility-success-50 text-utility-success-700",
    };
  }
  if (score >= 40) {
    return {
      label: "Unverified",
      badgeClass: "bg-utility-warning-50 text-utility-warning-700",
    };
  }
  return {
    label: "High risk",
    badgeClass: "bg-utility-error-50 text-utility-error-700",
  };
}
