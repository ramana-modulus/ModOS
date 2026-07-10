import { jsonOk, readScope } from "@/lib/api-response";
import { getPlanning } from "@/features/planning/server/repository";

export function GET(req: Request) {
  const scope = readScope(req);
  // Planning is pinned to P1.SP1 in the prototype; scope is accepted but the
  // demo data set is the same. Missing scope simply falls back to the default.
  return jsonOk(getPlanning(scope?.project, scope?.subProject));
}
