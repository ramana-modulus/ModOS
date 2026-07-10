import { jsonOk, readScope } from "@/lib/api-response";
import { getQAQC } from "@/features/qaqc/server/repository";

export function GET(req: Request) {
  const scope = readScope(req);
  if (scope) return jsonOk(getQAQC(scope.project, scope.subProject));
  return jsonOk(getQAQC());
}
