"use client";

import { useEffect } from "react";
import { IconX } from "@tabler/icons-react";
import { usePanel } from "./panel-provider";

/**
 * The single slide-over surface rendered inside the main column. Reads the
 * active panel from context; closes on Escape or backdrop click.
 */
export function SlideOverPanel() {
  const { panel, closePanel } = usePanel();

  useEffect(() => {
    if (!panel) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePanel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panel, closePanel]);

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden={!panel}
        onClick={closePanel}
        className={`absolute inset-0 z-10 bg-ink/20 transition-opacity duration-150 ${
          panel ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={panel?.title}
        aria-hidden={!panel}
        style={{ width: panel?.width ?? 380 }}
        className={`absolute right-0 top-0 bottom-0 z-20 flex max-w-[92vw] flex-col border-l border-line bg-surface shadow-[-4px_0_16px_rgba(0,0,0,0.06)] transition-transform duration-200 ${
          panel ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {panel && (
          <>
            <header className="flex flex-shrink-0 items-start justify-between border-b border-line px-[13px] py-[11px]">
              <div className="min-w-0">
                {panel.tag && (
                  <span className="mb-1 inline-block rounded-[10px] bg-accent-soft px-[7px] py-0.5 font-mono text-t9 text-accent">
                    {panel.tag}
                  </span>
                )}
                <div className="truncate text-t14 font-semibold text-ink">{panel.title}</div>
                {panel.subtitle && <div className="text-t10 text-faint">{panel.subtitle}</div>}
              </div>
              <button
                type="button"
                onClick={closePanel}
                aria-label="Close panel"
                className="ml-3 flex-shrink-0 cursor-pointer text-lg leading-none text-faint hover:text-ink"
              >
                <IconX size={18} />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto px-[13px] py-3">{panel.body}</div>
          </>
        )}
      </aside>
    </>
  );
}
