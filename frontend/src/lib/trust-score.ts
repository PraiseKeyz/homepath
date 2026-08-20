export function getScoreBand(score: number) {
  if (score >= 70) {
    return {
      label: "Likely legitimate",
      badgeClass: "bg-utility-success-50 text-utility-success-700",
      color: "#17b26a",
    };
  }
  if (score >= 40) {
    return {
      label: "Unverified",
      badgeClass: "bg-utility-warning-50 text-utility-warning-700",
      color: "#f79009",
    };
  }
  return {
    label: "High risk",
    badgeClass: "bg-utility-error-50 text-utility-error-700",
    color: "#f04438",
  };
}

export const UNCHECKED_MARKER_COLOR = "#717680";
