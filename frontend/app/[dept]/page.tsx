import { notFound } from "next/navigation";
import { ComingSoon } from "@/components/coming-soon";
import { NAV_ITEMS } from "@/lib/nav";

/**
 * Catch-all for departments that are still placeholders. Every other module now
 * has its own static route; HR is a "coming soon" even in the prototype
 * (`renderHR` → `renderComingSoon('hr')`).
 */
const PLACEHOLDER_ROUTES: Record<string, string> = {
  hr: "HR",
};

export function generateStaticParams() {
  return Object.keys(PLACEHOLDER_ROUTES).map((dept) => ({ dept }));
}

export default async function DepartmentPage({ params }: { params: Promise<{ dept: string }> }) {
  const { dept } = await params;
  const label = PLACEHOLDER_ROUTES[dept];
  if (!label) notFound();

  const icon = NAV_ITEMS[dept]?.icon;
  return <ComingSoon label={label} icon={icon} />;
}
