import { jsonOk } from "@/lib/api-response";
import { getEstimation } from "@/features/estimation/server/repository";

export function GET(req: Request) {
  const project = new URL(req.url).searchParams.get("project") ?? undefined;
  return jsonOk(getEstimation(project));
}
