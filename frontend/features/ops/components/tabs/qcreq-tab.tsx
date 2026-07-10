"use client";

import type { OpsPayload } from "@/features/ops/api";
import type { QcRequest } from "@/features/ops/types";
import { fmtQ } from "@/lib/format";

const STEPS: QcRequest["status"][] = ["requested", "scheduled", "inspected", "closed"];

const ST_META: Record<QcRequest["status"], { pill: string; label: string; dot: string }> = {
  requested: { pill: "pa", label: "Requested", dot: "#854F0B" },
  scheduled: { pill: "pb", label: "Scheduled", dot: "#185FA5" },
  inspected: { pill: "pa", label: "Inspected", dot: "#7B1FA2" },
  closed: { pill: "pg", label: "Cleared", dot: "#3B6D11" },
};

function Kpi({ label, value, sub, tone }: { label: string; value: string | number; sub: string; tone?: string }) {
  return (
    <div className="kp">
      <div className="kl">{label}</div>
      <div className={`kv ${tone ?? ""}`}>{value}</div>
      <div className="ks">{sub}</div>
    </div>
  );
}

function Card({ r, name }: { r: QcRequest; name: string }) {
  const st = ST_META[r.status];
  const curIdx = STEPS.indexOf(r.status);
  return (
    <div className="mb-2 rounded-lg border-[0.5px] border-line bg-surface px-3 py-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-t9 text-faint">{r.id}</span>
        <span className="text-t12 font-bold">{r.code}</span>
        {r.qty ? (
          <span className="rounded-[3px] px-1.5 py-px text-t9 font-bold" style={{ background: "#E6F5F3", color: "#0F766E" }}>
            +{fmtQ(r.qty)}
          </span>
        ) : null}
        {name && <span className="text-t10 font-medium text-muted">{name}</span>}
        <span className={`pill ${st.pill}`}>{st.label}</span>
        <span className="text-t9 text-faint">{r.week}</span>
        {r.inspRef && (
          <span className="rounded px-1.5 py-px font-mono text-t9" style={{ background: "#EFF5FB", color: "#185FA5" }}>
            {r.inspRef}
          </span>
        )}
      </div>
      <div className="mt-1 text-t10 text-ink-soft">{r.note}</div>
      {r.closedNote && (
        <div
          className="mt-1 rounded px-2 py-1 text-t10"
          style={{
            background: r.status === "closed" ? "#F3F9F0" : "#FBF1E0",
            color: r.status === "closed" ? "#3B6D11" : "#854F0B",
          }}
        >
          {r.closedNote}
        </div>
      )}
      {/* Lifecycle stepper */}
      <div className="my-1.5 flex items-center gap-0">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center">
            <div className="h-[7px] w-[7px] rounded-full" style={{ background: i <= curIdx ? st.dot : "#E0DEDA" }} />
            {i < STEPS.length - 1 && (
              <div className="h-[1.5px] w-[34px]" style={{ background: i < curIdx ? st.dot : "#E0DEDA" }} />
            )}
          </div>
        ))}
        <span className="ml-2 text-[8.5px] capitalize text-faint">{r.status}</span>
      </div>
      <div className="text-t9 text-faint">
        Requested {r.requestedOn} · {r.by}
      </div>
    </div>
  );
}

export function QcReqTab({ data }: { data: OpsPayload }) {
  const { qcRequests, scopeLines } = data;
  const nameOf = new Map(scopeLines.map((l) => [l.code, l.name]));
  const catOf = new Map(scopeLines.map((l) => [l.code, l.cat]));

  const open = qcRequests.filter((r) => r.status === "requested" || r.status === "scheduled").length;
  const inspecting = qcRequests.filter((r) => r.status === "inspected").length;
  const closed = qcRequests.filter((r) => r.status === "closed").length;

  // Group by discipline, following the scope item order.
  const catOrder: string[] = [];
  for (const l of scopeLines) if (!catOrder.includes(l.cat)) catOrder.push(l.cat);
  const groups = catOrder
    .map((cat) => ({ cat, reqs: qcRequests.filter((r) => (catOf.get(r.code) ?? "Other") === cat) }))
    .filter((g) => g.reqs.length > 0);

  return (
    <div>
      <div className="kr mb-3 grid grid-cols-2 sm:grid-cols-3">
        <Kpi label="Awaiting Inspection" value={open} sub="requested / scheduled" tone={open > 0 ? "cac" : "cg"} />
        <Kpi label="Under QC Review" value={inspecting} sub="inspected — result pending" tone={inspecting > 0 ? "ca" : ""} />
        <Kpi label="Cleared" value={closed} sub="unblocked for RA billing" tone="cg" />
      </div>

      <div className="mb-2.5 rounded-lg border-[0.5px] border-line bg-[#EFF5FB] px-3 py-2 text-t9 text-muted">
        Site raises an inspection request → QA/QC schedules + inspects (IMIR / WIR / FIR) → on pass it&apos;s cleared,
        which unblocks Billing to measure the RA. This is the intimation loop that gates the running account.
        <b> No inspection, no claim.</b>
      </div>

      {qcRequests.length === 0 ? (
        <div className="text-t11 text-faint">No inspection requests yet.</div>
      ) : (
        groups.map((g) => (
          <div key={g.cat}>
            <div className="mb-1.5 mt-3 flex items-center gap-2 rounded-md bg-[#F0EFED] px-2.5 py-1.5">
              <span className="text-t10 font-bold uppercase tracking-[0.4px] text-ink">{g.cat}</span>
              <span className="text-t9 text-faint">{g.reqs.length} request(s)</span>
            </div>
            {g.reqs.map((r) => (
              <Card key={r.id} r={r} name={nameOf.get(r.code) ?? ""} />
            ))}
          </div>
        ))
      )}
    </div>
  );
}
