"use client";

import { useState } from "react";
import { fmtC, fmtCompact, fmtQ } from "@/lib/format";
import type { ScPackagesView } from "@/features/subcontracts/api";
import { CatBanner, Chip, Code, InfoBanner, TypePill, VarPill } from "../ui-bits";

const SCGRID = "76px minmax(220px,1fr) 60px 40px 84px 92px 60px 100px 130px";

type Filter = "all" | "manpower" | "lineitem" | "machinery";

export function PackagesTab({ data }: { data: ScPackagesView }) {
  const [filter, setFilter] = useState<Filter>("all");
  const roundQ = (x: number) => (Math.abs(x) >= 100 ? Math.round(x) : Math.round(x * 100) / 100);

  const chips: { val: Filter; label: string; show: boolean }[] = [
    { val: "all", label: "All", show: true },
    { val: "manpower", label: "Labour SC", show: true },
    { val: "lineitem", label: "Composite SC", show: true },
    { val: "machinery", label: "Machinery SC", show: data.counts.machinery > 0 },
  ];

  const groups = data.groups
    .map((g) => ({ ...g, rows: filter === "all" ? g.rows : g.rows.filter((r) => r.scType === filter) }))
    .filter((g) => g.rows.length > 0);

  return (
    <div>
      <InfoBanner>
        <i className="ti ti-info-circle" style={{ verticalAlign: -2 }} /> Packages derive from the Planning kickoff make-vs-buy
        decision. <strong>Labour SC</strong> = subbie supplies labour, MH issues material. <strong>Composite SC</strong> = subbie
        supplies material + labour. <strong>Machinery SC</strong> = plant hire, billed on usage.
      </InfoBanner>

      {/* Filter chips */}
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <span className="mr-0.5 text-t9 uppercase tracking-[0.4px] text-faint">Filter:</span>
        {chips
          .filter((c) => c.show)
          .map((c) => {
            const on = filter === c.val;
            return (
              <button
                key={c.val}
                type="button"
                onClick={() => setFilter(c.val)}
                className="cursor-pointer rounded-[14px] border-[0.5px] px-2.5 py-[3px] text-t9"
                style={{
                  borderColor: on ? "#0F766E" : "#D8D7D4",
                  background: on ? "#E6F5F3" : "#fff",
                  color: on ? "#0F766E" : "#6B6A68",
                  fontWeight: on ? 600 : 400,
                }}
              >
                {c.label} <span className="opacity-60">{data.counts[c.val]}</span>
              </button>
            );
          })}
      </div>

      <div className="tw overflow-x-auto">
        <div className="th" style={{ gridTemplateColumns: SCGRID }}>
          <span>Code</span>
          <span>Package</span>
          <span>Qty</span>
          <span>UOM</span>
          <span>Budget ₹</span>
          <span>L1 / WO ₹</span>
          <span>Var %</span>
          <span>Status</span>
          <span style={{ textAlign: "right" }}>Action</span>
        </div>
        {groups.length === 0 && <div className="p-4 text-center text-t11 text-faint">No packages of this type in this sub-project.</div>}
        {groups.map((g) => (
          <div key={g.catId}>
            <CatBanner
              label={g.label}
              count={g.rows.length}
              noun="package"
              right={
                <>
                  {g.committed > 0 && <span className="normal-case tracking-normal opacity-85">₹{fmtCompact(g.committed)} committed</span>}
                  <span className="normal-case tracking-normal">
                    <span style={{ color: g.woRaised === g.count ? "#7DD3A0" : "#FCD34D" }}>
                      {g.woRaised}/{g.count}
                    </span>{" "}
                    WO raised
                  </span>
                </>
              }
            />
            {g.rows.map((r) => (
              <div key={r.code} className="tr items-center" style={{ gridTemplateColumns: SCGRID }}>
                <Code>{r.code}</Code>
                <span>
                  <div className="text-t11 font-medium text-ink">{r.name}</div>
                  <div className="mt-0.5">
                    <TypePill scType={r.scType} matNature={r.matNature} />
                  </div>
                </span>
                <span className="text-t11 font-semibold text-ink">{fmtQ(roundQ(r.totalQty))}</span>
                <span className="text-t10 text-faint">{r.uom}</span>
                <span className="text-t11 text-muted">₹{fmtC(r.basisRate)}</span>
                <span>
                  {r.curRate ? (
                    <>
                      <div className="text-t11 font-medium" style={{ color: r.curRate.src === "wo" ? "#3B6D11" : "#1A1917" }}>
                        ₹{r.curRate.rate}
                      </div>
                      <div className="text-t9 text-faint">{r.curRate.label}</div>
                    </>
                  ) : (
                    <span className="text-t10 text-faint">— pending</span>
                  )}
                </span>
                <span>
                  <VarPill value={r.variancePct} />
                </span>
                <span>
                  <Chip label={r.statusChip.label} bg={r.statusChip.bg} fg={r.statusChip.fg} />
                </span>
                <span className="flex items-center justify-end">
                  {r.action === "float" ? (
                    <span
                      className="rounded-[5px] px-2 py-1 text-t9 font-semibold text-white"
                      style={{ background: "#0F766E" }}
                    >
                      <i className="ti ti-mail-fast" style={{ fontSize: 9, verticalAlign: -1 }} /> Float Enquiry
                    </span>
                  ) : (
                    <i className="ti ti-chevron-right text-t14 text-faint" />
                  )}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="mt-2 flex justify-between text-t10 text-faint">
        <span>L1 / WO rate populates as quotes arrive and the WO is raised.</span>
        <span>
          {data.needRate} package{data.needRate === 1 ? "" : "s"} still need rate confirmation
        </span>
      </div>
    </div>
  );
}
