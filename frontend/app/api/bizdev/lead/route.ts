import { jsonError, jsonOk } from "@/lib/api-response";
import { createLead, type CreateLeadInput } from "@/features/bizdev/server/repository";

export async function POST(req: Request) {
  let body: CreateLeadInput;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }
  if (!body.client || !body.desc) return jsonError("Client and Description are required", 400);
  return jsonOk({ lead: createLead(body) }, { status: 201 });
}
