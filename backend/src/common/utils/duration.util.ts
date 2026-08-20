const UNIT_MS: Record<string, number> = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

// Parses simple duration strings like "7d", "12h", "30m", "45s" (or a bare
// number of seconds) into milliseconds — covers the formats JWT_EXPIRES_IN
// actually uses without pulling in a dependency for it.
export function parseDurationToMs(
  duration: string,
  fallbackMs: number,
): number {
  const match = /^(\d+)([smhd])$/.exec(duration.trim());
  if (match) {
    const [, value, unit] = match;
    return Number(value) * UNIT_MS[unit];
  }
  const seconds = Number(duration);
  return Number.isFinite(seconds) ? seconds * 1000 : fallbackMs;
}
