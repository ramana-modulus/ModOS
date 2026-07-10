import type { SetApproval } from "@/features/settings/types";

export const SET_APPROVALS: SetApproval[] = [
  {id:'AR-001', module:'procurement', trigger:'PO above ₹1,00,000',          approvers:['R-PM'],                  slaHrs:24, escalation:'R-CFO after 48h',  active:true,
   note:'Standard procurement guardrail.'},
  {id:'AR-002', module:'procurement', trigger:'PO above ₹10,00,000',         approvers:['R-PM','R-CFO'],          slaHrs:24, escalation:'R-CEO after 48h', active:true,
   note:'Two-step approval for high-value POs.'},
  {id:'AR-003', module:'procurement', trigger:'PO above ₹25,00,000',         approvers:['R-CFO','R-CEO'],         slaHrs:48, escalation:null,              active:true},
  {id:'AR-004', module:'engineering', trigger:'Design freeze for sub-project',approvers:['R-ENGG-LEAD','R-PM'],    slaHrs:24, escalation:'Client rep',      active:true,
   note:'Auto-routes to client portal after internal sign-off.'},
  {id:'AR-005', module:'billing',     trigger:'Client RA bill submission',   approvers:['R-PM','R-BD'],           slaHrs:24, escalation:'R-CEO after 48h', active:true},
  {id:'AR-006', module:'billing',     trigger:'Vendor RA bill above ₹5,00,000',approvers:['R-CFO'],               slaHrs:48, escalation:null,              active:true},
  {id:'AR-007', module:'estimation',  trigger:'Costing version submitted to BD',approvers:['R-ENGG-LEAD','R-PM'], slaHrs:24, escalation:'R-CEO after 48h', active:true,
   note:'Maker/Checker/Approver workflow.'},
  {id:'AR-008', module:'ops',         trigger:'Change Order above ₹2,00,000',approvers:['R-PM','R-CEO'],          slaHrs:24, escalation:'Client rep',      active:true},
  {id:'AR-009', module:'finance',     trigger:'Payment run above ₹20,00,000',approvers:['R-CFO','R-CEO'],         slaHrs:24, escalation:null,              active:true},
  {id:'AR-010', module:'qaqc',        trigger:'NCR closure (Major/Critical)',approvers:['R-QA','R-ENGG-LEAD'],    slaHrs:48, escalation:'R-PM after 72h',  active:true},
];
;
