import { fmtC } from "@/lib/format";
import { MetricStrip } from "@/features/procurement/components/metric-strip";
import type { ContractsPayload } from "@/features/contracts/api";
import type { ContractBid, ContractTender, EmdRecord, Rfi, Submittal } from "@/features/contracts/types";
import { bidGates, isCostingReceived, openRfiCount, tenderMetrics } from "@/features/contracts/domain";
import { CardBox, CPill, CTable, EmptyState, StatusPill } from "./ui";

type PreSub = "pipeline" | "submittals" | "rfi" | "bid" | "emd" | "similar";

const PRE_TABS: [PreSub, string][] = [
  ["pipeline", "Tender Pipeline"],
  ["submittals", "Submittals"],
  ["rfi", "RFI / Pre-Bid"],
  ["bid", "Bid Submission"],
  ["emd", "EMD / Fee"],
  ["similar", "Similar Works"],
];

const cardHead: React.CSSProperties = {
  padding: "10px 12px",
  borderBottom: "1px solid #E8E7E4",
  fontSize: "12px",
  fontWeight: 600,
  color: "#1A1917",
};

export function PreSalesView({
  data,
  tender,
  setTender,
  preSub,
  setPreSub,
}: {
  data: ContractsPayload;
  tender: string;
  setTender: (id: string) => void;
  preSub: PreSub;
  setPreSub: (s: PreSub) => void;
}) {
  const tenders = data.tenders;
  const t = tenders.find((x) => x.dealId === tender) ?? tenders[0];
  if (!t) return <EmptyState>No tenders available.</EmptyState>;

  const subs = data.submittals[t.dealId] ?? [];
  const emd = data.emd[t.dealId];
  const openRfi = openRfiCount(data.rfis, t.dealId);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Tender picker */}
      <div
        className="mb-2 flex items-center gap-2 rounded-md border-[0.5px] border-dashed px-2.5 py-[5px]"
        style={{ background: "#FBF9F6", borderColor: "#D8D7D4" }}
      >
        <span className="text-t10 font-medium uppercase tracking-[0.5px]" style={{ color: "#9B9894" }}>
          Tender:
        </span>
        <div className="flex flex-wrap gap-1">
          {tenders.map((x) => {
            const active = t.dealId === x.dealId;
            return (
              <div
                key={x.dealId}
                onClick={() => setTender(x.dealId)}
                className="cursor-pointer rounded-[14px] border-[0.5px] px-3 py-1 text-t11"
                style={{
                  borderColor: active ? "#7B1FA2" : "#D8D7D4",
                  background: active ? "#7B1FA2" : "#fff",
                  color: active ? "#fff" : "#4A4945",
                }}
              >
                {x.client.split(" ")[0]} <span style={{ opacity: 0.6 }}>{x.portal}</span>
              </div>
            );
          })}
        </div>
        <div className="ml-auto text-t10" style={{ color: "#9B9894" }}>
          {t.portalRef} · B2G
        </div>
      </div>

      <MetricStrip cells={tenderMetrics(t, subs, data.rfis, emd).map((c) => ({ label: c.l, value: c.v, color: c.c, sub: c.sub }))} />

      {/* Sub-tabs */}
      <div className="vtabs mb-2">
        {PRE_TABS.map(([id, lbl]) => (
          <div key={id} className={`vt${preSub === id ? " active" : ""}`} onClick={() => setPreSub(id)}>
            {lbl}
            {id === "rfi" && openRfi ? (
              <span
                className="ml-1 rounded-lg px-[5px] font-semibold"
                style={{ background: "#A32D2D", color: "#fff", fontSize: "9px" }}
              >
                {openRfi}
              </span>
            ) : null}
          </div>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {preSub === "pipeline" && <PipelineTab t={t} leadCosting={data.leadCosting} />}
        {preSub === "submittals" && <SubmittalsTab subs={subs} />}
        {preSub === "rfi" && <RfiTab rfis={data.rfis.filter((r) => r.tenderId === t.dealId)} />}
        {preSub === "bid" && <BidTab t={t} bid={data.bids[t.dealId]} subs={subs} emd={emd} leadCosting={data.leadCosting} />}
        {preSub === "emd" && <EmdTab emd={emd} />}
        {preSub === "similar" && <SimilarTab all={data.similar} tenderId={t.dealId} />}
      </div>
    </div>
  );
}

/* ── Pipeline ──────────────────────────────────────────────────────────── */
function PipelineTab({ t, leadCosting }: { t: ContractTender; leadCosting: Record<string, boolean> }) {
  const facts: [string, string][] = [
    ["Portal", t.portal],
    ["Portal Ref", t.portalRef],
    ["Client", t.client],
    ["Issued", t.issued],
    ["Pre-Bid Meeting", t.preBid],
    ["Due Date", t.dueDate],
    ["Owner", t.owner],
  ];
  const received = isCostingReceived(t.dealId, leadCosting);
  const statusNote =
    t.stage === "screening" ? (
      <span className="text-t10 font-medium" style={{ color: "#854F0B" }}>
        Screened doable — ready to forward to BD Deals
      </span>
    ) : t.stage === "submitted" ? (
      <span className="text-t10 font-medium" style={{ color: "#185FA5" }}>
        ✓ Bid submitted in portal
      </span>
    ) : received ? (
      <span className="text-t10 font-medium" style={{ color: "#3B6D11" }}>
        ✓ In BD Deals — costing received
      </span>
    ) : (
      <span className="text-t10 font-medium" style={{ color: "#854F0B" }}>
        ✓ In BD Deals — costing initiated
      </span>
    );

  return (
    <div style={{ background: "#fff", border: "0.5px solid #E8E7E4", borderRadius: "8px", padding: "14px" }}>
      <div className="flex flex-wrap gap-6">
        <div className="min-w-[240px] flex-1">
          <div className="mb-2 text-t10 uppercase tracking-[.4px]" style={{ color: "#9B9894" }}>
            Tender Source &amp; Screening
          </div>
          {facts.map(([k, v]) => (
            <div
              key={k}
              className="flex justify-between py-[5px]"
              style={{ borderBottom: "0.5px solid #F5F4F2" }}
            >
              <span className="text-t11" style={{ color: "#9B9894" }}>
                {k}
              </span>
              <span className="text-t11 font-medium" style={{ color: "#1A1917" }}>
                {v}
              </span>
            </div>
          ))}
        </div>
        <div className="min-w-[240px] flex-1">
          <div className="mb-2 text-t10 uppercase tracking-[.4px]" style={{ color: "#9B9894" }}>
            Criteria Check
          </div>
          <div className="mb-2.5 flex gap-2">
            <CPill color={t.financialOk ? "#3B6D11" : "#A32D2D"} bg={t.financialOk ? "#EAF3E0" : "#F6E0E0"}>
              {(t.financialOk ? "✓ " : "✗ ") + "Financial"}
            </CPill>
            <CPill color={t.technicalOk ? "#3B6D11" : "#A32D2D"} bg={t.technicalOk ? "#EAF3E0" : "#F6E0E0"}>
              {(t.technicalOk ? "✓ " : "✗ ") + "Technical"}
            </CPill>
          </div>
          <div className="text-t11 leading-[1.6]" style={{ color: "#6B6A68" }}>
            Screened doable → forwarded to <strong style={{ color: "#7B1FA2" }}>BD Deals</strong> as B2G. On estimation
            receipt the deal flips to <em>costing received</em>; Sales Head sets margin and moves it to Proposals → back
            to Contracts.
          </div>
          <div className="mt-3">{statusNote}</div>
        </div>
      </div>
    </div>
  );
}

/* ── Submittals ────────────────────────────────────────────────────────── */
function SubmittalsTab({ subs }: { subs: Submittal[] }) {
  const ready = subs.filter((s) => s.status === "ready").length;
  return (
    <CardBox>
      <div style={cardHead}>
        Submittal Checklist{subs.length ? ` — ${ready}/${subs.length} ready` : ""}
      </div>
      {subs.length === 0 ? (
        <EmptyState>No documents yet for this tender.</EmptyState>
      ) : (
        <CTable
          headers={["Document", "Category", "Owner", "Status"]}
          rows={subs.map((s) => [
            s.doc,
            <CPill key="c" color="#6B6A68" bg="#F0EFED">
              {s.cat}
            </CPill>,
            s.by || "—",
            <StatusPill key="s" status={s.status} />,
          ])}
        />
      )}
    </CardBox>
  );
}

/* ── RFI / Pre-Bid ─────────────────────────────────────────────────────── */
function RfiCard({ r }: { r: Rfi }) {
  const stById: Record<string, [string, string, string]> = {
    open: ["#854F0B", "#F6ECD9", "Open"],
    answered: ["#185FA5", "#E3EEF7", "Answered"],
    closed: ["#3B6D11", "#EAF3E0", "Closed"],
  };
  const [c, b, lbl] = stById[r.status] ?? ["#6B6A68", "#F0EFED", r.status];
  return (
    <div style={{ padding: "10px 14px", borderBottom: "0.5px solid #F0EFED" }}>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-t11 font-semibold" style={{ color: "#7B1FA2" }}>
          {r.id}{" "}
          <span className="font-normal" style={{ color: "#9B9894" }}>
            · {r.raisedBy} · {r.raisedOn}
          </span>
        </span>
        <span
          className="font-semibold"
          style={{ fontSize: "9.5px", color: c, background: b, padding: "2px 8px", borderRadius: "10px" }}
        >
          {lbl}
        </span>
      </div>
      <div className="mb-1.5 text-t11" style={{ color: "#1A1917" }}>
        {r.question}
      </div>
      {r.answer ? (
        <div
          className="text-t11"
          style={{
            color: "#3B6D11",
            background: "#F5F8F0",
            padding: "7px 10px",
            borderRadius: "6px",
            borderLeft: "2px solid #3B6D11",
          }}
        >
          ↳ {r.answer} <span style={{ color: "#9B9894" }}>— {r.answeredBy}, {r.answeredOn}</span>
        </div>
      ) : null}
    </div>
  );
}

function RfiTab({ rfis }: { rfis: Rfi[] }) {
  if (rfis.length === 0)
    return (
      <EmptyState>
        No RFIs raised for this tender. Estimation raises RFIs from their RFI tab → they appear here for Contracts to
        answer.
      </EmptyState>
    );
  return (
    <CardBox>
      <div style={cardHead}>RFIs from Estimation — Contracts answers &amp; circulates back</div>
      <div style={{ padding: "4px 0" }}>
        {rfis.map((r) => (
          <RfiCard key={r.id} r={r} />
        ))}
      </div>
    </CardBox>
  );
}

/* ── Bid Submission ────────────────────────────────────────────────────── */
function BidTab({
  t,
  bid,
  subs,
  emd,
  leadCosting,
}: {
  t: ContractTender;
  bid: ContractBid | undefined;
  subs: Submittal[];
  emd: EmdRecord | undefined;
  leadCosting: Record<string, boolean>;
}) {
  const b: ContractBid = bid ?? {
    quotedAmount: 0,
    margin: 0,
    submittedOn: "",
    submittedBy: "",
    portalFormat: "Client e-portal",
    ack: "",
    status: "awaiting_estimation",
  };
  const submitted = b.status === "submitted";
  const received = isCostingReceived(t.dealId, leadCosting);

  if (!received && !submitted) {
    return (
      <div style={{ background: "#fff", border: "0.5px solid #E8E7E4", borderRadius: "8px", padding: "20px", textAlign: "center" }}>
        <div className="mb-1.5 text-t11 font-medium" style={{ color: "#854F0B" }}>
          Awaiting estimation
        </div>
        <div className="mx-auto max-w-[460px] text-t11 leading-[1.6]" style={{ color: "#9B9894" }}>
          When Estimation completes &amp; approves the costing, the quoted amount appears here. Contracts then assembles
          submittals + Finance documents and submits the bid in {b.portalFormat || "the portal"}.
        </div>
      </div>
    );
  }

  const gates = bidGates(subs, emd, submitted);
  const facts: [string, string][] = [
    ["Quoted Amount", "₹" + fmtC(Math.round((b.quotedAmount || 0) / 100000)) + "L"],
    ["Margin Applied", (b.margin || 0) + "%"],
    ["Portal Format", b.portalFormat || "—"],
    ["Submitted On", b.submittedOn || "—"],
    ["Submitted By", b.submittedBy || "—"],
    ["Portal Acknowledgement", b.ack || "—"],
  ];

  const gateRow = (ok: boolean, label: string, detail: string) => (
    <div className="flex items-center gap-2 py-[7px]" style={{ borderBottom: "0.5px solid #F5F4F2" }}>
      <span style={{ fontSize: "13px", color: ok ? "#3B6D11" : "#C0BEBB" }}>{ok ? "✓" : "○"}</span>
      <span className="flex-1 text-t11" style={{ color: "#1A1917" }}>
        {label}
      </span>
      <span style={{ fontSize: "10.5px", color: ok ? "#3B6D11" : "#854F0B" }}>{detail}</span>
    </div>
  );

  return (
    <div style={{ background: "#fff", border: "0.5px solid #E8E7E4", borderRadius: "8px", padding: "14px" }}>
      <div className="mb-2.5 flex items-center justify-between">
        <span className="text-t11 font-semibold" style={{ color: "#1A1917" }}>
          Bid Submission — {t.portal}
        </span>
        <StatusPill status={submitted ? "submitted" : "ready_to_submit"} />
      </div>
      {facts.map(([k, v]) => (
        <div key={k} className="flex justify-between py-1.5" style={{ borderBottom: "0.5px solid #F5F4F2" }}>
          <span className="text-t11" style={{ color: "#9B9894" }}>
            {k}
          </span>
          <span className="text-t11 font-medium" style={{ color: "#1A1917" }}>
            {v}
          </span>
        </div>
      ))}

      {submitted ? (
        <div
          className="mt-3 text-t11"
          style={{ padding: "8px 10px", background: "#E3EEF7", border: "0.5px solid #A9CCE8", borderRadius: "6px", color: "#185FA5" }}
        >
          ✓ <strong>Tender submitted</strong> in {b.portal || t.portal} on {b.submittedOn} by {b.submittedBy}. BD deal
          moved to Proposal Sent.
        </div>
      ) : (
        <>
          <div className="mt-3.5">
            <div className="mb-1 text-t10 uppercase tracking-[.4px]" style={{ color: "#9B9894" }}>
              Pre-submission checklist
            </div>
            {gateRow(gates.subsReady, "All submittals marked ready", `${gates.subsCount}/${gates.subsTotal}`)}
            {gateRow(
              gates.finOk,
              "Finance documents received (EMD + tender fee)",
              gates.finOk ? "issued" : `${emd?.emdStatus ?? "pending"} / ${emd?.feeStatus ?? "pending"}`
            )}
          </div>
          <div className="mt-3">
            <button
              type="button"
              disabled
              className="tbb"
              style={{ fontSize: "11px", padding: "7px 14px", opacity: gates.canSubmit ? 1 : 0.45, cursor: "not-allowed", pointerEvents: "none" }}
            >
              Mark Tender as Submitted
            </button>
            <div className="mt-1.5 text-t10" style={{ color: "#854F0B" }}>
              {gates.canSubmit
                ? "Read-only demo — all gates satisfied."
                : `Enabled once ${!gates.subsReady ? "all submittals are ready" : ""}${!gates.subsReady && !gates.finOk ? " and " : ""}${!gates.finOk ? "Finance documents are received" : ""}.`}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ── EMD / Fee ─────────────────────────────────────────────────────────── */
function EmdTab({ emd }: { emd: EmdRecord | undefined }) {
  if (!emd) return <EmptyState>No EMD record for this tender.</EmptyState>;
  const eSt = emd.emdStatus || "pending";
  return (
    <div style={{ background: "#fff", border: "0.5px solid #E8E7E4", borderRadius: "8px", padding: "14px" }}>
      <div className="mb-1 text-t11 font-semibold" style={{ color: "#1A1917" }}>
        EMD &amp; Tender Fee — coordinated with Finance
      </div>
      <div className="mb-3 text-t10" style={{ color: "#9B9894" }}>
        Contracts raises the requirement → Finance issues the instrument → status returns here.
      </div>
      <CTable
        headers={["Item", "Amount", "Mode", "Status", "Finance Ref"]}
        rows={[
          ["EMD", "₹" + fmtC(emd.emdAmt || 0), emd.emdMode || "—", <StatusPill key="e" status={eSt} />, emd.financeRef || "—"],
          [
            "Tender Fee",
            "₹" + fmtC(emd.tenderFee || 0),
            "—",
            <StatusPill key="f" status={emd.feeStatus || "pending"} />,
            emd.financeRef || "—",
          ],
        ]}
      />
      {eSt === "pending" && (
        <div
          className="mt-2.5 text-t10"
          style={{ padding: "7px 10px", background: "#FAEEDA", border: "0.5px solid #F0D4A0", borderRadius: "6px", color: "#854F0B" }}
        >
          EMD not yet requested from Finance.
        </div>
      )}
      {eSt === "requested" && (
        <div
          className="mt-2.5 text-t10"
          style={{ padding: "7px 10px", background: "#E3EEF7", border: "0.5px solid #A9CCE8", borderRadius: "6px", color: "#185FA5" }}
        >
          ⏳ Requested — awaiting Finance to issue the {emd.emdMode || "instrument"}.
        </div>
      )}
      {eSt === "paid" && (
        <div className="mt-2.5 text-t10 font-medium" style={{ color: "#3B6D11" }}>
          ✓ EMD issued{emd.financeRef ? " · " + emd.financeRef : ""}
        </div>
      )}
    </div>
  );
}

/* ── Similar Works ─────────────────────────────────────────────────────── */
function SimilarTab({ all, tenderId }: { all: import("@/features/contracts/types").SimilarWork[]; tenderId: string }) {
  const forTender = all.filter((s) => s.forTender === tenderId);
  const list = forTender.length ? forTender : all;
  return (
    <CardBox>
      <div style={cardHead}>Similar Works — past tender intelligence {forTender.length ? "(for this tender)" : "(all)"}</div>
      <CTable
        headers={["Tender Ref", "Title", "Issued", "Bidders", "L1", "L2", "L3", "Outcome"]}
        rows={list.map((s) => [
          s.ref,
          s.title,
          s.issued,
          s.bidders,
          `${s.l1} · ₹${fmtC(Math.round(s.l1Rate / 100000))}L`,
          `₹${fmtC(Math.round(s.l2Rate / 100000))}L`,
          `₹${fmtC(Math.round(s.l3Rate / 100000))}L`,
          <CPill
            key="o"
            color={s.outcome.startsWith("Won") ? "#3B6D11" : "#A32D2D"}
            bg={s.outcome.startsWith("Won") ? "#EAF3E0" : "#F6E0E0"}
          >
            {s.outcome}
          </CPill>,
        ])}
      />
    </CardBox>
  );
}
