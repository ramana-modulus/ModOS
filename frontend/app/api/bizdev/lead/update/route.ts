import { jsonError, jsonOk } from "@/lib/api-response";
import { updateLead, type CreateLeadInput } from "@/features/bizdev/server/repository";

export async function POST(req: Request) {
  let body: { id?: string } & Partial<CreateLeadInput>;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }
  const { id, ...patch } = body;
  if (!id) return jsonError("Lead id is required", 400);
  try {
    return jsonOk({ lead: updateLead(id, patch) });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Failed to update lead", 404);
  }
}
