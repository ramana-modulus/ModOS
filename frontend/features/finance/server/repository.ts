import "server-only";
import { PROJECTS, PROC_POS, PROC_INVOICES } from "@/features/procurement/data";
import type { Project } from "@/types/procurement";
import {
  FIN_CONFIG,
  FIN_PAYMENT_RUNS,
  FIN_RECEIPTS,
  FIN_RECURRING,
  FIN_PNL,
  BILL_CONFIG,
  BILL_CLIENT,
  BILL_VENDOR,
  SC_SUBBIES,
  SC_WORKORDERS,
  SC_BILLS,
} from "@/features/finance/data";
import {
  OPS_TODAY,
  computeFinForecast,
  financeApUnified,
  opsParseDate,
  type ForecastStores,
} from "@/features/finance/domain";
import type {
  CashflowWeek,
  FinanceApView,
  FinanceArView,
  FinanceCashflowView,
  FinanceKpis,
  FinancePayload,
  FinancePnlView,
  FinProject,
  FinSubProject,
  PaymentRunView,
} from "@/features/finance/types";

const DAY = 86_400_000;

/** All stores wired into one object for the org-wide forecast + AP feed. */
function stores(): ForecastStores {
  return {
    procInvoices: PROC_INVOICES,
    billVendor: BILL_VENDOR,
    scBills: SC_BILLS,
    scSubbies: SC_SUBBIES,
    scWorkOrders: SC_WORKORDERS,
    procPos: PROC_POS,
    billClient: BILL_CLIENT,
    billConfig: BILL_CONFIG,
    paymentRuns: FIN_PAYMENT_RUNS,
    recurring: FIN_RECURRING,
  };
}

/* ─────────────────────────── Projects & scope ─────────────────────────── */

function subProjectsOf(p: Project): FinSubProject[] {
  if (p.subProjects && p.subProjects.length > 0) {
    return p.subProjects.map((s) => ({ id: s.id, name: s.name, units: s.units, spec: s.spec ?? "" }));
  }
  return [{ id: "SP1", name: p.name, units: 1, spec: "" }];
}

export function listFinProjects(): FinProject[] {
  return PROJECTS.map((p) => ({
    id: p.id,
    name: p.name,
    code: p.code,
    client: p.client,
    type: p.type,
    subProjects: subProjectsOf(p),
  }));
}

/* ─────────────────────────── Tab view builders ─────────────────────────── */

function bankName(id: string): string {
  return FIN_CONFIG.bankAccounts.find((a) => a.id === id)?.name ?? id;
}

function buildApView(key: string): FinanceApView {
  const feed = financeApUnified(key, stores());
  const billToRun = new Set<string>();
  FIN_PAYMENT_RUNS.forEach((r) => r.billIds.forEach((id) => billToRun.add(id)));

  const inbox = feed.filter((b) => b.status === "sent_to_finance" && !billToRun.has(b.id));

  const toRunView = (r: (typeof FIN_PAYMENT_RUNS)[number]): PaymentRunView => ({
    id: r.id,
    weekOf: r.weekOf,
    status: r.status,
    totalAmount: r.totalAmount,
    bankName: bankName(r.bankAccount),
    note: r.note || null,
    approvedBy: r.approvedBy,
    approvedOn: r.approvedOn,
    executedOn: r.executedOn,
    bills: r.billIds.flatMap((bid) => {
      const b = feed.find((x) => x.id === bid);
      return b
        ? [{ id: b.id, vendor: b.vendor, poRef: b.poRef, netPayable: b.netPayable, lineCount: b.lineCount }]
        : [];
    }),
  });

  return {
    inbox,
    inboxCount: inbox.length,
    scheduledRuns: FIN_PAYMENT_RUNS.filter((r) => r.status === "scheduled").map(toRunView),
    executedRuns: FIN_PAYMENT_RUNS.filter((r) => r.status === "executed").map(toRunView),
  };
}

function buildArView(key: string, projId: string, spId: string, client: string): FinanceArView {
  const today = opsParseDate(OPS_TODAY).getTime();
  const clientBills = BILL_CLIENT[key] ?? [];

  const outstanding = clientBills
    .filter((b) => b.status === "invoiced")
    .map((b) => {
      const days = b.invoicedOn
        ? Math.floor((today - opsParseDate(b.invoicedOn).getTime()) / DAY)
        : 0;
      const finalPayable = b.finalPayable ?? 0;
      const receivedToDate = b.receivedToDate ?? 0;
      return {
        id: b.id,
        invoiceNo: b.invoiceNo ?? "—",
        client,
        invoicedOn: b.invoicedOn ?? null,
        daysOutstanding: days,
        overdue: days > 30,
        finalPayable,
        receivedToDate,
        balance: finalPayable - receivedToDate,
        partPaid: receivedToDate > 0,
      };
    });

  const reconciled = FIN_RECEIPTS.filter((r) => r.project === projId && r.subProj === spId).map(
    (r) => ({
      id: r.id,
      date: r.date,
      clientBillRef: r.clientBillRef,
      invoiceNo: r.invoiceNo,
      amount: r.amount,
      receivedVia: r.receivedVia,
      refNo: r.refNo,
      reconciledOn: r.reconciledOn,
      note: r.note,
    })
  );

  return {
    outstanding,
    outstandingCount: outstanding.length,
    reconciled,
    reconciledCount: reconciled.length,
  };
}

function isLabour(desc: string): boolean {
  return /labour|wage/i.test(desc);
}

function buildCashflowView(): FinanceCashflowView {
  const weeksRaw = computeFinForecast(stores());
  const opening = FIN_CONFIG.bankAccounts.reduce((s, a) => s + a.balance, 0);
  const ccAvailable = FIN_CONFIG.workingCapitalLimit - FIN_CONFIG.workingCapitalDrawn;

  let running = opening;
  const weeks: CashflowWeek[] = weeksRaw.map((wk) => {
    const inTotal = wk.inflows.reduce((s, i) => s + i.amount, 0);
    const outTotal = wk.outflows.reduce((s, o) => s + o.amount, 0);
    const net = inTotal - outTotal;
    running += net;
    const outVendor = wk.outflows
      .filter((o) => o.category === "AP" || o.category === "AP-pending")
      .reduce((s, o) => s + o.amount, 0);
    const outLabour = wk.outflows
      .filter((o) => o.category === "Recurring" && isLabour(o.desc))
      .reduce((s, o) => s + o.amount, 0);
    const outOverhead = wk.outflows
      .filter((o) => o.category === "Recurring" && !isLabour(o.desc))
      .reduce((s, o) => s + o.amount, 0);
    return { ...wk, inTotal, outTotal, net, projectedBalance: running, outVendor, outLabour, outOverhead };
  });

  return {
    banks: FIN_CONFIG.bankAccounts.map((a) => ({
      id: a.id,
      name: a.name,
      balance: a.balance,
      ifsc: a.ifsc,
    })),
    ccAvailable,
    ccLimit: FIN_CONFIG.workingCapitalLimit,
    totalLiquidity: opening + ccAvailable,
    openingBalance: opening,
    weeks,
  };
}

const EMPTY_PNL_NUMS = {
  contractValue: 0,
  durationDays: 0,
  elapsedDays: 0,
  progressPct: 0,
  timePct: 0,
  revenue: { claimed: 0, certified: 0, invoiced: 0, received: 0 },
  receivable: 0,
  cost: { committed: 0, incurred: 0, paid: 0, breakdown: { material: 0, labour: 0, overheads: 0 } },
  estimatedCostToComplete: 0,
  projectedTotalCost: 0,
  projectedProfit: 0,
  projectedMarginPct: 0,
  budgetedMarginPct: 0,
  profitDelta: 0,
  profitPositive: true,
};

function buildPnlView(key: string, sp: FinSubProject): FinancePnlView {
  const pnl = FIN_PNL[key];
  if (!pnl) {
    return { present: false, name: sp.name, units: sp.units, ...EMPTY_PNL_NUMS };
  }
  const profitDelta = pnl.projectedMarginPct - pnl.budgetedMarginPct;
  return {
    present: true,
    name: sp.name,
    units: sp.units,
    contractValue: pnl.contractValue,
    durationDays: pnl.durationDays,
    elapsedDays: pnl.elapsedDays,
    progressPct: pnl.progressPct,
    timePct: pnl.durationDays > 0 ? Math.round((pnl.elapsedDays / pnl.durationDays) * 100) : 0,
    revenue: pnl.revenue,
    receivable: pnl.revenue.invoiced - pnl.revenue.received,
    cost: pnl.cost,
    estimatedCostToComplete: pnl.estimatedCostToComplete,
    projectedTotalCost: pnl.projectedTotalCost,
    projectedProfit: pnl.projectedProfit,
    projectedMarginPct: pnl.projectedMarginPct,
    budgetedMarginPct: pnl.budgetedMarginPct,
    profitDelta,
    profitPositive: profitDelta >= 0,
  };
}

/* ─────────────────────────── Payload ─────────────────────────── */

/**
 * Assemble the full finance payload for a scope. AP/AR/P&L are project-scoped;
 * treasury KPIs and the cashflow forecast are org-wide (recomputed live).
 */
export function getFinance(projId: string, spId: string): FinancePayload {
  const project = PROJECTS.find((p) => p.id === projId) ?? PROJECTS[0]!;
  const subProjects = subProjectsOf(project);
  const sp = subProjects.find((s) => s.id === spId) ?? subProjects[0]!;
  const key = `${project.id}.${sp.id}`;

  // Treasury KPIs (org-wide) + project-scoped AP/AR aggregates.
  const totalBank = FIN_CONFIG.bankAccounts.reduce((s, a) => s + a.balance, 0);
  const wcAvailable = FIN_CONFIG.workingCapitalLimit - FIN_CONFIG.workingCapitalDrawn;

  // Faithful to renderFinance: KPI AP inbox / AR outstanding read the legacy
  // BILL_VENDOR / BILL_CLIENT scoped stores directly (the AP tab uses the
  // richer unified feed for its own inbox filter).
  const apInboxBills = (BILL_VENDOR[key] ?? []).filter((b) => b.status === "sent_to_finance");
  const arOutstandingBills = (BILL_CLIENT[key] ?? []).filter((b) => b.status === "invoiced");

  const cashflow = buildCashflowView();
  const thisWeek = cashflow.weeks.find((w) => w.isCurrent) ?? cashflow.weeks[0]!;

  const kpis: FinanceKpis = {
    totalBank,
    bankCount: FIN_CONFIG.bankAccounts.length,
    wcAvailable,
    apInboxValue: apInboxBills.reduce((s, b) => s + (b.netPayable || 0), 0),
    apInboxCount: apInboxBills.length,
    arOutstandingValue: arOutstandingBills.reduce((s, b) => s + (b.finalPayable || 0), 0),
    arOutstandingCount: arOutstandingBills.length,
    weekIn: thisWeek.inTotal,
    weekOut: thisWeek.outTotal,
    weekNet: thisWeek.net,
  };

  return {
    scope: { project: project.id, subProject: sp.id },
    projects: listFinProjects(),
    meta: { cfo: "Rajesh", accounts: "Priya", zohoSyncOn: FIN_CONFIG.zohoSyncOn },
    kpis,
    ap: buildApView(key),
    ar: buildArView(key, project.id, sp.id, project.client),
    cashflow,
    pnl: buildPnlView(key, sp),
  };
}
