"use client";

import { fmtC } from "@/lib/format";
import { usePanel } from "@/components/layout/panel-provider";
import { SC_CAT_LABELS } from "@/features/subcontracts/data/packages";
import type { ScSubbieDetail, ScSubbieRow, ScSubbiesView } from "@/features/subcontracts/api";

const GRID = "60px minmax(180px,1.5fr) 96px 96px 56px 88px 112px 120px 34px";

function compChip(label: string, v: string) {
  const flag = v === "lapsed" || v === "pending";
  return (
    <span className="pill" style={{ background: flag ? "#FCEBEB" : "#EAF3DE", color: flag ? "#A32D2D" : "#3B6D11" }}>
      {label}: {v}
    </span>
  );
}

function DetailBody({ d }: { d: ScSubbieDetail }) {
  const Row = ({ l, v, col }: { l: string; v: string; col?: string }) => (
    <div className="flex justify-between border-b-[0.5px] border-[#F0EFEB] py-1.5 text-t11">
      <span className="text-muted">{l}</span>
      <span className="text-right font-medium" style={{ color: col ?? "#1A1917" }}>
        {v}
      </span>
    </div>
  );
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="text-t13 font-semibold text-ink">{d.name}</div>
        {d.status === "onboarding" ? (
          <span className="pill" style={{ background: "#FEF6E7", color: "#854F0B" }}>
            Onboarding
          </span>
        ) : (
          <span className="pill" style={{ background: "#EAF3DE", color: "#3B6D11" }}>
            {d.status === "blacklisted" ? "Blacklisted" : "Active"}
          </span>
        )}
      </div>
      <Row l="Code · State" v={`${d.code} · ${d.state}`} />
      <Row l="Kind" v={d.kindLabel} />
      <Row l="Trades" v={d.trades.join(", ") || "—"} />
      <Row l="Rating · Jobs" v={`${d.rating ? d.rating + " ★" : "—"} · ${d.jobs} completed`} />
      <Row l="Onboarded" v={d.onboardedOn || "—"} />
      {d.workOrders.length > 0 && <Row l="Active work orders" v={d.workOrders.join(", ")} />}
      <div className="mt-2 text-t10 font-medium uppercase tracking-[0.5px] text-faint">Labour-law compliance</div>
      <div className="mt-1.5 flex flex-wrap gap-1">
        {compChip("PF", d.compliance.pf)}
        {compChip("ESI", d.compliance.esi)}
        {compChip("Licence", d.compliance.licence)}
        {d.compliance.gstRCM && (
          <span className="pill" style={{ background: "#FEF6E7", color: "#854F0B" }}>
            GST: RCM
          </span>
        )}
      </div>
      {!d.compliant && (
        <div className="mt-2 rounded px-2.5 py-2 text-t10" style={{ background: "#FCEBEB", borderLeft: "3px solid #A32D2D", color: "#A32D2D" }}>
          <i className="ti ti-alert-triangle" style={{ verticalAlign: -2 }} /> Compliance flag open — work-order release is blocked until PF/ESI/licence
          are valid.
        </div>
      )}
      {d.note && <div className="mt-2 text-t10 text-muted">{d.note}</div>}
    </div>
  );
}

export function SubbiesTab({ data }: { data: ScSubbiesView }) {
  const { openPanel } = usePanel();
  const open = (r: ScSubbieRow) => {
    const d = data.details[r.code];
    if (!d) return;
    openPanel({ tag: r.code, title: "Subcontractor detail", subtitle: d.name, width: 460, body: <DetailBody d={d} /> });
  };

  return (
    <div>
      <div className="mb-2.5 flex gap-2 rounded-md px-2.5 py-2 text-t10" style={{ background: "#FBF9F6", border: "0.5px solid #E5E4E0", color: "#4A4945" }}>
        <i className="ti ti-info-circle" style={{ verticalAlign: -2 }} />
        <span>
          Subcontractor master lives here. Grouped by trade; a subbie working multiple trades appears under each. Labour-law compliance
          (PF/ESI/licence/GST RCM) gates work-order release.
        </span>
      </div>

      {data.orphanTrades.length > 0 && (
        <div className="mb-2.5 rounded-md px-3 py-2.5" style={{ background: "#FAEEDA", border: "0.5px solid #854F0B" }}>
          <div className="mb-1.5 text-t11 font-medium" style={{ color: "#854F0B" }}>
            <i className="ti ti-alert-triangle" style={{ verticalAlign: -2 }} /> {data.orphanTrades.length} trade
            {data.orphanTrades.length > 1 ? "s have" : " has"} subcontracted scope but no qualified subbie — needs onboarding
          </div>
          <div className="flex flex-wrap gap-1.5">
            {data.orphanTrades.map((t) => (
              <span key={t} className="rounded-[12px] bg-surface px-2 py-0.5 text-t10" style={{ border: "0.5px dashed #854F0B", color: "#854F0B" }}>
                {SC_CAT_LABELS[t] ?? t}
              </span>
            ))}
          </div>
        </div>
      )}

      {data.newly.length > 0 && (
        <div className="mb-2.5 rounded-md px-3 py-2.5" style={{ background: "#EAF3DE", border: "0.5px solid #3B6D11" }}>
          <div className="mb-1 text-t11 font-medium" style={{ color: "#3B6D11" }}>
            <i className="ti ti-user-plus" style={{ verticalAlign: -2 }} /> Recently onboarded
          </div>
          {data.newly.map((s) => (
            <div key={s.code} className="mt-0.5 text-t10 text-ink-soft">
              <strong>{s.name}</strong> ({s.code}) — {s.trades.join(", ")}
              {s.note ? " · " + s.note : ""}
            </div>
          ))}
        </div>
      )}

      <div className="mb-2.5 text-t10 text-muted">
        {data.multiTrade
          ? `${data.multiTrade} subbie${data.multiTrade > 1 ? "s" : ""} work more than one trade, so appear under each. Spend & WOs are scoped to the trade; tier, rating, on-time & compliance are subbie-wide.`
          : " "}
      </div>

      <div className="tw overflow-x-auto">
        <div className="th" style={{ gridTemplateColumns: GRID }}>
          <span>Code</span>
          <span>Subcontractor</span>
          <span>Tier</span>
          <span>RC / Trades</span>
          <span>Rating</span>
          <span>On-Time</span>
          <span>Spend (trade)</span>
          <span>Compliance</span>
          <span />
        </div>
        {data.groups.map((g) => (
          <div key={g.catId}>
            <div
              className="flex items-center justify-between px-3.5 py-[7px] text-t9 font-bold uppercase tracking-[0.6px] text-white"
              style={{ background: "#1A1917" }}
            >
              <span>
                {g.label} <span className="ml-1.5 font-normal normal-case tracking-normal opacity-55">{g.count} subbie{g.count === 1 ? "" : "s"}</span>
              </span>
              {g.inSp && <span className="text-t9 normal-case tracking-normal" style={{ color: "#A8C97F" }}>in this sub-project</span>}
            </div>
            {g.rows.map((r) => (
              <div
                key={`${g.catId}-${r.code}`}
                className="tr cursor-pointer items-center"
                style={{ gridTemplateColumns: GRID }}
                onClick={() => open(r)}
              >
                <span className="font-mono text-t10 font-medium text-ink">{r.code}</span>
                <span>
                  <div className="text-t11 font-medium text-ink">
                    {r.name}
                    {r.status === "onboarding" && (
                      <span className="pill ml-1" style={{ background: "#FEF6E7", color: "#854F0B", fontSize: 8 }}>
                        onboarding
                      </span>
                    )}
                    {r.status === "blacklisted" && (
                      <span className="pill ml-1" style={{ background: "#FCEBEB", color: "#A32D2D", fontSize: 8 }}>
                        blacklisted
                      </span>
                    )}
                  </div>
                  <div className="text-t9 text-faint">
                    {r.state} · {r.kindLabel}
                  </div>
                </span>
                <span>
                  <span className="rounded-lg px-1.5 py-0.5 text-t9 font-medium" style={{ background: r.tier.bg, color: r.tier.fg }}>
                    {r.tier.label}
                  </span>
                </span>
                <span className="text-t10">
                  {r.rcCount > 0 && (
                    <>
                      <span className="font-medium" style={{ color: "#3B6D11" }}>
                        ★ {r.rcCount} RC
                      </span>
                      <br />
                    </>
                  )}
                  <span className="text-muted">
                    {r.nTrades} trade{r.nTrades === 1 ? "" : "s"}
                  </span>
                </span>
                <span className="text-t11" style={{ color: r.rating && r.rating >= 4.5 ? "#3B6D11" : r.rating && r.rating >= 4 ? "#854F0B" : r.rating ? "#A32D2D" : "#9B9894" }}>
                  {r.rating ? "★ " + r.rating : "—"}
                </span>
                <span className="text-t11" style={{ color: r.onTime != null && r.onTime >= 90 ? "#3B6D11" : r.onTime != null && r.onTime >= 75 ? "#854F0B" : r.onTime != null ? "#A32D2D" : "#9B9894" }}>
                  {r.onTime != null ? r.onTime + "%" : "—"}
                  <div className="text-t9 text-faint">
                    {r.jobs} job{r.jobs === 1 ? "" : "s"}
                  </div>
                </span>
                <span className="text-t11 text-ink">
                  {r.tradeSpend > 0 ? "₹" + fmtC(Math.round(r.tradeSpend / 1000)) + "K" : "—"}
                  <div className="text-t9" style={{ color: r.woCount && !r.tradeWo ? "#185FA5" : "#9B9894" }}>
                    {r.tradeWo ? r.tradeWo + " WO · trade" : r.woCount ? r.woCount + " WO · other" : "0 WO"}
                  </div>
                </span>
                <span className="flex items-center gap-1.5 text-t10">
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ background: r.compFlag.dot }}
                    title={`PF ${r.compliance.pf} · ESI ${r.compliance.esi} · Lic ${r.compliance.licence}${r.compliance.gstRCM ? " · RCM" : ""}`}
                  />
                  <span style={{ color: r.compFlag.col }}>{r.compFlag.txt}</span>
                </span>
                <span className="text-right">
                  <i className="ti ti-chevron-right text-t14 text-faint" />
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
