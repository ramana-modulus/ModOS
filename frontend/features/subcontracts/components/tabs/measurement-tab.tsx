"use client";

import { fmtQ } from "@/lib/format";
import type { ScMeasurementCard, ScMeasurementView } from "@/features/subcontracts/api";
import { CatBanner, Code } from "../ui-bits";

const BILL_PILL: Record<string, { bg: string; fg: string; l: string }> = {
  matched: { bg: "#E6F5F3", fg: "#0F766E", l: "Matched" },
  discrepancy: { bg: "#FCEBEB", fg: "#A32D2D", l: "⚠ Held" },
  forwarded_to_finance: { bg: "#F3E8FB", fg: "#7B1FA2", l: "✓ Forwarded" },
  paid: { bg: "#EAF3DE", fg: "#3B6D11", l: "✓ Paid" },
};

function Card({ c }: { c: ScMeasurementCard }) {
  return (
    <div className="mb-2.5 overflow-hidden rounded-lg border-[0.5px] border-line bg-surface">
      <div className="flex items-center justify-between gap-2.5 border-b-[0.5px] border-[#EFEEEC] bg-[#FBF9F6] px-3 py-2">
        <div className="min-w-0">
          <div className="text-t11 text-ink">
            <Code>{c.code}</Code> {c.name}
          </div>
          <div className="mt-px text-t9 text-faint">
            {c.woNo} · {c.subbieName} · WO {fmtQ(c.woQty)} {c.uom} @ ₹{c.rate}
            {c.released ? "" : " · WO pending appr."}
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="text-right">
            <div className="text-t9 uppercase tracking-[0.4px] text-faint">Done to date</div>
            <div className="text-t11 font-medium text-ink">
              {fmtQ(c.cum)} / {fmtQ(c.woQty)} {c.uom}
            </div>
          </div>
          <div className="h-[7px] w-[70px] overflow-hidden rounded bg-[#EFEEEC]">
            <div className="h-full" style={{ background: "#0F766E", width: `${c.pct}%` }} />
          </div>
          <span className="w-[26px] text-right text-t10 text-muted">{c.pct}%</span>
        </div>
      </div>

      {c.released && (
        <div className="border-t-[0.5px] border-[#F2F1EF] bg-[#FCFBF9] px-3 py-1.5">
          <div className="text-t9 uppercase tracking-[0.4px] text-faint">
            <i className="ti ti-clipboard-list" style={{ verticalAlign: -1 }} /> Daily execution log · {fmtQ(c.execTot)} {c.uom} executed
            {c.uncert > 0 && (
              <span style={{ color: "#854F0B" }}>
                {" "}
                · {fmtQ(c.uncert)} uncertified
              </span>
            )}
          </div>
          {c.execLog.length > 0 ? (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {c.execLog.map((e, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 rounded-[9px] border-[0.5px] border-[#EAE8E4] bg-surface px-2 py-0.5 text-t9"
                  style={{ color: "#3F3E3C" }}
                >
                  <span className="text-faint">{e.date}</span>{" "}
                  <strong>
                    {fmtQ(e.qty)} {c.uom}
                  </strong>
                </span>
              ))}
            </div>
          ) : (
            <div className="text-t9 text-faint">No site execution logged yet.</div>
          )}
        </div>
      )}

      {c.measurements.length > 0 ? (
        c.measurements.map((r) => (
          <div key={r.ra} className="flex items-center justify-between gap-2.5 border-t-[0.5px] border-[#F2F1EF] px-3 py-1.5">
            <div className="flex min-w-0 flex-wrap items-center gap-2.5">
              <span className="rounded-[9px] px-2 py-px font-mono text-t9 font-semibold" style={{ color: "#0F766E", background: "#E6F5F3" }}>
                {r.isMach ? "Log" : "RA"}-{String(r.ra).padStart(2, "0")}
              </span>
              <span className="text-t10 text-ink">
                <strong>
                  {fmtQ(r.qtyThis)} {c.uom}
                </strong>{" "}
                <span className="text-faint">in this RA</span>
              </span>
              <span className="text-t9 text-faint">
                wk {r.ra} · to {r.periodTo} · {r.certBy}
              </span>
            </div>
            <div>
              {r.bill ? (
                <span className="flex items-center gap-1.5">
                  <span
                    className="rounded-[9px] px-1.5 py-0.5 text-t9 font-semibold"
                    style={{ background: (BILL_PILL[r.bill.status] ?? { bg: "#F5F4F2" }).bg, color: (BILL_PILL[r.bill.status] ?? { fg: "#9B9894" }).fg }}
                  >
                    {(BILL_PILL[r.bill.status] ?? { l: r.bill.status }).l}
                  </span>
                  <span className="font-mono text-t9 font-semibold" style={{ color: "#0F766E" }}>
                    {r.bill.billId}
                  </span>
                </span>
              ) : (
                <span className="whitespace-nowrap text-t9" style={{ color: "#854F0B" }}>
                  measured · awaiting bill
                </span>
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="px-3 py-2 text-t10 text-faint">
          No RA yet — {c.released ? "will be picked up in the next Raise RA." : "awaiting work-order release."}
        </div>
      )}
    </div>
  );
}

function groupByCat(cards: ScMeasurementCard[]) {
  const order: string[] = [];
  const grp: Record<string, ScMeasurementCard[]> = {};
  for (const c of cards) {
    if (!order.includes(c.catId)) order.push(c.catId);
    (grp[c.catId] ??= []).push(c);
  }
  return order.map((catId) => ({ catId, label: grp[catId]![0]!.cat, cards: grp[catId]! }));
}

export function MeasurementTab({ data }: { data: ScMeasurementView }) {
  const groups = groupByCat(data.cards);
  return (
    <div>
      <div className="mb-2.5 flex items-center justify-between gap-3 rounded-lg px-3 py-2.5" style={{ background: "#E6F5F3", border: "0.5px solid #99D6CC" }}>
        <div className="text-t11" style={{ color: "#0B5C52" }}>
          <i className="ti ti-calendar-week" style={{ verticalAlign: -2 }} /> Weekly running-account billing.{" "}
          {data.raisedWeeks.length
            ? "Raised so far: " + data.raisedWeeks.map((w) => "RA-" + String(w).padStart(2, "0")).join(", ") + "."
            : "No RA raised yet."}{" "}
          Next cycle: <strong>RA-{String(data.nextWeek).padStart(2, "0")} (Week {data.nextWeek})</strong>.
        </div>
        <span className="rounded-md px-3 py-1.5 text-t11 font-semibold text-white" style={{ background: "#0F766E" }}>
          <i className="ti ti-bolt" /> Raise RA — Week {data.nextWeek}
        </span>
      </div>

      <div className="mb-2.5 flex gap-2 rounded px-2.5 py-2 text-t10" style={{ background: "#E0F2FE", borderLeft: "3px solid #0EA5E9", color: "#075985" }}>
        <i className="ti ti-info-circle" style={{ verticalAlign: -2 }} />
        <span>
          <strong>RA = the weekly billing cycle</strong> (shared across line items), not a per-item counter. Each Raise RA captures the week&rsquo;s
          completed quantity across line items and raises <strong>one running-account bill per subcontractor</strong>.
        </span>
      </div>

      {groups.length === 0 ? (
        <div className="p-6 text-t12 text-muted">No work orders to measure yet. Raise &amp; release a work order first.</div>
      ) : (
        groups.map((g) => (
          <div key={g.catId}>
            <CatBanner label={g.label} count={g.cards.length} noun="package" />
            {g.cards.map((c) => (
              <Card key={c.key} c={c} />
            ))}
          </div>
        ))
      )}
    </div>
  );
}
