"use client";

/**
 * Tender Docs (BD) tab (`renderEstDocs`). Read-only view of the documents the BD
 * team uploaded during the lead stage — typed and sized by filename heuristics,
 * exactly like the prototype. Uploads happen in the BD module, not here.
 */
function inferType(name: string): { t: string; sz: string } {
  const n = name.toLowerCase();
  if (n.includes("tender") || n.includes("rfq")) return { t: "RFQ", sz: "2.4 MB" };
  if (n.includes("boq")) return { t: "BOQ", sz: "320 KB" };
  if (n.includes("drawing") || n.includes("plan")) return { t: "Drawing", sz: "8.2 MB" };
  if (n.includes("requirement") || n.includes("spec")) return { t: "Tech Spec", sz: "5.1 MB" };
  return { t: "Document", sz: "1.2 MB" };
}

const GRID = "1fr 84px 96px 88px 60px 76px";

function Pill({ children }: { children: string }) {
  return (
    <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 10, fontSize: 9, fontWeight: 600, background: "#EAF3DE", color: "#3B6D11", border: "0.5px solid #C0DD97" }}>
      {children}
    </span>
  );
}

export function TenderDocsTab({ docs, co, date, owner }: { docs: string[]; co: string; date: string; owner: string }) {
  const rawDocs = docs.length ? docs : ["Site_Plan.pdf", "Requirements.docx"];
  const rows = rawDocs.map((name) => ({ name, ...inferType(name) }));

  return (
    <div>
      <div style={{ fontSize: 11, color: "#6B6A68", padding: "8px 10px", background: "#E6F1FB", borderRadius: 6, marginBottom: 10, border: "0.5px solid #B8D4F0" }}>
        These documents were uploaded by the BD team during the lead stage for <strong>{co}</strong>. They are read-only here — upload new documents from the BD module.
      </div>
      <div className="tw" style={{ maxWidth: 700 }}>
        <div className="th" style={{ gridTemplateColumns: GRID }}>
          <span>Document</span>
          <span>Type</span>
          <span>Uploaded By</span>
          <span>Date</span>
          <span>Size</span>
          <span>Status</span>
        </div>
        {rows.map((d) => (
          <div key={d.name} className="tr" style={{ gridTemplateColumns: GRID }}>
            <span>
              <div style={{ fontSize: 11, fontWeight: 500, color: "#1A1917" }}>📄 {d.name}</div>
            </span>
            <span><Pill>{d.t}</Pill></span>
            <span style={{ fontSize: 10, color: "#6B6A68" }}>{owner}</span>
            <span style={{ fontSize: 10, color: "#9B9894" }}>{date}</span>
            <span style={{ fontSize: 10, color: "#9B9894" }}>{d.sz}</span>
            <span><Pill>Active</Pill></span>
          </div>
        ))}
      </div>
    </div>
  );
}
