/**
 * Shared domain types used across the shell. Feature-specific types live in
 * their own module (e.g. `types/procurement.ts`).
 */

export type DepartmentKey =
  | "projects"
  | "library"
  | "bizdev"
  | "estimation"
  | "planning"
  | "contracts"
  | "engineering"
  | "procurement"
  | "subcontracts"
  | "ops"
  | "qaqc"
  | "billing"
  | "finance"
  | "hr"
  | "settings"
  | "notifications"
  | "mytasks";

/** A generic maker → checker → approver workflow status. */
export type WorkflowStatus = "pending" | "in_progress" | "active" | "done" | "rejected";

/** Semantic status used by pills/badges across modules. */
export type StatusTone = "success" | "warn" | "danger" | "info" | "neutral" | "accent";
