/** Real app routes a notification/task target may point at. */
const ROUTES = new Set([
  "projects", "library", "bizdev", "estimation", "planning", "contracts", "engineering",
  "procurement", "subcontracts", "ops", "qaqc", "billing", "finance", "hr", "settings",
  "notifications", "mytasks",
]);

/** Aliases for prototype target strings that aren't literal route names. */
const ALIAS: Record<string, string> = { bd: "bizdev", "qa/qc": "qaqc" };

/**
 * Resolve a notification/task `actionTarget`/`target` (e.g. "estimation_assign",
 * "estimation_workflow", "bd") to a valid app route. Falls back to /projects.
 */
export function moduleHref(target: string | undefined): string {
  const raw = (target ?? "projects").toLowerCase();
  const aliased = ALIAS[raw] ?? raw;
  const base = ALIAS[aliased] ?? aliased.split("_")[0] ?? "projects";
  const resolved = ALIAS[base] ?? base;
  return ROUTES.has(resolved) ? `/${resolved}` : "/projects";
}
