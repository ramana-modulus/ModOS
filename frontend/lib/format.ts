/**
 * Number & currency formatters — faithful TypeScript ports of the prototype's
 * `fmtQ` / `fmtCompact` / `fmtC` / `fmtR` helpers. The app uses the Indian
 * numbering system (lakh / crore) throughout.
 */

const EM_DASH = "—";

/** Quantity / plain number with Indian digit grouping. Nullish → em-dash. */
export function fmtQ(n: number | null | undefined): string {
  if (n == null) return EM_DASH;
  return Number(n).toLocaleString("en-IN");
}

/** Compact Indian magnitude: 1.2Cr / 3.4L / 5.6k / plain. */
export function fmtCompact(value: number | null | undefined): string {
  const n = Number(value) || 0;
  if (n >= 1_00_00_000) return (n / 1_00_00_000).toFixed(n % 1_00_00_000 ? 1 : 0) + "Cr";
  if (n >= 1_00_000) return (n / 1_00_000).toFixed(n % 1_00_000 ? 1 : 0) + "L";
  if (n >= 1_000) return (n / 1_000).toFixed(n % 1_000 ? 1 : 0) + "k";
  return String(Math.round(n * 100) / 100);
}

/** Integer currency (no decimals), Indian grouping. Nullish/0-only guard → em-dash. */
export function fmtC(n: number | null | undefined): string {
  if (!n && n !== 0) return EM_DASH;
  return n.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

/** Currency with 2 decimals, Indian grouping. */
export function fmtR(n: number | null | undefined): string {
  if (!n && n !== 0) return EM_DASH;
  return n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** `₹` + integer currency — the most common money rendering in tables. */
export function fmtRupee(n: number | null | undefined): string {
  if (n == null) return EM_DASH;
  return "₹" + fmtC(n);
}
