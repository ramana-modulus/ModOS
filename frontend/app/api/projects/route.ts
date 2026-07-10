import { jsonOk } from "@/lib/api-response";
import { getProjects } from "@/features/projects/server/repository";

export function GET() {
  return jsonOk(getProjects());
}
