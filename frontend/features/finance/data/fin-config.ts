import type {
  FinConfig,
  PaymentRun,
  FinReceipt,
  RecurringCost,
  FinPnl,
} from "@/features/finance/types";

export const FIN_CONFIG: FinConfig = {
  bankAccounts: [
    {id:'BA01', name:'HDFC Current · Main Ops',          balance: 8525400, type:'current',  ifsc:'HDFC0000123'},
    {id:'BA02', name:'ICICI · Oragadam Project Account', balance: 3250000, type:'project',  ifsc:'ICIC0000456'},
  ],
  workingCapitalLimit: 15000000,  // ₹1.5 Cr CC line
  workingCapitalDrawn: 0,
  zohoSyncOn:  '23 May 2026 · 02:30',
  tallySyncOn: '22 May 2026 · 23:45',
};

// FIN_PAYMENT_RUNS — weekly batches of vendor bills to pay
export const FIN_PAYMENT_RUNS: PaymentRun[] = [
  {id:'PR-2026-21', weekOf:'25 May 2026', status:'scheduled',
   billIds:['INV-IHR-2026-058'],   // [v346] SS-M-102 from PROC_INVOICES (was VB-005 @45; canonical PROC rate @11.5)
   totalAmount: 2691, bankAccount:'BA01',
   approvedBy:null, approvedOn:null, executedOn:null,
   note:'Small bolt supplier — single bill batch.'},
  {id:'PR-2026-20', weekOf:'18 May 2026', status:'executed',
   billIds:['VB-003'],   // [v346] healed: VB-004 was a phantom (removed at v171) dangling in this run
   totalAmount: 1739320, bankAccount:'BA01',
   approvedBy:'CFO (Rajesh)', approvedOn:'20 May 2026',
   executedOn:'21–22 May 2026',
   note:'DCS steel batch 1 + AAHIR RA-1 — major fab outflow week.'},
  {id:'PR-2026-19', weekOf:'11 May 2026', status:'executed',
   billIds:['INV-IHR-2026-061'],   // [v346] SS-M-103 from PROC_INVOICES (was VB-002 @65; canonical PROC rate @17)
   totalAmount: 2387, bankAccount:'BA01',
   approvedBy:'CFO (Rajesh)', approvedOn:'13 May 2026',
   executedOn:'15 May 2026',
   note:'Hardware supplier — fast-track payment.'},
];

// FIN_RECEIPTS — client payments received
export const FIN_RECEIPTS: FinReceipt[] = [
  {id:'RCT-001', date:'22 May 2026', clientBillRef:'RA-1', project:'P1', subProj:'SP1',
   invoiceNo:'MH/INV/2026/047', amount: 4259800,
   receivedVia:'NEFT', refNo:'KSV2026-058', bankAccount:'BA01',
   status:'reconciled', reconciledOn:'23 May 2026',
   note:'Client paid in full within 2 days of invoice.'},
];

export const FIN_RECURRING: RecurringCost[] = [
  {desc:'Site labour weekly wages',           amount:280000},
  {desc:'Site overheads (fuel, supervision)', amount:65000},
];

export const FIN_AR_CREDIT_DAYS = 7; // contractual client payment terms after invoice
export const FIN_CERT_CYCLE_DAYS = 7; // typical client certification turnaround

// FIN_PNL — per sub-project profitability snapshot
// Computed values, not stored values (in production these would aggregate live)
export const FIN_PNL: Record<string, FinPnl> = {
  'P1.SP1': {
    contractValue: 35000000,    // sub-project slice (Porta Cabin A × 59)
    durationDays: 120,
    elapsedDays: 53,
    progressPct: 13,            // % completion (cum certified / contract)
    revenue: {
      claimed:    4000000+1490700,  // RA-1 + RA-2 draft
      certified:  3800000,
      invoiced:   4259800,
      received:   4259800,
    },
    cost: {
      committed:  8500000,      // total POs + WOs released
      incurred:   5400000,      // material delivered + work executed
      paid:       3570024,      // actual cash to vendors
      breakdown:  {material:3500000, labour:1700000, overheads:200000},
    },
    estimatedCostToComplete: 25000000,
    projectedTotalCost: 30400000,
    projectedProfit: 35000000 - 30400000,
    projectedMarginPct: ((35000000-30400000)/35000000*100),
    budgetedMarginPct: 14.5,    // original tender margin
  },
  'P1.SP2': {
    contractValue: 18900000,
    durationDays: 120, elapsedDays: 53, progressPct: 0,
    revenue: {claimed:0, certified:0, invoiced:0, received:0},
    cost: {committed:0, incurred:0, paid:0, breakdown:{material:0,labour:0,overheads:0}},
    estimatedCostToComplete: 16200000,
    projectedTotalCost: 16200000,
    projectedProfit: 2700000,
    projectedMarginPct: 14.3,
    budgetedMarginPct: 14.5,
  },
};
