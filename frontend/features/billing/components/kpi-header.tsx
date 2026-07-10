import type { BillingKpis } from "@/features/billing/types";
import { lakh } from "./format";

/** The 5-up KPI strip: Contract Value · Claimed (AR) · Certified · SC AP · Margin. */
export function KpiHeader({ kpis }: { kpis: BillingKpis }) {
  const pctOfContract =
    kpis.contractValue > 0 ? ((kpis.arGross / kpis.contractValue) * 100).toFixed(1) : "0.0";
  const lSuffix = <span className="ml-0.5 text-t10 font-normal text-faint">L</span>;

  return (
    <div className="kr grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
      <div className="kp">
        <div className="kl">Contract Value</div>
        <div className="kv">
          ₹{lakh(kpis.contractValue)}
          {lSuffix}
        </div>
        <div className="ks">total contract</div>
      </div>

      <div className="kp">
        <div className="kl">Claimed (AR)</div>
        <div className="kv">
          ₹{lakh(kpis.arGross)}
          {lSuffix}
        </div>
        <div className="ks">
          {kpis.raLabel} · {pctOfContract}% of contract
        </div>
      </div>

      <div className="kp">
        <div className="kl">Certified by Client</div>
        <div className="kv cg">
          ₹{lakh(kpis.arCertified)}
          {lSuffix}
        </div>
        <div className="ks">received: ₹{lakh(kpis.arReceived)} L · overlay</div>
      </div>

      <div className="kp">
        <div className="kl">Subcontractor AP</div>
        <div className={kpis.apOutstanding > 0 ? "kv ca" : "kv cg"}>
          ₹{lakh(kpis.apOutstanding)}
          {lSuffix}
        </div>
        <div className="ks">
          line-item SC{kpis.apManpower > 0 ? ` · +₹${lakh(kpis.apManpower)}L manpower deferred` : ""}
        </div>
      </div>

      <div className="kp">
        <div className="kl">Margin (client − SC)</div>
        <div className={kpis.margin >= 0 ? "kv cg" : "kv ca"}>
          ₹{lakh(kpis.margin)}
          {lSuffix}
        </div>
        <div className="ks">{kpis.marginPct}% · client − subbie cost</div>
      </div>
    </div>
  );
}
