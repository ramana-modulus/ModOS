import type { ScWorkOrder } from "@/features/subcontracts/types";

export const SC_WORKORDERS: Record<string, ScWorkOrder> = {
  'P1.SP1.SS-1001': {woNo:'MH/WO/2026/0041', subbie:'MSC-001', scType:'manpower', rate:14.20, qty:36000, value:511200, retentionPct:5, status:'released', raisedOn:'20 May 2026', approvedBy:'Shreeram R (CEO)', materialIssued:true, note:'Labour-only — MH issues fabricated steel; back-charge applies on wastage > 2%.'},
  'P1.SP1.WC-1001': {woNo:'MH/WO/2026/0043', subbie:'MSC-003', scType:'manpower', rate:355,   qty:1959, value:695445, retentionPct:5, status:'released', raisedOn:'21 May 2026', approvedBy:'Gobinath (COO)', materialIssued:true, note:'Labour-only — PIR panels issued from store.'},
  'P1.SP1.EL-1001': {woNo:'MH/WO/2026/0045', subbie:'MSC-002', scType:'lineitem', rate:1010,  qty:80,   value:80800,  retentionPct:5, status:'released', raisedOn:'22 May 2026', approvedBy:'Aarumugam (Subcontracts Manager)', materialIssued:false, note:'Composite turnkey — subbie supplies own material + labour.'},
  'P1.SP1.PL-1001': {woNo:'MH/WO/2026/0047', subbie:'MSC-002', scType:'lineitem', rate:122,   qty:240,  value:29280,  retentionPct:5, status:'released', raisedOn:'20 May 2026', approvedBy:'Aarumugam (Subcontracts Manager)', materialIssued:false, note:'Composite turnkey — plumbing & sanitary, subbie supplies own material + labour.'},
};
