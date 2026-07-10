import type { ProjectExtEntry } from "@/features/projects/types";

/**
 * `PROJ_EXT` — extended project metadata for the ERP overview dashboard
 * (team, dates, contract, progress, SPI/CPI, cost, cross-module pulse, risks,
 * location). P1 (Oragadam) is fully populated; P2–P5 are empty stubs that fall
 * back to the minimal overview. Ported verbatim from the prototype.
 */
export const PROJ_EXT: Record<string, ProjectExtEntry> = {
  'P1': {
    location:{addr:'Oragadam Industrial Estate, Sriperumbudur, Tamil Nadu — 602105', distFromFactory:'42 km from MH Sriperumbudur factory'},
    team:{
      pm:        {name:'Tharun Kumar',         role:'Project Manager',     email:'tharun@modulushousing.com',   phone:'+91-98765-43210'},
      planning:  {name:'Arun S.',              role:'Planning Head',       email:'arun@modulushousing.com',     phone:'+91-98765-43211'},
      engg:      {name:'Suresh Iyer',          role:'Engineering Lead',    email:'suresh@modulushousing.com',   phone:'+91-98765-43212'},
      proc:      {name:'Gobinath M.',          role:'Procurement Lead',    email:'gobinath@modulushousing.com', phone:'+91-98765-43213'},
      ops:       {name:'Vikram Shetty',        role:'Operations Lead',     email:'vikram@modulushousing.com',   phone:'+91-98765-43214'},
      qa:        {name:'Anand Pillai',         role:'QA / QC Lead',        email:'anand@modulushousing.com',    phone:'+91-98765-43215'},
      billing:   {name:'Priya Raman',          role:'Billing Engineer',    email:'priya@modulushousing.com',    phone:'+91-98765-43216'},
      finance:   {name:'Karthik Subramanian',  role:'Finance Controller',  email:'karthik@modulushousing.com',  phone:'+91-98765-43217'},
      clientSpoc:{name:'Kesavan Murugan',      role:'Client SPOC',         email:'kesavan@kesavandev.com',      phone:'+91-99876-54321', org:'Kesavan Developments Ltd'}
    },
    dates:{
      loi:          '15 Mar 2026',
      contract:     '28 Mar 2026',
      siteHandover: '05 Apr 2026',
      plannedStart: '10 Apr 2026',
      actualStart:  '10 Apr 2026',
      plannedEnd:   '08 Aug 2026',
      forecastEnd:  '12 Aug 2026',
      dlpEnd:       '12 Aug 2027'
    },
    contract:{
      type:'Item Rate (BOQ-based)',
      billingMode:'boq', // default for line items unless overridden in WBS_ITEM_ATTRS
      paymentTerms:'30% advance · 50% material at site · 20% on handover',
      retention:5,
      ldClause:'0.5% per week, capped at 5% of contract value',
      dlpMonths:12
    },
    progress:{plannedPct:65, actualPct:62},
    spi:0.94, cpi:1.02,
    cost:{
      contractCr:53.93, changeOrderCr:0.80, revisedCr:54.73,
      incurredCr:32.10, committedCr:42.40, toCompleteCr:21.50,
      forecastFinalCr:53.60, plannedMarginPct:18.0, forecastMarginPct:17.2
    },
    pulse:[
      {dept:'Engineering', icon:'ti-ruler-2',       val:72,   sub:'drawings approved · BOM frozen ✓',           kind:'pct',  goTo:'engineering'},
      {dept:'Procurement', icon:'ti-shopping-cart', val:88,   sub:'PO value committed · 5 of 12 POs raised',    kind:'pct',  goTo:'procurement'},
      {dept:'Operations',  icon:'ti-hammer',       val:62,   sub:'WBS complete · 142 workers on site',         kind:'pct',  goTo:'ops'},
      {dept:'QA / QC',     icon:'ti-shield-check', val:96,   sub:'2 NCRs open · 96% inspection pass rate',     kind:'pct',  goTo:'qaqc',  warn:true},
      {dept:'Billing',     icon:'ti-file-invoice', val:60,   sub:'₹32.1 Cr raised of ₹53.93 Cr',               kind:'pct',  goTo:'billing'},
      {dept:'Finance',     icon:'ti-cash',         val:52,   sub:'₹28.0 Cr received · ₹4.1 Cr AR outstanding', kind:'pct',  goTo:'finance'}
    ],
    risks:{rfis:3, rfcs:1, ncrs:2, changeOrders:1, criticalProc:0, pendingApprovals:2},
    healthOverride:null
  },
  // Minimal stubs for other projects (won't show extended overview but won't break)
  'P2':{}, 'P3':{}, 'P4':{}, 'P5':{}
};
