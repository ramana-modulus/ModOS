import { NextResponse } from "next/server";

/** Wrap a payload in the standard `{ data }` success envelope. */
export function jsonOk<T>(data: T, init?: ResponseInit): NextResponse {
  return NextResponse.json({ data }, init);
}

/** Standard `{ error }` failure envelope. */
export function jsonError(message: string, status = 400, code?: string): NextResponse {
  return NextResponse.json({ error: { message, code } }, { status });
}

/** Read + validate `project` / `subProject` query params. */
export function readScope(req: Request): { project: string; subProject: string } | null {
  const url = new URL(req.url);
  const project = url.searchParams.get("project");
  const subProject = url.searchParams.get("subProject");
  if (!project || !subProject) return null;
  return { project, subProject };
}
