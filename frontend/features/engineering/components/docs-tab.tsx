"use client";

import { Pill } from "@/components/ui/badge";
import type { EngineeringPayload } from "@/features/engineering/api";
import { EmptyState, InfoBanner } from "./eng-ui";

const TYPE_PILL: Record<string, "pg" | "pa" | "pb" | "pgr" | "pr" | "pac"> = {
  "Design Basis Report": "pb",
  Calculations: "pa",
  "Tech Spec": "pg",
  "Site Report": "pgr",
  Reference: "pgr",
  Vetting: "pa",
};

const STATUS_PILL: Record<string, "pg" | "pa" | "pgr"> = {
  Active: "pg",
  Draft: "pa",
  Reference: "pgr",
  "In Review": "pa",
};

export function DocsTab({ data }: { data: EngineeringPayload }) {
  const docs = data.docs;
  return (
    <div>
      <InfoBanner tone="info">
        <span>ℹ️</span>
        <span>
          Engineering documents — design basis, calculations, specs, references, and vetting submissions. These
          supplement the drawings + BOM with the technical rationale for the design.
        </span>
      </InfoBanner>
      {docs.length === 0 ? (
        <EmptyState>No engineering documents uploaded yet for this sub-project.</EmptyState>
      ) : (
        <div className="tw">
          <div className="th" style={{ gridTemplateColumns: "1fr 150px 130px 100px 70px 90px" }}>
            <span>Document</span>
            <span>Type</span>
            <span>Uploaded By</span>
            <span>Date</span>
            <span>Size</span>
            <span>Status</span>
          </div>
          {docs.map((d) => (
            <div key={d.name} className="tr" style={{ gridTemplateColumns: "1fr 150px 130px 100px 70px 90px" }}>
              <span className="truncate text-t11 font-medium text-ink">📄 {d.name}</span>
              <span>
                <Pill cls={TYPE_PILL[d.type] ?? "pgr"}>{d.type}</Pill>
              </span>
              <span className="text-t10 text-muted">{d.by}</span>
              <span className="text-t10 text-faint">{d.uploaded}</span>
              <span className="text-t10 text-faint">{d.size}</span>
              <span>
                <Pill cls={STATUS_PILL[d.status] ?? "pg"}>{d.status}</Pill>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
