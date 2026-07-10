"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface PanelContent {
  /** Monospace tag chip shown above the title (e.g. an item/RFQ code). */
  tag?: string;
  title: string;
  subtitle?: string;
  /** Panel width in px. Defaults to 380. */
  width?: number;
  body: ReactNode;
}

interface PanelContextValue {
  panel: PanelContent | null;
  openPanel: (content: PanelContent) => void;
  closePanel: () => void;
}

const PanelContext = createContext<PanelContextValue | null>(null);

/**
 * Right-hand slide-over panel state. Mirrors the prototype's family of
 * imperative panels (#qpanel / #opspanel / #ldpanel / #epanel …) with a single
 * declarative surface. Any feature can `openPanel({ title, body })`.
 */
export function PanelProvider({ children }: { children: ReactNode }) {
  const [panel, setPanel] = useState<PanelContent | null>(null);

  const openPanel = useCallback((content: PanelContent) => setPanel(content), []);
  const closePanel = useCallback(() => setPanel(null), []);

  const value = useMemo(
    () => ({ panel, openPanel, closePanel }),
    [panel, openPanel, closePanel]
  );

  return <PanelContext.Provider value={value}>{children}</PanelContext.Provider>;
}

export function usePanel(): PanelContextValue {
  const ctx = useContext(PanelContext);
  if (!ctx) throw new Error("usePanel must be used within a <PanelProvider>");
  return ctx;
}
