import type { ScEnquiryQuote } from "@/features/subcontracts/types";

export const SC_ENQUIRIES: Record<string, ScEnquiryQuote[]> = {
  'P1.SP1.SS-1001': [
    {subbie:'MSC-001', rate:14.20, leadDays:6, selected:true, payTerms:'Monthly RA, 30 days',  note:'L1 · existing crew, mobilised'},
    {subbie:'MSC-003', rate:15.80, leadDays:9, selected:false, note:''},
  ],
  'P1.SP1.WC-1001': [
    {subbie:'MSC-003', rate:355, leadDays:7, selected:true,  note:'L1'},
    {subbie:'MSC-001', rate:402, leadDays:5, selected:false, note:'faster but +13%'},
  ],
  'P1.SP1.SS-1004': [
    {subbie:'MSC-001', rate:14.50, leadDays:6, selected:true,  note:'L1 · erection crew available'},
    {subbie:'MSC-003', rate:16.00, leadDays:8, selected:false, note:'+10% · backup'},
  ],
  'P1.SP1.EL-1001': [
    {subbie:'MSC-002', rate:1010, leadDays:12, selected:true, payTerms:'RA-linked, 5% retention',  note:'L1 · turnkey incl. material'},
    {subbie:'MSC-005', rate:980,  leadDays:18, selected:false, note:'lower rate, longer lead, new subbie — held'},
  ],
  'P1.SP1.PL-1001': [
    {subbie:'MSC-002', rate:122, leadDays:10, selected:true, payTerms:'10% mobilisation advance, balance RA-linked', note:'L1 · turnkey incl. material'},
  ],
  // v384: FN-4001 (lineitem) + EL-2001 (manpower) deliberately staged UN-SOURCED (no enquiry) so the
  // clean "Float Enquiry" flow is demoable from the Work Packages table — the SC twin of Procurement
  // keeping some BOM items pre-RFQ. Their stale RA-3 billing lines are also dropped from the billing
  // spine (see _seedSP1BillingSpine) so a not-yet-sourced package carries no client measurement — a
  // derive-don't-store consistency fix, since they were pulled to L1 in v367 after the billing seed
  // had already measured them. WC-1002 (L1·Raise-WO) and PL-5001 (quotes·Select-L1) remain intact.
  // v369: staged at 'quotes recorded, no L1' — demos the Select-L1 step before Raise WO.
  'P1.SP1.PL-5001': [
    {subbie:'MSC-020', rate:1800, leadDays:6, selected:false, note:'sanitary-fixing crew, mobilised'},
    {subbie:'MSC-003', rate:1980, leadDays:9, selected:false, note:'+10% · longer lead'},
  ],
  // v368: WC-1002 pulled to L1 (Raise WO demo) — previously WO'd by the seeder with no enquiry history.
  'P1.SP1.WC-1002': [
    {subbie:'MSC-003', rate:355, leadDays:7, selected:true,  note:'L1 · same crew as 40mm panel'},
    {subbie:'MSC-001', rate:402, leadDays:5, selected:false, note:'+13% · faster lead'},
  ],
  // v368: enquiry history back-filled for executed packages (WO'd by the seeder) so Enquiries ↔ Work Packages reconcile.
  'P1.SP1.SS-2001': [
    {subbie:'MSC-001', rate:14.2, leadDays:6, selected:true,  note:'L1 · HDG erection crew'},
    {subbie:'MSC-003', rate:16.0, leadDays:8, selected:false, note:'+13% · backup'},
  ],
  'P1.SP1.FN-4002': [
    {subbie:'MSC-015', rate:400, leadDays:9, selected:true,  payTerms:'RA-linked, 5% retention', note:'L1 · turnkey door frames'},
    {subbie:'MSC-002', rate:430, leadDays:7, selected:false, note:'+7.5%'},
  ],
  'P1.SP1.RC-1001': [
    {subbie:'MSC-003', rate:95, leadDays:6, selected:true,  note:'L1 · roofing crew, same as cladding'},
    {subbie:'MSC-001', rate:105, leadDays:8, selected:false, note:'+10.5%'},
  ],
};
