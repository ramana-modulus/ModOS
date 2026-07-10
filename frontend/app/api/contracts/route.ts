import { jsonOk } from "@/lib/api-response";
import { getContracts } from "@/features/contracts/server/repository";

export function GET() {
  return jsonOk(getContracts());
}
