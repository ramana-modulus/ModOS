import { jsonError, jsonOk } from "@/lib/api-response";
import { moveStage } from "@/features/bizdev/server/repository";

export async function POST(req: Request) {
  let body: { id?: string; toStage?: string };
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }
  if (!body.id || !body.toStage) return jsonError("id and toStage are required", 400);
  try {
    return jsonOk({ lead: moveStage(body.id, body.toStage) });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Failed to move stage", 400);
  }
}
