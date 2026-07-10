import { jsonOk } from "@/lib/api-response";
import { getBizDev } from "@/features/bizdev/server/repository";

export function GET() {
  return jsonOk(getBizDev());
}
