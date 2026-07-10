"use client";

import { Pill } from "@/components/ui/badge";
import type { EngineeringPayload } from "@/features/engineering/api";
import type { TenderItem } from "@/features/engineering/types";
import { EmptyState } from "./eng-ui";

const SECTION_COLORS: Record<string, string> = {
  client_info: "#185FA5",
  scope: "#854F0B",
  commercial: "#3B6D11",
  bd_docs: "#C84B2F",
  est_boq: "#6B419F",
  sub_projects: "#1A1917",
  contractual: "#6B6A68",
};

const FILE_ICON: Record<string, string> = {
  pdf: "📄",
  xlsx: "📊",
  docx: "📝",
  zip: "🗜️",
  jpg: "🖼️",
  png: "🖼️",
};

function isFile(item: TenderItem): boolean {
  return !!item.kind && /pdf|xlsx|docx|zip|jpg|png/.test(item.kind);
}

export function IncomingTab({ data }: { data: EngineeringPayload }) {
  const pack = data.tenderPack;
  if (!pack) {
    return (
      <EmptyState>
        No Tender Pack assembled for this project.
        <br />
        <span className="text-t9">Tender Packs are auto-created when BD marks a deal as Won.</span>
      </EmptyState>
    );
  }

  const coAccepted = pack.changeOrders.filter((c) => c.status === "accepted").length;
  const coPending = pack.changeOrders.filter((c) => c.status === "pending").length;

  return (
    <div>
      {/* Header — pack metadata */}
      <div className="mb-3 flex items-center gap-3.5 rounded-lg border-[0.5px] border-line bg-canvas px-3.5 py-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-accent-soft text-t18 text-accent">
          🗂
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-0.5 text-t13 font-semibold text-ink">Tender Pack — {data.project.name}</div>
          <div className="text-t9 text-muted">
            Frozen on <strong>{pack.frozenAt}</strong> by {pack.frozenBy} · Source lead:{" "}
            <span className="font-mono text-accent">{pack.sourceLeadId}</span>
          </div>
        </div>
        <div className="flex flex-shrink-0 gap-1.5">
          <Pill cls="pg">🔒 Frozen — read only</Pill>
          {coAccepted > 0 && (
            <Pill cls="pa">
              {coAccepted} Change Order{coAccepted > 1 ? "s" : ""} accepted
            </Pill>
          )}
          {coPending > 0 && <Pill cls="pr">{coPending} CO pending</Pill>}
        </div>
      </div>

      {/* Notice */}
      <div className="mb-3 flex gap-2.5 rounded-md bg-info-soft px-3 py-2.5 text-t10 text-info">
        <span className="flex-shrink-0">ℹ️</span>
        <div className="flex-1">
          <strong>This is your engineering brief.</strong> Auto-assembled from BD&apos;s lead docs + Estimation&apos;s
          approved BOQ at deal close. Engineer everything against this pack as the source of truth. Any scope, qty, or
          spec change after freeze requires a <strong>formal Change Order</strong> raised by Contracts &amp; Legal —
          never silent revisions.
        </div>
      </div>

      {/* Change orders */}
      {pack.changeOrders.length > 0 && (
        <div className="mb-3 overflow-hidden rounded-lg border-[0.5px] border-line bg-surface">
          <div className="flex items-center gap-2 border-b-[0.5px] border-warn/40 bg-warn-soft px-3 py-2.5">
            <span className="flex-1 text-t11 font-semibold text-warn">⇄ Change Orders against this Pack</span>
            <span className="text-t9 text-warn">
              {pack.changeOrders.length} CO{pack.changeOrders.length > 1 ? "s" : ""}
            </span>
          </div>
          <div className="px-3 py-2">
            {pack.changeOrders.map((co) => (
              <div key={co.id} className="mb-1.5 rounded-md border-[0.5px] border-line p-2">
                <div className="mb-1 flex items-center gap-2">
                  <span className="font-mono text-t10 font-semibold text-warn">{co.id}</span>
                  <span className="flex-1 text-t10 font-medium text-ink">{co.title}</span>
                  <Pill cls={co.status === "accepted" ? "pg" : co.status === "pending" ? "pa" : "pgr"}>{co.status}</Pill>
                </div>
                <div className="mb-0.5 text-t9 text-muted">
                  <strong>Requested by:</strong> {co.requestedBy} on {co.date}
                </div>
                <div className="mb-0.5 text-t9 text-muted">
                  <strong>Impact:</strong> {co.impact}
                </div>
                {co.status === "accepted" && (
                  <div className="text-t9 text-success">
                    <strong>Accepted:</strong> {co.acceptedOn} by {co.acceptedBy}
                  </div>
                )}
                {co.sectionsAffected && (
                  <div className="mt-0.5 text-t9 text-faint">Sections affected: {co.sectionsAffected.join(", ")}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sections */}
      {pack.sections.map((sec) => {
        const color = SECTION_COLORS[sec.id] ?? "#6B6A68";
        return (
          <div key={sec.id} className="mb-2.5 overflow-hidden rounded-lg border-[0.5px] border-line bg-surface">
            <div className="flex items-center gap-2 border-b-[0.5px] border-line bg-canvas px-3 py-2.5">
              <span
                className="flex h-5.5 w-5.5 flex-shrink-0 items-center justify-center rounded text-t11"
                style={{ background: `${color}1A`, color }}
              >
                ●
              </span>
              <div className="flex-1 text-t11 font-semibold text-ink">{sec.label}</div>
              <div className="text-t9 text-faint">
                {sec.items.length} item{sec.items.length === 1 ? "" : "s"}
              </div>
            </div>
            <div className="px-3 py-2">
              {sec.items.map((item, i) =>
                isFile(item) ? (
                  <div key={i} className="flex items-center gap-2.5 border-b-[0.5px] border-line/60 py-1.5 text-t10">
                    <span
                      className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded bg-subtle text-t11"
                      style={{ color }}
                    >
                      {FILE_ICON[item.kind ?? ""] ?? "📄"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-t10 font-medium text-ink">{item.label}</div>
                      <div className="truncate font-mono text-t9 text-faint">
                        {item.value}
                        {item.size ? ` · ${item.size}` : ""}
                        {item.uploadedBy ? ` · by ${item.uploadedBy}` : ""}
                        {item.uploadedOn ? ` · ${item.uploadedOn}` : ""}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    key={i}
                    className="grid gap-2.5 border-b-[0.5px] border-line/60 py-1.5 text-t10"
                    style={{ gridTemplateColumns: "160px 1fr" }}
                  >
                    <div className="font-medium text-faint">{item.label}</div>
                    <div className="text-ink">
                      {item.value}
                      {item.linkTo && <span className="ml-1 text-t9 text-accent">· view in {item.linkTo} →</span>}
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
