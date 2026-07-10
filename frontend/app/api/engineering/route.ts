import { jsonError, jsonOk, readScope } from "@/lib/api-response";
import { getEngineering } from "@/features/engineering/server/repository";

export function GET(req: Request) {
  const scope = readScope(req);
  if (!scope) return jsonError("Missing project / subProject", 400);
  return jsonOk(getEngineering(scope.project, scope.subProject));
}
