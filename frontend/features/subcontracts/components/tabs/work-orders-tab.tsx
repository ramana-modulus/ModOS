"use client";

import { fmtC, fmtQ } from "@/lib/format";
import type { ScWorkOrderRow, ScWorkOrdersView } from "@/features/subcontracts/api";
import { CatBanner, Chip, Code } from "../ui-bits";

const GRID = "128px 66px minmax(150px,1fr) 78px 62px 92px 104px 128px 132px";

function groupByCat(rows: ScWorkOrderRow[]) {
  const order: string[] = [];
  const grp: Record<string, ScWorkOrderRow[]> = {};
  for (const r of rows) {
    if (!order.includes(r.catId)) order.push(r.catId);
    (grp[r.catId] ??= []).push(r);
  }
  return order.map((catId) => ({ catId, label: grp[catId]![0]!.cat, rows: grp[catId]! }));
}

export function WorkOrdersTab({ data }: { data: ScWorkOrdersView }) {
  const { rows, kpis } = data;
  if (rows.length === 0)
    return (
      <div className="rounded-lg bg-[#F5F4F2] p-8 text-center text-t11 text-faint">
        No work orders raised yet for this sub-project. Pick an L1 subcontractor in <strong style={{ color: "#0F766E" }}>Comparative / L1</strong> and
        raise the WO from there.
      </div>
    );

  const groups = groupByCat(rows);

  return (
    <div>
      <div className="mb-3 grid grid-cols-5 gap-2.5">
        <div className="kp">
          <div className="kl">WOs Raised</div>
          <div className="kv">{kpis.raised}</div>
          <div className="ks">₹{(kpis.totalValue / 100000).toFixed(2)}L total value</div>
        </div>
        <div className="kp">
          <div className="kl">Pending Approval</div>
          <div className={"kv " + (kpis.pendingApproval > 0 ? "ca" : "cg")}>{kpis.pendingApproval}</div>
          <div className="ks">awaiting value-based sign-off</div>
        </div>
        <div className="kp">
          <div className="kl">Released to Ops</div>
          <div className={"kv " + (kpis.released === kpis.raised ? "cg" : "cac")}>
            {kpis.released}/{kpis.raised}
          </div>
          <div className="ks">issued for execution</div>
        </div>
        <div className="kp">
          <div className="kl">RA In Progress</div>
          <div className="kv cg">{kpis.raStarted}</div>
          <div className="ks">measurement started</div>
        </div>
        <div className="kp">
          <div className="kl">Variations</div>
          <div className={"kv " + (kpis.variations > 0 ? "ca" : "cg")}>{kpis.variations}</div>
          <div className="ks">WOs with revision history</div>
        </div>
      </div>

      <div className="tw overflow-x-auto">
        <div className="th" style={{ gridTemplateColumns: GRID }}>
          <span>WO #</span>
          <span>Code</span>
          <span>Subcontractor</span>
          <span>Qty</span>
          <span>Rate</span>
          <span>Value</span>
          <span>Approver</span>
          <span>Status</span>
          <span>Measurement</span>
        </div>
        {groups.map((g) => (
          <div key={g.catId}>
            <CatBanner label={g.label} count={g.rows.length} noun="WO" />
            {g.rows.map((r) => (
              <div key={r.key} className="tr items-center" style={{ gridTemplateColumns: GRID }}>
                <span>
                  <div className="font-mono text-t10 font-semibold text-ink">{r.woNo}</div>
                  {r.amendmentCount > 0 && (
                    <div className="text-t9" style={{ color: "#854F0B" }}>
                      ⟲ Varied ×{r.amendmentCount}
                    </div>
                  )}
                  {r.materialIssued && (
                    <div className="text-t9" style={{ color: "#854F0B" }} title="MH issues material — back-charge on excess">
                      ⚠ MH material
                    </div>
                  )}
                </span>
                <Code>{r.code}</Code>
                <span>
                  <div className="text-t11 font-medium text-ink">{r.subbieName}</div>
                  <div className="ts text-t9 text-faint">{r.packageName}</div>
                </span>
                <span className="text-t11 text-ink">
                  {fmtQ(r.qty)} {r.uom}
                </span>
                <span className="text-t11 text-muted">₹{r.rate}</span>
                <span className="text-t11 font-medium text-ink">₹{fmtC(r.value)}</span>
                <span>
                  <div className="flex flex-col gap-px">
                    <span className="text-t10 font-medium" style={{ color: r.approver.pending ? "#854F0B" : "#3B6D11" }}>
                      {r.approver.pending ? "⏳" : "✓"} {r.approver.who.split(" ")[0]}
                    </span>
                    <span className="text-t9 text-faint">{r.approver.thresholdLabel}</span>
                  </div>
                </span>
                <span>
                  <Chip label={r.statusChip.label} bg={r.statusChip.bg} fg={r.statusChip.fg} />
                </span>
                <span>
                  {r.measurement ? (
                    <>
                      <Chip
                        label={`${r.measurement.full ? "✓ " : ""}${fmtQ(r.measurement.cum)}/${fmtQ(r.measurement.woQty)} in ${r.measurement.raCount} RA`}
                        bg={r.measurement.full ? "#EAF3DE" : "#FAEEDA"}
                        fg={r.measurement.full ? "#3B6D11" : "#854F0B"}
                      />
                      <div className="mt-0.5 text-t9 text-faint">to {r.measurement.periodTo}</div>
                    </>
                  ) : (
                    <span className="text-t9 text-faint">—</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="mt-2.5 flex items-center gap-2 rounded-md px-3 py-2.5 text-t10 text-muted" style={{ background: "#FBF9F6", border: "0.5px solid #E5E4E0" }}>
        <i className="ti ti-external-link" style={{ fontSize: 13, color: "#0F766E" }} />
        <span>
          <strong>Lifecycle:</strong> WO Raised → Value-based Approval → Released to Ops → RA Measurement (certified) → SC Bill → Retention → Finance
          Payment.
        </span>
      </div>
    </div>
  );
}
