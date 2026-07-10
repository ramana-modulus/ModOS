import type {
  ProjectDoc,
  LegalTerms,
  FinInstrument,
  Obligation,
  ContractWorkflow,
  ArbitrationCase,
} from "@/features/contracts/types";

export const CONTRACT_PROJECT_DOCS: Record<string, ProjectDoc[]> = {
  'P1':[
    {doc:'Signed Work Order', cat:'Contract', status:'uploaded', on:'02 Apr 2026', by:'visvaprasad'},
    {doc:'Letter of Award (LOA)', cat:'Contract', status:'uploaded', on:'30 Mar 2026', by:'visvaprasad'},
    {doc:'Performance BG', cat:'Financial', status:'uploaded', on:'05 Apr 2026', by:'Finance'},
    {doc:'Insurance — CAR Policy', cat:'Insurance', status:'pending', on:'', by:''},
    {doc:'Approved GA Drawings', cat:'Technical', status:'uploaded', on:'10 Apr 2026', by:'Dushyanth'},
  ],
};

export const CONTRACT_LEGAL_TERMS: Record<string, LegalTerms> = {
  'P1':{dlpMonths:12, dlpStart:'on handover', ldPct:0.5, ldCap:10, ldBasis:'per week of delay, cap 10% of contract value',
        manpowerClause:'Min 40 skilled labour on-site during erection phase', warranty:'24 months on structure, 12 on fitments',
        opsFeasibility:'feasible', opsNote:'Standard PEB scope; site access confirmed by Ops recce.', reviewedBy:'Legal Head'},
};

export const CONTRACT_FIN_INSTRUMENTS: Record<string, FinInstrument[]> = {
  'P1':[
    {type:'Performance BG', amount:1600000, ref:'BG/HDFC/0091', issued:'05 Apr 2026', expiry:'05 Apr 2027', status:'active'},
    {type:'Advance BG', amount:3200000, ref:'BG/HDFC/0092', issued:'08 Apr 2026', expiry:'08 Oct 2026', status:'active'},
    {type:'EMD (refund due)', amount:250000, ref:'FIN-EMD-0061', issued:'01 Mar 2026', expiry:'', status:'refund_pending'},
    {type:'Solvency Certificate', amount:0, ref:'SOLV/HDFC/0017', issued:'20 Feb 2026', expiry:'20 Feb 2027', status:'active'},
  ],
};

export const CONTRACT_OBLIGATIONS: Record<string, Obligation[]> = {
  'P1':[
    {obligation:'Submit monthly progress report', type:'Deliverable', due:'monthly', linkedTo:'—', status:'on_track'},
    {obligation:'Achieve 50% erection by Day 75', type:'Milestone', due:'15 Jun 2026', linkedTo:'WBS', status:'on_track', penalty:'LD applies'},
    {obligation:'Maintain CAR insurance through DLP', type:'Compliance', due:'continuous', linkedTo:'CAR Policy', status:'at_risk', penalty:'Contract breach'},
  ],
};

export const CONTRACT_WF: Record<string, ContractWorkflow> = {
  'P1':{ maker:{person:'Priya (Legal Exec)', status:'done', on:'28 Mar 2026'},
         checker:{person:'Contracts Manager', status:'done', on:'29 Mar 2026'},
         approver:{person:'Legal Head', status:'done', on:'29 Mar 2026'},
         ceo:{person:'Shreeram R (CEO)', status:'done', on:'30 Mar 2026', threshold:'> ₹50L'},
         contractValue:32000000 },
};

export const CONTRACT_ARBITRATION: Record<string, ArbitrationCase[]> = {
  'P1':[
    {id:'ARB-001', raisedOn:'18 May 2026', raisedBy:'Modulus Housing', against:'Client (Kesavan)',
     reason:'Idle-time claim — site not ready for 14 days after mobilization',
     claimAmt:480000, stage:'conciliation', settlementAmt:0, status:'open',
     note:'Notice issued under cl.24. Client disputes 6 of 14 days.'},
  ],
};
