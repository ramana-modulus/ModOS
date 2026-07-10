"use client";

import { useState } from "react";
import { fmtC, fmtQ } from "@/lib/format";
import type { BillingView, VendorBill, VendorBillStatus, VendorBillType } from "@/features/billing/types";
import { RouteBar } from "../route-bar";

const STATUS_META: Record<VendorBillStatus, { label: string; color: string; bg: string }> = {
  received: { label: "Received — to verify", color: "#854F0B", bg: "#FBF1E0" },
  verifying: { label: "Verifying", color: "#854F0B", bg: "#FBF1E0" },
  qc_signed: { label: "QC signed", color: "#185FA5", bg: "#E6F1FB" },
  certified: { label: "Certified", color: "#185FA5", bg: "#E6F1FB" },
  sent_to_finance: { label: "Sent to Finance", color: "#185FA5", bg: "#E6F1FB" },
  paid: { label: "Paid", color: "#3B6D11", bg: "#EAF3DE" },
  rejected: { label: "Rejected", color: "#A32D2D", bg: "#FCEBEB" },
};

const TYPE_LABEL: Record<VendorBillType, string> = {
  material_supplier: "Material supplier",
  services: "Services",
  subcontractor_ra: "Subcontractor RA",
};

const TYPE_FILTERS: { key: string; label: string }[] = [
  { key: "all", label: "All types" },
  { key: "material_supplier", label: "Material" },
  { key: "services", label: "Services" },
];

const STATUS_FILTERS: { key: string; label: string }[] = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "sent_to_finance", label: "Sent to Finance" },
  { key: "paid", label: "Paid" },
];

const OPEN_STATUSES: VendorBillStatus[] = ["received", "verifying", "qc_signed", "certified"];

function Row({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex justify-between py-0.5 text-t10">
      <span className="text-muted">{label}</span>
      <span style={tone ? { color: tone } : undefined} className={tone ? "" : "text-ink"}>
        {value}
      </span>
    </div>
  );
}

function BillCard({ bill }: { bill: VendorBill }) {
  const meta = STATUS_META[bill.status];
  return (
    <div className="mb-2.5 overflow-hidden rounded-lg border-[0.5px] border-line bg-white">
      <div className="flex flex-wrap items-center gap-2 border-b-[0.5px] border-[#F0EFEB] px-3 py-2.5" style={{ background: "#FAFAF8" }}>
        <span className="font-mono text-t10 text-muted">{bill.id}</span>
        <span className="text-t12 font-semibold text-ink">{bill.vendor}</span>
        <span className="rounded-[3px] px-1.5 py-px text-t8 font-semibold" style={{ color: "#5B5A57", background: "#F0EFEB" }}>
          {TYPE_LABEL[bill.type]}
        </span>
        <span className="text-t9 text-faint">
          {bill.billNo} · {bill.poRef || "no PO"} · {bill.billDate}
        </span>
        <span className="ml-auto rounded-[3px] px-2 py-0.5 text-t9 font-semibold" style={{ color: meta.color, background: meta.bg }}>
          {meta.label}
        </span>
      </div>

      <div className="grid gap-3 px-3 py-2.5 md:grid-cols-2">
        <div>
          <div className="mb-1 text-t9 font-semibold uppercase tracking-[0.4px] text-faint">Line items</div>
          {bill.lineItems.map((li, i) => (
            <div key={i} className="flex items-center gap-2 border-b-[0.5px] border-[#F0EFEB] py-1 text-t10">
              {li.bomCode && <span className="font-mono text-muted" style={{ color: "#854F0B" }}>{li.bomCode}</span>}
              <span className="flex-1 text-ink-soft">{li.desc}</span>
              <span className="text-faint">
                {fmtQ(li.qty)} {li.uom} × ₹{fmtC(li.rate)}
              </span>
              <span className="font-semibold text-ink">₹{fmtC(li.amount)}</span>
            </div>
          ))}
        </div>
        <div className="rounded-md border-[0.5px] border-line px-3 py-2" style={{ background: "#FBF9F6" }}>
          <Row label="Gross amount" value={`₹${fmtC(bill.grossAmount)}`} />
          {bill.tds > 0 && <Row label="Less: TDS" value={`−₹${fmtC(bill.tds)}`} tone="#A32D2D" />}
          {bill.retention > 0 && <Row label="Less: Retention" value={`−₹${fmtC(bill.retention)}`} tone="#A32D2D" />}
          <Row label="Add: GST (18%)" value={`+₹${fmtC(bill.gst)}`} />
          <div className="mt-1 flex justify-between border-t-[0.5px] border-line pt-1 text-t10 font-bold text-ink">
            <span>Net payable</span>
            <span>₹{fmtC(bill.netPayable)}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t-[0.5px] border-[#F0EFEB] px-3 py-2 text-t9 text-faint">
        <span>{bill.verifiedBy ? `✓ Verified by ${bill.verifiedBy}` : "○ Not verified"}</span>
        <span>{bill.qcSignOff ? `QC ${bill.qcSignOff}` : "QC pending"}</span>
        <span>{bill.certifiedBy ? `Certified by ${bill.certifiedBy}` : "Not certified"}</span>
        <span>{bill.sentToFinanceOn ? `→ Finance ${bill.sentToFinanceOn}` : "Not forwarded"}</span>
        <span>{bill.paidOn ? `Paid ${bill.paidOn}` : ""}</span>
      </div>

      {bill.blockers && bill.blockers.length > 0 && (
        <div className="border-t-[0.5px] border-[#E8C9C9] px-3 py-2 text-t10" style={{ background: "#FBF3F3", color: "#A32D2D" }}>
          ⛔ {bill.blockers.join(" · ")}
        </div>
      )}
    </div>
  );
}

export function VendorBillsTab({ data }: { data: BillingView }) {
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const bills = data.vendorBills.filter((b) => {
    if (typeFilter !== "all" && b.type !== typeFilter) return false;
    if (statusFilter === "all") return true;
    if (statusFilter === "open") return OPEN_STATUSES.includes(b.status);
    return b.status === statusFilter;
  });

  const totalNet = bills.reduce((s, b) => s + b.netPayable, 0);
  const openCount = data.vendorBills.filter((b) => OPEN_STATUSES.includes(b.status)).length;

  return (
    <>
      <RouteBar
        inherit="Procurement (PO ↔ GRN) + services POs"
        route="Finance — consolidated AP / payment run"
        note="3-way match: bill ↔ PO ↔ GRN + QC sign-off"
      />

      <div className="mb-3 flex flex-wrap items-center gap-2">
        {TYPE_FILTERS.map((f) => {
          const active = typeFilter === f.key;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setTypeFilter(f.key)}
              className="cursor-pointer rounded-[14px] border-[0.5px] px-3 py-1 text-t11"
              style={{ borderColor: active ? "var(--ac)" : "#D8D7D4", background: active ? "var(--ac-lt)" : "#fff", color: active ? "var(--ac)" : "#6B6A68" }}
            >
              {f.label}
            </button>
          );
        })}
        <span className="mx-1 text-faint">|</span>
        {STATUS_FILTERS.map((f) => {
          const active = statusFilter === f.key;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setStatusFilter(f.key)}
              className="cursor-pointer rounded-[14px] border-[0.5px] px-3 py-1 text-t11"
              style={{ borderColor: active ? "var(--ac)" : "#D8D7D4", background: active ? "var(--ac-lt)" : "#fff", color: active ? "var(--ac)" : "#6B6A68" }}
            >
              {f.label}
            </button>
          );
        })}
        <span className="ml-auto text-t9 text-faint">
          {openCount} open · net shown ₹{fmtC(totalNet)}
        </span>
      </div>

      {bills.length === 0 ? (
        <div className="rounded-lg border-[0.5px] border-dashed border-line bg-white py-7 text-center text-t11 text-faint">
          No vendor bills in this view.
        </div>
      ) : (
        bills.map((b) => <BillCard key={b.id} bill={b} />)
      )}
    </>
  );
}
