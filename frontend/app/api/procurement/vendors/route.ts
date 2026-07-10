import { jsonOk } from "@/lib/api-response";
import { listVendors } from "@/features/procurement/server/repository";

export function GET() {
  return jsonOk(listVendors());
}
