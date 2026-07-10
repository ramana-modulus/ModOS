"use client";

import { useState } from "react";
import { fmtC } from "@/lib/format";
import type { FinanceApView, PaymentRunView, UnifiedApBill } from "@/features/finance/types";

type ApFilter = "inbox" | "scheduled" | "executed";

const COLS = "80px 1fr 130px 120px 100px 120px";

function SourceTag({ bill }: { bill: UnifiedApBill }) {
  if (bill.src === "sc") {
    return (
      <span className="ml-1 rounded-md bg-[#E6F5F3] px-1.5 py-px text-[8px] font-semibold text-[#0F766E]">
        SC
      </span>
    );
  }
  if (bill.bridgedFromProc) {
    return (
      <span
        title="Bridged from the procurement invoice spine"
        className="ml-1 rounded-md bg-[#FAEEDA] px-1.5 py-px text-[8px] font-semibold text-[#854F0B]"
      >
        PROC
      </span>
    );
  }
  return null;
}

function Inbox({ bills }: { bills: UnifiedApBill[] }) {
  if (bills.length === 0) {
    return (
      <div className="rounded-lg bg-[#F5F4F2] p-[30px] text-center text-t11 text-faint">
        Inbox empty — no certified bills awaiting payment scheduling.
      </div>
    );
  }
  return (
    <div className="tw">
      <div className="th" style={{ gridTemplateColumns: COLS }}>
        <span>Bill ID</span>
        <span>Vendor · Bill No</span>
        <span>Type</span>
        <span>PO/WO Ref</span>
        <span>Amount</span>
        <span>Certified On</span>
      </div>
      {bills.map((b) => (
        <div key={b.id} className="tr" style={{ gridTemplateColumns: COLS }}>
          <span className="font-mono text-t10 font-medium text-ink">{b.id}</span>
          <span>
            <div className="text-t11 font-medium text-ink">{b.vendor}</div>
            <div className="font-mono text-[9px] text-faint">{b.billNo}</div>
          </span>
          <span className="text-t10 text-ink-soft">
            {b.type.replace(/_/g, " ")}
            <SourceTag bill={b} />
          </span>
          <span className="font-mono text-t10 text-[#854F0B]">{b.poRef ?? "—"}</span>
          <span className="text-t11 font-semibold text-ink">₹{fmtC(b.netPayable)}</span>
          <span className="text-t10 text-muted">
            {(b.certifiedOn ?? "").split(" ").slice(0, 2).join(" ")}
          </span>
        </div>
      ))}
    </div>
  );
}

function RunCard({ run }: { run: PaymentRunView }) {
  const executed = run.status === "executed";
  return (
    <div
      className="rounded-lg bg-surface p-3"
      style={{ border: `0.5px solid ${executed ? "#3B6D11" : "#E5E4E0"}` }}
    >
      <div className="mb-2 flex items-center justify-between border-b-[0.5px] border-[#F0EFEB] pb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-t12 font-semibold text-ink">{run.id}</span>
            <span className="text-t11 text-muted">Week of {run.weekOf}</span>
            <span className={"pill " + (executed ? "pg" : "pa")} style={{ fontSize: 9 }}>
              {run.status}
            </span>
          </div>
          <div className="mt-0.5 text-t10 text-faint">
            {run.bills.length} bill{run.bills.length === 1 ? "" : "s"} · {run.bankName}
            {run.note ? " · " + run.note : ""}
          </div>
        </div>
        <div className="text-right">
          <div className="text-base font-semibold text-ink">₹{fmtC(run.totalAmount / 100000)} L</div>
          <div className="text-[9px] text-faint">
            {run.executedOn
              ? "Executed " + run.executedOn
              : run.approvedBy
                ? `Approved by ${run.approvedBy} · ${run.approvedOn}`
                : "Pending CFO approval"}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        {run.bills.map((b) => (
          <div
            key={b.id}
            className="flex items-center gap-2 rounded bg-[#FBF9F6] px-2.5 py-1.5 text-t10"
          >
            <span className="min-w-[60px] font-mono font-medium text-ink">{b.id}</span>
            <span className="flex-1 text-ink-soft">
              {b.vendor} <span className="text-faint">· {b.lineCount} line{b.lineCount > 1 ? "s" : ""}</span>
            </span>
            <span className="font-mono text-[#854F0B]">{b.poRef ?? "—"}</span>
            <span className="font-medium text-ink">₹{fmtC(b.netPayable)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Runs({ runs, kind }: { runs: PaymentRunView[]; kind: ApFilter }) {
  if (runs.length === 0) {
    return (
      <div className="rounded-lg bg-[#F5F4F2] p-[30px] text-center text-t11 text-faint">
        No {kind} payment runs.
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2.5">
      {runs.map((r) => (
        <RunCard key={r.id} run={r} />
      ))}
    </div>
  );
}

export function ApTab({ ap }: { ap: FinanceApView }) {
  const [filter, setFilter] = useState<ApFilter>("inbox");

  const meta: Record<ApFilter, { label: string; count: number }> = {
    inbox: { label: "Inbox", count: ap.inboxCount },
    scheduled: { label: "Scheduled Runs", count: ap.scheduledRuns.length },
    executed: { label: "Executed Runs", count: ap.executedRuns.length },
  };
  const order: ApFilter[] = ["inbox", "scheduled", "executed"];

  return (
    <>
      {/* Filter pills */}
      <div className="mb-3 flex items-center gap-1.5 rounded-md border-[0.5px] border-[#E5E4E0] bg-surface px-2.5 py-1.5">
        {order.map((f) => {
          const active = filter === f;
          const m = meta[f];
          return (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={
                "cursor-pointer rounded-[14px] border-[0.5px] px-3 py-1 text-t11 " +
                (active ? "border-ink bg-ink font-medium text-white" : "border-input bg-surface text-muted")
              }
            >
              {m.label} {m.count > 0 ? `(${m.count})` : ""}
            </button>
          );
        })}
        <span className="ml-auto text-t10 text-faint">
          Bills move here only after Billing certifies them
        </span>
      </div>

      {filter === "inbox" && <Inbox bills={ap.inbox} />}
      {filter === "scheduled" && <Runs runs={ap.scheduledRuns} kind="scheduled" />}
      {filter === "executed" && <Runs runs={ap.executedRuns} kind="executed" />}

      <div className="mt-3 rounded-md border-[0.5px] border-[#E5E4E0] bg-[#FBF9F6] px-3 py-2 text-t10 text-muted">
        <strong>Payment workflow:</strong> Bill arrives from Billing (certified) → Finance adds to weekly
        run → CFO approves → Bank file generated (NEFT/RTGS) → Bank executes → Status updates to paid,
        syncs to Tally as expense.
      </div>
    </>
  );
}
