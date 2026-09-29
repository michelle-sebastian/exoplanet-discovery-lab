"use client";

import { discoveryColors } from "@/lib/discovery-colors";
import { ALL_METHODS, STACK_METHODS, type DiscoveryBar } from "./timeline-data";

export default function DiscoveryYearChart({ bars, view, method, selectedYear, onSelect }: { bars: DiscoveryBar[]; view: "annual" | "cumulative"; method: string; selectedYear: number | null; onSelect: (year: number, toggle?: boolean) => void }) {
  const maximum = Math.max(1, ...bars.map(bar => view === "annual" ? bar.annual : bar.cumulative));
  const categories = method === ALL_METHODS ? STACK_METHODS : [method];
  return <>
    <div className="mt-4 overflow-x-auto rounded-md border border-slate-200 bg-white px-3 pb-4 pt-3">
      <div className="min-w-[720px]">
        <p className="mb-3 text-xs font-medium text-slate-600">Confirmed planets{view === "cumulative" ? " discovered through each year" : " discovered in each year"}</p>
        <div className="grid grid-cols-[48px_minmax(0,1fr)] gap-2">
          <div className="relative h-[260px] text-right text-[11px] tabular-nums text-slate-600">{[0, 0.25, 0.5, 0.75, 1].map(fraction => <span key={fraction} className="absolute right-0 -translate-y-1/2" style={{ top: `${(1 - fraction) * 100}%` }}>{Math.round(maximum * fraction).toLocaleString()}</span>)}</div>
          <div className="relative h-[260px]">
            {[0, 0.25, 0.5, 0.75, 1].map(fraction => <div key={fraction} className="pointer-events-none absolute inset-x-0 border-t border-slate-100" style={{ bottom: `${fraction * 100}%` }} />)}
            <div role="group" aria-label="Select a discovery year" className="relative flex h-full items-end gap-1 border-b border-slate-300">
              {bars.map((bar, index) => {
                const count = view === "annual" ? bar.annual : bar.cumulative;
                const description = `${bar.year}: ${count.toLocaleString()} ${view === "annual" ? "discoveries in this year" : "total discoveries through this year"}. ${bar.segments.map(item => `${item.name}: ${item.count.toLocaleString()}`).join("; ")}`;
                return <button key={bar.year} id={`timeline-year-${bar.year}`} type="button" data-year={bar.year} data-count={count} aria-label={`${bar.year}: ${count} ${view === "annual" ? "annual" : "cumulative"} discoveries. ${selectedYear === bar.year ? "Clear year selection to show all years." : "Select year."}`} aria-pressed={selectedYear === bar.year} tabIndex={selectedYear === bar.year || (selectedYear === null && index === 0) ? 0 : -1} title={description} onClick={() => onSelect(bar.year, true)} onKeyDown={event => {
                  if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
                  event.preventDefault();
                  const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? bars.length - 1 : Math.max(0, Math.min(bars.length - 1, index + (event.key === "ArrowRight" ? 1 : -1)));
                  const next = bars[nextIndex].year;
                  onSelect(next);
                  document.getElementById(`timeline-year-${next}`)?.focus();
                }} className={`relative flex h-full min-w-0 flex-1 items-end rounded-t-sm hover:bg-slate-50 ${selectedYear === bar.year ? "bg-teal-50 outline-1 outline-teal-700" : ""}`}>
                  <span data-bar-stack="true" className="flex w-full flex-col-reverse" style={{ height: `${count / maximum * 100}%` }}>{bar.segments.map(segment => <span key={segment.name} data-segment={segment.name} data-segment-count={segment.count} className="block w-full shrink-0" style={{ height: `${segment.count / count * 100}%`, backgroundColor: discoveryColors[segment.name] ?? "#64748b" }} />)}</span>
                  {(index === 0 || index === bars.length - 1 || (bar.year % 5 === 0 && index < bars.length - 2)) && <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[11px] text-slate-600">{bar.year}</span>}
                </button>;
              })}
            </div>
          </div>
        </div>
        <p className="ml-14 mt-8 text-center text-xs font-medium text-slate-600">Discovery year</p>
      </div>
    </div>
    <div aria-label="Discovery method legend" className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-700">{categories.map(name => <span key={name} className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-sm" style={{ backgroundColor: discoveryColors[name] ?? "#64748b" }} aria-hidden="true" />{name}</span>)}</div>
    {method === ALL_METHODS && <p className="mt-2 text-xs text-slate-600">Other methods groups the remaining techniques; choose one in the method filter to see it individually.</p>}
  </>;
}
