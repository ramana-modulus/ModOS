/** Procurement sub-tabs — mirrors the prototype's `curProcSub` values, labels,
 *  and the Pre-PO / PO Lifecycle / Reference visual grouping. */
export type ProcurementTabKey =
  | "bom"
  | "rfq"
  | "quotes"
  | "pos"
  | "grn"
  | "bills"
  | "resupply"
  | "vendors"
  | "releaselog"
  | "docs"
  | "workflow";

export interface ProcTab {
  key: ProcurementTabKey;
  label: string;
  title?: string;
}

export interface ProcTabGroup {
  title: string;
  tabs: ProcTab[];
}

export const PROC_TAB_GROUPS: ProcTabGroup[] = [
  {
    title: "Pre-PO",
    tabs: [
      { key: "bom", label: "BOM (Aggregated)" },
      { key: "rfq", label: "RFQ" },
      { key: "quotes", label: "Quotations" },
    ],
  },
  {
    title: "PO Lifecycle",
    tabs: [
      { key: "pos", label: "Purchase Orders" },
      { key: "grn", label: "Delivery Status", title: "Read-only — site (Ops) records goods receipt" },
      { key: "bills", label: "Bill Status", title: "3-way match & pass gate — Ops records, Procurement forwards to Finance" },
      { key: "resupply", label: "Resupply", title: "Materials rejected at incoming inspection — coordinate RTV resupply" },
    ],
  },
  {
    title: "Reference",
    tabs: [
      { key: "vendors", label: "Vendors" },
      { key: "releaselog", label: "BOM Release Log" },
      { key: "docs", label: "Docs" },
      { key: "workflow", label: "Approval Workflow" },
    ],
  },
];
