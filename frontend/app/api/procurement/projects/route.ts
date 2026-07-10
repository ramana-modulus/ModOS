import { jsonOk } from "@/lib/api-response";
import { listProjects } from "@/features/procurement/server/repository";

export function GET() {
  return jsonOk({ projects: listProjects() });
}
