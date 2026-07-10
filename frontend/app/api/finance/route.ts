import { jsonOk } from "@/lib/api-response";
import { getFinance } from "@/features/finance/server/repository";

/** GET /api/finance?project=P1&subProject=SP1 — full finance payload for a scope. */
export function GET(req: Request) {
  const url = new URL(req.url);
  const project = url.searchParams.get("project") ?? "P1";
  const subProject = url.searchParams.get("subProject") ?? "SP1";
  return jsonOk(getFinance(project, subProject));
}
