"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import type { Planet } from "@/components/PlanetScatter";
import CandidateChart from "./CandidateChart";
import Link from "next/link";
import { catalogFlux, filterCandidates, planetHabitabilityUrl } from "@/lib/habitability";

const defaults = { minRadius: "0.5", maxRadius: "1.8", minFlux: "0.35", maxFlux: "1.7", maxDistance: "", method: "all", query: "" };
const SEARCH_BATCH_SIZE = 24;
const format = (value: number | null | undefined, digits = 2) => typeof value === "number" && Number.isFinite(value) ? value.toLocaleString(undefined, { maximumFractionDigits: digits }) : "Unknown";
const temperature = (value: number | null | undefined) => typeof value === "number" ? `${format(Math.round(value - 273.15) || 0, 0)} °C (${format(value, 0)} K)` : "Unknown";

export default function CandidateCatalog({ planets, initialQuery = "" }: { planets: Planet[]; initialQuery?: string }) {
  const [mode, setMode] = useState<"filters" | "search">(initialQuery.trim() ? "search" : "filters");
  const [query, setQuery] = useState(initialQuery);
  const [searchLimit, setSearchLimit] = useState(SEARCH_BATCH_SIZE);
  const [applied, setApplied] = useState(defaults);
  const [view, setView] = useState<"chart" | "table">("chart");
  const topScroll = useRef<HTMLDivElement>(null);
  const tableScroll = useRef<HTMLDivElement>(null);
  const scrollSpacer = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = tableScroll.current;
    const table = container?.querySelector("table");
    if (!container || !table) return;
    const resize = () => {
      if (scrollSpacer.current) scrollSpacer.current.style.width = `${container.scrollWidth}px`;
      if (topScroll.current) topScroll.current.scrollLeft = container.scrollLeft;
    };
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    observer.observe(table);
    resize();
    return () => observer.disconnect();
  }, []);
  const [filters, setFilters] = useState(defaults);
  const [sort, setSort] = useState("earth");
  const [expanded, setExpanded] = useState<string | null>(null);
  const invalid = [filters.minRadius, filters.maxRadius, filters.minFlux, filters.maxFlux].some(v => v.trim() === "" || !Number.isFinite(Number(v)) || Number(v) < 0) || Number(filters.minRadius) > Number(filters.maxRadius) || Number(filters.minFlux) > Number(filters.maxFlux) || (filters.maxDistance !== "" && (!Number.isFinite(Number(filters.maxDistance)) || Number(filters.maxDistance) < 0));
  const candidates = useMemo(() => filterCandidates(planets, { minRadius: Number(applied.minRadius), maxRadius: Number(applied.maxRadius), minFlux: Number(applied.minFlux), maxFlux: Number(applied.maxFlux), maxDistance: applied.maxDistance === "" ? null : Number(applied.maxDistance), method: "all", query: "" }).sort((a, b) => {
    if (sort === "name") return a.planet.pl_name.localeCompare(b.planet.pl_name);
    if (sort === "radius") return a.planet.pl_rade - b.planet.pl_rade;
    if (sort === "flux") return a.flux.value - b.flux.value;
    if (sort === "distance") return (a.planet.sy_dist ?? Infinity) - (b.planet.sy_dist ?? Infinity);
    return Math.abs(a.flux.value - 1) + Math.abs(a.planet.pl_rade - 1) - Math.abs(b.flux.value - 1) - Math.abs(b.planet.pl_rade - 1);
  }), [planets, applied, sort]);
  const changed = JSON.stringify(filters) !== JSON.stringify(applied);
  const resetNeeded = JSON.stringify(filters) !== JSON.stringify(defaults) || JSON.stringify(applied) !== JSON.stringify(defaults);
  const found = useMemo(() => query.trim() ? planets.filter(p => `${p.pl_name} ${p.hostname ?? ""}`.toLowerCase().includes(query.trim().toLowerCase())) : [], [planets, query]);
  const shown = found.slice(0, searchLimit);
  const ranges = [["Radius", "minRadius", "maxRadius"], ["Starlight", "minFlux", "maxFlux"]] as const;

  return <section className="lab-panel mt-6 p-5 sm:p-6" aria-labelledby="candidate-list-heading">
    <h2 id="candidate-list-heading" className="text-xl font-semibold">Explore real planets worth a closer look</h2>
    <p className="mt-2 text-sm leading-6 text-slate-600">This site’s <strong className="font-semibold text-slate-800">simplified starting screen</strong> looks for small worlds receiving broadly Earth-like starlight: <strong className="font-semibold text-slate-800">radius 0.5–1.8 times Earth’s</strong> and <strong className="font-semibold text-slate-800">starlight 0.35–1.7 times Earth’s</strong>. These classroom defaults help identify worlds worth studying; passing the screen does not establish habitability. Adjust the ranges or search for a particular planet or star.</p>
    <div role="group" aria-label="How to explore planets" className="mt-3 inline-flex flex-wrap overflow-hidden rounded-md border border-slate-200">{([ ["filters", "Filter by properties"], ["search", "Search for a planet or a star"] ] as const).map(([key, label]) => <button type="button" key={key} aria-pressed={mode === key} onClick={() => setMode(key)} className={`px-4 py-2 text-sm font-semibold text-teal-800 ${mode === key ? "bg-teal-50" : "bg-white"}`}>{label}</button>)}</div>
    <div hidden={mode !== "filters"}>
    <p className="mt-3 text-xs text-slate-500">Radius and starlight are relative to Earth = 1.</p>
    <div className="mt-2 flex flex-wrap items-end gap-x-5 gap-y-3">
      {ranges.map(([label, minKey, maxKey]) => <fieldset key={label} className="min-w-0"><legend className="text-xs font-semibold text-slate-700">{label}</legend><div className="mt-1 flex gap-2">{[[minKey, "Min"], [maxKey, "Max"]].map(([key, bound]) => <label key={key} className="text-xs text-slate-500">{bound}<input aria-label={`${bound === "Min" ? "Minimum" : "Maximum"} ${label.toLowerCase()}`} type="number" min="0" step="any" value={filters[key as typeof minKey | typeof maxKey]} onChange={e => setFilters(f => ({ ...f, [key]: e.target.value }))} className="mt-1 block w-24 border px-2 py-1 text-sm text-slate-800" /></label>)}</div></fieldset>)}
      <label className="text-xs font-semibold text-slate-700">Max distance from Earth (pc)<input aria-label="Maximum distance from Earth (pc)" type="number" min="0" step="any" placeholder="Any" value={filters.maxDistance} onChange={e => setFilters(f => ({ ...f, maxDistance: e.target.value }))} className="mt-1 block w-28 border px-2 py-1 text-sm font-normal" /></label>
      <button type="button" disabled={invalid || !changed} onClick={() => { setApplied(filters); setExpanded(null); }} className="min-h-11 rounded-md bg-teal-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-40">Apply filters</button>
      {resetNeeded ? <button type="button" onClick={() => { setFilters(defaults); setApplied(defaults); setSort("earth"); setExpanded(null); }} className="min-h-11 rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-800">Reset filters</button> : null}
    </div>
    {changed && !invalid ? <p className="mt-2 text-xs text-slate-600" role="status">Ranges changed. Select Apply filters to update the results.</p> : null}
    <p className="mt-4 font-semibold" aria-live="polite">Displaying {candidates.length.toLocaleString()} planets</p>
    {invalid ? <p role="alert" className="mt-2 text-sm text-rose-700">Enter valid, non-negative ranges with each minimum no greater than its maximum.</p> : null}
    <div className="mt-3 inline-flex overflow-hidden rounded-md border border-slate-200" role="group" aria-label="Candidate display">
      {(["chart", "table"] as const).map(mode => <button key={mode} type="button" aria-pressed={view === mode} onClick={() => setView(mode)} className={`px-4 py-2 text-sm font-semibold text-teal-800 ${view === mode ? "bg-teal-50" : "bg-white"}`}>{mode === "chart" ? "Chart" : "Detailed table"}</button>)}
    </div>
    <div hidden={view !== "chart"}><CandidateChart planets={candidates.map(({planet}) => planet)} /></div>
    <div hidden={view !== "table"}>
    <p className="mt-2 text-xs leading-5 text-slate-600">All matches appear below; scroll sideways for more columns. Earth = 1 for radius, mass, and starlight. AU is Earth’s orbital distance; pc measures distance from us. “Estimated” starlight is inferred from catalog equilibrium temperature under Earth-like reflectivity assumptions. Missing values are unknown. Catalog filters are independent of the simulator.</p>
    <div className="mt-3 flex justify-end">
      <label className="text-xs font-semibold text-slate-700">Sort planets<select value={sort} onChange={e => setSort(e.target.value)} className="mt-1 block w-full border px-3 py-2 text-sm font-normal"><option value="earth">Closest to Earth in size and starlight</option><option value="name">Name</option><option value="radius">Smallest radius first</option><option value="flux">Least starlight first</option><option value="distance">Nearest to Earth first</option></select></label>
    </div>
    <div ref={topScroll} className="candidate-table-scroll mt-3 overflow-x-scroll rounded border border-slate-200 bg-slate-50" style={{ height: 22 }} tabIndex={0} role="region" aria-label="Scroll candidate table sideways" onScroll={e => {
      if (tableScroll.current && tableScroll.current.scrollLeft !== e.currentTarget.scrollLeft) tableScroll.current.scrollLeft = e.currentTarget.scrollLeft;
    }}><div ref={scrollSpacer} style={{ width: 1450, height: 1 }} /></div>
    <div ref={tableScroll} className="candidate-table-scroll mt-1 overflow-x-auto rounded-md border border-slate-200" tabIndex={0} role="region" aria-label="Candidate planet properties" onScroll={e => {
      if (topScroll.current && topScroll.current.scrollLeft !== e.currentTarget.scrollLeft) topScroll.current.scrollLeft = e.currentTarget.scrollLeft;
    }}>
      <table className="w-full min-w-[1450px] text-left text-xs">
        <caption className="sr-only">All planets matching your candidate filters and their catalog properties</caption>
        <thead className="bg-slate-100"><tr>{["Planet / host star", "Radius (Earth = 1)", "Mass (Earth = 1)", "Starlight (Earth = 1)", "Equilibrium temperature", "Year length (days)", "Orbit (AU)", "Distance from us (pc)", "Host temperature (K)", "Discovery", "Investigate"].map(h => <th key={h} scope="col" className="px-3 py-3 font-semibold">{h}</th>)}</tr></thead>
        <tbody>{candidates.map(({ planet, flux }) => <Fragment key={planet.pl_name}>
          <tr className="border-t border-slate-200 hover:bg-teal-50/40">
            <th scope="row" className="px-3 py-3"><Link href={planetHabitabilityUrl(planet.pl_name)} className="text-left font-semibold text-teal-800 underline">{planet.pl_name}</Link><button className="mt-1 block text-xs font-normal text-teal-800 underline" aria-expanded={expanded === planet.pl_name} onClick={() => setExpanded(n => n === planet.pl_name ? null : planet.pl_name)}>Host-star details</button><div className="mt-1 font-normal text-slate-600">{planet.hostname || "Unknown host"}</div></th>
            <td className="px-3 py-3">{format(planet.pl_rade)}</td><td className="px-3 py-3">{format(planet.pl_masse)}</td><td className="px-3 py-3">{format(flux.value)}{flux.estimated ? <span className="block text-slate-500">Estimated</span> : null}</td><td className="px-3 py-3">{temperature(planet.pl_eqt)}</td><td className="px-3 py-3">{format(planet.pl_orbper)}</td><td className="px-3 py-3">{format(planet.pl_orbsmax, 3)}</td><td className="px-3 py-3">{format(planet.sy_dist)}</td><td className="px-3 py-3">{format(planet.st_teff, 0)}</td><td className="px-3 py-3">{planet.discoverymethod || "Unknown"}<span className="block text-slate-500">{planet.disc_year ?? "Unknown"}</span></td>
            <td className="px-3 py-3"><Link href={planetHabitabilityUrl(planet.pl_name)} className="whitespace-nowrap font-semibold text-teal-800 underline">View habitability →</Link><a href={`https://exoplanetarchive.ipac.caltech.edu/overview/${encodeURIComponent(planet.pl_name)}`} target="_blank" rel="noreferrer" className="mt-2 block text-slate-600 underline">NASA Archive ↗</a></td>
          </tr>
          {expanded === planet.pl_name ? <tr className="border-t border-teal-100 bg-teal-50"><td colSpan={11} className="px-4 py-4"><p className="font-semibold">More about {planet.pl_name}’s host star</p><div className="mt-2 flex flex-wrap gap-x-8 gap-y-2"><span>Radius: {format(planet.st_rad, 3)} × Sun</span><span>Mass: {format(planet.st_mass)} × Sun</span><span>Metallicity: {format(planet.st_met)} dex</span><span>Known planets: {format(planet.sy_pnum, 0)}</span></div><p className="mt-2 text-slate-600">Equilibrium temperature is not a measured surface temperature. Atmosphere, surface pressure, and water remain questions for further observations.</p></td></tr> : null}
        </Fragment>)}</tbody>
      </table>
      {!candidates.length ? <p className="p-5 text-sm text-slate-600">No planets match these filters. Widen the ranges and apply, or reset the filters.</p> : null}
    </div>
    <p className="mt-3 text-xs text-slate-600">Click a planet’s name for its habitability assessment. Sorting by Earth similarity compares radius and starlight only; it is not a habitability ranking.</p>
    </div>
    </div>
    <div hidden={mode !== "search"} className="mt-3">
      <label className="text-xs font-semibold text-slate-700">Search for a planet or a star<input type="search" value={query} onChange={e => { setQuery(e.target.value); setSearchLimit(SEARCH_BATCH_SIZE); }} className="mt-1 block w-full max-w-md border px-3 py-2 text-sm font-normal" placeholder="Try TRAPPIST-1 or Kepler-10 b" /></label>
      <p className="mt-2 text-xs leading-5 text-slate-600">Search the full catalog, independently of the ranges. A star search finds its known planets. The starting screen is a size-and-starlight check, not a habitability rating.</p>
      <p className="mt-3 font-semibold" aria-live="polite">{query.trim() ? `${found.length.toLocaleString()} ${found.length === 1 ? "planet" : "planets"} found${found.length > SEARCH_BATCH_SIZE ? ` · Showing ${shown.length.toLocaleString()}` : ""}` : "Enter a planet or star name to begin."}</p>
      {found.length > SEARCH_BATCH_SIZE ? <p className="mt-1 text-xs text-slate-600">Add more of the planet or star name to narrow your results, or load more below.</p> : null}
      <div className="mt-3 grid gap-3 md:grid-cols-2">{shown.map(planet => {
        const flux = catalogFlux(planet);
        const knownRadius = typeof planet.pl_rade === "number" && Number.isFinite(planet.pl_rade);
        const outside = (knownRadius && (planet.pl_rade < 0.5 || planet.pl_rade > 1.8)) || (flux && (flux.value < 0.35 || flux.value > 1.7));
        const status = outside ? "Outside starting criteria" : !knownRadius || !flux ? "Insufficient data for starting screen" : "Matches starting criteria";
        return <article key={planet.pl_name} className="rounded-md border border-slate-200 p-3"><h3 className="font-semibold">{planet.pl_name}</h3><p className="text-xs text-slate-600">Host: {planet.hostname || "Unknown"} · Radius: {format(planet.pl_rade)} × Earth · Starlight: {format(flux?.value)} × Earth{flux?.estimated ? " (estimated)" : ""}</p><p className={`mt-2 text-xs font-semibold ${status === "Matches starting criteria" ? "text-teal-800" : "text-slate-700"}`}>{status}</p><div className="mt-2 flex flex-wrap gap-4 text-xs font-semibold text-teal-800"><Link className="underline" href={planetHabitabilityUrl(planet.pl_name, { search: query })}>View habitability and planet properties →</Link></div></article>;
      })}</div>
      {shown.length < found.length ? <button type="button" onClick={() => setSearchLimit(limit => limit + SEARCH_BATCH_SIZE)} className="mt-4 rounded-md border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-800">Load {Math.min(SEARCH_BATCH_SIZE, found.length - shown.length)} more planets</button> : null}
      {query.trim() && !found.length ? <p className="mt-2 text-sm text-slate-600">No matches. Try part of the name or check the spelling.</p> : null}
    </div>

  </section>;
}
