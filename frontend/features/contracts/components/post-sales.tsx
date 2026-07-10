import { fmtC } from "@/lib/format";
import { MetricStrip } from "@/features/procurement/components/metric-strip";
import type { ContractsPayload } from "@/features/contracts/api";
import type {
  ArbitrationCase,
  ContractWorkflow,
  FinInstrument,
  LegalTerms,
  Obligation,
  ProjectDoc,
  WorkflowNode,
} from "@/features/contracts/types";
import {
  activeInstrumentCount,
  docsUploadedCount,
  isHighValue,
  obligationsAtRisk,
  openDisputes,
} from "@/features/contracts/domain";
import { CardBox, CPill, CTable, EmptyState, StatusPill } from "./ui";

type PostSub = "docs" | "legal" | "fininstr" | "obligations" | "arbitration" | "workflow";

const POST_TABS: [PostSub, string][] = [
  ["docs", "Project Docs"],
  ["legal", "Legal Terms"],
  ["fininstr", "Financial Instruments"],
  ["obligations", "Obligations"],
  ["arbitration", "Arbitration & Mitigation"],
  ["workflow", "Workflow"],
];

const cardHead: React.CSSProperties = {
  padding: "10px 12px",
  borderBottom: "1px solid #E8E7E4",
  fontSize: "12px",
  fontWeight: 600,
  color: "#1A1917",
};

export function PostSalesView({
  data,
  project,
  setProject,
  postSub,
  setPostSub,
}: {
  data: ContractsPayload;
  project: string;
  setProject: (id: string) => void;
  postSub: PostSub;
  setPostSub: (s: PostSub) => void;
}) {
  const projects = data.projects;
  const p = projects.find((x) => x.id === project) ?? projects[0];
  if (!p) return <EmptyState>No awarded projects yet.</EmptyState>;

  const docs = data.projectDocs[p.id] ?? [];
  const docsUp = docsUploadedCount(docs);
  const fin = data.finInstruments[p.id] ?? [];
  const finActive = activeInstrumentCount(fin);
  const obl = data.obligations[p.id] ?? [];
  const oblRisk = obligationsAtRisk(obl);
  const arb = data.arbitration[p.id] ?? [];
  const arbOpen = openDisputes(arb);
  const lt = data.legalTerms[p.id];

  const cells = [
    { label: "Project Docs", value: `${docsUp}/${docs.length}`, color: docsUp === docs.length ? "#3B6D11" : "#854F0B", sub: "uploaded" },
    { label: "DLP", value: (lt?.dlpMonths ?? "—") + " mo", sub: "defect liability" },
    { label: "LD Clause", value: lt?.ldPct != null ? lt.ldPct + "%/wk" : "—", sub: "cap " + (lt?.ldCap ?? "—") + "%" },
    { label: "Fin. Instruments", value: `${finActive}`, color: "#3B6D11", sub: "active" },
    { label: "Obligations", value: `${obl.length}`, color: oblRisk ? "#A32D2D" : "#3B6D11", sub: oblRisk ? `${oblRisk} at risk` : "on track" },
    { label: "Disputes", value: `${arbOpen}`, color: arbOpen ? "#A32D2D" : "#3B6D11", sub: "open" },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Project picker */}
      <div
        className="mb-2 flex items-center gap-2 rounded-md border-[0.5px] border-dashed px-2.5 py-[5px]"
        style={{ background: "#FBF9F6", borderColor: "#D8D7D4" }}
      >
        <span className="text-t10 font-medium uppercase tracking-[0.5px]" style={{ color: "#9B9894" }}>
          Project:
        </span>
        <div className="flex flex-wrap gap-1">
          {projects.map((x) => {
            const active = p.id === x.id;
            return (
              <div
                key={x.id}
                onClick={() => setProject(x.id)}
                className="cursor-pointer rounded-[14px] border-[0.5px] px-3 py-1 text-t11"
                style={{
                  borderColor: active ? "#7B1FA2" : "#D8D7D4",
                  background: active ? "#7B1FA2" : "#fff",
                  color: active ? "#fff" : "#4A4945",
                }}
              >
                {x.name}
              </div>
            );
          })}
        </div>
      </div>

      <MetricStrip cells={cells} />

      {/* Sub-tabs */}
      <div className="vtabs mb-2">
        {POST_TABS.map(([id, lbl]) => (
          <div key={id} className={`vt${postSub === id ? " active" : ""}`} onClick={() => setPostSub(id)}>
            {lbl}
            {id === "arbitration" && arbOpen ? (
              <span
                className="ml-1 rounded-lg px-[5px] font-semibold"
                style={{ background: "#A32D2D", color: "#fff", fontSize: "9px" }}
              >
                {arbOpen}
              </span>
            ) : null}
          </div>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {postSub === "docs" && <DocsTab name={p.name} docs={docs} />}
        {postSub === "legal" && <LegalTab lt={lt} />}
        {postSub === "fininstr" && <FinInstrumentsTab fin={fin} />}
        {postSub === "obligations" && <ObligationsTab obl={obl} />}
        {postSub === "arbitration" && <ArbitrationTab arb={arb} />}
        {postSub === "workflow" && <WorkflowTab name={p.name} wf={data.workflow[p.id]} />}
      </div>
    </div>
  );
}

/* ── Project Docs ──────────────────────────────────────────────────────── */
function DocsTab({ name, docs }: { name: string; docs: ProjectDoc[] }) {
  const up = docsUploadedCount(docs);
  return (
    <CardBox>
      <div style={cardHead}>
        Project Document Folder — {name}
        {docs.length ? ` · ${up}/${docs.length} in folder` : ""}
      </div>
      {docs.length === 0 ? (
        <EmptyState>No documents collated yet.</EmptyState>
      ) : (
        <CTable
          headers={["Document", "Category", "Status", "Uploaded", "By"]}
          rows={docs.map((d) => [
            d.doc,
            <CPill key="c" color="#6B6A68" bg="#F0EFED">
              {d.cat}
            </CPill>,
            <StatusPill key="s" status={d.status} />,
            d.on || "—",
            d.by || "—",
          ])}
        />
      )}
    </CardBox>
  );
}

/* ── Legal Terms ───────────────────────────────────────────────────────── */
function LegalTab({ lt }: { lt: LegalTerms | undefined }) {
  if (!lt || !lt.dlpMonths) return <EmptyState>Legal terms not captured for this project yet.</EmptyState>;
  const feas = lt.opsFeasibility === "feasible";
  const terms: [string, string][] = [
    ["Defect Liability Period", `${lt.dlpMonths} months (${lt.dlpStart})`],
    ["Liquidated Damages", `${lt.ldPct}% ${lt.ldBasis}`],
    ["Manpower Clause", lt.manpowerClause],
    ["Warranty", lt.warranty],
  ];
  return (
    <div className="flex flex-wrap gap-3.5">
      <div className="min-w-[280px] flex-1" style={{ background: "#fff", border: "0.5px solid #E8E7E4", borderRadius: "8px", padding: "14px" }}>
        <div className="mb-2 text-t10 uppercase tracking-[.4px]" style={{ color: "#9B9894" }}>
          Contractual Terms
        </div>
        {terms.map(([k, v]) => (
          <div key={k} className="py-1.5" style={{ borderBottom: "0.5px solid #F5F4F2" }}>
            <div className="text-t9 uppercase tracking-[.3px]" style={{ color: "#9B9894" }}>
              {k}
            </div>
            <div className="mt-0.5 text-t11" style={{ color: "#1A1917" }}>
              {v}
            </div>
          </div>
        ))}
      </div>
      <div className="min-w-[280px] flex-1" style={{ background: "#fff", border: "0.5px solid #E8E7E4", borderRadius: "8px", padding: "14px" }}>
        <div className="mb-2 text-t10 uppercase tracking-[.4px]" style={{ color: "#9B9894" }}>
          Ops Feasibility Input
        </div>
        <div className="mb-2">
          <CPill color={feas ? "#3B6D11" : "#854F0B"} bg={feas ? "#EAF3E0" : "#F6ECD9"}>
            {feas ? "✓ Feasible" : "⚠ Review needed"}
          </CPill>
        </div>
        <div className="text-t11 leading-[1.6]" style={{ color: "#4A4945" }}>
          {lt.opsNote || ""}
        </div>
        <div className="mt-2.5 text-t10" style={{ color: "#9B9894" }}>
          Reviewed by {lt.reviewedBy || "—"}
        </div>
      </div>
    </div>
  );
}

/* ── Financial Instruments ─────────────────────────────────────────────── */
function FinInstrumentsTab({ fin }: { fin: FinInstrument[] }) {
  if (fin.length === 0) return <EmptyState>No financial instruments recorded.</EmptyState>;
  return (
    <CardBox>
      <div style={cardHead}>Financial Instruments — Finance-fed (BG / EMD / Solvency / Bank cert)</div>
      <CTable
        headers={["Instrument", "Amount", "Reference", "Issued", "Expiry", "Status"]}
        rows={fin.map((f) => [
          f.type,
          f.amount ? "₹" + fmtC(Math.round(f.amount / 100000)) + "L" : "—",
          f.ref,
          f.issued || "—",
          f.expiry || "—",
          <StatusPill key="s" status={f.status} />,
        ])}
      />
    </CardBox>
  );
}

/* ── Obligations ───────────────────────────────────────────────────────── */
function ObligationsTab({ obl }: { obl: Obligation[] }) {
  return (
    <CardBox>
      <div style={cardHead}>Contract Obligation Tracker — milestone &amp; penalty-linked deliverables</div>
      {obl.length === 0 ? (
        <EmptyState>No obligations tracked.</EmptyState>
      ) : (
        <CTable
          headers={["Obligation", "Type", "Due", "Linked To", "Penalty", "Status"]}
          rows={obl.map((o) => [
            o.obligation,
            <CPill key="t" color="#6B6A68" bg="#F0EFED">
              {o.type}
            </CPill>,
            o.due,
            o.linkedTo || "—",
            o.penalty || "—",
            <StatusPill key="s" status={o.status} />,
          ])}
        />
      )}
    </CardBox>
  );
}

/* ── Arbitration & Mitigation ──────────────────────────────────────────── */
function ArbitrationCard({ a }: { a: ArbitrationCase }) {
  const stages: ArbitrationCase["stage"][] = ["notice", "conciliation", "arbitration", "settled"];
  const si = stages.indexOf(a.stage);
  return (
    <div style={{ padding: "12px 14px", borderBottom: "0.5px solid #F0EFED" }}>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-t11 font-semibold" style={{ color: "#7B1FA2" }}>
          {a.id}{" "}
          <span className="font-normal" style={{ color: "#9B9894" }}>
            · raised by {a.raisedBy} · {a.raisedOn}
          </span>
        </span>
        <StatusPill status={a.status} />
      </div>
      <div className="mb-2 text-t11" style={{ color: "#1A1917" }}>
        <strong>Reason:</strong> {a.reason}
      </div>
      {/* stage stepper */}
      <div className="mb-2 flex gap-1">
        {stages.map((s, j) => (
          <div
            key={s}
            className="flex-1 text-center font-semibold capitalize"
            style={{
              padding: "3px 4px",
              borderRadius: "4px",
              fontSize: "9px",
              background: j < si ? "#EAF3E0" : j === si ? "#F3E9F5" : "#F0EFED",
              color: j < si ? "#3B6D11" : j === si ? "#7B1FA2" : "#9B9894",
            }}
          >
            {j < si ? "✓ " : ""}
            {s}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-5 text-t11" style={{ color: "#4A4945" }}>
        <span>
          <span style={{ color: "#9B9894" }}>Against:</span> {a.against}
        </span>
        <span>
          <span style={{ color: "#9B9894" }}>Claim:</span> ₹{fmtC(Math.round(a.claimAmt / 100000))}L
        </span>
        <span>
          <span style={{ color: "#9B9894" }}>Settlement:</span>{" "}
          {a.settlementAmt ? "₹" + fmtC(Math.round(a.settlementAmt / 100000)) + "L" : "—"}
        </span>
      </div>
      {a.note ? (
        <div className="mt-2 text-t10 italic" style={{ color: "#6B6A68" }}>
          {a.note}
        </div>
      ) : null}
    </div>
  );
}

function ArbitrationTab({ arb }: { arb: ArbitrationCase[] }) {
  if (arb.length === 0)
    return (
      <EmptyState>
        No disputes raised. The register captures: why a dispute arose, who raised it, claim amount, settlement process,
        and final settlement amount.
      </EmptyState>
    );
  return (
    <CardBox>
      <div style={cardHead}>Arbitration &amp; Mitigation Register</div>
      <div style={{ padding: "4px 0" }}>
        {arb.map((a) => (
          <ArbitrationCard key={a.id} a={a} />
        ))}
      </div>
    </CardBox>
  );
}

/* ── Workflow ──────────────────────────────────────────────────────────── */
function WorkflowTab({ name, wf }: { name: string; wf: ContractWorkflow | undefined }) {
  if (!wf) return <EmptyState>No contract sign-off workflow for this project yet.</EmptyState>;
  const highValue = isHighValue(wf.contractValue);
  const nodes: { role: string; node: WorkflowNode }[] = [
    { role: "Maker · Legal Review", node: wf.maker },
    { role: "Checker · Contracts Mgr", node: wf.checker },
    { role: "Approver · Legal Head", node: wf.approver },
  ];
  if (highValue) nodes.push({ role: "CEO Sign-off " + (wf.ceo.threshold || ""), node: wf.ceo });

  const stMap: Record<string, [string, string, string]> = {
    done: ["done", "✓", "Approved"],
    active: ["active", "→", "In review"],
    pending: ["pending", "○", "Pending"],
    rejected: ["rejected", "✕", "Rejected"],
  };

  const matrix: [string, string][] = [
    ["≤ ₹50L", "Maker → Contracts Manager → Legal Head"],
    ["> ₹50L", "+ CEO sign-off required"],
  ];

  return (
    <div style={{ background: "#FBF9F6", border: "0.5px solid #E8E7E4", borderRadius: "8px", padding: "14px" }}>
      <div className="mb-2.5 text-t11 font-semibold" style={{ color: "#1A1917" }}>
        Contract Sign-off — {name}
      </div>
      <div className="wf-tracker">
        {nodes.map((n, i) => {
          const [cls, ic, lbl] = stMap[n.node.status] ?? stMap.pending!;
          return (
            <div key={i} className={`wf-node ${cls}`}>
              <div className="wf-node-role">{n.role}</div>
              <div className="wf-node-person">{n.node.person}</div>
              <div className="wf-node-status">
                {ic} {lbl}
                {n.node.on ? ` · ${n.node.on}` : ""}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ background: "#fff", border: "0.5px solid #E8E7E4", borderRadius: "8px", padding: "12px 14px" }}>
        <div className="mb-2 text-t11 font-semibold" style={{ color: "#1A1917" }}>
          Value-Based Approval Matrix
        </div>
        {matrix.map(([k, v]) => (
          <div key={k} className="flex justify-between py-[5px] text-t11" style={{ borderBottom: "0.5px solid #F5F4F2" }}>
            <span style={{ color: "#9B9894" }}>{k}</span>
            <span style={{ color: "#1A1917" }}>{v}</span>
          </div>
        ))}
        <div className="mt-2.5 text-t10" style={{ color: "#6B6A68" }}>
          This contract: <strong style={{ color: "#1A1917" }}>₹{fmtC(Math.round((wf.contractValue || 0) / 100000))}L</strong> →{" "}
          {highValue ? (
            <span className="font-semibold" style={{ color: "#7B1FA2" }}>
              CEO sign-off path
            </span>
          ) : (
            "standard path"
          )}
          .
        </div>
      </div>
    </div>
  );
}
