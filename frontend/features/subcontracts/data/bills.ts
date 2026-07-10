import type { ScBill } from "@/features/subcontracts/types";

export const SC_BILLS: Record<string, ScBill> = {
  'P1.SP1.MSC-001~RA6': {billId:'SCB/MSC-001/RA06', billDate:'13 May 2026', subbie:'MSC-001', raNo:6, periodTo:'12 May 2026',
    lines:[{code:'SS-1001', certQty:8000, qty:8000, rate:14.20, woRate:14.20, amount:113600, matchWO:'match', matchRA:'match'}],
    gross:113600, retentionPct:5, gstPct:18, tdsPct:1, matchWO:'match', matchRA:'match', status:'forwarded_to_finance', forwardedOn:'14 May 2026', payRef:null, note:'Week 6 running-account bill - structural erection.'},
  'P1.SP1.MSC-001~RA7': {billId:'SCB/MSC-001/RA07', billDate:'20 May 2026', subbie:'MSC-001', raNo:7, periodTo:'19 May 2026',
    lines:[{code:'SS-1001', certQty:12000, qty:12000, rate:14.20, woRate:14.20, amount:170400, matchWO:'match', matchRA:'match'}],
    gross:170400, retentionPct:5, gstPct:18, tdsPct:1, matchWO:'match', matchRA:'match', status:'matched', forwardedOn:null, payRef:null, note:'Week 7 running-account bill - structural erection.'},
  'P1.SP1.MSC-002~RA6': {billId:'SCB/MSC-002/RA06', billDate:'13 May 2026', subbie:'MSC-002', raNo:6, periodTo:'12 May 2026',
    lines:[{code:'EL-1001', certQty:40, qty:40, rate:1010, woRate:1010, amount:40400, matchWO:'match', matchRA:'match'}],
    gross:40400, retentionPct:5, gstPct:18, tdsPct:1, matchWO:'match', matchRA:'match', status:'forwarded_to_finance', forwardedOn:'14 May 2026', payRef:null, note:'Week 6 running-account bill - electricals.'},
  'P1.SP1.MSC-002~RA7': {billId:'SCB/MSC-002/RA07', billDate:'20 May 2026', subbie:'MSC-002', raNo:7, periodTo:'19 May 2026',
    lines:[{code:'EL-1001', certQty:24, qty:24, rate:1010, woRate:1010, amount:24240, matchWO:'match', matchRA:'match'},{code:'PL-1001', certQty:100, qty:100, rate:122, woRate:122, amount:12200, matchWO:'match', matchRA:'match'}],
    gross:36440, retentionPct:5, gstPct:18, tdsPct:1, matchWO:'match', matchRA:'match', status:'matched', forwardedOn:null, payRef:null, note:'Week 7 running-account bill - electricals + plumbing (2 line items).'},
};
