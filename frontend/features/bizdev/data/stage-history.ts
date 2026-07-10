/** Per-lead stage transition history — `[stage, enteredAt][]`. */
export const STAGE_HISTORY: Record<string, [string, string][]> = {
    L1:  [['enquiry','01 May 2026']],                                                                                       // 22d in enquiry — stale
    L2:  [['enquiry','05 May 2026']],                                                                                       // 18d in enquiry — stale
    L3:  [['enquiry','08 May 2026']],                                                                                       // 15d in enquiry — stale
    L4:  [['enquiry','16 Apr 2026'],['costing','05 May 2026']],                                                              // 18d in costing — warn
    L5:  [['enquiry','24 Apr 2026']],                                                                                       // 29d in enquiry — very stale
    L6:  [['enquiry','01 Mar 2026'],['costing','10 Mar 2026'],['proposal','20 Apr 2026'],['negotiation','10 May 2026']],     // 13d in negotiation — ok
    L7:  [['enquiry','18 May 2026'],['costing','19 May 2026'],['proposal','22 May 2026']],                                   // 1d in proposal — fresh
    L8:  [['enquiry','15 May 2026'],['costing','18 May 2026']],                                                              // 5d in costing — fresh
    L9:  [['enquiry','01 Mar 2026'],['costing','15 Mar 2026'],['proposal','20 Apr 2026'],['negotiation','05 May 2026']],     // 18d in negotiation — warn
    L10: [['enquiry','04 Mar 2026'],['costing','15 Mar 2026'],['proposal','01 Apr 2026'],['negotiation','15 Apr 2026'],['won','01 May 2026']], // won 22d ago
    L11: [['enquiry','01 Apr 2026'],['costing','15 Apr 2026'],['proposal','10 May 2026']],                                   // 13d in proposal — ok
  };
