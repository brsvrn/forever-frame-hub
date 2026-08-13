export function parseBoundedIntegerDraft(
  rawValue: string,
  min: number,
  max: number,
): number | null {
  const value = rawValue.trim();
  if (!/^\d+$/.test(value)) return null;

  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < min || parsed > max) return null;
  return parsed;
}

export function normalizeBoundedIntegerDraft(
  rawValue: string,
  fallback: number,
  min: number,
  max: number,
): number {
  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed) || rawValue.trim() === "") return fallback;
  return Math.min(max, Math.max(min, Math.round(parsed)));
}
