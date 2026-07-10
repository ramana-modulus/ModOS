import { fmtC } from "@/lib/format";

/** Compact register money — mirrors the prototype `_regMoney` (Cr / L / ₹). */
export function regMoney(v: number | null | undefined): string {
  const val = v || 0;
  const a = Math.abs(val);
  const sign = val < 0 ? "-" : "";
  if (a >= 1e7) return sign + "₹" + (a / 1e7).toFixed(2) + "Cr";
  if (a >= 1e5) return sign + "₹" + (a / 1e5).toFixed(1) + "L";
  return sign + "₹" + fmtC(Math.round(a));
}

/** Lakh display used by the KPI header (value / 1L, no ₹ prefix). */
export function lakh(v: number | null | undefined): string {
  return fmtC(Math.round(((v || 0) / 100000) * 10) / 10);
}
