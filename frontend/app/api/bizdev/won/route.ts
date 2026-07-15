import { jsonError, jsonOk } from "@/lib/api-response";
import { createWonProject } from "@/features/bizdev/server/repository";

export async function POST(req: Request) {
  let body: { id?: string };
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }
  if (!body.id) return jsonError("Lead id is required", 400);
  try {
    return jsonOk({ project: createWonProject(body.id) });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Failed to create won project", 404);
  }
}
