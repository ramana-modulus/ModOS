import type { BillConfig, ClientBill, VendorBill } from "@/features/finance/types";

export const BILL_CONFIG: BillConfig = {
  retentionPct: 5,        // % held until DLP end
  gstPct: 18,             // construction services GST
  tdsContractorPct: 2,    // TDS 194C on contractor payments
  handoverMilestonePct: 15,  // % of contract billed on handover (FAC), per contract milestone
  agingBuckets: [{min:0,max:30,label:'0–30 days',color:'#3B6D11'},{min:31,max:60,label:'31–60 days',color:'#854F0B'},{min:61,max:90,label:'61–90 days',color:'#A32D2D'},{min:91,max:9999,label:'>90 days',color:'#5C2E91'}],
};

// BILL_CLIENT — outgoing RA bills (Modulus → Client), per (project.subproject)
export const BILL_CLIENT: Record<string, ClientBill[]> = {
  'P1.SP1': [
    {
      id: 'RA-1', billNo: 'MH/ORG/RA1/2026',
      billDate: '15 May 2026',
      periodFrom: '01 Apr 2026', periodTo: '15 May 2026',
      status: 'paid',
      preparedBy: 'Suresh (Billing Engg.)',
      submittedOn: '15 May 2026', certifiedOn: '19 May 2026',
      certifiedBy: 'Mr. Kesavan (Client Rep)',
      invoicedOn: '20 May 2026', invoiceNo: 'MH/INV/2026/047',
      paidOn: '22 May 2026', paymentRef: 'NEFT-KSV2026-058',
      claimedAmount: 2460000, certifiedAmount: 2460000,
      retention: 123000, netCertified: 2337000,
      gst: 420660, finalPayable: 2757660,
      reductionNote: '[v318] Raw-material lines (SS-M-101/102/103) removed from client AR — material is AP-only (Procurement → Finance), never a client claim. Steel work and its primer-coating QC deduction (₹2L, batch 1) bill as work in RA-2 (SS-1001). RA-1 now bills mobilization + engineering only.',
      lineItems: [
        {code:'MOBIL-01', name:'Site Mobilization + Office Setup',     uom:'LS',  plannedQty:1,     cumDone:1,     prevBilled:0, thisBill:1,     rate:1500000, amount:1500000},
        {code:'DESIGN-01',name:'Engineering + Detailed Drawings',      uom:'LS',  plannedQty:1,     cumDone:0.8,   prevBilled:0, thisBill:0.8,   rate:1200000, amount:960000},
        // [v318] Material lines (SS-M-101/102/103) removed — raw material is not a client claim (composite-rate; AP via Procurement → Finance).
      ],
      attachments: ['Measurement_RA1.xlsx','Photos_RA1.pdf','QC_Sign-off_RA1.pdf','Tax_Invoice_INV047.pdf'],
    },
    {
      id: 'RA-2', billNo: 'MH/ORG/RA2/2026 (draft)',
      billDate: '23 May 2026',
      periodFrom: '16 May 2026', periodTo: '23 May 2026 (in-progress)',
      status: 'draft',
      preparedBy: 'Suresh (Billing Engg.)',
      submittedOn: null, certifiedOn: null, invoicedOn: null, paidOn: null,
      claimedAmount: 180000, certifiedAmount: null,
      retention: null, netCertified: null, gst: null, finalPayable: null,
      lineItems: [
        // [v433] SS-1001 / SS-1004 (cabin scope) retired from the sub-project RA — billed per-cabin via cabin RAs.
        {code:'DESIGN-01',name:'Engineering (balance)',        uom:'LS', plannedQty:1,     cumDone:0.95,  prevBilled:0.8,thisBill:0.15,  rate:1200000, amount:180000, note:'GFC drawings ~95% complete.'},
      ],
      attachments: [],
      blockers: [],   // [v433] cabin scope (SS-1001/SS-1004) retired -> billed per-cabin via cabin RAs; RA-2 carries design balance only
    },
  ],
  'P1.SP2': [
    {id:'RA-1', billNo:'MH/ORG-B/RA1/2026 (draft)', billDate:'—', periodFrom:'—', periodTo:'—', status:'draft', claimedAmount:0, certifiedAmount:null, lineItems:[], attachments:[], blockers:['Porta Cabin B still in design — no executable work yet.']},
  ],
};

// BILL_VENDOR — incoming bills from vendors / subcontractors
export const BILL_VENDOR: Record<string, VendorBill[]> = {
  'P1.SP1': [
    { /* [v346] RETAINED in BILL_VENDOR: SS-M-101 batch-1 (paid history). Its code's batch-2 (held/discrepancy)
         lives in PROC_INVOICES['P1.SP1.SS-M-101'] and one key can't hold both batches until the backend's
         array-per-code vendor_bill table. All OTHER material AP is single-sourced from PROC_INVOICES. */
      id:'VB-003', billNo:'AAH/2026/118', vendor:'Aahir Engineers', vendorCode:'MVDR052',
      type:'material_supplier', billDate:'19 May 2026', receivedOn:'19 May 2026',
      poRef:'MH-PO-26-001', status:'paid',
      grossAmount:1474000, tds:0, retention:0, gst:265320, netPayable:1739320,
      lineItems:[
        {bomCode:'SS-M-101', desc:'IS 2062 E250 raw steel (batch 1 of 2 — delivered, GRN-26-005)', qty:22000, uom:'kg', rate:67, amount:1474000},
      ],
      verifiedBy:'Vignesh', verifiedOn:'19 May 2026', qcSignOff:'IMIR-006', certifiedBy:'PM (Manoj)', certifiedOn:'19 May 2026', sentToFinanceOn:'19 May 2026', paidOn:'22 May 2026',
    },
    {
      id:'VB-001', billNo:'JAY/RENT/05', vendor:'JAY AMBE CONSTRUCTIONS', vendorCode:'MVVDR0758',
      type:'services', billDate:'23 May 2026', receivedOn:'23 May 2026',
      poRef:'MH-WO-26-005', status:'received',
      grossAmount:180000, tds:3600, retention:0, gst:32400, netPayable:208800,
      lineItems:[
        {desc:'25T mobile crane hire — 5 days (26–30 May)', qty:5, uom:'Day', rate:36000, amount:180000},
      ],
      verifiedBy:null, verifiedOn:null, qcSignOff:null, certifiedBy:null, certifiedOn:null, sentToFinanceOn:null, paidOn:null,
      blockers:['Advance bill — services not yet rendered. Hold for verification post-crane mobilization.'],
    },
  ],
  'P1.SP2': [],
};
