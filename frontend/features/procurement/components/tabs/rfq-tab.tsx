"use client";

import {
  IconAlertTriangle,
  IconArchive,
  IconBell,
  IconBoltFilled,
  IconCheck,
  IconClock,
  IconClockPlay,
  IconFileText,
  IconMailFast,
  IconRotateClockwise,
  IconSend,
  IconUser,
  IconUserPlus,
} from "@tabler/icons-react";
import type { InvitedVendor } from "@/types/procurement";
import type { RfqCard as RfqCardVM, ScopeParams } from "@/features/procurement/api/types";
import { procurementApi } from "@/features/procurement/api/client";
import { useQuery } from "@/features/procurement/hooks/use-query";
import { CatBanner } from "@/features/procurement/components/cat-banner";
import { fmtQ } from "@/lib/format";

const btn =
  "inline-flex items-center gap-1 whitespace-nowrap rounded-md border-[0.5px] border-input bg-surface px-2 py-[3px] text-t9 text-muted hover:bg-canvas";
const btnBlue = "inline-flex items-center gap-1 whitespace-nowrap rounded-md border-[0.5px] border-info bg-info px-2 py-[3px] text-t9 text-white";

const VENDOR_CHIP: Record<string, { bg: string; fg: string; icon: string }> = {
  responded: { bg: "#EAF3DE", fg: "#3B6D11", icon: "✓" },
  pending: { bg: "#FAEEDA", fg: "#854F0B", icon: "⏳" },
  declined: { bg: "#FCEBEB", fg: "#A32D2D", icon: "✗" },
  invited: { bg: "#F5F4F2", fg: "#9B9894", icon: "—" },
};

function vendorSub(v: InvitedVendor, card: RfqCardVM): string {
  if (v.status === "responded" && v.quoteId) {
    const q = card.quotes.find((qq) => qq.id === v.quoteId);
    if (q) return `₹${q.rate}/${card.rfq.uom}${v.respondedAt ? ` · ${v.respondedAt}` : ""}`;
  }
  if (v.status === "responded") return v.respondedAt ?? "";
  if (v.status === "declined") return v.reason ?? "declined";
  if (v.status === "pending") return "awaiting";
  return v.status;
}

function RfqCard({ card, isOpen, onCompare }: { card: RfqCardVM; isOpen: boolean; onCompare: () => void }) {
  const r = card.rfq;
  const responded = r.invitedVendors.filter((v) => v.status === "responded").length;
  const declined = r.invitedVendors.filter((v) => v.status === "declined").length;
  const pending = r.invitedVendors.filter((v) => v.status === "pending").length;

  return (
    <div
      className="mb-2 rounded-md border-[0.5px] bg-surface px-3.5 py-3"
      style={{ borderColor: isOpen ? "#185FA5" : "#E5E4E0", borderLeft: `3px solid ${isOpen ? "#185FA5" : "#9B9894"}` }}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-t11 font-semibold text-ink">{r.rfqId}</span>
          {isOpen ? (
            <span className="rounded-lg bg-info-soft px-[7px] py-0.5 text-t9 font-semibold text-info">⏳ OPEN</span>
          ) : (
            <span className="rounded-lg bg-canvas px-[7px] py-0.5 text-t9 font-medium text-muted">CLOSED</span>
          )}
          <span className="font-mono text-t10 text-warn">{card.code}</span>
          <span className="text-t11 text-ink">{card.name}</span>
        </div>
        <div className="text-t10 text-muted">
          {fmtQ(r.qty)} {r.uom}
        </div>
      </div>

      <div className="mb-2 flex flex-wrap gap-x-3.5 gap-y-1 text-t10 text-muted">
        <div>
          <IconUser size={11} className="mr-1 inline align-[-2px]" />
          Floated by <strong className="text-ink">{r.floatedBy}</strong> on {r.floatedAt}
        </div>
        {isOpen ? (
          <div>
            <IconClock size={11} className="mr-1 inline align-[-2px] text-info" />
            Deadline: <strong className="text-info">{r.deadline}</strong>
          </div>
        ) : (
          <div>
            <IconCheck size={11} className="mr-1 inline align-[-2px] text-success" />
            Closed: {r.closedAt} — {r.closedReason}
          </div>
        )}
      </div>

      <div className="mb-2 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <div>
          <div className="mb-1 text-t9 font-medium uppercase tracking-[0.4px] text-faint">
            Response Status ({r.invitedVendors.length} invited)
          </div>
          <div className="flex gap-2.5 text-t10">
            <span className="text-success">
              <strong>{responded}</strong> responded
            </span>
            {pending > 0 && (
              <span className="text-warn">
                <strong>{pending}</strong> pending
              </span>
            )}
            {declined > 0 && (
              <span className="text-danger">
                <strong>{declined}</strong> declined
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-end justify-end gap-1.5">
          {isOpen && (
            <button type="button" className={btnBlue}>
              <IconUserPlus size={10} /> Add vendors
            </button>
          )}
          {!isOpen && (
            <button type="button" className={btn}>
              <IconRotateClockwise size={10} /> Reopen &amp; add
            </button>
          )}
          {isOpen && (
            <button type="button" className={btn}>
              <IconBell size={10} /> Remind
            </button>
          )}
          {isOpen && responded > 0 && (
            <button type="button" className={btnBlue} onClick={onCompare}>
              Compare Quotes →
            </button>
          )}
          <button type="button" className={btn}>
            <IconFileText size={10} /> Letter
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {r.invitedVendors.map((v) => {
          const cfg = VENDOR_CHIP[v.status] ?? VENDOR_CHIP.invited!;
          return (
            <div key={v.vCode} className="flex min-w-[120px] flex-col gap-px rounded-md px-2.5 py-[5px] text-t10" style={{ background: cfg.bg }}>
              <div className="font-medium" style={{ color: cfg.fg }}>
                {cfg.icon} {v.name}
              </div>
              <div className="text-t9 text-muted">{vendorSub(v, card)}</div>
            </div>
          );
        })}
      </div>

      {r.notes && <div className="mt-2 rounded bg-[#FBF9F6] px-2.5 py-1.5 text-t10 italic text-muted">{r.notes}</div>}
    </div>
  );
}

export function RfqTab({ scope, onGoToQuotes }: { scope: ScopeParams; onGoToQuotes: () => void }) {
  const { data, loading, error } = useQuery(() => procurementApi.getRfqView(scope), [scope.project, scope.subProject]);

  if (loading) return <div className="px-3.5 py-8 text-center text-t11 text-faint">Loading RFQs…</div>;
  if (error || !data) return <div className="rounded-lg bg-canvas p-8 text-center text-t11 text-faint">{error ?? "No data."}</div>;

  const { counts, needAction, openGroups, closedGroups, bypassed } = data;
  const empty = openGroups.length === 0 && closedGroups.length === 0 && bypassed.length === 0;

  return (
    <div>
      {/* Header banner */}
      <div className="mb-2.5 flex items-center gap-3 rounded-md border-[0.5px] border-info bg-info-soft px-3 py-2.5">
        <IconMailFast size={20} className="text-info" aria-hidden />
        <div className="flex-1">
          <div className="text-t12 font-semibold text-info">Request for Quotation (RFQ) Workflow</div>
          <div className="text-t10 text-muted">
            Float RFQ → invite vendors → track responses → compare quotes. Rate-contract-covered items
            bypass this step. {counts.open} open · {counts.closed} closed · {counts.bypassed} bypassed via RC.
          </div>
        </div>
        <button type="button" className={btnBlue + " px-2.5 py-1.5 text-t10"}>
          <IconSend size={10} /> Float New RFQ
        </button>
      </div>

      {/* Need-action banner */}
      {needAction.length > 0 && (
        <div className="mb-2.5 rounded-md border-[0.5px] border-warn bg-warn-soft px-3 py-2.5">
          <div className="mb-1.5 text-t11 font-semibold text-warn">
            <IconAlertTriangle size={13} className="mr-1 inline align-[-2px]" />
            {needAction.length} BOM item{needAction.length > 1 ? "s have" : " has"} no RFQ, no Rate Contract, no PO — action needed
          </div>
          <div className="flex flex-wrap gap-1.5">
            {needAction.map((i) => (
              <span key={i.code} className="cursor-pointer rounded-[14px] border-[0.5px] border-dashed border-warn bg-surface px-2.5 py-1 text-t10 text-warn">
                <strong className="font-mono">{i.code}</strong>{" "}
                <span className="text-muted">{i.name.length > 28 ? i.name.slice(0, 28) + "…" : i.name}</span> ·{" "}
                <span className="text-ink">
                  {fmtQ(i.totalQty)} {i.uom}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Open RFQs */}
      {openGroups.length > 0 && (
        <>
          <div className="mb-2 text-t11 font-semibold uppercase tracking-[0.4px] text-info">
            <IconClockPlay size={13} className="mr-1 inline align-[-2px]" />
            Open RFQs ({counts.open})
          </div>
          {openGroups.map((g) => (
            <div key={g.cat}>
              <CatBanner cat={g.cat} count={g.cards.length} noun="RFQ" />
              {g.cards.map((c) => (
                <RfqCard key={c.key} card={c} isOpen onCompare={onGoToQuotes} />
              ))}
            </div>
          ))}
        </>
      )}

      {/* Bypassed via RC */}
      {bypassed.length > 0 && (
        <>
          <div className="mb-2 mt-3.5 text-t11 font-semibold uppercase tracking-[0.4px] text-success">
            <IconBoltFilled size={13} className="mr-1 inline align-[-2px]" />
            RFQ Bypassed — Rate Contract Used ({bypassed.length})
          </div>
          {bypassed.map((b) => (
            <div
              key={b.code}
              className="mb-1.5 flex items-center gap-3.5 rounded-md border-[0.5px] border-success bg-surface px-3.5 py-2.5 text-t10"
              style={{ borderLeft: "3px solid #3B6D11" }}
            >
              <IconBoltFilled size={16} className="text-success" />
              <div className="flex-1">
                <div>
                  <span className="font-mono text-warn">{b.code}</span> <strong>{b.name}</strong> · {fmtQ(b.qty)} {b.uom}
                </div>
                <div className="mt-0.5 text-muted">
                  RC <span className="font-mono text-success">{b.rc?.id}</span> with {b.rc?.vendorName} @ ₹{b.rc?.rate}/{b.rc?.uom} — direct PO raised, no quotes needed
                </div>
              </div>
              <div className="text-t9 text-faint">{b.closedAt}</div>
            </div>
          ))}
        </>
      )}

      {/* Closed RFQs */}
      {closedGroups.length > 0 && (
        <>
          <div className="mb-2 mt-3.5 text-t11 font-semibold uppercase tracking-[0.4px] text-muted">
            <IconArchive size={13} className="mr-1 inline align-[-2px]" />
            Closed RFQs ({counts.closed})
          </div>
          {closedGroups.map((g) => (
            <div key={g.cat}>
              <CatBanner cat={g.cat} count={g.cards.length} noun="RFQ" />
              {g.cards.map((c) => (
                <RfqCard key={c.key} card={c} isOpen={false} onCompare={onGoToQuotes} />
              ))}
            </div>
          ))}
        </>
      )}

      {empty && (
        <div className="rounded-lg bg-canvas p-8 text-center text-t11 text-faint">No RFQs floated yet for this sub-project.</div>
      )}
    </div>
  );
}
