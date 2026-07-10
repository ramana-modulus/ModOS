import { apiGet } from "@/lib/http";
import type {
  ArbitrationCase,
  AwardedProject,
  ContractBid,
  ContractTender,
  ContractWorkflow,
  EmdRecord,
  FinInstrument,
  LegalTerms,
  Obligation,
  ProjectDoc,
  Rfi,
  SimilarWork,
  Submittal,
} from "./types";

export interface ContractsKpis {
  tenders: number;
  openRfis: number;
  awardedProjects: number;
  openDisputes: number;
}

export interface ContractsPayload {
  /* Pre-Sales */
  tenders: ContractTender[];
  submittals: Record<string, Submittal[]>;
  rfis: Rfi[];
  bids: Record<string, ContractBid>;
  emd: Record<string, EmdRecord>;
  similar: SimilarWork[];
  /* Post-Sales */
  projects: AwardedProject[];
  projectDocs: Record<string, ProjectDoc[]>;
  legalTerms: Record<string, LegalTerms>;
  finInstruments: Record<string, FinInstrument[]>;
  obligations: Record<string, Obligation[]>;
  arbitration: Record<string, ArbitrationCase[]>;
  workflow: Record<string, ContractWorkflow>;
  /* Shared */
  leadCosting: Record<string, boolean>;
  today: string;
  kpis: ContractsKpis;
}

export const contractsApi = {
  getContracts: () => apiGet<ContractsPayload>("/contracts"),
};
