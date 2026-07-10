"use client";

import { useEffect, type ReactNode } from "react";
import { IconX } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  footer?: ReactNode;
  /** Panel width in px (default 560). */
  width?: number;
  children: ReactNode;
  className?: string;
}

/** Centered dialog (`.ra-popup`). Closes on Escape and backdrop click. */
export function Modal({
  open,
  onClose,
  title,
  subtitle,
  icon,
  footer,
  width = 560,
  children,
  className,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-ink/50 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{ width }}
        className={cn(
          "flex max-h-[85vh] w-full max-w-[92vw] flex-col overflow-hidden rounded-[10px] bg-surface shadow-[0_16px_48px_rgba(0,0,0,0.2)]",
          className
        )}
      >
        <header className="flex items-center gap-2.5 border-b-[0.5px] border-line px-4 py-3.5">
          {icon}
          <div className="min-w-0 flex-1">
            <div className="truncate text-t13 font-semibold text-ink">{title}</div>
            {subtitle && <div className="truncate text-t10 text-faint">{subtitle}</div>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="cursor-pointer text-faint hover:text-ink"
          >
            <IconX size={18} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-3.5">{children}</div>

        {footer && (
          <footer className="flex justify-end gap-2 border-t-[0.5px] border-line bg-subtle px-4 py-3">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}
