import { jsonError, jsonOk } from "@/lib/api-response";
import { revertL1 } from "@/features/procurement/server/repository";

export async function POST(req: Request) {
  let body: { key?: string };
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }
  if (!body.key) return jsonError("key is required", 400);
  try {
    return jsonOk({ quotes: revertL1(body.key) });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Failed to revert L1", 409);
  }
}
