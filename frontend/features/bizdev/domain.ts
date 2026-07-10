import type { Lead } from "@/features/bizdev/types";

const MONTHS: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};

/** Parse a `DD MMM YYYY` date string to a Date (null if malformed). */
export function parseLeadDate(s: string | null): Date | null {
  if (!s) return null;
  const parts = s.split(" ");
  if (parts.length < 3) return null;
  const month = MONTHS[parts[1]!];
  if (month === undefined) return null;
  return new Date(parseInt(parts[2]!, 10), month, parseInt(parts[0]!, 10));
}

/** Whole-day difference between two `DD MMM YYYY` strings (clamped at 0). */
export function daysBetween(d1: string | null, d2: string | null): number {
  const a = parseLeadDate(d1);
  const b = parseLeadDate(d2);
  if (!a || !b) return 0;
  return Math.max(0, Math.round((b.getTime() - a.getTime()) / 86400000));
}

/** Days since the lead entered its current stage. */
export function getDaysInStage(lead: Lead, today: string): number {
  if (!lead.stageHistory.length) return 0;
  return daysBetween(lead.stageHistory[lead.stageHistory.length - 1]!.enteredAt, today);
}

/** Total lead age (days since first stage entry / creation). */
export function getDaysSinceCreated(lead: Lead, today: string): number {
  if (lead.stageHistory.length) return daysBetween(lead.stageHistory[0]!.enteredAt, today);
  return daysBetween(lead.date, today);
}

/** Whether the estimation costing round-trip has come back for this lead. */
export function isCostingReceived(lead: Lead): boolean {
  return Boolean(lead.costingSubmitted);
}
