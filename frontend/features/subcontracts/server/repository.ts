import "server-only";
import { fmtC } from "@/lib/format";
import {
  SC_BILLS,
  SC_DOCS,
  SC_ENQUIRIES,
  SC_EXEC_LOG,
  SC_MEASUREMENTS,
  SC_PROJECTS,
  SC_SIGNED_SCOPES,
  SC_STANDING_DOCS,
  SC_SUBBIES,
  SC_TODAY,
  SC_WO_AMENDMENTS,
  SC_WORKORDERS,
} from "@/features/subcontracts/data";
import { SC_APPROVAL } from "@/features/subcontracts/data/approval";
import {
  anySubcBill,
  scApprover,
  scApproverMeta,
  scAwaitingSubWeeks,
  scBillCalc,
  scBillForLineWeek,
  scCatLabel,
  scCompliant,
  scExecToDate,
  scLifecycleStage,
  scNextRaWeek,
  scPackagesFor,
  scProjSp,
  scQualifiedSubbies,
  scRaBillKeysFor,
  scSubbieOnTime,
  scSubbieTier,
  scSubbieTradeSpend,
  scSubbieWoCount,
} from "@/features/subcontracts/domain";
import type {
  ScEnquiryCard,
  ScEnquiryInvite,
  ScKpiCell,
  ScPackageRow,
  ScQuoteCard,
  ScStatusChip,
  ScSubbieRow,
  ScWorkflowCard,
  ScWorkflowNode,
  SubcontractsPayload,
} from "@/features/subcontracts/api";
import type { ScPackage, ScRfq, ScSubbie } from "@/features/subcontracts/types";

/* Machinery-hire rate-contract count per subbie (name-matched). The full
   MACHINERY_HIRE_CONTRACTS table isn't ported; only the two active RCs remain. */
const RC_COUNT: Record<string, number> = { "MSC-006": 1, "MSC-007": 1 };

/* ─────────────────────────── Enquiry envelopes (SC_RFQS) ─────────────────────────── */

/**
 * Build the works-enquiry envelopes from the enquiry quotes + raised WOs — a
 * faithful port of the `seedScRfqs` IIFE and `scReconcileEnquiries`. An enquiry
 * is closed once its package carries a work order.
 */
function buildRfqs(): Record<string, ScRfq> {
  const rfqs: Record<string, ScRfq> = {};
  let n = 0;
  for (const k of Object.keys(SC_ENQUIRIES)) {
    n++;
    const quotes = SC_ENQUIRIES[k] ?? [];
    const hasWO = !!SC_WORKORDERS[k];
    rfqs[k] = {
      enqId: "SCE-2026-" + String(n).padStart(3, "0"),
      mode: "enquiry",
      floatedBy: "Vikram Shetty (Procurement Manager)",
      floatedAt: "20 May 2026 · 10:00 AM",
      deadline: "24 May 2026 · 6:00 PM",
      invitedSubbies: quotes.map((q) => ({
        code: q.subbie,
        name: SC_SUBBIES[q.subbie]?.name ?? q.subbie,
        invitedAt: "20 May",
        status: "responded",
        respondedAt: "21 May · 11:30 AM",
      })),
      closedAt: hasWO ? "22 May 2026 · 4:00 PM" : null,
      closedReason: hasWO ? "Work order raised — enquiry closed" : null,
      notes: "",
    };
  }
  // Showcase the open lifecycle on PL-5001 (pre-WO, quotes recorded, no L1).
  const open = "P1.SP1.PL-5001";
  const openRfq = rfqs[open];
  if (openRfq && !openRfq.closedAt) {
    if (!openRfq.invitedSubbies.some((v) => v.code === "MSC-005"))
      openRfq.invitedSubbies.push({ code: "MSC-005", name: SC_SUBBIES["MSC-005"]?.name ?? "MSC-005", invitedAt: "20 May", status: "pending" });
    if (!openRfq.invitedSubbies.some((v) => v.code === "MSC-004"))
      openRfq.invitedSubbies.push({ code: "MSC-004", name: SC_SUBBIES["MSC-004"]?.name ?? "MSC-004", invitedAt: "20 May", status: "declined", reason: "No structural crew available this month" });
  }
  // Reconcile: any open enquiry whose package has a WO is closed.
  for (const k of Object.keys(rfqs)) {
    const r = rfqs[k]!;
    if (r.closedAt) continue;
    if (SC_WORKORDERS[k]) {
      r.closedAt = "22 May 2026 · 4:00 PM";
      r.closedReason = "Work order raised — enquiry closed";
      r.invitedSubbies.forEach((v) => {
        if (v.status === "pending") v.status = "no_response";
      });
    }
  }
  return rfqs;
}

/* ─────────────────────────── Small helpers ─────────────────────────── */

function findProject(projId: string) {
  return SC_PROJECTS.find((p) => p.id === projId) ?? SC_PROJECTS[0]!;
}

function variancePct(basisRate: number, actual: number | null): number | null {
  if (!actual || !basisRate) return null;
  return ((actual - basisRate) / basisRate) * 100;
}

function curRate(k: string): ScPackageRow["curRate"] {
  const wo = SC_WORKORDERS[k];
  if (wo && wo.rate != null) return { rate: wo.rate, label: "WO Rate", src: "wo" };
  const l1 = (SC_ENQUIRIES[k] ?? []).find((e) => e.selected);
  if (l1) return { rate: l1.rate, label: "L1 Rate", src: "l1" };
  return null;
}

/* ─────────────────────────── Tab builders ─────────────────────────── */

function buildPackages(key: string, pkgs: ScPackage[], rfqs: Record<string, ScRfq>): SubcontractsPayload["packages"] {
  const statCell = (k: string, stage: string): ScStatusChip => {
    if (stage === "bill") {
      const ps = scPackageStatusLite(k);
      return ps === "paid"
        ? { label: "Paid", bg: "#EAF3DE", fg: "#3B6D11" }
        : ps === "discrepancy"
          ? { label: "Bill Held", bg: "#FCEBEB", fg: "#A32D2D" }
          : ps === "matched"
            ? { label: "RA Certified", bg: "#EAF3FB", fg: "#185FA5" }
            : { label: "✓ Forwarded", bg: "#F3E8FB", fg: "#7B1FA2" };
    }
    const map: Record<string, ScStatusChip> = {
      none: { label: "Enquiry Needed", bg: "#FCEBEB", fg: "#A32D2D" },
      floated: { label: "Enquiry Floated", bg: "#FEF6E7", fg: "#854F0B" },
      compare: { label: "Quotes · L1 Pending", bg: "#FEF6E7", fg: "#854F0B" },
      l1: { label: "L1 · WO Pending", bg: "#EAF3FB", fg: "#185FA5" },
      wo_pending: { label: "WO · Approval", bg: "#FEF6E7", fg: "#854F0B" },
      released: { label: "WO Released", bg: "#EAF3DE", fg: "#3B6D11" },
      measuring: { label: "RA in Progress", bg: "#EAF3FB", fg: "#185FA5" },
    };
    return map[stage] ?? { label: stage, bg: "#F2F1EF", fg: "#6B6A68" };
  };

  const rows: ScPackageRow[] = pkgs.map((p) => {
    const k = key + "." + p.code;
    const cr = curRate(k);
    const stage = scLifecycleStage(k, !!rfqs[k]);
    const wo = SC_WORKORDERS[k];
    return {
      code: p.code,
      name: p.name,
      cat: p.cat,
      catId: p.catId,
      uom: p.uom,
      scType: p.scType,
      matNature: p.matNature,
      totalQty: p.totalQty,
      basisRate: p.basisRate,
      budgetValue: p.budgetValue,
      curRate: cr,
      variancePct: variancePct(p.basisRate, cr?.rate ?? null),
      stage,
      statusChip: statCell(k, stage),
      action: stage === "none" ? "float" : "chevron",
      woValue: wo?.value ?? 0,
    };
  });

  const order: string[] = [];
  const grouped: Record<string, ScPackageRow[]> = {};
  for (const r of rows) {
    if (!order.includes(r.catId)) order.push(r.catId);
    (grouped[r.catId] ??= []).push(r);
  }
  const groups = order.map((catId) => {
    const list = grouped[catId]!;
    return {
      catId,
      label: scCatLabel(catId),
      count: list.length,
      committed: list.reduce((s, r) => s + r.woValue, 0),
      woRaised: list.filter((r) => r.woValue > 0).length,
      rows: list,
    };
  });

  return {
    groups,
    counts: {
      all: pkgs.length,
      manpower: pkgs.filter((p) => p.scType === "manpower").length,
      lineitem: pkgs.filter((p) => p.scType === "lineitem").length,
      machinery: pkgs.filter((p) => p.scType === "machinery").length,
    },
    needRate: rows.filter((r) => !r.curRate).length,
    total: pkgs.length,
  };
}

/** Local mirror of scPackageStatus that returns only the bill-stage sub-status. */
function scPackageStatusLite(k: string): string {
  const sub = SC_WORKORDERS[k]?.subbie ?? null;
  const code = k.split(".").slice(2).join(".");
  const pre = `${scProjSp(k)}.${sub}~RA`;
  const statuses = sub
    ? Object.keys(SC_BILLS)
        .filter((bk) => bk.startsWith(pre) && (SC_BILLS[bk]!.lines || []).some((l) => l.code === code))
        .map((bk) => SC_BILLS[bk]!.status)
    : [];
  if (statuses.every((x) => x === "paid") && statuses.length) return "paid";
  if (statuses.some((x) => x === "discrepancy")) return "discrepancy";
  if (statuses.some((x) => x === "matched")) return "matched";
  return "forwarded_to_finance";
}

function buildEnquiries(key: string, pkgs: ScPackage[], rfqs: Record<string, ScRfq>): SubcontractsPayload["enquiries"] {
  const cardFor = (p: ScPackage, r: ScRfq, isOpen: boolean): ScEnquiryCard => {
    const k = key + "." + p.code;
    const quotes = SC_ENQUIRIES[k] ?? [];
    const invited: ScEnquiryInvite[] = r.invitedSubbies.map((v) => {
      let detail =
        v.status === "pending"
          ? "awaiting"
          : v.status === "declined"
            ? v.reason ?? "declined"
            : v.status === "no_response"
              ? "no reply"
              : v.respondedAt ?? "";
      if (v.status === "responded") {
        const q = quotes.find((qq) => qq.subbie === v.code);
        if (q) detail = "₹" + fmtC(q.rate) + "/" + p.uom + (v.respondedAt ? " · " + v.respondedAt : "");
      }
      return { ...v, detail };
    });
    return {
      key: k,
      enqId: r.enqId,
      isOpen,
      code: p.code,
      name: p.name,
      cat: p.cat,
      catId: p.catId,
      scType: p.scType,
      matNature: p.matNature,
      totalQty: p.totalQty,
      uom: p.uom,
      floatedBy: r.floatedBy,
      floatedAt: r.floatedAt,
      deadline: r.deadline,
      closedAt: r.closedAt,
      closedReason: r.closedReason,
      notes: r.notes,
      invited,
      counts: {
        responded: invited.filter((v) => v.status === "responded").length,
        pending: invited.filter((v) => v.status === "pending").length,
        declined: invited.filter((v) => v.status === "declined").length,
        noResp: invited.filter((v) => v.status === "no_response").length,
      },
    };
  };

  const open: ScEnquiryCard[] = [];
  const closed: ScEnquiryCard[] = [];
  for (const p of pkgs) {
    const r = rfqs[key + "." + p.code];
    if (!r) continue;
    if (r.closedAt) closed.push(cardFor(p, r, false));
    else open.push(cardFor(p, r, true));
  }
  const needAction = pkgs
    .filter((p) => !rfqs[key + "." + p.code])
    .map((p) => ({ code: p.code, name: p.name, totalQty: p.totalQty, uom: p.uom }));

  return { open, closed, needAction };
}

function buildComparative(key: string, pkgs: ScPackage[], rfqs: Record<string, ScRfq>): SubcontractsPayload["comparative"] {
  const items = pkgs.map((p) => {
    const k = key + "." + p.code;
    const enq = SC_ENQUIRIES[k] ?? [];
    const r = rfqs[k];
    const wo = SC_WORKORDERS[k];
    const stage = scLifecycleStage(k, !!r);
    const sorted = [...enq].sort((a, b) => a.rate - b.rate);
    const quotes: ScQuoteCard[] = sorted.map((e, idx) => {
      const sub = SC_SUBBIES[e.subbie];
      const rank = idx + 1;
      const v = variancePct(p.basisRate, e.rate) ?? 0;
      return {
        subbie: e.subbie,
        subbieName: sub?.name ?? e.subbie,
        subbieStatus: sub?.status ?? "active",
        rate: e.rate,
        leadDays: e.leadDays,
        payTerms: e.payTerms,
        note: e.note,
        selected: e.selected,
        rank,
        isL1: rank === 1,
        total: Math.round(e.rate * p.totalQty),
        variancePct: v,
        compliant: sub ? scCompliant(sub) : true,
      };
    });

    let sidebarBadge: { label: string; color: string };
    if (stage === "bill" || stage === "released" || stage === "measuring") sidebarBadge = { label: "WO ✓", color: "#3B6D11" };
    else if (stage === "wo_pending") sidebarBadge = { label: "WO pending", color: "#854F0B" };
    else if (stage === "l1") sidebarBadge = { label: "L1 ✓", color: "#3B6D11" };
    else if (stage === "compare") sidebarBadge = { label: `${enq.length} quote${enq.length > 1 ? "s" : ""}`, color: "#854F0B" };
    else if (stage === "floated") sidebarBadge = { label: "⏳ pending", color: "#0F766E" };
    else sidebarBadge = { label: "no enquiry", color: "#A32D2D" };

    return {
      code: p.code,
      name: p.name,
      scType: p.scType,
      matNature: p.matNature,
      uom: p.uom,
      totalQty: p.totalQty,
      basisRate: p.basisRate,
      cat: p.cat,
      catId: p.catId,
      stage,
      sidebarBadge,
      rfq: r
        ? {
            enqId: r.enqId,
            isOpen: !r.closedAt,
            deadline: r.deadline,
            floatedBy: r.floatedBy,
            closedAt: r.closedAt,
            closedReason: r.closedReason,
            invited: r.invitedSubbies,
          }
        : null,
      wo: wo ? { woNo: wo.woNo, subbie: wo.subbie, subbieName: SC_SUBBIES[wo.subbie]?.name ?? wo.subbie, status: wo.status } : null,
      quotes,
    };
  });
  return { items };
}

function buildWorkOrders(key: string, pkgs: ScPackage[]): SubcontractsPayload["workOrders"] {
  const rows = pkgs
    .map((p) => {
      const k = key + "." + p.code;
      const wo = SC_WORKORDERS[k];
      if (!wo) return null;
      const ms = (SC_MEASUREMENTS[k] ?? []).slice().sort((a, b) => a.ra - b.ra);
      const bill = anySubcBill(k);
      let statusChip: ScStatusChip;
      if (wo.status === "pending_approval") statusChip = { label: "Pending Approval", bg: "#FAEEDA", fg: "#854F0B" };
      else if (bill) statusChip = { label: "Billed ✓", bg: "#EAF3DE", fg: "#3B6D11" };
      else if (ms.length) statusChip = { label: "Under Measurement", bg: "#E0F2FE", fg: "#075985" };
      else statusChip = { label: "Released · To Ops", bg: "#E6F5F3", fg: "#0F766E" };
      const meta = scApproverMeta(wo.value);
      const last = ms[ms.length - 1];
      return {
        key: k,
        woNo: wo.woNo,
        code: p.code,
        cat: p.cat,
        catId: p.catId,
        packageName: p.name,
        subbie: wo.subbie,
        subbieName: SC_SUBBIES[wo.subbie]?.name ?? wo.subbie,
        qty: wo.qty,
        uom: p.uom,
        rate: wo.rate,
        value: wo.value,
        status: wo.status,
        materialIssued: wo.materialIssued,
        amendmentCount: (SC_WO_AMENDMENTS[k] ?? []).length,
        approver: { who: meta.who, thresholdLabel: meta.thresholdLabel, pending: wo.status === "pending_approval" },
        statusChip,
        measurement: last
          ? { cum: last.cumQty, woQty: wo.qty, raCount: ms.length, periodTo: last.periodTo, full: last.cumQty >= wo.qty }
          : null,
      };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

  return {
    rows,
    kpis: {
      raised: rows.length,
      totalValue: rows.reduce((s, w) => s + w.value, 0),
      pendingApproval: rows.filter((w) => w.status === "pending_approval").length,
      released: rows.filter((w) => w.status === "released").length,
      raStarted: rows.filter((w) => w.measurement !== null).length,
      variations: rows.filter((w) => w.amendmentCount > 0).length,
    },
  };
}

function buildMeasurement(key: string, pkgs: ScPackage[]): SubcontractsPayload["measurement"] {
  const cards = pkgs
    .filter((p) => SC_WORKORDERS[key + "." + p.code])
    .map((p) => {
      const k = key + "." + p.code;
      const wo = SC_WORKORDERS[k]!;
      const ms = (SC_MEASUREMENTS[k] ?? []).slice().sort((a, b) => a.ra - b.ra);
      const cum = ms.length ? Math.max(...ms.map((m) => m.cumQty)) : 0;
      const pct = wo.qty ? Math.round((cum / wo.qty) * 100) : 0;
      const released = wo.status === "released";
      const isMach = p.scType === "machinery";
      const execLog = (SC_EXEC_LOG[k] ?? []).map((e) => ({ date: e.date, qty: e.qty }));
      const execTot = scExecToDate(k);
      return {
        key: k,
        code: p.code,
        name: p.name,
        cat: p.cat,
        catId: p.catId,
        uom: p.uom,
        woNo: wo.woNo,
        subbieName: SC_SUBBIES[wo.subbie]?.name ?? wo.subbie,
        woQty: wo.qty,
        rate: wo.rate,
        status: wo.status,
        released,
        cum,
        pct,
        execLog,
        execTot,
        uncert: Math.max(0, execTot - cum),
        measurements: ms.map((r) => {
          const found = scBillForLineWeek(k, r.ra);
          return {
            ra: r.ra,
            qtyThis: r.qtyThis,
            periodTo: r.periodTo,
            certBy: r.certBy,
            bill: found ? { billId: found.b.billId, status: found.b.status } : null,
            isMach,
          };
        }),
      };
    });

  const raisedWeeks = [
    ...new Set(
      Object.keys(SC_MEASUREMENTS)
        .filter((k) => scProjSp(k) === key)
        .flatMap((k) => SC_MEASUREMENTS[k]!.map((m) => m.ra))
    ),
  ].sort((a, b) => a - b);

  return { cards, nextWeek: scNextRaWeek(key), raisedWeeks };
}

function buildBills(key: string): SubcontractsPayload["bills"] {
  const bills = scRaBillKeysFor(key).map((bk) => ({ bk, b: SC_BILLS[bk]! }));
  const bySub: Record<string, typeof bills> = {};
  for (const x of bills) (bySub[x.b.subbie] ??= []).push(x);

  const sections = Object.keys(bySub).map((sub) => {
    const list = bySub[sub]!.slice().sort((a, b) => (b.b.raNo || 0) - (a.b.raNo || 0));
    const rows = list.map(({ bk, b }) => {
      const c = scBillCalc(b);
      const codes = (b.lines || []).map((l) => l.code);
      return {
        bk,
        billId: b.billId,
        billDate: b.billDate,
        raNo: b.raNo,
        periodTo: b.periodTo,
        lineCodes: codes,
        lineDetail: (b.lines || []).map((l) => `${l.qty}×₹${l.rate}`).join(" · "),
        gross: b.gross,
        retention: c.retention,
        retentionPct: b.retentionPct,
        gst: c.gst,
        tds: c.tds,
        net: c.net,
        status: b.status,
      };
    });
    return {
      sub,
      subName: SC_SUBBIES[sub]?.name ?? sub,
      count: list.length,
      netTotal: list.reduce((s, x) => s + scBillCalc(x.b).net, 0),
      rows,
    };
  });

  const awaiting = scAwaitingSubWeeks(key);
  const awaitingRows = Object.keys(awaiting)
    .sort()
    .map((id) => {
      const [sub, wk] = id.split("|");
      const lines = awaiting[id]!;
      return {
        sub: sub!,
        subName: SC_SUBBIES[sub!]?.name ?? sub!,
        week: parseInt(wk!, 10),
        lines: lines.map((l) => ({ code: l.code, certQty: l.certQty })),
        certVal: lines.reduce((s, l) => s + Math.round(l.certQty * l.woRate), 0),
      };
    });

  return {
    sections,
    awaiting: awaitingRows,
    kpis: {
      awaitingClaim: Object.keys(awaiting).length,
      raBills: bills.length,
      held: bills.filter((x) => x.b.status === "discrepancy").length,
      forwarded: bills.filter((x) => x.b.status === "forwarded_to_finance").length,
      paid: bills.filter((x) => x.b.status === "paid").length,
      totalGross: bills.reduce((s, x) => s + x.b.gross, 0),
    },
  };
}

function buildBillStatus(key: string): SubcontractsPayload["billStatus"] {
  const bills = Object.keys(SC_BILLS)
    .filter((bk) => bk.startsWith(key + "."))
    .map((bk) => SC_BILLS[bk]!);
  const bySub: Record<string, typeof bills> = {};
  for (const b of bills) (bySub[b.subbie] ??= []).push(b);
  return Object.keys(bySub).map((sub) => {
    const list = bySub[sub]!.slice().sort((a, b) => b.raNo - a.raNo);
    return {
      sub,
      count: list.length,
      total: list.reduce((s, b) => s + (b.gross || 0), 0),
      paid: list.filter((b) => b.status === "paid").reduce((s, b) => s + (b.gross || 0), 0),
      rows: list.map((b) => ({ billId: b.billId, raNo: b.raNo, periodTo: b.periodTo, status: b.status, gross: b.gross || 0 })),
    };
  });
}

function buildSubbies(pkgs: ScPackage[]): SubcontractsPayload["subbies"] {
  const tradesInSp: string[] = [];
  for (const p of pkgs) if (p.catId && !tradesInSp.includes(p.catId)) tradesInSp.push(p.catId);
  const orphanTrades = tradesInSp.filter((t) => scQualifiedSubbies(t).length === 0);
  const newly = Object.values(SC_SUBBIES)
    .filter((s) => s.status === "onboarding" || s.newVendor)
    .map((s) => ({ code: s.code, name: s.name, trades: (s.trades || []).map(scCatLabel), note: s.note }));

  const kindLabel = (s: ScSubbie) => (s.kind === "composite" ? "Composite SC" : s.kind === "machinery" ? "Plant hire" : "Labour SC");

  // Trade coverage — a subbie serving >1 trade appears under each.
  const pairs: { s: ScSubbie; trade: string }[] = [];
  for (const s of Object.values(SC_SUBBIES)) for (const t of s.trades.length ? s.trades : ["—"]) pairs.push({ s, trade: t });
  const order: string[] = [];
  for (const t of tradesInSp) order.push(t);
  for (const p of pairs) if (!order.includes(p.trade)) order.push(p.trade);
  const grp: Record<string, { s: ScSubbie; trade: string }[]> = {};
  for (const p of pairs) (grp[p.trade] ??= []).push(p);
  const multiTrade = Object.values(SC_SUBBIES).filter((s) => (s.trades || []).length > 1).length;

  const rowFor = (s: ScSubbie, trade: string): ScSubbieRow => {
    const c = s.compliance;
    const compFlag =
      s.status === "onboarding"
        ? { dot: "#854F0B", txt: "verifying", col: "#854F0B" }
        : !scCompliant(s)
          ? {
              dot: "#A32D2D",
              txt: c.esi === "lapsed" ? "ESI lapsed" : c.licence === "pending" ? "licence pending" : c.pf === "lapsed" ? "PF lapsed" : "flag",
              col: "#A32D2D",
            }
          : { dot: "#3B6D11", txt: c.gstRCM ? "compliant · RCM" : "compliant", col: "#6B6A68" };
    const sp = scSubbieTradeSpend(s.code, trade);
    return {
      code: s.code,
      name: s.name,
      state: s.state,
      kindLabel: kindLabel(s),
      status: s.status,
      tier: scSubbieTier(s),
      rcCount: RC_COUNT[s.code] ?? 0,
      nTrades: (s.trades || []).length,
      rating: s.rating,
      onTime: scSubbieOnTime(s.code),
      jobs: s.jobs,
      tradeSpend: sp.spend,
      tradeWo: sp.n,
      woCount: scSubbieWoCount(s.code),
      compliance: { pf: c.pf, esi: c.esi, licence: c.licence, gstRCM: c.gstRCM },
      compFlag,
    };
  };

  const groups = order
    .filter((t) => grp[t])
    .map((t) => ({
      catId: t,
      label: scCatLabel(t),
      count: grp[t]!.length,
      inSp: tradesInSp.includes(t),
      rows: grp[t]!.map(({ s }) => rowFor(s, t)),
    }));

  const details: SubcontractsPayload["subbies"]["details"] = {};
  for (const s of Object.values(SC_SUBBIES)) {
    details[s.code] = {
      code: s.code,
      name: s.name,
      state: s.state,
      kindLabel: s.kind === "composite" ? "Composite (material + labour)" : s.kind === "turnkey" ? "Turnkey" : s.kind === "machinery" ? "Plant hire" : "Labour-only",
      status: s.status,
      trades: (s.trades || []).map(scCatLabel),
      rating: s.rating,
      jobs: s.jobs,
      onboardedOn: s.onboardedOn,
      workOrders: Object.keys(SC_WORKORDERS)
        .filter((k) => SC_WORKORDERS[k]!.subbie === s.code)
        .map((k) => SC_WORKORDERS[k]!.woNo),
      compliance: { pf: s.compliance.pf, esi: s.compliance.esi, licence: s.compliance.licence, gstRCM: s.compliance.gstRCM },
      compliant: scCompliant(s),
      note: s.note,
    };
  }

  return { groups, orphanTrades, newly, multiTrade, details };
}

function buildDocs(projId: string, spId: string, key: string): SubcontractsPayload["docs"] {
  const proj = findProject(projId);
  const sp = proj.subProjects.find((s) => s.id === spId);
  return {
    standing: SC_STANDING_DOCS,
    scoped: SC_DOCS[key] ?? [],
    scopeName: sp?.name ?? "",
  };
}

function buildWorkflow(key: string, pkgs: ScPackage[]): SubcontractsPayload["workflow"] {
  const items = pkgs.map((p) => {
    const k = key + "." + p.code;
    const enq = SC_ENQUIRIES[k] ?? [];
    const l1 = enq.find((e) => e.selected);
    const wo = SC_WORKORDERS[k];
    const ms = SC_MEASUREMENTS[k] ?? [];
    const value = wo ? wo.value : l1 ? Math.round(l1.rate * p.totalQty) : 0;
    return { p, k, enq, l1, wo, ms, value, ap: scApprover(value || 0) };
  });
  const tot = items.length;
  const nEnq = items.filter((i) => i.enq.length).length;
  const nL1 = items.filter((i) => i.l1).length;
  const nWO = items.filter((i) => i.wo).length;
  const nRel = items.filter((i) => i.wo && i.wo.status === "released").length;
  const nMob = items.filter((i) => i.ms.length).length;
  const st = (d: number, t: number): ScWorkflowNode["state"] => (d >= t && t > 0 ? "done" : d > 0 ? "active" : "pending");

  const nodes: ScWorkflowNode[] = [
    { role: "Enquiry", person: "Naveen R (Buyer-Works)", done: nEnq, total: tot, verb: "floated", state: st(nEnq, tot) },
    { role: "L1 selected", person: "Comparative / L1", done: nL1, total: tot, verb: "picked", state: st(nL1, tot) },
    { role: "WO raised", person: "Naveen R (Maker)", done: nWO, total: tot, verb: "raised", state: st(nWO, tot) },
    { role: "Approved", person: "Aarumugam · Gobinath · Shreeram", done: nRel, total: tot, verb: "released", state: st(nRel, tot) },
    { role: "Mobilised", person: "Site · RA running", done: nMob, total: tot, verb: "on site", state: st(nMob, tot) },
  ];

  const bands = SC_APPROVAL.map((b, idx) => {
    const lo = idx === 0 ? 0 : SC_APPROVAL[idx - 1]!.max;
    const inBand = items.filter((i) => i.wo && i.ap.who === b.who);
    const approved = inBand.filter((i) => i.wo!.status === "released").length;
    const thresholdLabel = b.max === Infinity ? `> ₹${fmtC(lo)}` : idx === 0 ? `≤ ₹${fmtC(b.max)}` : `₹${fmtC(lo)}–₹${fmtC(b.max)}`;
    return { who: b.who, role: b.role, thresholdLabel, approved, inBand: inBand.length };
  });

  const pending = items.filter((i) => i.wo && i.wo.status === "pending_approval");
  const prompts = SC_APPROVAL.map((b) => {
    const list = pending.filter((i) => i.ap.who === b.who);
    return { who: b.who, role: b.role, woNos: list.map((i) => i.wo!.woNo) };
  }).filter((x) => x.woNos.length > 0);

  const cards: ScWorkflowCard[] = items.map((it) => {
    const w = it.wo;
    const cls = w && w.status === "released" ? "submitted" : w ? "in-progress" : "pending";
    const subbieName = w ? SC_SUBBIES[w.subbie]?.name ?? w.subbie : it.l1 ? SC_SUBBIES[it.l1.subbie]?.name ?? it.l1.subbie : "—";
    const valueDisplay = it.value > 0 ? "₹" + (it.value >= 100000 ? (it.value / 100000).toFixed(2) + "L" : fmtC(Math.round(it.value / 1000)) + "K") : "—";
    const action: ScWorkflowCard["action"] =
      w && w.status === "pending_approval" ? { kind: "approve", who: it.ap.who } : w && w.status === "released" ? { kind: "released" } : it.l1 ? { kind: "raise" } : { kind: "l1" };
    return {
      code: it.p.code,
      name: it.p.name,
      cat: it.p.cat,
      catId: it.p.catId,
      woNo: w?.woNo ?? null,
      subbieName,
      valueDisplay,
      routesTo: w ? `${it.ap.who} (${it.ap.role})` : "",
      cls,
      chips: [
        { label: "Enquiry", on: it.enq.length > 0 },
        { label: "L1", on: !!it.l1 },
        { label: "WO raised", on: !!w },
        { label: "Approved", on: !!w && w.status === "released" },
      ],
      action,
    };
  });

  return { nodes, bands, prompts, cards };
}

function buildKpis(key: string, pkgs: ScPackage[]): ScKpiCell[] {
  const nPkg = pkgs.length;
  const nComp = pkgs.filter((p) => p.scType === "lineitem").length;
  const nLab = pkgs.filter((p) => p.scType === "manpower").length;
  const nMach = pkgs.filter((p) => p.scType === "machinery").length;
  const budget = pkgs.reduce((s, p) => s + p.budgetValue, 0);
  const woVal = pkgs.reduce((s, p) => s + (SC_WORKORDERS[key + "." + p.code]?.value ?? 0), 0);
  const woCount = pkgs.filter((p) => SC_WORKORDERS[key + "." + p.code]).length;
  const raCertified = pkgs.filter((p) => SC_MEASUREMENTS[key + "." + p.code]).length;

  const scopedBills = Object.entries(SC_BILLS).filter(([k]) => k.startsWith(key + "."));
  const retentionHeld = scopedBills.reduce((s, [, b]) => s + scBillCalc(b).retention, 0);
  const fwd = scopedBills.filter(([, b]) => b.status === "forwarded_to_finance");
  const apFwd = fwd.reduce((s, [, b]) => s + scBillCalc(b).net, 0);
  const complianceFlags = Object.values(SC_SUBBIES).filter(
    (v) => v.status === "active" && (v.compliance.esi === "lapsed" || v.compliance.licence === "pending")
  ).length;

  return [
    { label: "SC Packages", value: `${nPkg}`, sub: `${nComp} comp · ${nLab} labour · ${nMach} plant` },
    { label: "Budget Value", value: `₹${fmtC(budget)}` },
    { label: "WOs Raised", value: `${woCount}/${nPkg}`, color: woCount > 0 ? "#185FA5" : "#6B6A68", sub: `₹${fmtC(woVal)}` },
    { label: "RA Certified", value: `${raCertified}`, color: raCertified > 0 ? "#3B6D11" : "#6B6A68", sub: "running measure" },
    { label: "Retention Held", value: `₹${fmtC(retentionHeld)}`, color: retentionHeld > 0 ? "#854F0B" : "#6B6A68", sub: "against defects" },
    { label: "→ Finance", value: `${fwd.length}`, color: fwd.length > 0 ? "#7B1FA2" : "#3B6D11", sub: `₹${fmtC(apFwd)} fwd` },
    { label: "Compliance", value: `${complianceFlags}`, color: complianceFlags > 0 ? "#A32D2D" : "#3B6D11", sub: "PF/ESI/licence" },
  ];
}

/* ─────────────────────────── Entry point ─────────────────────────── */

export function getSubcontracts(projId: string, spId: string): SubcontractsPayload {
  const project = findProject(projId);
  const sp = project.subProjects.find((s) => s.id === spId) ?? project.subProjects[0]!;
  const key = `${project.id}.${sp.id}`;
  const signed = SC_SIGNED_SCOPES.has(key);
  const pkgs = signed ? scPackagesFor(project.id, sp.id) : [];
  const rfqs = buildRfqs();

  return {
    scope: { project: project.id, subProject: sp.id },
    signed,
    today: SC_TODAY,
    projects: SC_PROJECTS,
    kpis: buildKpis(key, pkgs),
    packages: buildPackages(key, pkgs, rfqs),
    enquiries: buildEnquiries(key, pkgs, rfqs),
    comparative: buildComparative(key, pkgs, rfqs),
    workOrders: buildWorkOrders(key, pkgs),
    measurement: buildMeasurement(key, pkgs),
    bills: buildBills(key),
    billStatus: buildBillStatus(key),
    subbies: buildSubbies(pkgs),
    docs: buildDocs(project.id, sp.id, key),
    workflow: buildWorkflow(key, pkgs),
  };
}
