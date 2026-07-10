import "server-only";
import type {
  BomRow,
  Grn,
  Invoice,
  Project,
  ProcKey,
  PurchaseOrder,
  Quote,
  RateContract,
  Rfq,
  Vendor,
  WorkflowState,
} from "@/types/procurement";
import {
  ENG_BOM,
  MODOS_TODAY,
  PROC_GRN,
  PROC_INVOICES,
  PROC_POS,
  PROC_QUOTES,
  PROC_RATE_CONTRACTS,
  PROC_RFQS,
  PROC_WORKFLOW,
  PROC_DOCS,
  PROC_STANDING_DOCS,
  PROJECTS,
  VENDORS_MASTER,
} from "@/features/procurement/data";
import {
  aggregateBOM,
  approverFor,
  approverRoleFor,
  buildBomRow,
  computeSummary,
  getActiveRC,
  getRCsForVendor,
  getVendorPerformance,
  poReceivedQty,
  spUnits,
  type LifecycleStores,
} from "@/features/procurement/domain";
import { PROC_TEAM } from "@/features/procurement/data/workflow";
import { ENG_BOM_HISTORY } from "@/features/procurement/data/bom-history";
import type { DocsView, ReleaseEvent, WorkflowView } from "@/features/procurement/api/types";
import type {
  BillRow,
  BomListResponse,
  GrnGroup,
  PoRow,
  QuoteGroup,
  QuotesView,
  QuoteItem,
  RfqCard,
  RfqRow,
  RfqView,
  VendorRow,
} from "@/features/procurement/api/types";

/**
 * In-memory procurement store — the mock "database". Seed data is deep-cloned
 * once so mutations (L1 selection, PO generation) don't corrupt the source
 * constants. In a real app this module is where a DB/ORM would live; the route
 * handlers depend only on these service methods, not on the raw tables.
 */
interface Db {
  rfqs: Record<ProcKey, Rfq>;
  quotes: Record<ProcKey, Quote[]>;
  pos: Record<ProcKey, PurchaseOrder>;
  grns: Record<ProcKey, Grn[]>;
  invoices: Record<ProcKey, Invoice>;
  workflow: Record<ProcKey, WorkflowState>;
  rateContracts: RateContract[];
}

function seed(): Db {
  return structuredClone({
    rfqs: PROC_RFQS,
    quotes: PROC_QUOTES,
    pos: PROC_POS,
    grns: PROC_GRN,
    invoices: PROC_INVOICES,
    workflow: PROC_WORKFLOW,
    rateContracts: PROC_RATE_CONTRACTS,
  });
}

let db: Db = seed();

/** Reset the store to the seed snapshot — used by tests. */
export function resetProcurementStore(): void {
  db = seed();
}

function stores(): LifecycleStores {
  return { ...db };
}

/* ─────────────────────────── Projects & scope ─────────────────────────── */

export function listProjects(): Project[] {
  return PROJECTS;
}

function findProject(projId: string): Project {
  return PROJECTS.find((p) => p.id === projId) ?? PROJECTS[0]!;
}

/** Aggregated + lifecycle-enriched BOM rows for a scope. */
export function getScopeRows(projId: string, spId: string): BomRow[] {
  const project = findProject(projId);
  const engLines = ENG_BOM[`${projId}.${spId}`] ?? [];
  const units = spUnits(project, spId);
  const items = aggregateBOM(engLines, { units });
  return items.map((item) => buildBomRow(projId, spId, item, stores()));
}

/** Material display name for a code within a scope (falls back to a global scan). */
function materialName(projId: string, spId: string, code: string): string {
  const scan = (key: string): string => {
    for (const line of ENG_BOM[key] ?? []) {
      const c = (line.components || []).find((x) => x.code === code);
      if (c?.name) return c.name;
    }
    return "";
  };
  const local = scan(`${projId}.${spId}`);
  if (local) return local;
  for (const key of Object.keys(ENG_BOM)) {
    const n = scan(key);
    if (n) return n;
  }
  const rc = PROC_RATE_CONTRACTS.find((r) => r.materialCode === code);
  return rc?.materialName ?? code;
}

function scopeInvoices(projId: string, spId: string): Invoice[] {
  const prefix = `${projId}.${spId}.`;
  return Object.entries(db.invoices)
    .filter(([k]) => k.startsWith(prefix))
    .map(([, inv]) => inv);
}

/* ─────────────────────────── Tab view models ─────────────────────────── */

export function getBom(projId: string, spId: string): BomListResponse {
  const rows = getScopeRows(projId, spId);

  // Category order follows the Engineering parent-BOQ order (approved + released).
  const catOrder: string[] = [];
  for (const line of ENG_BOM[`${projId}.${spId}`] ?? []) {
    if (line.engStatus === "approved" && line.released !== false && !catOrder.includes(line.cat)) {
      catOrder.push(line.cat);
    }
  }
  for (const r of rows) if (!catOrder.includes(r.cat)) catOrder.push(r.cat);

  const categoryGroups = catOrder
    .map((cat) => {
      const items = rows.filter((r) => r.cat === cat);
      return {
        cat,
        count: items.length,
        sourcedCount: items.filter((r) => r.sourcing.fully).length,
        committed: items.reduce((s, r) => s + r.committedValue, 0),
      };
    })
    .filter((g) => g.count > 0);

  return {
    scope: `${projId}.${spId}`,
    rows,
    summary: computeSummary(rows, scopeInvoices(projId, spId)),
    categories: catOrder.filter((c) => rows.some((r) => r.cat === c)),
    categoryGroups,
    catOrder,
  };
}

export function getRfqs(projId: string, spId: string): RfqRow[] {
  const prefix = `${projId}.${spId}.`;
  return Object.entries(db.rfqs)
    .filter(([k]) => k.startsWith(prefix))
    .map(([key, rfq]) => {
      const code = key.slice(prefix.length);
      return { key, code, name: materialName(projId, spId, code), uom: rfq.uom, rfq };
    });
}

/** Structured RFQ view: workflow counts, need-action items, and grouped cards. */
export function getRfqView(projId: string, spId: string): RfqView {
  const rows = getScopeRows(projId, spId);
  const catOf = new Map(rows.map((r) => [r.code, r.cat]));
  const catOrder: string[] = [];
  for (const line of ENG_BOM[`${projId}.${spId}`] ?? []) {
    if (line.engStatus === "approved" && line.released !== false && !catOrder.includes(line.cat)) catOrder.push(line.cat);
  }

  const prefix = `${projId}.${spId}.`;
  const entries = Object.entries(db.rfqs).filter(([k]) => k.startsWith(prefix));
  const open = entries.filter(([, r]) => !r.closedAt && r.mode === "rfq");
  const closed = entries.filter(([, r]) => r.closedAt && r.mode === "rfq");
  const bypassedEntries = entries.filter(([, r]) => r.mode === "rate_contract");

  const toCard = ([key, rfq]: [string, (typeof db.rfqs)[string]]): RfqCard => {
    const code = key.slice(prefix.length);
    return { key, code, name: materialName(projId, spId, code), uom: rfq.uom, lotN: 1, rfq, quotes: db.quotes[key] ?? [] };
  };

  const group = (list: [string, (typeof db.rfqs)[string]][]): RfqView["openGroups"] => {
    const byCat = new Map<string, RfqCard[]>();
    list.forEach((e) => {
      const card = toCard(e);
      const cat = catOf.get(card.code) ?? "Other";
      (byCat.get(cat) ?? byCat.set(cat, []).get(cat)!).push(card);
    });
    const order = [...catOrder, ...[...byCat.keys()].filter((c) => !catOrder.includes(c))];
    return order.filter((c) => byCat.has(c)).map((cat) => ({ cat, cards: byCat.get(cat)! }));
  };

  const needAction = rows
    .filter((r) => !r.activeRC && r.sourcing.remaining > 0)
    .map((r) => ({ code: r.code, name: r.name, uom: r.uom, totalQty: r.totalQty }));

  const bypassed = bypassedEntries.map(([key, rfq]) => {
    const code = key.slice(prefix.length);
    const rc = db.rateContracts.find((x) => x.id === rfq.rcId);
    return {
      code,
      name: materialName(projId, spId, code),
      uom: rfq.uom,
      qty: rfq.qty,
      closedAt: rfq.closedAt,
      rc: rc ? { id: rc.id, vendorName: rc.vendorName, rate: rc.rate, uom: rc.uom } : null,
    };
  });

  return {
    counts: { open: open.length, closed: closed.length, bypassed: bypassed.length },
    needAction,
    openGroups: group(open),
    closedGroups: group(closed),
    bypassed,
  };
}

export function getQuotes(projId: string, spId: string): QuoteGroup[] {
  const rows = getScopeRows(projId, spId);
  return rows
    .filter((r) => r.quoteCount > 0)
    .map((r) => ({
      key: r.key,
      code: r.code,
      name: r.name,
      uom: r.uom,
      totalQty: r.totalQty,
      budgetRate: r.rate,
      quotes: db.quotes[r.key] ?? [],
      l1: r.l1,
      activeRC: r.activeRC,
    }));
}

/** Master-detail comparative-statement view: every BOM item + its quotes/RC/RFQ/PO. */
export function getQuotesView(projId: string, spId: string): QuotesView {
  const rows = getScopeRows(projId, spId);
  const catOrder: string[] = [];
  for (const line of ENG_BOM[`${projId}.${spId}`] ?? []) {
    if (line.engStatus === "approved" && line.released !== false && !catOrder.includes(line.cat)) catOrder.push(line.cat);
  }
  for (const r of rows) if (!catOrder.includes(r.cat)) catOrder.push(r.cat);

  const items: QuoteItem[] = rows.map((r) => ({
    key: r.key,
    code: r.code,
    name: r.name,
    uom: r.uom,
    cat: r.cat,
    totalQty: r.totalQty,
    sourceBOQs: r.sourceBOQs,
    sources: r.sources,
    quotes: db.quotes[r.key] ?? [],
    activeRC: r.activeRC,
    rfq: r.rfq,
    po: r.po,
    anyVendorHandles: VENDORS_MASTER.some((v) => v.handles.includes(r.code)),
  }));
  return { items, catOrder };
}

/** Clear the L1 selection on a line (blocked once a PO exists). */
export function revertL1(key: ProcKey): Quote[] {
  if (db.pos[key]) throw new Error("A PO has already been raised against this L1 — revert the PO first.");
  const quotes = db.quotes[key];
  if (!quotes) throw new Error(`No quotes for ${key}`);
  quotes.forEach((q) => {
    q.selected = false;
  });
  return quotes;
}

export function getPos(projId: string, spId: string): PoRow[] {
  const rows = getScopeRows(projId, spId);
  return rows
    .filter((r): r is BomRow & { po: PurchaseOrder } => r.po !== null)
    .map((r) => {
      const role = approverRoleFor(r.po.value);
      return {
        key: r.key,
        code: r.code,
        name: r.name,
        po: r.po,
        receivedQty: r.receivedQty,
        approverRole: role,
        approverName: approverFor(PROC_TEAM, r.po.value).name,
      };
    });
}

export function getGrn(projId: string, spId: string): GrnGroup[] {
  const rows = getScopeRows(projId, spId);
  const prefix = `${projId}.${spId}.`;
  const grnKeys = new Set(Object.keys(db.grns).filter((k) => k.startsWith(prefix)));
  return rows
    .filter((r) => r.po || grnKeys.has(r.key))
    .map((r) => ({
      key: r.key,
      code: r.code,
      name: r.name,
      po: r.po,
      grns: db.grns[r.key] ?? [],
      orderedQty: r.po?.qty ?? 0,
      receivedQty: r.receivedQty,
    }));
}

export function getBills(projId: string, spId: string): BillRow[] {
  const prefix = `${projId}.${spId}.`;
  return Object.entries(db.invoices)
    .filter(([k]) => k.startsWith(prefix))
    .map(([key, invoice]) => {
      const code = key.slice(prefix.length);
      return { key, code, name: materialName(projId, spId, code), invoice };
    });
}

export function listVendors(): VendorRow[] {
  return VENDORS_MASTER.map((vendor: Vendor) => ({
    vendor,
    performance: getVendorPerformance(vendor.code, db.pos, db.grns),
    rateContractCount: getRCsForVendor(db.rateContracts, vendor.code).length,
  }));
}

export function listRateContracts(): RateContract[] {
  return db.rateContracts;
}

/* ─────────────────────────── Mutations ─────────────────────────── */

/** Select an L1 vendor for a line — marks one quote selected, unmarks the rest. */
export function selectL1(key: ProcKey, quoteId: string): Quote[] {
  const quotes = db.quotes[key];
  if (!quotes) throw new Error(`No quotes for ${key}`);
  if (!quotes.some((q) => q.id === quoteId)) throw new Error(`Quote ${quoteId} not found`);
  quotes.forEach((q) => {
    q.selected = q.id === quoteId;
  });
  return quotes;
}

function nextPoNumber(): string {
  const max = Object.values(db.pos).reduce((mx, po) => {
    const m = /MH-PO-\d{2}-0*(\d+)/.exec(po.poNumber);
    return m ? Math.max(mx, Number(m[1])) : mx;
  }, 0);
  return `MH-PO-26-${String(max + 1).padStart(3, "0")}`;
}

/**
 * Generate a PO from a line's selected (or given) quote. Uses the active rate
 * contract's rate when one covers the material; otherwise the quote rate.
 */
export function generatePO(projId: string, spId: string, key: ProcKey, quoteId?: string): PurchaseOrder {
  if (db.pos[key]) return db.pos[key];
  const quotes = db.quotes[key] ?? [];
  const quote = quoteId ? quotes.find((q) => q.id === quoteId) : quotes.find((q) => q.selected);
  if (!quote) throw new Error(`No selected quote for ${key}`);

  const code = key.split(".").slice(2).join(".");
  const rows = getScopeRows(projId, spId);
  const item = rows.find((r) => r.code === code);
  const rc = getActiveRC(db.rateContracts, code, quote.vCode);
  const rate = rc ? rc.rate : quote.rate;
  const qty = quote.qty || item?.totalQty || 0;

  const po: PurchaseOrder = {
    poNumber: nextPoNumber(),
    vCode: quote.vCode,
    vendor: quote.vendor,
    qty,
    uom: item?.uom ?? "",
    rate,
    value: rate * qty,
    status: "approved",
    poDate: MODOS_TODAY,
    expDelivery: MODOS_TODAY,
    zohoRef: null,
    deliveredQty: 0,
    note: rc ? `Direct PO under ${rc.id}` : "PO raised against L1 quote",
  };
  db.pos[key] = po;
  db.workflow[key] = {
    ...(db.workflow[key] ?? {
      csStatus: "approved",
      leadStatus: "approved",
      vendorAckStatus: "pending",
    }),
    csStatus: "approved",
    leadStatus: "approved",
    approverStatus: "approved",
    poStatus: "pending",
    vendorAckStatus: "pending",
  } as WorkflowState;
  return po;
}

/** Record a GRN against a PO (partial or full delivery). */
export function recordGrn(key: ProcKey, qtyReceived: number, receivedBy: string): Grn {
  const po = db.pos[key];
  if (!po) throw new Error(`No PO for ${key}`);
  const existing = db.grns[key] ?? (db.grns[key] = []);
  const grn: Grn = {
    grnId: `GRN-26-${String(100 + existing.length + 1)}`,
    poNumber: po.poNumber,
    date: MODOS_TODAY,
    qtyReceived,
    condition: "good",
    receivedBy,
    batchNos: [],
    rejectedQty: 0,
    note: `Received ${qtyReceived} ${po.uom}`,
  };
  existing.push(grn);
  po.deliveredQty = poReceivedQty(existing);
  return grn;
}

/* ─────────────────────────── Docs / Release Log / Workflow ─────────────────────────── */

const REL_MONTHS: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};
function parseRelDate(s: string): number {
  const m = /(\d+)\s+(\w+)\s+(\d+)/.exec(s);
  if (!m) return 0;
  return new Date(Number(m[3]), REL_MONTHS[m[2]!] ?? 0, Number(m[1])).getTime();
}

/** Procurement lifecycle state for one BOM material (used by the release log). */
function matStateFor(scope: string, code: string): { label: string; status: string; vendor?: string; value?: number } {
  const k = `${scope}.${code}`;
  const po = db.pos[k];
  const quotes = db.quotes[k] ?? [];
  const wf = db.workflow[k];
  if (po) return { label: `PO ${po.poNumber}`, status: "po_raised", vendor: po.vendor, value: po.value };
  if (quotes.some((q) => q.selected)) return { label: "L1 selected — awaiting PO", status: "l1_selected" };
  if (quotes.length > 0) return { label: `${quotes.length} quote(s) received`, status: "quotes_in" };
  if (wf?.csStatus === "in_progress") return { label: "CS in progress — RFQ floated", status: "rfq_floated" };
  return { label: "Pending RFQ", status: "pending" };
}

export function getProcDocs(projId: string, spId: string): DocsView {
  const scope = `${projId}.${spId}`;
  const sp = findProject(projId).subProjects?.find((s) => s.id === spId);
  return { standing: PROC_STANDING_DOCS, docs: PROC_DOCS[scope] ?? [], subProjectName: sp?.name ?? "" };
}

export function getProcReleaseLog(projId: string, spId: string): ReleaseEvent[] {
  const scope = `${projId}.${spId}`;
  const engLines = ENG_BOM[scope] ?? [];
  const events: ReleaseEvent[] = [];
  for (const [histKey, versions] of Object.entries(ENG_BOM_HISTORY)) {
    if (!histKey.startsWith(`${scope}.`)) continue;
    const itemCode = histKey.slice(scope.length + 1);
    const boq = engLines.find((i) => i.code === itemCode);
    if (!boq) continue;
    versions.forEach((v, vi) => {
      if (!v.released) return;
      const isSuperseded = vi > 0;
      events.push({
        date: v.releasedAt || v.date,
        boqCode: itemCode,
        boqName: boq.name,
        boqCat: boq.cat,
        ver: v.ver,
        changes: v.changes,
        by: v.by,
        isSuperseded,
        newerVer: isSuperseded ? (versions[vi - 1]?.ver ?? null) : null,
        components: (boq.components || []).map((c) => ({
          code: c.code, name: c.name, engQty: c.engQty, uom: c.uom, state: matStateFor(scope, c.code),
        })),
      });
    });
  }
  events.sort((a, b) => parseRelDate(b.date) - parseRelDate(a.date));
  return events;
}

export function getProcWorkflow(projId: string, spId: string): WorkflowView {
  const scope = `${projId}.${spId}`;
  const rows = getScopeRows(projId, spId);
  const items = rows.map((a) => {
    const k = a.key;
    const wf = db.workflow[k] ?? { csStatus: "pending", leadStatus: "pending", approverStatus: "pending", poStatus: "pending", vendorAckStatus: "pending" } as WorkflowState;
    const quotes = db.quotes[k] ?? [];
    const sel = quotes.find((q) => q.selected);
    const po = db.pos[k];
    const value = po ? po.value : sel ? sel.rate * sel.qty : 0;
    const role = approverRoleFor(value);
    const appr = PROC_TEAM.approvers[role];
    return {
      code: a.code, name: a.name, uom: a.uom, qty: a.totalQty, value,
      vendor: sel ? sel.vendor : po ? po.vendor : null,
      wf, approverRole: role, approverName: appr.name, thresholdLabel: appr.thresholdLabel,
      poNumber: po ? po.poNumber : null, cat: a.cat,
    };
  });

  const tot = items.length;
  const count = (pred: (i: (typeof items)[number]) => boolean) => items.filter(pred).length;
  const csApproved = count((i) => i.wf.csStatus === "approved");
  const leadDone = count((i) => i.wf.leadStatus === "approved");
  const apprDone = count((i) => i.wf.approverStatus === "approved");
  const poSent = count((i) => i.wf.poStatus === "sent");
  const ackDone = count((i) => i.wf.vendorAckStatus === "acknowledged" || i.wf.vendorAckStatus === "partial");
  const st = (done: number, some: number): "done" | "active" | "pending" => (done === tot ? "done" : some > 0 ? "active" : "pending");

  const nodes = [
    { role: "Buyer", person: PROC_TEAM.buyer.name, status: `${csApproved}/${tot} CS prepared`, state: (csApproved === tot ? "done" : "active") as "done" | "active" },
    { role: "Procurement Lead", person: PROC_TEAM.lead.name, status: `${leadDone}/${tot} reviewed`, state: st(leadDone, leadDone) },
    { role: "Approver (value-based)", person: "Manager / COO / CEO", status: `${apprDone}/${tot} approved`, state: st(apprDone, apprDone) },
    { role: "PO Sent", person: "→ Vendor", status: `${poSent}/${tot} dispatched`, state: st(poSent, poSent) },
    { role: "Vendor Ack", person: "Vendor", status: `${ackDone}/${tot} acknowledged`, state: st(ackDone, ackDone) },
  ];

  const matrix = (["manager", "coo", "ceo"] as const).map((roleKey) => {
    const a = PROC_TEAM.approvers[roleKey];
    return {
      roleKey, name: a.name, role: a.role, thresholdLabel: a.thresholdLabel,
      count: count((i) => i.approverRole === roleKey),
      approved: count((i) => i.approverRole === roleKey && i.wf.approverStatus === "approved"),
      initials: a.name.split(" ").map((x) => x[0] ?? "").join("").slice(0, 2),
    };
  });

  const prompts = {
    lead: items.filter((i) => i.wf.csStatus === "approved" && i.wf.leadStatus === "pending").map((i) => i.code),
    manager: items.filter((i) => i.approverRole === "manager" && i.wf.leadStatus === "approved" && i.wf.approverStatus === "pending").map((i) => i.code),
    coo: items.filter((i) => i.approverRole === "coo" && i.wf.leadStatus === "approved" && i.wf.approverStatus === "pending").map((i) => i.code),
    ceo: items.filter((i) => i.approverRole === "ceo" && i.wf.leadStatus === "approved" && i.wf.approverStatus === "pending").map((i) => i.code),
  };

  const catOrder: string[] = [];
  for (const line of engLinesFor(scope)) if (line.engStatus === "approved" && line.released !== false && !catOrder.includes(line.cat)) catOrder.push(line.cat);
  for (const i of items) if (!catOrder.includes(i.cat)) catOrder.push(i.cat);
  const groups = catOrder
    .map((cat) => ({ cat, items: items.filter((i) => i.cat === cat).map(({ cat: _c, ...rest }) => rest) }))
    .filter((g) => g.items.length > 0);

  return { nodes, matrix, prompts, groups, leadName: PROC_TEAM.lead.name };
}

function engLinesFor(scope: string) {
  return ENG_BOM[scope] ?? [];
}
