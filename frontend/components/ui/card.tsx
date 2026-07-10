import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Surface container — white card with a hairline border. */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-lg border-[0.5px] border-line bg-surface", className)}
      {...props}
    />
  );
}

interface CardHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, action, className }: CardHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-2", className)}>
      <div className="min-w-0">
        <div className="text-t12 font-medium text-ink">{title}</div>
        {subtitle && <div className="text-t9 text-faint">{subtitle}</div>}
      </div>
      {action}
    </div>
  );
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-[13px]", className)} {...props} />;
}

/** Inline section heading with flanking hairlines (`.sec-hdr`). */
export function SectionHeader({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "my-3.5 flex items-center gap-2 text-t10 font-medium uppercase tracking-[0.8px] text-faint",
        className
      )}
    >
      <span aria-hidden className="h-px max-w-[18px] flex-1 bg-gradient-to-r from-line to-transparent" />
      {children}
      <span aria-hidden className="h-px flex-1 bg-gradient-to-r from-line to-transparent" />
    </div>
  );
}
