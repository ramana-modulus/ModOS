import type { MyTask } from "@/features/inbox/types";

export const MY_TASKS: MyTask[] = [
  {id:'T1',dept:'Estimation',project:'Oragadam Warehouse',msg:'Assign engineers to Oragadam Warehouse costing (Auravintharam / Tharun / Anand)',priority:'high',due:'28 May 2026',done:false,target:'estimation_workflow'},
  {id:'T2',dept:'Estimation',project:'NTPC Tender',msg:'Assign engineers to NTPC costing — Mukunthan / Tharun / Anand (urgent tender deadline)',priority:'high',due:'22 May 2024',done:false,target:'estimation_workflow'},
  {id:'T3',dept:'Engineering',project:'Oragadam Warehouse',msg:'Approve SS-PCA-Bolt-Schedule-GFC (Porta Cabin A, Rev 1) · Tharun',priority:'med',due:'25 May 2026',done:false,target:'engineering'},
  {id:'T3b',dept:'Engineering',project:'Oragadam Warehouse',msg:'Rohith: Review & approve AR-PCA-Door-Window-GFC submitted by Anand',priority:'high',due:'25 May 2026',done:false,target:'engineering'},
  {id:'T4',dept:'Procurement',project:'Oragadam Warehouse',msg:'Get quotes for WC-M-101 PIR Wall Panel (Porta Cabin A)',priority:'high',due:'27 May 2026',done:false,target:'procurement'},
  {id:'T4b',dept:'Procurement',project:'Oragadam Warehouse',msg:'Gobinath: 2 POs pending CEO approval — SS-M-109 (₹17.9K) & SS-M-105 (₹21.5K)',priority:'high',due:'25 May 2026',done:false,target:'procurement'},
  {id:'T5',dept:'Ops',project:'Oragadam Warehouse',msg:'Inspect SS-M-102 partial delivery (200/300 nos M16 bolts)',priority:'med',due:'24 May 2026',done:false,target:'ops'},
  {id:'T6',dept:'Ops',project:'Oragadam Warehouse',msg:'Respond to RFI-002 — Bolt grade for SS-1004 connections · Assign to Tharun',priority:'med',due:'24 May 2026',done:false,target:'engineering'},
  {id:'T7',dept:'BD',project:'Oragadam Warehouse',msg:'Generate Quote — costing received from Estimation',priority:'low',due:'23 May 2024',done:false,target:'bizdev'},
];
