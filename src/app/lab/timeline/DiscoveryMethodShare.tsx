"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { Planet } from "@/components/PlanetScatter";
import { discoveryColors } from "@/lib/discovery-colors";
import { groupMethodShares } from "./timeline-data";

export default function DiscoveryMethodShare({ planets: population, selectedYear }: { planets: Planet[]; selectedYear: number | null }) {
  const { shares, otherMethods } = groupMethodShares(population);
  return <section className="mt-6 border-t border-slate-200 pt-5" aria-labelledby="methods-heading">
    <h3 id="methods-heading" className="text-lg font-semibold">Discovery methods {selectedYear === null ? "across all years" : <>in <strong className="rounded bg-teal-50 px-2 py-1 font-bold text-teal-900">{selectedYear}</strong></>}</h3>
    <p className="mt-3 text-sm leading-6 text-slate-700"><strong>{population.length.toLocaleString()} planets in the same selection as the table above.</strong> Each planet is counted once, under its archive discovery method; other methods may later confirm or study it.</p>
    {population.length > 0 ? <div className="mt-4 grid items-center gap-5 md:grid-cols-[minmax(0,300px)_minmax(0,1fr)]">
      <div className="mx-auto h-[260px] w-full max-w-[300px] min-w-0" role="img" aria-label={`Discovery method shares: ${shares.map(item => `${item.name}: ${item.count.toLocaleString()}`).join("; ")}.`}>
        <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 260, height: 260 }}>
          <PieChart><Pie data={shares} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius="85%" stroke="#fff" strokeWidth={2} isAnimationActive={false}>{shares.map(item => <Cell key={item.name} fill={discoveryColors[item.name] ?? "#64748b"} />)}</Pie><Tooltip formatter={(value, name) => [Number(value).toLocaleString(), String(name)]} /></PieChart>
        </ResponsiveContainer>
      </div>
      <div className="min-w-0">
        <table className="w-full text-left text-sm"><caption className="sr-only">Discovery method breakdown, {selectedYear === null ? "all years" : selectedYear}</caption><thead><tr className="border-b border-slate-300 text-slate-600"><th scope="col" className="pb-2 font-medium">Method</th><th scope="col" className="pb-2 text-right font-medium">Planets</th><th scope="col" className="pb-2 text-right font-medium">Share</th></tr></thead><tbody>{shares.map(({ name, count }) => <tr key={name} className="border-b border-slate-100"><th scope="row" className="py-3 pr-2 font-medium"><span className="mr-2 inline-block h-3 w-3 rounded-sm align-middle" style={{ backgroundColor: discoveryColors[name] ?? "#64748b" }} aria-hidden="true" />{name}</th><td className="py-3 text-right tabular-nums">{count.toLocaleString()}</td><td className="py-3 pl-2 text-right tabular-nums">{(count / population.length * 100).toFixed(1)}%</td></tr>)}</tbody></table>
        {otherMethods.length > 0 && <p className="mt-3 text-xs leading-5 text-slate-600"><strong>Other methods:</strong> {otherMethods.map(item => `${item.name} (${item.count.toLocaleString()})`).join(", ")}.</p>}
      </div>
    </div> : <p className="mt-4 text-sm text-slate-600">No discoveries match this selection. Select another bar, or click the selected bar again to show all years.</p>}
    <p className="mt-4 text-sm leading-6 text-slate-700">Transits dominate the full catalog because surveys such as Kepler and TESS repeatedly measured the brightness of large numbers of stars. These shares describe <em>detected</em> planets, not the underlying frequency of planets detectable by each technique.</p>
  </section>;
}
