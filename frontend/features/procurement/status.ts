import type {
  BomLineStatus,
  InvoiceStatus,
  LeadTimeBucket,
  PoStatus,
  RfqMode,
  VendorCategory,
  VendorStatus,
} from "@/types/procurement";
import type { StatusTone } from "@/types";

export interface StatusMeta {
  label: string;
  tone: StatusTone;
}

export const BOM_STATUS: Record<BomLineStatus, StatusMeta> = {
  rfq_needed: { label: "RFQ Needed", tone: "neutral" },
  quotes_open: { label: "Quotes Open", tone: "info" },
  l1_selected: { label: "L1 Selected", tone: "accent" },
  po_raised: { label: "PO Raised", tone: "warn" },
  delivered: { label: "Delivered", tone: "success" },
};

export const PO_STATUS: Record<PoStatus, StatusMeta> = {
  draft: { label: "Draft", tone: "neutral" },
  approved: { label: "Approved", tone: "info" },
  sent_to_zoho: { label: "Sent to Zoho", tone: "info" },
  partial_delivery: { label: "Partial Delivery", tone: "warn" },
  delivered: { label: "Delivered", tone: "success" },
};

export const INVOICE_STATUS: Record<InvoiceStatus, StatusMeta> = {
  pending: { label: "Pending", tone: "neutral" },
  received: { label: "Received", tone: "info" },
  match_pending: { label: "Match Pending", tone: "warn" },
  matched: { label: "Matched", tone: "success" },
  discrepancy: { label: "Discrepancy", tone: "danger" },
  forwarded_to_finance: { label: "Forwarded to Finance", tone: "info" },
  paid: { label: "Paid", tone: "success" },
};

export const VENDOR_STATUS: Record<VendorStatus, StatusMeta> = {
  active: { label: "Active", tone: "success" },
  probation: { label: "Probation", tone: "warn" },
  onboarding: { label: "Onboarding", tone: "info" },
};

export const VENDOR_CATEGORY: Record<VendorCategory, StatusMeta> = {
  preferred: { label: "Preferred", tone: "success" },
  standard: { label: "Standard", tone: "neutral" },
  probation: { label: "Probation", tone: "warn" },
};

export const RFQ_MODE: Record<RfqMode, StatusMeta> = {
  rfq: { label: "RFQ", tone: "info" },
  rate_contract: { label: "Rate Contract", tone: "accent" },
};

export const LEAD_BUCKET: Record<LeadTimeBucket, StatusMeta> = {
  fast: { label: "0–5d", tone: "success" },
  medium: { label: "5–10d", tone: "warn" },
  slow: { label: "10d+", tone: "danger" },
  unknown: { label: "—", tone: "neutral" },
};
