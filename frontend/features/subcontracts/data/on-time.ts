/**
 * Subcontractor on-time %. Genuinely independent operational data (WOs carry no
 * plan-vs-actual completion dates to derive it from), so tracked here like a real
 * vendor scorecard. Absent code = no track record yet (onboarding / no jobs).
 * Ported verbatim from `SC_SUBBIE_ONTIME`.
 */
export const SC_SUBBIE_ONTIME: Record<string, number> = {
  "MSC-001": 96, "MSC-002": 91, "MSC-003": 88, "MSC-004": 93, "MSC-006": 97, "MSC-007": 90,
  "MSC-008": 94, "MSC-009": 85, "MSC-010": 89, "MSC-011": 82, "MSC-012": 92, "MSC-013": 86,
  "MSC-014": 90, "MSC-015": 95, "MSC-016": 80, "MSC-017": 96, "MSC-018": 87, "MSC-019": 89,
  "MSC-020": 83, "MSC-021": 91, "MSC-022": 58,
};
