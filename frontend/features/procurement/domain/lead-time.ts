import type { LeadTimeBucket } from "@/types/procurement";

/** Bucket a lead time (days) — 0–5 fast, 5–10 medium, 10+ slow. */
export function getLeadTimeBucket(days: number | null | undefined): LeadTimeBucket {
  if (days === null || days === undefined) return "unknown";
  if (days <= 5) return "fast";
  if (days <= 10) return "medium";
  return "slow";
}
