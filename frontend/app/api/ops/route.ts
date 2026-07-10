import { jsonError, jsonOk, readScope } from "@/lib/api-response";
import { getOps } from "@/features/ops/server/repository";

export function GET(req: Request) {
  const scope = readScope(req);
  if (!scope) return jsonError("Missing project / subProject query params", 400);
  return jsonOk(getOps(scope.project, scope.subProject));
}
