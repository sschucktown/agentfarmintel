export function safeNumber(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;
  const cleaned = value.replace(/[$,%\s,]/g, "");
  if (!cleaned) return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

export function safeString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export function parseDate(value: unknown): Date | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function median(values: Array<number | null | undefined>): number | null {
  const numbers = values.filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  if (numbers.length === 0) return null;
  const sorted = [...numbers].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[middle];
  return (sorted[middle - 1] + sorted[middle]) / 2;
}

export function groupBy<T>(items: T[], keyFn: (item: T) => string): Record<string, T[]> {
  return items.reduce<Record<string, T[]>>((groups, item) => {
    const key = keyFn(item) || "Unknown";
    groups[key] = groups[key] ?? [];
    groups[key].push(item);
    return groups;
  }, {});
}

export function countBy<T>(items: T[], keyFn: (item: T) => string): Record<string, number> {
  return Object.fromEntries(Object.entries(groupBy(items, keyFn)).map(([key, group]) => [key, group.length]));
}

export function topN<T>(items: T[], count: number, scoreFn: (item: T) => number | null | undefined): T[] {
  return [...items]
    .sort((a, b) => (scoreFn(b) ?? Number.NEGATIVE_INFINITY) - (scoreFn(a) ?? Number.NEGATIVE_INFINITY))
    .slice(0, count);
}

export function formatCurrency(value: number | null | undefined): string {
  if (typeof value !== "number" || !Number.isFinite(value)) return "Not available";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

export function formatNumber(value: number | null | undefined): string {
  if (typeof value !== "number" || !Number.isFinite(value)) return "Not available";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value);
}

export function formatPercent(value: number | null | undefined): string {
  if (typeof value !== "number" || !Number.isFinite(value)) return "Not available";
  return new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 0 }).format(value);
}

export function firstString(...values: unknown[]): string | undefined {
  for (const value of values) {
    const str = safeString(value);
    if (str) return str;
  }
  return undefined;
}

export function firstNumber(...values: unknown[]): number | null {
  for (const value of values) {
    const num = safeNumber(value);
    if (num !== null) return num;
  }
  return null;
}
