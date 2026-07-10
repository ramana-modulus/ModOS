"use client";

import { Fragment } from "react";
import type { LibTransport } from "@/features/library/types";

const TD = "border-[0.5px] border-line px-2 py-[5px]";
const TH = "border-[0.5px] border-[#333] px-2 py-1.5 text-t9 uppercase text-faint";

export function TransportTab({ transport }: { transport: LibTransport[] }) {
  const groups = [...new Set(transport.map((t) => `${t.group}||${t.groupLabel}`))];
  return (
    <div>
      <div className="mb-2 rounded-md border-[0.5px] border-[#B8D4F0] bg-info-soft px-2.5 py-[7px] text-t10" style={{ color: "#1A4A6B" }}>
        <strong>TR- codes</strong> — Transportation vehicle reference. Rate is per KM; actual trip rate = rate × distance. Dimensions &amp; payload
        shown for vehicle selection. Toll, loading/unloading at actuals unless noted.
      </div>
      <div className="overflow-auto rounded-lg border-[0.5px] border-line">
        <table className="w-full min-w-[1000px] border-collapse text-t10">
          <thead>
            <tr className="bg-ink">
              <th className={`${TH} min-w-[80px] text-left`}>Item Code</th>
              <th className={`${TH} min-w-[180px] text-left`}>Description</th>
              <th className={`${TH} text-center`}>Qty Type</th>
              <th className={`${TH} text-center`}>Qty</th>
              <th className={`${TH} text-center`} style={{ color: "#1A4A6B" }}>Rate ₹</th>
              <th className={`${TH} text-left`}>Dimensions (L×W×H ft)</th>
              <th className={`${TH} text-center`}>Volume (cum)</th>
              <th className={`${TH} text-center`}>Payload (MT)</th>
              <th className={`${TH} text-left`}>Comments</th>
              <th className={`${TH} whitespace-nowrap text-center`}>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((gk) => {
              const [gCode, gLabel] = gk.split("||");
              const rows = transport.filter((t) => `${t.group}||${t.groupLabel}` === gk);
              return (
                <Fragment key={gk}>
                  <tr style={{ background: "#1A4A6B" }}>
                    <td colSpan={10} className="px-2.5 py-[5px] text-t10 font-semibold text-white">
                      <span className="mr-2 rounded bg-white/20 px-1.5 py-px font-mono text-t9">{gCode}</span>
                      {gLabel}
                    </td>
                  </tr>
                  {rows.map((t) => (
                    <tr key={t.code} className="est-item-row">
                      <td className={`${TD} whitespace-nowrap font-mono text-t9 font-bold`} style={{ color: "#1A4A6B" }}>{t.code}</td>
                      <td className={`${TD} min-w-[180px] text-t11 font-medium`}>{t.desc}</td>
                      <td className={`${TD} text-center text-t10 text-faint`}>{t.qtyType}</td>
                      <td className={`${TD} text-center text-t10 text-faint`}>1</td>
                      <td className={`${TD} text-center text-t10 text-faint`}>{t.rate ? `₹${t.rate}` : "—"}</td>
                      <td className={`${TD} min-w-[100px] text-t9 text-muted`}>{t.dims}</td>
                      <td className={`${TD} text-t9 text-muted`}>{t.vol}</td>
                      <td className={`${TD} text-t9 text-muted`}>{t.payload}</td>
                      <td className={`${TD} min-w-[180px] text-t9 text-faint`}>{t.comments}</td>
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
