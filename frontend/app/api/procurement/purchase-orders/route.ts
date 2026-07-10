import { jsonError, jsonOk, readScope } from "@/lib/api-response";
import { generatePO, getPos } from "@/features/procurement/server/repository";

export function GET(req: Request) {
  const scope = readScope(req);
  if (!scope) return jsonError("Missing project / subProject", 400, "scope_required");
  return jsonOk(getPos(scope.project, scope.subProject));
}

export async function POST(req: Request) {
  let body: { project?: string; subProject?: string; key?: string; quoteId?: string };
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }
  if (!body.project || !body.subProject || !body.key) {
    return jsonError("project, subProject and key are required", 400);
  }
  try {
    return jsonOk({ po: generatePO(body.project, body.subProject, body.key, body.quoteId) }, {
      status: 201,
    });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Failed to generate PO", 409);
  }
}
