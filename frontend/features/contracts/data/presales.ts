import type {
  Submittal,
  Rfi,
  ContractBid,
  EmdRecord,
  SimilarWork,
} from "@/features/contracts/types";

export const CONTRACT_SUBMITTALS: Record<string, Submittal[]> = {
  'L9':[
    {doc:'Company Registration Certificate', cat:'Statutory', status:'ready', by:'Priya'},
    {doc:'MSME / Udyam Certificate', cat:'Statutory', status:'ready', by:'Priya'},
    {doc:'GST Registration Certificate', cat:'Statutory', status:'ready', by:'Priya'},
    {doc:'PAN Card', cat:'Statutory', status:'ready', by:'Priya'},
    {doc:'Audited Balance Sheet (3 yrs)', cat:'Financial', status:'ready', by:'Finance'},
    {doc:'EPF Registration', cat:'Statutory', status:'ready', by:'Priya'},
    {doc:'ESI Registration', cat:'Statutory', status:'pending', by:'Priya'},
    {doc:'Labour License', cat:'Statutory', status:'pending', by:'Priya'},
    {doc:'Similar Works Completion Certificates', cat:'Technical', status:'ready', by:'Contracts'},
    {doc:'Solvency Certificate', cat:'Financial', status:'pending', by:'Finance'},
    {doc:'EMD DD / BG', cat:'Financial', status:'pending', by:'Finance'},
    {doc:'Technical Compliance PPT', cat:'Technical', status:'pending', by:'Contracts'},
  ],
  'L8':[
    {doc:'Company Registration Certificate', cat:'Statutory', status:'ready', by:'Priya'},
    {doc:'GST Registration Certificate', cat:'Statutory', status:'ready', by:'Priya'},
    {doc:'Audited Balance Sheet (3 yrs)', cat:'Financial', status:'pending', by:'Finance'},
    {doc:'Similar Works Completion Certificates', cat:'Technical', status:'pending', by:'Contracts'},
    {doc:'EMD DD', cat:'Financial', status:'pending', by:'Finance'},
  ],
  'L10':[
    {doc:'Company Registration Certificate', cat:'Statutory', status:'ready', by:'Priya'},
    {doc:'MSME / Udyam Certificate', cat:'Statutory', status:'ready', by:'Priya'},
    {doc:'GST Registration Certificate', cat:'Statutory', status:'ready', by:'Priya'},
    {doc:'Audited Balance Sheet (3 yrs)', cat:'Financial', status:'ready', by:'Finance'},
    {doc:'Similar Works Completion Certificates', cat:'Technical', status:'ready', by:'Contracts'},
    {doc:'EMD DD', cat:'Financial', status:'ready', by:'Finance'},
    {doc:'Technical Compliance PPT', cat:'Technical', status:'ready', by:'Contracts'},
  ],
};

export const RFIS: Rfi[] = [
  {id:'RFI-001', tenderId:'L9', raisedBy:'Tharun (Estimation)', raisedOn:'05 Mar 2026',
   question:'Tender BOQ silent on cabin floor finish — vinyl or cement screed? Rate impact ±₹180/sqft.',
   answer:'Clarified at pre-bid: vinyl flooring, 2mm, anti-skid.', answeredBy:'visvaprasad', answeredOn:'10 Mar 2026', status:'closed'},
  {id:'RFI-002', tenderId:'L9', raisedBy:'Anand (Estimation)', raisedOn:'06 Mar 2026',
   question:'Is erection at site in NLC scope or supply-only? Affects transport + labour.',
   answer:'Supply, transport AND erection in scope. Confirmed in corrigendum-1.', answeredBy:'visvaprasad', answeredOn:'10 Mar 2026', status:'closed'},
  {id:'RFI-003', tenderId:'L9', raisedBy:'Tharun (Estimation)', raisedOn:'12 Mar 2026',
   question:'Wind speed / seismic zone for structural design basis not specified.',
   answer:'', answeredBy:'', answeredOn:'', status:'open'},
  {id:'RFI-004', tenderId:'L8', raisedBy:'Mukunthan (Estimation)', raisedOn:'20 May 2026',
   question:'Security cabin — is AC load to be included in electrical scope?',
   answer:'', answeredBy:'', answeredOn:'', status:'open'},
];

export const CONTRACT_BIDS: Record<string, ContractBid> = {
  'L10':{quotedAmount:9120000, margin:14, submittedOn:'12 Mar 2026', submittedBy:'aravind',
         portalFormat:'GeM BoQ template v2', ack:'GEM/ACK/2231/0456', status:'submitted'},
  'L9':{quotedAmount:0, margin:0, submittedOn:'', submittedBy:'', portalFormat:'NLC e-portal XLS', ack:'', status:'awaiting_estimation'},
};

export const CONTRACT_EMD: Record<string, EmdRecord> = {
  'L9':{emdAmt:250000, emdMode:'BG', emdStatus:'requested', tenderFee:11800, feeStatus:'paid', financeRef:'FIN-EMD-0091'},
  'L8':{emdAmt:50000, emdMode:'DD', emdStatus:'pending', tenderFee:5900, feeStatus:'pending', financeRef:''},
  'L10':{emdAmt:180000, emdMode:'DD', emdStatus:'paid', tenderFee:8260, feeStatus:'paid', financeRef:'FIN-EMD-0083'},
};

export const CONTRACT_SIMILAR: SimilarWork[] = [
  {ref:'NLC/2024/CABIN/025', title:'25 Nos Steel Cabins — NLC', issued:'Aug 2024', bidders:6,
   l1:'Modulus Housing', l1Rate:28500000, l2Rate:30100000, l3Rate:31800000, outcome:'Won', forTender:'L9'},
  {ref:'NTPC/2023/SEC/012', title:'Security Cabins — NTPC Talcher', issued:'Nov 2023', bidders:4,
   l1:'Saffron Modular', l1Rate:3850000, l2Rate:4200000, l3Rate:4500000, outcome:'Lost (L2)', forTender:'L8'},
  {ref:'SR/2024/RRT/118', title:'Gang Rest Rooms — Southern Railway', issued:'Jun 2024', bidders:7,
   l1:'Modulus Housing', l1Rate:8900000, l2Rate:9400000, l3Rate:9950000, outcome:'Won', forTender:'L10'},
];
