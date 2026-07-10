import { jsonOk } from "@/lib/api-response";
import { getLibrary } from "@/features/library/server/repository";

export function GET() {
  return jsonOk(getLibrary());
}
