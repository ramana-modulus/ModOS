"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export interface ProjectWon {
  name: string;
  code: string;
}

interface ProjectWonContextValue {
  won: ProjectWon | null;
  /** Fire the company-wide "Project Won" banner. Pass the server-created project
   * code when available; otherwise a placeholder code is minted. */
  celebrate: (name: string, code?: string) => void;
  /** Acknowledge / close the banner. */
  dismiss: () => void;
}

const ProjectWonContext = createContext<ProjectWonContextValue | null>(null);

/**
 * Company-wide "Project Won" celebration state (prototype `markWon`). When a BD
 * deal is marked Won, `celebrate()` mints a new project code and shows a global
 * banner (see ProjectWonBanner) that stays up — visible in every department —
 * until a user acknowledges it.
 */
export function ProjectWonProvider({ children }: { children: ReactNode }) {
  const [won, setWon] = useState<ProjectWon | null>(null);

  const celebrate = useCallback((name: string, code?: string) => {
    setWon({ name, code: code ?? `MH-${String(Date.now()).slice(-5)}` });
  }, []);
  const dismiss = useCallback(() => setWon(null), []);

  const value = useMemo(() => ({ won, celebrate, dismiss }), [won, celebrate, dismiss]);

  return <ProjectWonContext.Provider value={value}>{children}</ProjectWonContext.Provider>;
}

export function useProjectWon(): ProjectWonContextValue {
  const ctx = useContext(ProjectWonContext);
  if (!ctx) throw new Error("useProjectWon must be used within a <ProjectWonProvider>");
  return ctx;
}
