export function formatPrice(price: string | number, listingType: string) {
  const n = Number(price);
  const suffix = listingType === "RENT" ? "/yr" : "";
  if (n >= 1_000_000)
    return `₦${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M${suffix}`;
  return `₦${n.toLocaleString()}${suffix}`;
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function formatAreaKey(key: string) {
  return key.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
