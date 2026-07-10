"use client";

import { Fragment } from "react";
import { IconHistory } from "@tabler/icons-react";
import type { LibHistoryEntry, LibMaterial } from "@/features/library/types";
import { usePanel } from "@/components/layout/panel-provider";
import { RateHistoryPanel } from "@/features/library/components/rate-history-panel";

const MAT_CAT_COLOR: Record<string, string> = {
  "Steel – Section": "#185FA5",
  "Steel – Plate": "#185FA5",
  "Steel – Fastener": "#185FA5",
  "Steel – Rebar": "#185FA5",
  Cementitious: "#854F0B",
  Aggregate: "#854F0B",
  Admixture: "#854F0B",
  "Paint / Coating": "#3B6D11",
  Consumable: "#9B9894",
  Chemical: "#7B1FA2",
  "Earth Material": "#5D4037",
  Utilities: "#00796B",
  Formwork: "#C84B2F",
  Fabricated: "#C84B2F",
  Fastener: "#185FA5",
  "Safety / Temporary": "#9B9894",
};

const TD = "border-[0.5px] border-line px-2 py-[5px]";
const TH = "border-[0.5px] border-[#333] px-2 py-[5px] text-t9 uppercase text-faint";

export function MaterialTab({
  materials,
  activeCat,
  history,
}: {
  materials: LibMaterial[];
  activeCat: string;
  history: Record<string, LibHistoryEntry[]>;
}) {
  const { openPanel } = usePanel();
  const filtered =
    activeCat === "All"
      ? materials
      : materials.filter((m) => {
          const prefix = activeCat === "RO" ? "RC-M-" : `${activeCat}-M-`;
          return m.code.startsWith(prefix) || m.code.startsWith(`${activeCat}-M-`);
        });
  const groups = [...new Set(filtered.map((m) => `${m.group}||${m.groupLabel}`))];

  const openHistory = (code: string, name: string) =>
    openPanel({ tag: code, title: name, subtitle: "Rate history", width: 420, body: <RateHistoryPanel entries={history[code] ?? []} /> });

  return (
    <div>
      <div className="mb-2 rounded-md border-[0.5px] border-[#F0C9BC] bg-[#FAF0EC] px-2.5 py-[7px] text-t10 text-accent">
        <strong>BOM codes</strong>: <code className="rounded bg-accent-soft px-1 py-px">[CAT]-M-[3digit]</code> — e.g. SS-M-101. Grouped by work
        sub-category (SS-10xx, SS-20xx…). <strong className="text-success">Green column</strong> shows which BOQ line items use this material.
      </div>
      <div className="overflow-auto rounded-lg border-[0.5px] border-line">
        <table className="w-full min-w-[1050px] border-collapse text-t10">
          <thead>
            <tr className="bg-ink">
              <th className={`${TH} w-10 text-center`}>S.No</th>
              <th className={`${TH} min-w-[100px] text-left`}>MAT Code</th>
              <th className={`${TH} min-w-[180px] text-left`}>Material Name</th>
              <th className={`${TH} min-w-[200px] text-left`}>Specification / Grade / Type</th>
              <th className={`${TH} min-w-[110px] text-left`}>Material Category</th>
              <th className={`${TH} text-center`}>Unit</th>
              <th className={`${TH} min-w-[70px] text-center`}>Std Qty*</th>
              <th className={`${TH} min-w-[80px] text-right`}>Rate ₹</th>
              <th className={`${TH} min-w-[140px] text-left`} style={{ color: "#3B6D11" }}>Applicable BOQ Codes</th>
              <th className={`${TH} whitespace-nowrap text-center`}>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((gk) => {
              const [gCode, gLabel] = gk.split("||");
              const rows = filtered.filter((m) => `${m.group}||${m.groupLabel}` === gk);
              return (
                <Fragment key={gk}>
                  <tr style={{ background: "#2A4A7F" }}>
                    <td colSpan={10} className="px-2.5 py-[5px] text-t10 font-semibold text-white">
                      <span className="mr-2 rounded bg-white/20 px-1.5 py-px font-mono text-t9">{gCode}</span>
                      {gLabel}
                    </td>
                  </tr>
                  {rows.map((m) => {
                    const col = MAT_CAT_COLOR[m.matCat] ?? "#9B9894";
                    return (
                      <tr key={m.code} className="est-item-row">
                        <td className={`${TD} text-center text-t9 text-muted`}>{m.sno}</td>
                        <td className={`${TD} whitespace-nowrap font-mono text-t9 font-bold text-accent`}>{m.code}</td>
                        <td className={`${TD} min-w-[180px] text-t11 font-medium`}>{m.name}</td>
                        <td className={`${TD} min-w-[200px] text-t9 text-muted`}>{m.spec}</td>
                        <td className={TD}>
                          <span className="whitespace-nowrap rounded px-[5px] py-px text-t8 font-semibold" style={{ color: col, background: `${col}18` }}>{m.matCat}</span>
                        </td>
                        <td className={`${TD} text-center text-t10 text-faint`}>{m.uom}</td>
                        <td className={`${TD} text-center text-t10 font-medium text-info`}>{m.stdQty}</td>
                        <td className={`${TD} text-right font-mono text-t11 font-bold text-accent`}>
                          ₹{m.rate.toLocaleString("en-IN")}
                          {history[m.code] && (
                            <IconHistory
                              size={10}
                              className="ml-1 inline cursor-pointer align-[-1px] text-faint"
                              onClick={() => openHistory(m.code, m.name)}
                            />
                          )}
                        </td>
                        <td className={`${TD} min-w-[140px] text-t9 italic text-success`}>{m.boqCodes}</td>
                        <td className={`${TD} whitespace-nowrap text-center text-t9 leading-[1.4] text-faint`}>
                          {m.lastUpdated || "—"}
                          <br />
                          <span className="text-t9 font-medium text-muted">{m.updatedBy}</span>
                        </td>
                      </tr>
                    );
                  })}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
