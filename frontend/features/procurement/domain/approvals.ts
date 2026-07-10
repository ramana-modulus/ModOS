import type { Approver, ProcTeam } from "@/types/procurement";

export type ApproverRole = "manager" | "coo" | "ceo";

/**
 * Route a PO value to its approver role.
 *   ≤ ₹5L → manager · ≤ ₹25L → coo · > ₹25L → ceo
 */
export function approverRoleFor(value: number): ApproverRole {
  if (value <= 500000) return "manager";
  if (value <= 2500000) return "coo";
  return "ceo";
}

/** Resolve the approver record for a PO value against the team matrix. */
export function approverFor(team: ProcTeam, value: number): Approver {
  return team.approvers[approverRoleFor(value)];
}
