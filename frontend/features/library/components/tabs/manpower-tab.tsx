"use client";

import { Fragment } from "react";
import type { LibManpower } from "@/features/library/types";

const SKILL_COLOR: Record<string, string> = {
  Skilled: "#185FA5",
  "Semi-Skilled": "#854F0B",
  Unskilled: "#9B9894",
  Professional: "#3B6D11",
};
const GROUP_COLOR = (g: string) => (g === "MP-10xx" ? "#6B1F6B" : g === "MP-20xx" ? "#8B3A8B" : g === "MP-30xx" ? "#5C1A5C" : "#3B6D11");

const TD = "border-[0.5px] border-line px-2 py-[5px]";
const TH = "border-[0.5px] border-[#333] px-2 py-1.5 text-t9 uppercase text-faint";

export function ManpowerTab({ manpower }: { manpower: LibManpower[] }) {
  const groups = [...new Set(manpower.map((m) => `${m.group}||${m.groupLabel}`))];
  return (
    <div>
      <div className="mb-2 rounded-md border-[0.5px] border-[#D4A0D4] bg-[#F5EAF5] px-2.5 py-[7px] text-t10 text-[#6B1F6B]">
        <strong>MP- codes</strong> — Manpower rate cards. Flexible across any BOQ line item&apos;s BOM breakdown. Rates per 8-hr working day. North
        rates shown as primary; South &amp; East shown for reference. Overtime at 1.5×. EPF/ESI for direct workforce.
      </div>
      <div className="overflow-auto rounded-lg border-[0.5px] border-line">
        <table className="w-full min-w-[900px] border-collapse text-t10">
          <thead>
            <tr className="bg-ink">
              <th className={`${TH} min-w-[80px] text-left`}>Item Code</th>
              <th className={`${TH} min-w-[200px] text-left`}>Designation / Trade</th>
              <th className={`${TH} text-left`}>Skill Level</th>
              <th className={`${TH} text-center`}>Unit</th>
              <th className={`${TH} text-right`} style={{ color: "#6B1F6B" }}>Rate North ₹</th>
              <th className={`${TH} text-right`}>Rate South ₹</th>
              <th className={`${TH} text-right`}>Rate East ₹</th>
              <th className={`${TH} text-left`}>Remarks / Scope</th>
              <th className={`${TH} whitespace-nowrap text-center`}>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((gk) => {
              const [gCode, gLabel] = gk.split("||");
              const rows = manpower.filter((m) => `${m.group}||${m.groupLabel}` === gk);
              return (
                <Fragment key={gk}>
                  <tr style={{ background: GROUP_COLOR(gCode!) }}>
                    <td colSpan={9} className="px-2.5 py-[5px] text-t10 font-semibold text-white">
                      <span className="mr-2 rounded bg-white/20 px-1.5 py-px font-mono text-t9">{gCode}</span>
                      {gLabel}
                    </td>
                  </tr>
                  {rows.map((m) => {
                    const sc = SKILL_COLOR[m.skill] ?? "#9B9894";
                    return (
                      <tr key={m.code} className="est-item-row">
                        <td className={`${TD} whitespace-nowrap font-mono text-t9 font-bold`} style={{ color: "#6B1F6B" }}>{m.code}</td>
                        <td className={`${TD} min-w-[200px] text-t11 font-medium`}>{m.trade}</td>
                        <td className={TD}><span className="rounded px-1.5 py-0.5 text-t9 font-semibold" style={{ color: sc, background: `${sc}18` }}>{m.skill}</span></td>
                        <td className={`${TD} text-center text-t10 text-faint`}>{m.uom}</td>
                        <td className={`${TD} text-right font-mono text-t11 font-bold`} style={{ color: "#6B1F6B" }}>₹{m.rateN.toLocaleString("en-IN")}</td>
                        <td className={`${TD} text-right font-mono text-t10 text-muted`}>{m.rateS ? `₹${m.rateS.toLocaleString("en-IN")}` : "—"}</td>
                        <td className={`${TD} text-right font-mono text-t10 text-muted`}>{m.rateE ? `₹${m.rateE.toLocaleString("en-IN")}` : "—"}</td>
                        <td className={`${TD} min-w-[180px] text-t9 text-faint`}>{m.remarks}</td>
                        <td className={`${TD} whitespace-nowrap text-center text-t9 leading-[1.4] text-faint`}>01 May 2024<br /><span className="text-t9 font-medium text-muted">Ramana</span></td>
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
