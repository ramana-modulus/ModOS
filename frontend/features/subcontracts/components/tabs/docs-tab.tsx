"use client";

import type { ScDocsView } from "@/features/subcontracts/api";
import type { ScDoc } from "@/features/subcontracts/types";

const GT = "minmax(0,1fr) 150px 110px 100px 70px 90px";

const TYPE_COLORS: Record<string, string> = {
  "Work Order": "pb",
  Comparative: "pa",
  "Subbie Quote": "pa",
  "RA Bill": "pb",
  Agreement: "pg",
  "Rate Card": "pg",
  ASL: "pg",
  Compliance: "pgr",
  Policy: "pa",
  Template: "pb",
};
const STATUS_PILL: Record<string, string> = {
  Active: "pg",
  Released: "pg",
  Certified: "pg",
  Sent: "pb",
  Received: "pa",
  Draft: "pgr",
  Expired: "pr",
};

function Rows({ list }: { list: ScDoc[] }) {
  return (
    <>
      {list.map((d) => (
        <div key={d.name} className="tr" style={{ gridTemplateColumns: GT }}>
          <span>
            <div className="text-t11 font-medium text-ink">
              <i className="ti ti-file mr-1" style={{ fontSize: 11, color: "#854F0B", verticalAlign: -1 }} />
              {d.name}
            </div>
          </span>
          <span>
            <span className={"pill " + (TYPE_COLORS[d.type] ?? "pgr")} style={{ fontSize: 9 }}>
              {d.type}
            </span>
          </span>
          <span className="text-t10 text-muted">{d.by}</span>
          <span className="text-t10 text-faint">{d.uploaded}</span>
          <span className="text-t10 text-faint">{d.size}</span>
          <span>
            <span className={"pill " + (STATUS_PILL[d.status] ?? "pg")} style={{ fontSize: 9 }}>
              {d.status}
            </span>
          </span>
        </div>
      ))}
    </>
  );
}

function Head() {
  return (
    <div className="th" style={{ gridTemplateColumns: GT }}>
      <span>Document</span>
      <span>Type</span>
      <span>Owner / By</span>
      <span>Date</span>
      <span>Size</span>
      <span>Status</span>
    </div>
  );
}

function Banner({ label, n, right }: { label: string; n: number; right?: string }) {
  return (
    <div className="mt-2.5 flex items-center justify-between rounded-t-md px-3.5 py-[7px] text-t9 font-bold uppercase tracking-[0.6px] text-white" style={{ background: "#1A1917" }}>
      <span>
        {label} <span className="ml-1.5 font-normal normal-case tracking-normal opacity-55">{n} doc{n === 1 ? "" : "s"}</span>
      </span>
      {right && <span className="text-t9 font-medium normal-case tracking-normal opacity-70">{right}</span>}
    </div>
  );
}

export function DocsTab({ data }: { data: ScDocsView }) {
  return (
    <div>
      <div className="mb-2.5 rounded-md px-2.5 py-2 text-t11 text-faint" style={{ background: "#E6F1FB" }}>
        <i className="ti ti-info-circle" style={{ verticalAlign: -2, color: "#185FA5" }} /> <strong>Subcontract documents.</strong> Standing reference
        docs (subcontract agreement &amp; GCC, labour rate card, approved/debarred subcontractor lists, EHS / retention / back-charge policies,
        labour-compliance &amp; insurance) live at the department level and apply to every project. Work orders, comparative statements, subbie quotes
        and RA / measurement abstracts are filed against the sub-project they were raised for.
      </div>

      <Banner label="Standing / reference documents" n={data.standing.length} right="department-wide · apply to every project" />
      <div className="tw overflow-x-auto rounded-t-none">
        <Head />
        <Rows list={data.standing} />
      </div>

      <Banner label="Work Orders & RA Bills" n={data.scoped.length} right={data.scopeName} />
      {data.scoped.length > 0 ? (
        <div className="tw overflow-x-auto rounded-t-none">
          <Head />
          <Rows list={data.scoped} />
        </div>
      ) : (
        <div className="rounded-b-lg bg-[#F5F4F2] p-5 text-center text-t11 text-faint">
          No work orders or RA bills filed here yet — they will appear as packages are awarded and certified.
        </div>
      )}
    </div>
  );
}
