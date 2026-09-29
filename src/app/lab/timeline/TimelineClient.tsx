"use client";

import { useMemo, useState } from "react";
import type { Planet } from "@/components/PlanetScatter";
import SectionNav from "@/components/SectionNav";
import { discoveryColors } from "@/lib/discovery-colors";
import { nasaPlanetResources } from "@/lib/planet-resources";
import { publishedRadius } from "@/lib/catalog-values";
import datasetMeta from "@/data/dataset-meta.json";
import DiscoveryYearChart from "./DiscoveryYearChart";
import DiscoveryYearSelector from "./DiscoveryYearSelector";
import DiscoveryMethodShare from "./DiscoveryMethodShare";
import { discoveryMilestones, historicalAccounts } from "./milestones";
import { ALL_METHODS, PAGE_SIZE, buildDiscoveryBars, countMethods, discoveryMethod, discoveryYears, selectYearForMethod } from "./timeline-data";

const snapshotDate = new Date(`${datasetMeta.fetched_at}T00:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
const buttonStyle = "rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-800 hover:bg-teal-100 disabled:opacity-40";

function BackToTop() {
  return <div className="mt-5 flex justify-end"><a href="#timeline-top" className={`${buttonStyle} shadow-sm`} onClick={event => {
    event.preventDefault();
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#timeline-top`);
    window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
    document.getElementById("timeline-top")?.focus({ preventScroll: true });
  }}>Back to top ↑</a></div>;
}

export default function TimelineClient({ planets }: { planets: Planet[] }) {
  const dated = useMemo(() => planets.filter(planet => typeof planet.disc_year === "number" && Number.isInteger(planet.disc_year) && planet.disc_year > 0), [planets]);
  const years = useMemo(() => discoveryYears(dated), [dated]);
  const methods = useMemo(() => countMethods(dated).map(item => item.name).sort(), [dated]);
  const [method, setMethod] = useState(ALL_METHODS);
  const [view, setView] = useState<"annual" | "cumulative">("annual");
  const [year, setYear] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const selectedYear = year;
  const bars = useMemo(() => buildDiscoveryBars(dated, years, method, view), [dated, years, method, view]);
  const selectedBar = bars.find(bar => bar.year === selectedYear);
  const selectedPlanets = useMemo(() => planets.filter(planet => (selectedYear === null || planet.disc_year === selectedYear) && (method === ALL_METHODS || discoveryMethod(planet) === method)).sort((a, b) => a.pl_name.localeCompare(b.pl_name)), [planets, selectedYear, method]);
  const selectedMethods = countMethods(selectedPlanets);
  const milestone = discoveryMilestones.find(item => item.year === selectedYear);
  const pageCount = Math.max(1, Math.ceil(selectedPlanets.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * PAGE_SIZE;
  const selectYear = (value: number | null, toggle = false) => { setYear(current => toggle && current === value ? null : value); setPage(1); };
  const selectMilestone = (value: number, scroll = false) => {
    setMethod(ALL_METHODS);
    selectYear(value);
    if (scroll) {
      document.getElementById("discovery-data")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
      document.getElementById(`timeline-year-${value}`)?.focus({ preventScroll: true });
    }
  };

  return <main className="site-page">
    <header id="timeline-top" tabIndex={-1} className="page-intro" style={{ borderBottom: "none", paddingBottom: 0, marginBottom: 0 }}>
      <p className="text-sm font-semibold uppercase text-teal-700">Explore the NASA Exoplanet Archive</p>
      <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Discovery Timeline</h1>
      <p className="mt-3 leading-7 text-slate-700">From the first planets found by pulsar timing to Kepler’s discovery surges, new tools transformed the search for other worlds. Explore when planets were discovered, which methods revealed them, and the missions behind the milestones.</p>
      <p className="mt-2 text-xs text-slate-600" style={{ maxWidth: "none" }}>{planets.length.toLocaleString()} confirmed planets · NASA Exoplanet Archive snapshot: {snapshotDate}</p>
    </header>
    <SectionNav items={[{ href: "#discovery-data", label: "Explore discovery data" }, { href: "#milestones", label: "Milestones & missions" }]} />
    <section id="discovery-data" aria-labelledby="chart-heading" className="space-y-6">
      <div className="lab-panel p-5 sm:p-6">
        <h2 id="chart-heading" className="text-xl font-semibold">{view === "annual" ? "Discoveries each year" : "Total discovered so far"}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-700">Type a year or select a bar; choose All years or click the selected bar again to clear it. The planet table and pie chart below share your year and method selection. In the total view, a selected year still shows only its new discoveries below.</p>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <div className="inline-flex flex-wrap gap-1 rounded-md border border-slate-200 p-1" role="group" aria-label="Discovery count view">{(["annual", "cumulative"] as const).map(value => <button key={value} type="button" aria-pressed={view === value} onClick={() => setView(value)} className={`rounded px-3 py-2 text-sm font-semibold ${view === value ? "bg-teal-50 text-teal-800" : "text-slate-600 hover:bg-slate-50"}`}>{value === "annual" ? "Discoveries each year" : "Total discovered so far"}</button>)}</div>
          <label className="text-sm font-medium">Discovery method<select value={method} onChange={event => { const next = event.target.value; setMethod(next); if (selectedYear !== null) setYear(selectYearForMethod(dated, next, selectedYear)); setPage(1); }} className="mt-1 block max-w-full rounded-md border border-slate-300 bg-white px-3 py-2"><option>{ALL_METHODS}</option>{methods.map(name => <option key={name}>{name}</option>)}</select></label>
          <DiscoveryYearSelector years={years} selectedYear={selectedYear} onSelect={selectYear} />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2" role="group" aria-label="Explore historical milestones"><span className="text-xs font-semibold text-slate-600">Milestone shortcuts (all methods):</span>{discoveryMilestones.filter(item => years.includes(item.year)).map(item => <button key={item.year} type="button" aria-pressed={selectedYear === item.year && method === ALL_METHODS} onClick={() => selectMilestone(item.year)} className={`rounded-md border px-2.5 py-1.5 text-xs font-medium ${selectedYear === item.year && method === ALL_METHODS ? "border-teal-400 bg-teal-50 text-teal-800" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}>{item.year}: {item.label}</button>)}</div>
        <DiscoveryYearChart bars={bars} view={view} method={method} selectedYear={selectedYear} onSelect={selectYear} />
        <section className="mt-5 border-t border-slate-200 pt-4" aria-labelledby="year-heading">
          <div className="flex flex-wrap items-center justify-between gap-3"><h3 id="year-heading" className="text-lg font-semibold">Planets in this selection</h3><p className="rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-bold text-teal-900" aria-live="polite">{selectedYear === null ? "All years selected" : <>Selected year: <strong className="text-lg font-extrabold">{selectedYear}</strong></>}</p></div>
          <p className="mt-2 text-sm text-slate-600">{method}. This selection applies to both the planet table and the discovery-method pie chart.</p>
          <div className="mt-3 flex flex-wrap gap-x-8 gap-y-2" role="status" aria-live="polite" aria-atomic="true"><p><strong className="text-2xl tabular-nums">{selectedPlanets.length.toLocaleString()}</strong><span className="ml-2 text-sm text-slate-600">{selectedYear === null ? "planets across all years" : `new in ${selectedYear}`}</span></p>{selectedYear !== null && <p><strong className="text-2xl tabular-nums">{(selectedBar?.cumulative ?? 0).toLocaleString()}</strong><span className="ml-2 text-sm text-slate-600">total through {selectedYear}</span></p>}</div>
          <p className="mt-2 text-xs text-slate-600">{method === ALL_METHODS ? "Counts include all discovery methods." : `Counts include ${method} discoveries only.`}</p>
          {milestone && <aside className="mt-4 rounded-md border border-teal-100 bg-teal-50 px-4 py-3"><h4 className="text-sm font-semibold text-teal-900">{milestone.title}</h4><p className="mt-1 text-sm leading-6 text-slate-700">{milestone.summary} <a href={`#history-${milestone.historyId}`} className="font-semibold text-teal-800 underline">Read the history and sources ↓</a></p></aside>}
          {selectedMethods.length > 0 && <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-700" aria-label="Selected discovery method breakdown">{selectedMethods.map(item => <span key={item.name} className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: discoveryColors[item.name] ?? "#64748b" }} aria-hidden="true" />{item.name}: {item.count.toLocaleString()}</span>)}</div>}
          {selectedPlanets.length > 0 ? <>
            <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[580px] text-left text-sm"><caption className="sr-only">Discoveries {selectedYear === null ? "across all years" : `in ${selectedYear}`}, {method}, page {currentPage} of {pageCount}</caption><thead className="border-b border-slate-300 text-slate-600"><tr><th scope="col" className="py-2 pr-4">Planet / NASA record</th><th scope="col" className="py-2 pr-4">Year</th><th scope="col" className="py-2 pr-4">Discovery method</th><th scope="col" className="py-2 pr-4">Radius (Earth = 1)</th><th scope="col" className="py-2">Period (days)</th></tr></thead><tbody>{selectedPlanets.slice(start, start + PAGE_SIZE).map(planet => <tr key={planet.pl_name} className="border-b border-slate-100"><th scope="row" className="py-2.5 pr-4 font-semibold"><a className="text-teal-700 underline" href={nasaPlanetResources(planet.pl_name).archive} target="_blank" rel="noreferrer" aria-label={`${planet.pl_name}, NASA Exoplanet Archive (opens in a new tab)`}>{planet.pl_name} ↗</a></th><td className="py-2.5 pr-4 tabular-nums"><span className={selectedYear !== null ? "rounded bg-teal-50 px-2 py-1 font-bold text-teal-900" : ""}>{planet.disc_year ?? "Unknown"}</span></td><td className="py-2.5 pr-4">{discoveryMethod(planet)}</td><td className="py-2.5 pr-4 tabular-nums">{publishedRadius(planet) !== null ? publishedRadius(planet)!.toLocaleString("en-US", { maximumFractionDigits: 2 }) : "Unknown"}</td><td className="py-2.5 tabular-nums">{typeof planet.pl_orbper === "number" ? planet.pl_orbper.toFixed(2) : "Unknown"}</td></tr>)}</tbody></table></div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-slate-600">Showing {start + 1}-{Math.min(start + PAGE_SIZE, selectedPlanets.length)} of {selectedPlanets.length.toLocaleString()} discoveries.</p>{pageCount > 1 && <nav aria-label="Discovery list pagination" className="flex flex-wrap items-center gap-2"><button type="button" className={buttonStyle} disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Previous</button><label className="text-xs text-slate-600">Page <select aria-label="Discovery list page" value={currentPage} onChange={event => setPage(Number(event.target.value))} className="rounded border border-slate-300 bg-white p-2">{Array.from({ length: pageCount }, (_, index) => <option key={index + 1}>{index + 1}</option>)}</select> of {pageCount}</label><button type="button" className={buttonStyle} disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}>Next</button></nav>}</div>
          </> : <p className="mt-4 text-sm text-slate-600">No discoveries match {selectedYear === null ? "all years" : selectedYear} for {method.toLowerCase()}. Select another bar or discovery method, or click the selected bar again to show all years.</p>}
          <DiscoveryMethodShare planets={selectedPlanets} selectedYear={selectedYear} />
        </section>
        <p className="mt-5 text-xs leading-5 text-slate-600">Discovery year is the archive’s assigned discovery date. Counts reflect this downloaded snapshot, not a live NASA total. Survey design, detection limits, validation, and reporting all affect annual counts. <a href="https://exoplanetarchive.ipac.caltech.edu/" target="_blank" rel="noreferrer" className="text-teal-700 underline">NASA Exoplanet Archive ↗</a></p>
        <BackToTop />
      </div>
    </section>
    <section id="milestones" aria-labelledby="history-heading" className="lab-panel mt-6 p-5 sm:p-6">
      <h2 id="history-heading" className="text-xl font-semibold">Milestones & missions: how the search changed</h2>
      <p className="mt-2 text-sm text-slate-600">Follow the evidence, instruments, and missions behind the timeline. Explore a milestone year to connect its story with the catalog.</p>
      <div className="mt-5 space-y-6">{historicalAccounts.map(account => <article id={`history-${account.id}`} key={account.id} className="scroll-mt-4 border-l-2 border-teal-600 pl-4"><h3 className="font-semibold">{account.title}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{account.details}</p><div className="mt-2 flex flex-wrap gap-2">{discoveryMilestones.filter(item => item.historyId === account.id && years.includes(item.year)).map(item => <button key={item.year} type="button" className={buttonStyle} onClick={() => selectMilestone(item.year, true)}>Explore {item.year} ↑</button>)}</div></article>)}</div>
      <BackToTop />
    </section>
  </main>;
}
