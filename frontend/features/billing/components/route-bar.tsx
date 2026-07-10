/** billRouteBar — the "inherits from / routes to" strip atop each billing tab. */
export function RouteBar({ inherit, route, note }: { inherit: string; route: string; note?: string }) {
  return (
    <div className="mb-2.5 flex flex-wrap items-center gap-2 rounded-md border-[0.5px] border-line bg-[#F7F6F4] px-2.5 py-[7px] text-t9 text-muted">
      <span>
        <span style={{ color: "#185FA5" }}>↙</span> <strong className="text-ink-soft">Inherits</strong> {inherit}
      </span>
      <span className="text-[#D8D7D4]">·</span>
      <span>
        <span style={{ color: "#854F0B" }}>↗</span> <strong className="text-ink-soft">Routes to</strong> {route}
      </span>
      {note && (
        <>
          <span className="text-[#D8D7D4]">·</span>
          <span className="text-faint">{note}</span>
        </>
      )}
    </div>
  );
}
