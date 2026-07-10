import { jsonOk } from "@/lib/api-response";
import { getInbox } from "@/features/inbox/server/repository";

export function GET() {
  return jsonOk(getInbox());
}
