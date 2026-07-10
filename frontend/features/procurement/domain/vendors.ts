import type { Grn, ProcKey, PurchaseOrder, VendorPerformance } from "@/types/procurement";

/**
 * Compute a vendor scorecard from their POs + GRNs — faithful port of
 * `getVendorPerformance`. On-time %, quality avg and rate stability are the
 * prototype's demo proxies (documented inline).
 */
export function getVendorPerformance(
  vendorCode: string,
  pos: Record<ProcKey, PurchaseOrder>,
  grns: Record<ProcKey, Grn[]>
): VendorPerformance {
  const allPOs = Object.entries(pos).filter(([, po]) => po.vCode === vendorCode);
  if (allPOs.length === 0) {
    return {
      poCount: 0,
      totalSpend: 0,
      onTimePct: null,
      qualityAvg: null,
      rateStability: null,
      paymentCompliance: "—",
      last90Spend: 0,
    };
  }

  let onTime = 0;
  let late = 0;
  let totalSpend = 0;
  let deliveredPOs = 0;
  let qualitySum = 0;
  let qualityCount = 0;
  const rates: number[] = [];

  allPOs.forEach(([k, po]) => {
    totalSpend += po.value || 0;
    rates.push(po.rate);
    if (po.status === "delivered" || po.status === "partial_delivery") {
      deliveredPOs++;
      const poGrns = grns[k] || [];
      if (poGrns.length > 0) {
        if (po.status === "delivered") onTime++;
        else late++;
      }
    }
    // Quality proxy: assume 95% acceptance → 4.5★ per PO.
    qualitySum += 4.5;
    qualityCount++;
  });
  void late;

  const onTimePct = deliveredPOs > 0 ? Math.round((onTime / deliveredPOs) * 100) : null;
  const qualityAvg = qualityCount > 0 ? (qualitySum / qualityCount).toFixed(1) : null;
  const rateStability =
    rates.length > 1
      ? (1 - (Math.max(...rates) - Math.min(...rates)) / Math.max(...rates)) * 100
      : 100;

  return {
    poCount: allPOs.length,
    totalSpend,
    onTimePct,
    qualityAvg,
    rateStability: typeof rateStability === "number" ? rateStability.toFixed(0) : rateStability,
    paymentCompliance: "—",
    last90Spend: totalSpend,
  };
}
