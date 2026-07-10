import { jsonOk } from "@/lib/api-response";
import { getSettings } from "@/features/settings/server/repository";

export function GET() {
  return jsonOk(getSettings());
}
