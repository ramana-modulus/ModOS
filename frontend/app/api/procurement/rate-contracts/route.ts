import { jsonOk } from "@/lib/api-response";
import { listRateContracts } from "@/features/procurement/server/repository";

export function GET() {
  return jsonOk(listRateContracts());
}
