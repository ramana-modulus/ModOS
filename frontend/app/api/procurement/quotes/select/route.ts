import { jsonError, jsonOk } from "@/lib/api-response";
import { selectL1 } from "@/features/procurement/server/repository";

export async function POST(req: Request) {
  let body: { key?: string; quoteId?: string };
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }
  if (!body.key || !body.quoteId) return jsonError("key and quoteId are required", 400);
  try {
    return jsonOk({ quotes: selectL1(body.key, body.quoteId) });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Failed to select L1", 404);
  }
}
