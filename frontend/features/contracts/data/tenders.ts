import type { ContractTender } from "@/features/contracts/types";

// Pre-Sales tenders — extends BD B2G deals with contracts-side fields.
export const CONTRACT_TENDERS: ContractTender[] = [
  {dealId:'L9', portal:'Palladium', portalRef:'NLC/2026/CABIN/040',
   client:'Neyveli Lignite Corporation', title:'4 Nos Portable Steel Cabins',
   issued:'25 Feb 2026', preBid:'10 Mar 2026', dueDate:'20 May 2026', emdAmt:250000, tenderFee:11800,
   estValue:32000000, financialOk:true, technicalOk:true, stage:'bid_prep', owner:'visvaprasad'},
  {dealId:'L8', portal:'Tender247', portalRef:'GEM/2026/B/7506141',
   client:'NTPC Multi Location', title:'Security Cabin — Supply & Install',
   issued:'12 May 2026', preBid:'24 May 2026', dueDate:'08 Jun 2026', emdAmt:50000, tenderFee:5900,
   estValue:8000000, financialOk:true, technicalOk:true, stage:'bid_prep', owner:'visvaprasad'},
  {dealId:'L10', portal:'GeM', portalRef:'GEM/2026/RLY/2231',
   client:'Southern Indian Railways', title:'Gang Rest Room cum Toilet — CISP',
   issued:'20 Feb 2026', preBid:'02 Mar 2026', dueDate:'14 Mar 2026', emdAmt:180000, tenderFee:8260,
   estValue:9500000, financialOk:true, technicalOk:true, stage:'submitted', owner:'aravind'},
  {dealId:'L12', portal:'Palladium', portalRef:'BHEL/2026/CABIN/018',
   client:'BHEL Trichy', title:'18 Nos Site Office Cabins',
   issued:'18 May 2026', preBid:'30 May 2026', dueDate:'18 Jun 2026', emdAmt:120000, tenderFee:7080,
   estValue:6500000, financialOk:true, technicalOk:true, stage:'screening', owner:'visvaprasad'},
];

