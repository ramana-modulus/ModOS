/** Operations sub-tabs — mirrors the prototype's `curOpsSub` values, grouped by
 *  workflow phase (Execution · Materials · Coordination · Closeout). */
export type OpsTabKey =
  | "scope"
  | "reports"
  | "sitelog"
  | "grn"
  | "store"
  | "bills"
  | "incoming"
  | "indents"
  | "qcreq"
  | "handover";

export interface OpsTab {
  key: OpsTabKey;
  label: string;
}

export interface OpsTabGroup {
  title: string;
  tabs: OpsTab[];
}

export const OPS_TAB_GROUPS: OpsTabGroup[] = [
  {
    title: "Execution",
    tabs: [
      { key: "scope", label: "Scope Tracking" },
      { key: "reports", label: "Progress Reports" },
      { key: "sitelog", label: "Site Log" },
    ],
  },
  {
    title: "Materials",
    tabs: [
      { key: "grn", label: "Goods Receipt" },
      { key: "store", label: "Store" },
      { key: "bills", label: "Vendor Bills" },
    ],
  },
  {
    title: "Coordination",
    tabs: [
      { key: "incoming", label: "📥 Incoming" },
      { key: "indents", label: "Site Indents" },
      { key: "qcreq", label: "QC Requests" },
    ],
  },
  {
    title: "Closeout",
    tabs: [{ key: "handover", label: "Handover" }],
  },
];
