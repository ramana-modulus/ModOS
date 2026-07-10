import { jsonError, jsonOk, readScope } from "@/lib/api-response";
import { getProcWorkflow } from "@/features/procurement/server/repository";

export function GET(req: Request) {
  const scope = readScope(req);
  if (!scope) return jsonError("Missing project / subProject", 400, "scope_required");
  return jsonOk(getProcWorkflow(scope.project, scope.subProject));
}
