import type { RateContract } from "@/types/procurement";

/** Active rate contract for a material (optionally scoped to a vendor). */
export function getActiveRC(
  rateContracts: RateContract[],
  materialCode: string,
  vendorCode?: string
): RateContract | null {
  return (
    rateContracts.find(
      (rc) =>
        rc.status === "active" &&
        rc.materialCode === materialCode &&
        (!vendorCode || rc.vendorCode === vendorCode)
    ) ?? null
  );
}

/** All rate contracts (any status) for a vendor. */
export function getRCsForVendor(rateContracts: RateContract[], vendorCode: string): RateContract[] {
  return rateContracts.filter((rc) => rc.vendorCode === vendorCode);
}
