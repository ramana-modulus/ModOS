import "server-only";
import {
  CONTRACT_ARBITRATION,
  CONTRACT_BIDS,
  CONTRACT_EMD,
  CONTRACT_FIN_INSTRUMENTS,
  CONTRACT_LEGAL_TERMS,
  CONTRACT_OBLIGATIONS,
  CONTRACT_PROJECT_DOCS,
  CONTRACT_PROJECTS,
  CONTRACT_SIMILAR,
  CONTRACT_SUBMITTALS,
  CONTRACT_TENDERS,
  CONTRACT_WF,
  CONTRACTS_TODAY,
  RFIS,
} from "@/features/contracts/data";
import { LEADS_BASE } from "@/features/bizdev/data/leads-base";
import type { ContractsPayload } from "@/features/contracts/api";

/**
 * The full Contracts & Legal payload. Pre-sales tenders are keyed to the BD B2G
 * deals (so `leadCosting` is derived from the shared LEADS store); post-sales
 * stores are keyed per awarded project.
 */
export function getContracts(): ContractsPayload {
  const leadCosting: Record<string, boolean> = {};
  for (const lead of LEADS_BASE) {
    if (lead.type === "B2G") leadCosting[lead.id] = Boolean(lead.costingSubmitted);
  }

  return {
    tenders: CONTRACT_TENDERS,
    submittals: CONTRACT_SUBMITTALS,
    rfis: RFIS,
    bids: CONTRACT_BIDS,
    emd: CONTRACT_EMD,
    similar: CONTRACT_SIMILAR,
    projects: CONTRACT_PROJECTS,
    projectDocs: CONTRACT_PROJECT_DOCS,
    legalTerms: CONTRACT_LEGAL_TERMS,
    finInstruments: CONTRACT_FIN_INSTRUMENTS,
    obligations: CONTRACT_OBLIGATIONS,
    arbitration: CONTRACT_ARBITRATION,
    workflow: CONTRACT_WF,
    leadCosting,
    today: CONTRACTS_TODAY,
    kpis: {
      tenders: CONTRACT_TENDERS.length,
      openRfis: RFIS.filter((r) => r.status === "open").length,
      awardedProjects: CONTRACT_PROJECTS.length,
      openDisputes: Object.values(CONTRACT_ARBITRATION)
        .flat()
        .filter((a) => a.status === "open").length,
    },
  };
}
