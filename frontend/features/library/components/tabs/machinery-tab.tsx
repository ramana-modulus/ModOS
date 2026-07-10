"use client";

import { Fragment } from "react";
import type { LibMachinery } from "@/features/library/types";

const TD = "border-[0.5px] border-line px-2 py-[5px]";
const TH = "border-[0.5px] border-[#333] px-2 py-1.5 text-t9 uppercase text-faint";

function YesNo({ v }: { v: string }) {
  const yes = v === "Yes";
  return (
    <span className="rounded px-1.5 py-px text-t9 font-semibold" style={{ color: yes ? "#3B6D11" : "#A32D2D", background: yes ? "#EAF3DE" : "#FCEBEB" }}>
      {v}
    </span>
  );
}

export function MachineryTab({ machinery }: { machinery: LibMachinery[] }) {
  const groups = [...new Set(machinery.map((m) => `${m.group}||${m.groupLabel}`))];
  return (
    <div>
      <div className="mb-2 rounded-md border-[0.5px] border-[#C0DD97] bg-success-soft px-2.5 py-[7px] text-t10" style={{ color: "#145A32" }}>
        <strong>MC- codes</strong> — Machinery / Equipment hire rates. Flexible across any BOQ line item. Fuel &amp; operator inclusion noted per item.
        Mobilisation/demob charges are separate. DSR references included where applicable.
      </div>
      <div className="overflow-auto rounded-lg border-[0.5px] border-line">
        <table className="w-full min-w-[900px] border-collapse text-t10">
          <thead>
            <tr className="bg-ink">
              <th className={`${TH} min-w-[80px] text-left`}>Item Code</th>
              <th className={`${TH} min-w-[200px] text-left`}>Equipment Description</th>
              <th className={`${TH} text-center`}>Unit</th>
              <th className={`${TH} min-w-[80px] text-right`} style={{ color: "#145A32" }}>Rate ₹</th>
              <th className={`${TH} text-center`}>Fuel Incl?</th>
              <th className={`${TH} text-center`}>Operator Incl?</th>
              <th className={`${TH} text-left`}>Capacity / Spec</th>
              <th className={`${TH} text-left`}>Comments</th>
              <th className={`${TH} whitespace-nowrap text-center`}>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((gk) => {
              const [gCode, gLabel] = gk.split("||");
              const rows = machinery.filter((m) => `${m.group}||${m.groupLabel}` === gk);
              return (
                <Fragment key={gk}>
                  <tr style={{ background: "#145A32" }}>
                    <td colSpan={9} className="px-2.5 py-[5px] text-t10 font-semibold text-white">
                      <span className="mr-2 rounded bg-white/20 px-1.5 py-px font-mono text-t9">{gCode}</span>
                      {gLabel}
                    </td>
                  </tr>
                  {rows.map((m) => (
                    <tr key={m.code} className="est-item-row">
                      <td className={`${TD} whitespace-nowrap font-mono text-t9 font-bold`} style={{ color: "#145A32" }}>{m.code}</td>
                      <td className={`${TD} min-w-[200px] text-t11 font-medium`}>{m.machine}</td>
                      <td className={`${TD} text-center text-t10 text-faint`}>{m.uom}</td>
                      <td className={`${TD} text-right font-mono text-t11 font-bold`} style={{ color: "#145A32" }}>₹{m.rate.toLocaleString("en-IN")}</td>
                      <td className={`${TD} text-center`}><YesNo v={m.fuelIncl} /></td>
                      <td className={`${TD} text-center`}><YesNo v={m.opIncl} /></td>
                      <td className={`${TD} min-w-[130px] text-t9 text-muted`}>{m.cap}</td>
                      <td className={`${TD} min-w-[180px] text-t9 text-faint`}>{m.comments}</td>
                      <td className={`${TD} whitespace-nowrap text-center text-t9 leading-[1.4] text-faint`}>01 May 2024<br /><span className="text-t9 font-medium text-muted">Arumugam</span></td>
                    </tr>
                  ))}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
