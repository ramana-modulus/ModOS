import type { Ncr } from "@/features/qaqc/types";

export const QC_NCR: Record<string, Ncr[]> = {
  'P1.SP1': [
    {id:'NCR-007', raisedAt:'22 May 2026 · 14:00', raisedBy:'Karthik (QA Engg.)',
     forCode:'SS-1004', linkedInspection:'WIR-003', source:'WIR', cabin:3,
     defect:'Weld undercut at 3 joints in welded built-up beam — Bay 3, Column line C2. Failed visual inspection per ITP-004.',
     severity:'major', status:'action_taken', blocksBilling:true,
     disposition:'rework', responsibleParty:'Tharun (Struct. Engg.)', targetDate:'24 May 2026',
     rootCause:'Welder qualification lapse \u2014 WPS not followed on built-up section root pass; no in-process hold-point caught it.',
     correction:'Grind out defective welds, re-prepare groove, re-weld with E7018, DPT on repaired welds before sign-off.',
     correctiveAction:'Re-qualify welder to WPS-04; add a mandatory root-pass hold-point to ITP-004 for all built-up sections; toolbox talk issued to fab crew.',
     verifyNote:null,
     actionPlan:'Grind out defective welds with disc grinder, prepare clean groove, re-weld with E7018 electrodes, DPT on repaired welds before sign-off.',
     actionPlanBy:'Tharun (Struct. Engg.)', actionPlanAt:'22 May 2026 · 16:30', opsNotifiedAt:'22 May 2026 · 16:35', opsNotifiedTo:'Operations',
     actionTaken:'Repairs completed by Ramesh (Senior Welder). Visual inspection on repaired welds OK. DPT scheduled for 24 May.',
     actionTakenBy:'Ramesh (Welder)', actionTakenAt:'23 May 2026 · 11:00',
     closedAt:null, closedBy:null, verifiedAt:null,
     opsIndent:'IND-021',
     attachments:['Weld_defect_photos.jpg','Repair_method_statement.pdf','Repair_completion_photos.jpg']},
  ],
  'P1.SP2': [],
};
