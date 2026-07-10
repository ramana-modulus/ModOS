"use client";

import { useState } from "react";
import { fmtC, fmtQ } from "@/lib/format";
import { Pill } from "@/components/ui/badge";
import type { BillingView, CabinRollup, RaClientGroup } from "@/features/billing/types";
import { regMoney } from "../format";
import { RouteBar } from "../route-bar";

function CabinSummary({ rollup }: { rollup: CabinRollup }) {
  const stg = (label: string, o: { n: number; net: number }, col: string) => (
    <div className="min-w-[92px] flex-1">
      <div className="text-t9 font-semibold uppercase tracking-[0.4px]" style={{ color: col }}>
        {label}
      </div>
      <div className="mt-0.5 text-t14 font-semibold text-ink">₹{fmtC(o.net)}</div>
      <div className="text-t9 text-faint">
        {o.n} cabin{o.n === 1 ? "" : "s"}
      </div>
    </div>
  );
  return (
    <div className="mb-3 overflow-hidden rounded-lg border-[0.5px] border-line" style={{ borderLeft: "2.5px solid #185FA5" }}>
      <div className="flex items-center gap-2.5 border-b-[0.5px] border-line px-3 py-2.5" style={{ background: "#F7FAFD" }}>
        <span style={{ color: "#185FA5" }}>🏠</span>
        <span className="text-t13 font-semibold text-ink">Cabin-scope RAs</span>
        <Pill cls="pb">Billed per cabin</Pill>
        <span className="text-t9 text-faint">
          {rollup.units} cabins · each raised, certified &amp; paid on its own RA
        </span>
      </div>
      <div className="flex flex-wrap gap-3.5 px-3 py-2.5">
        {stg("Unbilled (cleared)", rollup.unbilled, "#6B6A68")}
        {stg("Billed", rollup.billed, "#C9892E")}
        {stg("Certified", rollup.certified, "#185FA5")}
        {stg("Paid", rollup.paid, "#3B6D11")}
      </div>
      <div className="border-t-[0.5px] border-[#F0EFEB] px-3 py-2 text-t9 text-faint" style={{ background: "#FAFAF8" }}>
        Cabin-scope work (steel, cladding, MEP…) is billed one RA per cabin.
        {rollup.pending > 0
          ? ` ${rollup.pending} cabin${rollup.pending === 1 ? "" : "s"} not yet QC-cleared (withheld until they pass).`
          : ""}{" "}
        The sub-project RAs below carry prelims only.
      </div>
    </div>
  );
}

function RaGroup({ group }: { group: RaClientGroup }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="mb-3 overflow-hidden rounded-lg border-[0.5px] border-line" style={{ borderLeft: `2.5px solid ${group.accent}` }}>
      <div className="flex cursor-pointer items-center gap-2.5 px-3 py-2.5" style={{ background: "#FAFAF8" }} onClick={() => setOpen((o) => !o)}>
        <span className="text-faint">{open ? "▾" : "▸"}</span>
        <span className="text-t13 font-semibold text-ink">{group.cycle}</span>
        <Pill cls={group.pill}>{group.statusLabel}</Pill>
        <span className="text-t9 text-faint">
          {group.lines.length} line{group.lines.length === 1 ? "" : "s"}
        </span>
        <span className="ml-auto text-t12 font-semibold text-ink">
          ₹{fmtC(group.net)}
          <span className="text-t9 font-normal text-faint"> net claim</span>
        </span>
      </div>
      {open && (
        <>
          {group.lines.length === 0 ? (
            <div className="border-t-[0.5px] border-[#F0EFEB] px-3 py-2.5 text-t10 text-faint">
              No client-billable work lines in this RA (material is vendor-AP only).
            </div>
          ) : (
            group.lines.map((l) => (
              <div key={l.code} className="flex items-center gap-2.5 border-t-[0.5px] border-[#F0EFEB] px-3 py-2">
                <span className="min-w-[74px] font-mono text-t10 text-muted">{l.code}</span>
                <span className="flex-1 text-t11 text-ink">{l.name}</span>
                <span className="text-t10 text-faint">
                  {l.isMilestone ? "milestone / lump-sum" : `${fmtQ(l.measuredQty)} ${l.uom} × ₹${fmtC(l.clientRate || 0)}`}
                </span>
                <span className="text-t11 font-semibold text-ink">₹{fmtC(l.value)}</span>
              </div>
            ))
          )}
          <div className="flex flex-wrap items-center gap-4 border-t-[0.5px] border-[#F0EFEB] px-3 py-2.5" style={{ background: "#FAFAF8" }}>
            <span className="text-t10 text-muted">Gross <strong className="text-ink">₹{fmtC(group.gross)}</strong></span>
            <span className="text-t10 text-muted">Retention 5% <strong style={{ color: "#A32D2D" }}>−₹{fmtC(group.retention)}</strong></span>
            <span className="text-t10 text-muted">GST 18% <strong className="text-ink">+₹{fmtC(group.gst)}</strong></span>
            <span className="text-t10 text-muted">Net <strong className="text-ink">₹{fmtC(group.net)}</strong></span>
          </div>
        </>
      )}
    </div>
  );
}

export function ClientRaTab({ data }: { data: BillingView }) {
  const cabinized = data.units > 1;
  const hoPct = data.config.handoverMilestonePct;
  return (
    <>
      <RouteBar
        inherit="Measurement spine — client face (work lines)"
        route="Client (AR invoice) → Finance (receipt)"
        note="generated from measurement; cannot diverge from measured qty"
      />

      <div className="mb-2.5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled
          className="cursor-not-allowed rounded border-[0.5px] px-2 py-1 text-t10 opacity-55"
          style={{ borderColor: "#D8D7D4", color: "#6B6A68" }}
          title="Locked until the client FAC is signed in QA/QC → Handover"
        >
          🔒 Handover Claim ({hoPct}%) — locked
        </button>
      </div>

      <div className="mb-2.5 rounded-md border-[0.5px] px-3 py-2 text-t10" style={{ background: "#FBF1E0", borderColor: "#E5C9A0", color: "#854F0B" }}>
        🔒 The <b>{hoPct}% handover milestone</b> claim is locked until the client FAC is signed in QA/QC → Handover.
      </div>

      {cabinized && (
        <div className="mb-2.5 rounded-md border-[0.5px] px-3 py-2 text-t10" style={{ background: "#EAF3FB", borderColor: "#185FA5", color: "#185FA5" }}>
          🏢 Cabinized sub-project (<b>{data.units} units</b>) — cabin-scope work is billed <b>per-cabin</b>. The sub-project RAs below carry <b>prelims only</b> (mobilization, design).
        </div>
      )}

      {cabinized && data.cabinRollup && <CabinSummary rollup={data.cabinRollup} />}

      {data.raClient.length === 0 ? (
        <div className="rounded-lg border-[0.5px] border-dashed border-line bg-white py-7 text-center text-t11 text-faint">
          No RA cycle in the spine yet.
        </div>
      ) : (
        data.raClient.map((g) => <RaGroup key={g.cycle} group={g} />)
      )}

      <div className="mt-3 rounded-md border-[0.5px] border-line bg-[#FBF9F6] px-3 py-2 text-t10 text-muted">
        <strong>How RA bills auto-populate:</strong> Cum Done is pulled live from Ops DPR. Only line items with QC sign-off are claimable. This bill = Cum Done − Prev Billed. Retention 5%, GST 18% applied per Modulus standard. The <b>handover milestone</b> claim is a separate, FAC-gated client claim.
        {data.register.arCertified > 0 && (
          <span> Certified to date: {regMoney(data.register.arCertified)}.</span>
        )}
      </div>
    </>
  );
}
