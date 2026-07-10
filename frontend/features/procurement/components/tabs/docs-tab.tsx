"use client";

import { IconFile, IconInfoCircle, IconUpload } from "@tabler/icons-react";
import type { ProcDoc } from "@/types/procurement";
import type { ScopeParams } from "@/features/procurement/api/types";
import { procurementApi } from "@/features/procurement/api/client";
import { useQuery } from "@/features/procurement/hooks/use-query";
import { Pill } from "@/components/ui/badge";
import { CatBanner } from "@/features/procurement/components/cat-banner";

const GT = "1fr 150px 110px 100px 70px 90px";
const TYPE_CLS: Record<string, "pg" | "pa" | "pb" | "pgr" | "pr"> = {
  "RFQ Letter": "pb", "Vendor Quote": "pa", "Rate Contract": "pg", "Commercial Terms": "pgr",
  AVL: "pg", Compliance: "pgr", "HSN/GST Master": "pgr", "Spec Master": "pg", Template: "pb", Policy: "pa",
};
const STATUS_CLS: Record<string, "pg" | "pb" | "pa" | "pgr" | "pr"> = {
  Active: "pg", Sent: "pb", Received: "pa", Draft: "pgr", Expired: "pr",
};

function DocTable({ list }: { list: ProcDoc[] }) {
  return (
    <div className="tw rounded-b-md">
      <div className="th" style={{ gridTemplateColumns: GT }}>
        <span>Document</span><span>Type</span><span>Owner / By</span><span>Date</span><span>Size</span><span>Status</span>
      </div>
      {list.map((d, i) => (
        <div key={i} className="tr" style={{ gridTemplateColumns: GT }}>
          <span className="text-t11 font-medium text-ink"><IconFile size={11} className="mr-1 inline align-[-1px] text-warn" />{d.name}</span>
          <span><Pill cls={TYPE_CLS[d.type] ?? "pgr"}>{d.type}</Pill></span>
          <span className="text-t10 text-muted">{d.by}</span>
          <span className="text-t10 text-faint">{d.uploaded}</span>
          <span className="text-t10 text-faint">{d.size}</span>
          <span><Pill cls={STATUS_CLS[d.status] ?? "pg"}>{d.status}</Pill></span>
        </div>
      ))}
    </div>
  );
}

export function DocsTab({ scope }: { scope: ScopeParams }) {
  const { data, loading, error } = useQuery(() => procurementApi.getDocs(scope), [scope.project, scope.subProject]);
  if (loading || !data) return <div className="px-3.5 py-8 text-center text-t11 text-faint">{error ?? "Loading documents…"}</div>;

  return (
    <div>
      <div className="mb-2.5 rounded-md bg-info-soft px-2.5 py-2 text-t11 text-faint">
        <IconInfoCircle size={12} className="mr-1 inline align-[-2px] text-info" /> <strong className="text-ink">Procurement documents.</strong>{" "}
        Standing reference docs (policy, GTC, rate contracts, AVL, compliance &amp; HSN/GST masters, templates) live at the department level and apply to every project. RFQ letters and vendor quotes are filed against the sub-project they were raised for.
      </div>
      <div className="mb-1.5 flex justify-end gap-1.5">
        <button className="rounded-md border-[0.5px] border-input bg-surface px-2 py-1 text-t10 text-muted" type="button">+ Upload Vendor Quote</button>
        <button className="rounded-md border-[0.5px] border-input bg-surface px-2 py-1 text-t10 text-muted" type="button">+ New RFQ Letter</button>
        <button className="rounded-md border-[0.5px] border-accent bg-accent px-2 py-1 text-t10 font-medium text-white" type="button"><IconUpload size={11} className="mr-1 inline align-[-1px]" />Upload Document</button>
      </div>

      <CatBanner cat="Standing / reference documents" count={data.standing.length} noun="doc" right={<span className="opacity-70">department-wide · apply to every project</span>} />
      <DocTable list={data.standing} />

      <div className="mt-2.5">
        <CatBanner cat="RFQs & Vendor Quotes" count={data.docs.length} noun="doc" right={data.subProjectName ? <span className="opacity-70">{data.subProjectName}</span> : undefined} />
        {data.docs.length ? (
          <DocTable list={data.docs} />
        ) : (
          <div className="rounded-b-lg bg-canvas p-5 text-center text-t11 text-faint">No RFQ letters or vendor quotes filed here yet — they will appear as enquiries are raised.</div>
        )}
      </div>
    </div>
  );
}
