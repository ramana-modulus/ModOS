import {
  IconBell,
  IconBooks,
  IconBuilding,
  IconCalculator,
  IconCheckbox,
  IconChartLine,
  IconClipboardList,
  IconFileInvoice,
  IconFileText,
  IconHammer,
  IconReceipt,
  IconRuler2,
  IconSettings,
  IconShieldCheck,
  IconShoppingCart,
  IconUsers,
  IconUsersGroup,
  type Icon,
} from "@tabler/icons-react";
import type { DepartmentKey } from "@/types";

export interface NavItem {
  key: DepartmentKey;
  label: string;
  href: string;
  icon: Icon;
  /** Primary action label for this view (from the prototype's `sw()` action map). */
  action?: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

/** Sidebar structure — mirrors the prototype's left-nav sections and order. */
export const NAV_SECTIONS: NavSection[] = [
  {
    title: "Core",
    items: [
      { key: "projects", label: "Projects", href: "/projects", icon: IconBuilding, action: "New Project" },
      { key: "library", label: "Item Libraries", href: "/library", icon: IconBooks, action: "New Item" },
    ],
  },
  {
    title: "Departments",
    items: [
      { key: "bizdev", label: "Business Dev", href: "/bizdev", icon: IconChartLine, action: "New Lead" },
      { key: "estimation", label: "Estimation", href: "/estimation", icon: IconCalculator, action: "New BOQ" },
      { key: "planning", label: "Planning & Control", href: "/planning", icon: IconClipboardList, action: "New WBS" },
      { key: "contracts", label: "Contracts & Legal", href: "/contracts", icon: IconFileText },
      { key: "engineering", label: "Engineering", href: "/engineering", icon: IconRuler2, action: "Upload Drawing" },
      { key: "procurement", label: "Procurement", href: "/procurement", icon: IconShoppingCart, action: "New PO" },
      { key: "subcontracts", label: "Subcontracts", href: "/subcontracts", icon: IconUsersGroup, action: "New Work Order" },
      { key: "ops", label: "Operations", href: "/ops", icon: IconHammer, action: "Log Work" },
      { key: "qaqc", label: "QA / QC", href: "/qaqc", icon: IconShieldCheck, action: "New Inspection" },
      { key: "billing", label: "Billing", href: "/billing", icon: IconFileInvoice, action: "New RA Bill" },
      { key: "finance", label: "Finance", href: "/finance", icon: IconReceipt, action: "New Invoice" },
      { key: "hr", label: "HR", href: "/hr", icon: IconUsers },
    ],
  },
  {
    title: "System",
    items: [{ key: "settings", label: "Settings", href: "/settings", icon: IconSettings, action: "Save" }],
  },
];

/** Flat lookup of every nav item by key. */
export const NAV_ITEMS: Record<string, NavItem> = Object.fromEntries(
  NAV_SECTIONS.flatMap((s) => s.items).map((i) => [i.key, i])
);

/** Top-bar utility actions (bell + tasks). */
export const TOPBAR_ACTIONS = {
  notifications: { label: "Notifications", href: "/notifications", icon: IconBell },
  mytasks: { label: "My Tasks", href: "/mytasks", icon: IconCheckbox },
} as const;

/** Human label + breadcrumb for a route, used by the top bar. */
export function resolveDepartment(pathname: string): {
  key: string;
  label: string;
  breadcrumb: string;
} {
  const segment = pathname.split("/").filter(Boolean)[0] ?? "projects";
  const item = NAV_ITEMS[segment];
  if (item) {
    const section = NAV_SECTIONS.find((s) => s.items.some((i) => i.key === item.key));
    return { key: item.key, label: item.label, breadcrumb: `${section?.title ?? ""} / ${item.label}` };
  }
  if (segment === "notifications") return { key: segment, label: "Notifications", breadcrumb: "Notifications" };
  if (segment === "mytasks") return { key: segment, label: "My Tasks", breadcrumb: "My Tasks" };
  const fallback = segment.charAt(0).toUpperCase() + segment.slice(1);
  return { key: segment, label: fallback, breadcrumb: fallback };
}
