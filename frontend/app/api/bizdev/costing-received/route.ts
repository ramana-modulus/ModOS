import { jsonError, jsonOk } from "@/lib/api-response";
import { markCostingReceived } from "@/features/bizdev/server/repository";

export async function POST(req: Request) {
  let body: { id?: string };
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }
  if (!body.id) return jsonError("Lead id is required", 400);
  try {
    return jsonOk({ lead: markCostingReceived(body.id) });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Failed to mark costing received", 404);
  }
}
