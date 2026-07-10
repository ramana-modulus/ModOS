import { jsonError, jsonOk, readScope } from "@/lib/api-response";
import { getGrn, recordGrn } from "@/features/procurement/server/repository";

export function GET(req: Request) {
  const scope = readScope(req);
  if (!scope) return jsonError("Missing project / subProject", 400, "scope_required");
  return jsonOk(getGrn(scope.project, scope.subProject));
}

export async function POST(req: Request) {
  let body: { key?: string; qtyReceived?: number; receivedBy?: string };
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }
  if (!body.key || typeof body.qtyReceived !== "number") {
    return jsonError("key and numeric qtyReceived are required", 400);
  }
  try {
    return jsonOk(
      { grn: recordGrn(body.key, body.qtyReceived, body.receivedBy ?? "Site Store") },
      { status: 201 }
    );
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Failed to record GRN", 409);
  }
}
