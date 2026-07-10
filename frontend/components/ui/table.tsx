import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: ReactNode;
  align?: "left" | "right" | "center";
  /** Fixed column width, e.g. "120px" or "18%". */
  width?: string;
  /** Extra classes on the <td>. */
  className?: string;
  headerClassName?: string;
  render: (row: T, index: number) => ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  loadingRows?: number;
  /** Rendered when `data` is empty and not loading. */
  empty?: ReactNode;
  getRowKey?: (row: T, index: number) => string | number;
  onRowClick?: (row: T, index: number) => void;
  rowClassName?: (row: T, index: number) => string | undefined;
  className?: string;
}

const alignClass = { left: "text-left", right: "text-right font-mono", center: "text-center" } as const;

/**
 * Reusable data table with loading / empty / populated states (`table.t`).
 * Numeric columns (`align: "right"`) get a monospace font automatically.
 */
export function DataTable<T>({
  columns,
  data,
  loading = false,
  loadingRows = 5,
  empty = "No records.",
  getRowKey,
  onRowClick,
  rowClassName,
  className,
}: DataTableProps<T>) {
  return (
    <div className={cn("overflow-x-auto rounded-lg border-[0.5px] border-line", className)}>
      <table className="w-full border-collapse text-t11">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={col.width ? { width: col.width } : undefined}
                className={cn(
                  "border-b-[0.5px] border-line bg-canvas px-[9px] py-1.5 text-t85 font-medium uppercase tracking-[0.4px] text-faint",
                  alignClass[col.align ?? "left"].replace(" font-mono", ""),
                  col.headerClassName
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading &&
            Array.from({ length: loadingRows }).map((_, r) => (
              <tr key={`sk-${r}`}>
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="border-b-[0.5px] border-line-soft px-[9px] py-1.5 [tr:last-child_&]:border-b-0"
                  >
                    <span className="block h-3 w-full max-w-[120px] animate-pulse rounded bg-line-soft" />
                  </td>
                ))}
              </tr>
            ))}

          {!loading && data.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-[9px] py-8 text-center text-t11 text-faint">
                {empty}
              </td>
            </tr>
          )}

          {!loading &&
            data.map((row, i) => (
              <tr
                key={getRowKey ? getRowKey(row, i) : i}
                onClick={onRowClick ? () => onRowClick(row, i) : undefined}
                className={cn(
                  onRowClick && "cursor-pointer",
                  "transition-colors hover:[&>td]:bg-subtle-2",
                  rowClassName?.(row, i)
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "border-b-[0.5px] border-line-soft px-[9px] py-1.5 align-top text-ink [tr:last-child_&]:border-b-0",
                      alignClass[col.align ?? "left"],
                      col.className
                    )}
                  >
                    {col.render(row, i)}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
