import { jsonOk } from "@/lib/api-response";
import { listProjects } from "@/features/billing/server/repository";

export function GET() {
  return jsonOk({ projects: listProjects() });
}
