"use client";

import type { BillingView, RegAgeingBucket, RegCycleRow, RegisterView } from "@/features/billing/types";
import { regMoney } from "../format";
import { RouteBar } from "../route-bar";

function Bar({ segs }: { segs: { label: string; color: string; value: number }[] }) {
  const total = segs.reduce((s, x) => s + x.value, 0) || 1;
  return (
    <div className="my-2 flex h-2 overflow-hidden rounded" style={{ background: "#EDEAE5" }}>
      {segs
        .filter((x) => x.value > 0)
        .map((x, i) => (
          <div key={i} title={`${x.label}: ${regMoney(x.value)}`} style={{ width: `${Math.max(2, (x.value / total) * 100)}%`, background: x.color }} />
        ))}
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="min-w-[64px] flex-1">
      <div className="text-t9 uppercase tracking-[0.4px] text-faint">{label}</div>
      <div className="text-t13 font-bold" style={{ color: color ?? "#1A1917" }}>
        {value}
      </div>
    </div>
  );
}

function Ageing({ buckets, title }: { buckets: RegAgeingBucket[]; title: string }) {
  if (buckets.length === 0) return null;
  return (
    <div className="mt-2.5 border-t-[0.5px] border-[#F0EFEB] pt-2">
      <div className="mb-1.5 text-t9 font-medium uppercase tracking-[0.5px] text-faint">{title}</div>
      {buckets.map((b) => (
        <div key={b.label} className="flex justify-between py-0.5 text-t10">
          <span style={{ color: b.color }}>● {b.label}</span>
          <span className="text-ink">{regMoney(b.value)}</span>
        </div>
      ))}
    </div>
  );
}

function arStatusPill(row: RegCycleRow) {
  const map = {
    billed: { label: "Billed", color: "#185FA5", bg: "#E6F1FB" },
    partial: { label: "Partial", color: "#854F0B", bg: "#FBF1E0" },
    claimable: { label: "Claimable", color: "#3B6D11", bg: "#EAF3DE" },
    none: null,
  } as const;
  const m = map[row.arStatus];
  if (!m) return <span style={{ color: "#C4C2BD" }}>—</span>;
  return (
    <span className="rounded-[3px] px-1.5 py-px text-t8 font-semibold" style={{ color: m.color, background: m.bg }}>
      {m.label}
    </span>
  );
}

function apStatusPill(row: RegCycleRow) {
  const map = {
    paid: { label: "Paid", color: "#3B6D11", bg: "#EAF3DE" },
    certified: { label: "Certified", color: "#185FA5", bg: "#E6F1FB" },
    pending: { label: "Pending", color: "#854F0B", bg: "#FBF1E0" },
    none: null,
  } as const;
  const m = map[row.apStatus];
  if (!m) return <span style={{ color: "#C4C2BD" }}>—</span>;
  return (
    <span className="rounded-[3px] px-1.5 py-px text-t8 font-semibold" style={{ color: m.color, background: m.bg }}>
      {m.label}
    </span>
  );
}

const RA_COLS = "24px 70px 1fr 90px 1fr 90px 110px";

export function RegisterTab({ data }: { data: BillingView }) {
  const r: RegisterView = data.register;

  return (
    <>
      <RouteBar
        inherit="Client RA (AR) + Subcontractor RA (AP) — live from the spine"
        route="Finance — AR receipts + AP payment run"
        note="Material vendor AP: Procurement (3-way match) → Finance, not here"
      />

      <div className="mb-2 text-t9 text-faint">
        Scope: <b className="text-ink-soft">{data.scope}</b> · live from the measurement spine · recomputed every render
      </div>

      <div className="mb-3.5 grid gap-2.5 lg:grid-cols-2">
        {/* AR card */}
        <div className="rounded-lg border-[0.5px] border-line bg-white p-3.5">
          <div className="mb-1.5 flex items-center gap-1.5">
            <span style={{ color: "#3B6D11" }}>↗</span>
            <span className="text-t12 font-semibold text-ink">Accounts Receivable — Client → Modulus</span>
          </div>
          <Bar
            segs={[
              { label: "Received", color: "#3B6D11", value: r.arReceived },
              { label: "Certified (not received)", color: "#185FA5", value: Math.max(0, r.arCertified - r.arReceived) },
              { label: "Billed (not certified)", color: "#C9892E", value: Math.max(0, r.arBilled - Math.max(r.arCertified, r.arReceived)) },
              { label: "Claimable (not billed)", color: "#BBB6AE", value: r.arClaimable },
            ]}
          />
          <div className="mt-2 flex flex-wrap gap-2.5">
            <Stat label="Claimable" value={regMoney(r.arClaimable)} />
            <Stat label="Billed" value={regMoney(r.arBilled)} color="#C9892E" />
            <Stat label="Certified" value={regMoney(r.arCertified)} color="#185FA5" />
            <Stat label="Received" value={regMoney(r.arReceived)} color="#3B6D11" />
            <Stat label="Outstanding" value={regMoney(r.arOutstanding)} color={r.arOutstanding > 0 ? "#A32D2D" : "#3B6D11"} />
          </div>
          <div className="mt-1.5 text-t8 text-faint">
            Claimable / Billed are live from the spine · Certified / Received overlaid from AR data.
          </div>
          <Ageing buckets={r.arAgeing} title="AR ageing — billed, awaiting receipt" />
        </div>

        {/* AP card */}
        <div className="rounded-lg border-[0.5px] border-line bg-white p-3.5">
          <div className="mb-1.5 flex items-center gap-1.5">
            <span style={{ color: "#A32D2D" }}>↘</span>
            <span className="text-t12 font-semibold text-ink">Accounts Payable — Subcontractor → Modulus</span>
          </div>
          <Bar
            segs={[
              { label: "Paid", color: "#3B6D11", value: r.apPaid },
              { label: "Certified (not paid)", color: "#185FA5", value: Math.max(0, r.apCert) },
              { label: "Pending certification", color: "#BBB6AE", value: Math.max(0, r.apNet - r.apPaid - r.apCert) },
            ]}
          />
          <div className="mt-2 flex flex-wrap gap-2.5">
            <Stat label="Net payable" value={regMoney(r.apNet)} />
            <Stat label="Certified" value={regMoney(r.apCert)} color="#185FA5" />
            <Stat label="Paid" value={regMoney(r.apPaid)} color="#3B6D11" />
            <Stat label="Outstanding" value={regMoney(r.apOutstanding)} color={r.apOutstanding > 0 ? "#A32D2D" : "#3B6D11"} />
          </div>
          {r.apManpower > 0 ? (
            <div className="mt-1.5 rounded px-2 py-1 text-t9" style={{ background: "#FBF6EE", color: "#854F0B" }}>
              ⏳ Manpower SC {regMoney(r.apManpower)} deferred (pending Subcontracts-dept build) · material AP sits in Procurement
            </div>
          ) : (
            <div className="mt-1.5 text-t8 text-faint">Line-item SC only · material AP sits in Procurement.</div>
          )}
          <Ageing buckets={r.apAgeing} title="AP ageing — certified, awaiting payment" />
        </div>
      </div>

      {/* Net position strip */}
      <div className="mb-3.5 grid grid-cols-1 gap-3.5 rounded-lg border-[0.5px] border-line bg-[#FBF9F6] px-4 py-3 sm:grid-cols-3">
        <div>
          <div className="text-t9 uppercase tracking-[0.4px] text-faint">Client billing (AR, gross)</div>
          <div className="text-t16 font-bold" style={{ color: "#3B6D11" }}>{regMoney(r.arGross)}</div>
        </div>
        <div className="sm:border-x-[0.5px] sm:border-line sm:px-3.5">
          <div className="text-t9 uppercase tracking-[0.4px] text-faint">Subcontractor cost (SC AP, gross)</div>
          <div className="text-t16 font-bold" style={{ color: "#A32D2D" }}>{regMoney(r.apGross)}</div>
        </div>
        <div>
          <div className="text-t9 uppercase tracking-[0.4px] text-faint">Margin (client − SC)</div>
          <div className="text-t16 font-bold" style={{ color: r.margin >= 0 ? "#1A1917" : "#A32D2D" }}>
            {regMoney(r.margin)} <span className="text-t10 font-medium text-muted">{r.marginPct}%</span>
          </div>
        </div>
      </div>

      {/* RA-wise table */}
      <div className="mb-1.5 text-t10 font-semibold text-ink">
        RA-wise breakdown <span className="font-normal text-faint">(client AR · subbie AP · margin per cycle)</span>
      </div>
      {r.cycles.length === 0 ? (
        <div className="rounded-lg border-[0.5px] border-dashed border-line bg-white py-6 text-center text-t11 text-faint">
          No approved RA in the register yet.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border-[0.5px] border-line bg-white">
          <div
            className="grid gap-1.5 border-b-[0.5px] border-line px-3 py-2 text-t9 font-semibold uppercase tracking-[0.4px] text-faint"
            style={{ gridTemplateColumns: RA_COLS, background: "#F5F4F2" }}
          >
            <span />
            <span>RA</span>
            <span className="text-right">Client (AR)</span>
            <span className="text-center">AR status</span>
            <span className="text-right">Subbie (AP)</span>
            <span className="text-center">AP status</span>
            <span className="text-right">Margin</span>
          </div>
          {r.cycles.map((c) => (
            <div key={c.cycle} className="grid items-center gap-1.5 border-b-[0.5px] border-[#F0EFED] px-3 py-2.5 text-t11 last:border-b-0" style={{ gridTemplateColumns: RA_COLS }}>
              <span />
              <span className="font-bold text-ink">{c.cycle}</span>
              <span className="text-right font-semibold" style={{ color: "#3B6D11" }}>{regMoney(c.arNet)}</span>
              <span className="text-center">{arStatusPill(c)}</span>
              <span className="text-right font-semibold" style={{ color: "#A32D2D" }}>{regMoney(c.apNet)}</span>
              <span className="text-center">{apStatusPill(c)}</span>
              <span className="text-right font-bold" style={{ color: c.margin >= 0 ? "#1A1917" : "#A32D2D" }}>{regMoney(c.margin)}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
