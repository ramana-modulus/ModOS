import type { ProcDoc, ScopeKey } from "@/types/procurement";

/** `PROC_STANDING_DOCS` — department-wide reference documents (apply everywhere). */
export const PROC_STANDING_DOCS: ProcDoc[] = [
  { name: "Procurement_Policy_SOP_v4.pdf", type: "Policy", uploaded: "12 Feb 2026", by: "Aarumugam", size: "1.0 MB", status: "Active" },
  { name: "Commercial_Terms_GTC_v3.pdf", type: "Commercial Terms", uploaded: "15 Jan 2026", by: "Aarumugam", size: "0.8 MB", status: "Active" },
  { name: "General_Purchase_TandC_v2.pdf", type: "Commercial Terms", uploaded: "15 Jan 2026", by: "Aarumugam", size: "0.5 MB", status: "Active" },
  { name: "Approved_Vendor_List_FY26.xlsx", type: "AVL", uploaded: "05 Apr 2026", by: "Aarumugam", size: "0.2 MB", status: "Active" },
  { name: "Debarred_Vendor_Register.xlsx", type: "AVL", uploaded: "05 Apr 2026", by: "Aarumugam", size: "0.1 MB", status: "Active" },
  { name: "Approved_Makes_and_Spec_Master.xlsx", type: "Spec Master", uploaded: "20 Mar 2026", by: "Rohith", size: "0.6 MB", status: "Active" },
  { name: "HSN_GST_Master_FY26.xlsx", type: "HSN/GST Master", uploaded: "01 Apr 2026", by: "Aarumugam", size: "0.4 MB", status: "Active" },
  { name: "MSME_Compliance_Master.xlsx", type: "Compliance", uploaded: "05 Apr 2026", by: "Aarumugam", size: "0.3 MB", status: "Active" },
  { name: "GST_Vendor_Compliance_Tracker.xlsx", type: "Compliance", uploaded: "05 Apr 2026", by: "Aarumugam", size: "0.3 MB", status: "Active" },
  { name: "Rate_Contract_TSA_Steel_FY26.pdf", type: "Rate Contract", uploaded: "01 Apr 2026", by: "Aarumugam", size: "1.2 MB", status: "Active" },
  { name: "Rate_Contract_Inhouse_Hardware_FY26.pdf", type: "Rate Contract", uploaded: "01 Apr 2026", by: "Aarumugam", size: "0.9 MB", status: "Active" },
  { name: "Rate_Contract_AsianPaints_Industrial_FY26.pdf", type: "Rate Contract", uploaded: "01 Apr 2026", by: "Aarumugam", size: "0.7 MB", status: "Active" },
  { name: "Vendor_Onboarding_KYC_Template.docx", type: "Template", uploaded: "10 Jan 2026", by: "Aarumugam", size: "0.2 MB", status: "Active" },
  { name: "Standard_PO_Template_FY26.docx", type: "Template", uploaded: "10 Jan 2026", by: "Aarumugam", size: "0.2 MB", status: "Active" },
];

/** `PROC_DOCS` — sub-project transactional docs (RFQ letters + received quotes). */
export const PROC_DOCS: Record<ScopeKey, ProcDoc[]> = {
  "P1.SP1": [
    { name: "RFQ_Letter_SS_Steel_Batch1_28Apr2026.pdf", type: "RFQ Letter", uploaded: "28 Apr 2026", by: "Naveen R", size: "0.4 MB", status: "Sent" },
    { name: "RFQ_Letter_Bolts_M16_M20_29Apr2026.pdf", type: "RFQ Letter", uploaded: "29 Apr 2026", by: "Naveen R", size: "0.3 MB", status: "Sent" },
    { name: "RFQ_Letter_Welding_Primer_02May2026.pdf", type: "RFQ Letter", uploaded: "02 May 2026", by: "Naveen R", size: "0.3 MB", status: "Sent" },
    { name: "Aahir_Engineers_Steel_Quote_29Apr.pdf", type: "Vendor Quote", uploaded: "29 Apr 2026", by: "Naveen R", size: "0.6 MB", status: "Received" },
    { name: "JayAmbe_Steel_Quote_30Apr.pdf", type: "Vendor Quote", uploaded: "30 Apr 2026", by: "Naveen R", size: "0.5 MB", status: "Received" },
    { name: "IndWelders_E7018_Quote_03May.pdf", type: "Vendor Quote", uploaded: "03 May 2026", by: "Naveen R", size: "0.4 MB", status: "Received" },
  ],
  "P1.SP2": [],
};
