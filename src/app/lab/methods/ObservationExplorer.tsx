"use client";

import { useMemo, useState, type PointerEvent } from "react";
import observations from "@/data/observations.json";
import MethodsBackToTop from "@/components/MethodsBackToTop";

type Observation = {
  id: string;
  kind: string;
  planet: string;
  note: string;
  reference: string;
  url: string;
  timeFrame: string;
  rows: number[][];
  periodDays?: number;
  trialMin?: number;
  trialMax?: number;
  trialStep?: number;
  trialStart?: number;
  periodTolerance?: number;
};

const transitCases = (observations as Observation[]).filter((item) => item.kind === "photometry");
const velocityCases = (observations as Observation[]).filter((item) => item.kind === "radialVelocity");

function groupTransitWindows(rows: number[][]) {
  return rows.reduce<number[][][]>((groups, row) => {
    if (!groups.length || row[0] - groups[groups.length - 1][groups[groups.length - 1].length - 1][0] > 1) groups.push([]);
    groups[groups.length - 1].push(row);
    return groups;
  }, []);
}

function uncertainty(row: number[]) {
  return typeof row[2] === "number" && Number.isFinite(row[2]) && row[2] >= 0 ? row[2] : 0;
}

function UncertaintyBar({ x, value, error, y }: { x: number; value: number; error: number; y: (value: number) => number }) {
  if (!error) return null;
  const top = y(value + error);
  const bottom = y(value - error);
  return <g data-uncertainty-bar="true" aria-hidden="true" stroke="#64748b" strokeWidth="1" opacity="0.65"><line x1={x} x2={x} y1={top} y2={bottom} /><line x1={x - 2} x2={x + 2} y1={top} y2={top} /><line x1={x - 2} x2={x + 2} y1={bottom} y2={bottom} /></g>;
}

export default function ObservationExplorer({ mode }: { mode: "transit" | "velocity" }) {
  const [showUncertainty, setShowUncertainty] = useState(false);
  const [velocityView, setVelocityView] = useState<"time" | "cycle">("time");
  const [transitId, setTransitId] = useState(transitCases[0].id);
  const [velocityId, setVelocityId] = useState(velocityCases[0].id);
  const [eventIndex, setEventIndex] = useState(0);
  const [selectedRowIndex, setSelectedRowIndex] = useState(0);
  const [depthGuess, setDepthGuess] = useState("");
  const [trialPeriod, setTrialPeriod] = useState(velocityCases[0].trialStart ?? 4);
  const [revealed, setRevealed] = useState(false);
  const transit = transitCases.find((item) => item.id === transitId) ?? transitCases[0];
  const velocity = velocityCases.find((item) => item.id === velocityId) ?? velocityCases[0];
  const eventGroups = useMemo(() => groupTransitWindows(transit.rows), [transit]);
  const event = eventGroups[eventIndex] ?? eventGroups[0];
  const selectedRow = event[selectedRowIndex] ?? event[0];
  const selectedDropPercent = (1 - selectedRow[1]) * 100;
  const eventStart = event[0][0];
  const eventHours = (event[event.length - 1][0] - eventStart) * 24;
  const transitX = (row: number[]) => 92 + ((row[0] - eventStart) * 24 / eventHours) * 678;
  const minFlux = Math.min(...event.map((row) => row[1]));
  const fluxMinWithError = Math.min(...event.map(row => row[1] - (showUncertainty ? uncertainty(row) : 0)));
  const maxFlux = Math.max(1, ...event.map(row => row[1] + (showUncertainty ? uncertainty(row) : 0)));
  const fluxPadding = Math.max(0.002, (maxFlux - fluxMinWithError) * 0.08);
  const fluxLow = fluxMinWithError - fluxPadding;
  const fluxHigh = maxFlux + fluxPadding;
  const transitY = (flux: number) => 260 - (flux - fluxLow) / (fluxHigh - fluxLow) * 220;
  const rvRows = velocity.rows;
  const velocityMean = rvRows.reduce((sum, row) => sum + row[1], 0) / rvRows.length;
  const velocityExtent = Math.ceil(Math.max(...rvRows.map((row) => Math.abs(row[1] - velocityMean) + (showUncertainty ? uncertainty(row) : 0))) / 20) * 20 + 20;
  const velocityY = (value: number) => 250 - (value + velocityExtent) / (2 * velocityExtent) * 200;
  const folded = useMemo(() => rvRows.map((row) => ({
    phase: ((row[0] - rvRows[0][0]) / trialPeriod % 1 + 1) % 1,
    velocity: row[1] - velocityMean,
    uncertainty: uncertainty(row),
  })).sort((a, b) => a.phase - b.phase), [rvRows, trialPeriod, velocityMean]);
  const velocityStart = Math.min(...rvRows.map(row => row[0]));
  const velocitySpan = Math.max(...rvRows.map(row => row[0])) - velocityStart || 1;
  const velocityPoints = velocityView === "cycle" ? folded.map(row => ({ x: row.phase, value: row.velocity, error: row.uncertainty })) : rvRows.map(row => ({ x: (row[0] - velocityStart) / velocitySpan, value: row[1] - velocityMean, error: uncertainty(row) }));
  const observedDepth = (1 - minFlux) * 100;

  function inspectTransit(eventPointer: PointerEvent<SVGSVGElement>) {
    const bounds = eventPointer.currentTarget.getBoundingClientRect();
    const chartX = (eventPointer.clientX - bounds.left) / bounds.width * 800;
    let nearest = 0;
    for (let index = 1; index < event.length; index++) {
      if (Math.abs(transitX(event[index]) - chartX) < Math.abs(transitX(event[nearest]) - chartX)) nearest = index;
    }
    setSelectedRowIndex(nearest);
  }

  return <section id={`real-${mode}-observations`} aria-labelledby={`real-${mode}-heading`} className="lab-panel p-5 sm:p-6">
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">Published measurements</p>
    <h2 id={`real-${mode}-heading`} className="mt-2 text-xl font-semibold text-slate-900">{mode === "transit" ? "Examine real transit observations" : "Examine real radial-velocity observations"}</h2>
    <p className="mt-2 text-sm leading-6 text-slate-700">These are measurements published by research teams and served by the NASA Exoplanet Archive. {mode === "transit" ? "Compare the brightness measurements with the simulated transit above." : "Inspect the star’s measured motion over time, then try aligning the observations into a repeating cycle."} HD 189733 b appears in both method tabs, so you can compare two kinds of evidence for the same planet.</p>
    {mode === "transit" ? <div className="mt-5 space-y-4">
      <label className="block text-sm font-medium">Exoplanet
        <select value={transit.id} onChange={(e) => { setTransitId(e.target.value); setEventIndex(0); setSelectedRowIndex(0); setDepthGuess(""); setRevealed(false); }} className="mt-1 block min-w-52 rounded border border-slate-300 bg-white px-3 py-2">
          {transitCases.map((item) => <option key={item.id} value={item.id}>{item.planet}</option>)}
        </select>
      </label>
      <div>
        <h3 className="font-semibold">Transit: {transit.planet}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">{transit.note}</p>
        <p className="mt-2 text-sm leading-6 text-slate-700">A <strong>transit light curve</strong> plots a star’s brightness over time. Here, each dot is a published measurement, with time on the horizontal axis and relative brightness on the vertical axis. A value of 1.0 represents normal brightness; the transit appears as a dip below it when the planet crosses in front of the star.</p>
        <p className="mt-2 text-sm leading-6 text-slate-700"><strong>What to do:</strong> {eventGroups.length > 1 ? "Compare the observation windows. " : "Inspect this observation window. "}Point at or click a dot to see its brightness and percentage change from 1.0. Choose a low point in the dip for an approximate depth, then check your estimate. A single short window cannot establish the orbital period by itself.</p>
      </div>
      {eventGroups.length > 1 && <label className="block text-sm font-medium">Observation window
        <select value={eventIndex} onChange={(e) => { setEventIndex(Number(e.target.value)); setSelectedRowIndex(0); setDepthGuess(""); setRevealed(false); }} className="mt-1 block rounded border border-slate-300 bg-white px-3 py-2">
          {eventGroups.map((_, index) => <option value={index} key={index}>Window {index + 1}</option>)}
        </select>
      </label>}
      <label className="flex items-center gap-2 text-sm font-medium text-teal-800"><input type="checkbox" checked={showUncertainty} onChange={event => setShowUncertainty(event.target.checked)} className="accent-teal-700" />Show measurement uncertainty</label>
      {showUncertainty ? <p className="text-xs leading-5 text-slate-600">Each vertical bar shows the measurement’s reported uncertainty from the published file. This is not the full uncertainty of a fitted planet model.</p> : null}
      <div className="overflow-x-auto border-y border-slate-200 bg-white py-4">
        <svg viewBox="0 0 800 310" role="img" aria-label={`Measured ${transit.planet} stellar brightness across a transit; point at or click the graph to inspect a measurement`} onPointerMove={inspectTransit} onPointerDown={inspectTransit} className="min-w-[560px] w-full cursor-crosshair touch-pan-x">
          {[0, 1, 2, 3, 4].map((tick) => <g key={tick}>
            <line x1="92" x2="770" y1={40 + tick * 55} y2={40 + tick * 55} stroke="#e2e8f0" />
            <text x="80" y={44 + tick * 55} textAnchor="end" fontSize="11" fill="#475569">{(fluxHigh - tick * (fluxHigh - fluxLow) / 4).toFixed(3)}</text>
            <text x={92 + tick * 169.5} y="280" textAnchor="middle" fontSize="11" fill="#475569">{(tick * eventHours / 4).toFixed(1)}</text>
          </g>)}
          <line x1="92" x2="770" y1={transitY(1)} y2={transitY(1)} stroke="#94a3b8" strokeDasharray="4 4" />
          {showUncertainty && event.map((row, index) => <UncertaintyBar key={index} x={transitX(row)} value={row[1]} error={uncertainty(row)} y={transitY} />)}
          {event.map((row, index) => <circle data-observation-point="transit" key={index} cx={transitX(row)} cy={transitY(row[1])} r="2.5" fill="#0369a1" />)}
          <circle cx={transitX(selectedRow)} cy={transitY(selectedRow[1])} r="6" fill="#d97706" stroke="white" strokeWidth="1.5" />
          <text x="431" y="305" textAnchor="middle" fontSize="12" fill="#334155">Hours since start of observation</text>
          <text transform="translate(18 150) rotate(-90)" textAnchor="middle" fontSize="12" fill="#334155">Relative flux</text>
        </svg>
      </div>
      <label className="block max-w-md text-sm font-medium">Inspect a measurement
        <input type="range" min="0" max={event.length - 1} step="1" value={selectedRowIndex} onChange={(e) => setSelectedRowIndex(Number(e.target.value))} className="mt-2 block w-full accent-amber-600" />
      </label>
      <output className="block border-l-4 border-amber-600 bg-amber-50 px-4 py-3 text-sm leading-6 text-slate-800">
        At {((selectedRow[0] - eventStart) * 24).toFixed(2)} hours, relative brightness is <strong>{selectedRow[1].toFixed(5)}</strong>. (1 - {selectedRow[1].toFixed(5)}) × 100 = <strong>{selectedDropPercent.toFixed(4)}%</strong> relative to a baseline of 1.0. A positive value means the star is dimmer.{showUncertainty ? ` Reported brightness uncertainty: ±${uncertainty(selectedRow).toFixed(5)}.` : ""}
      </output>
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-sm font-medium">Estimate the dip depth (%)<input type="number" min="0" step="any" value={depthGuess} onChange={(e) => { setDepthGuess(e.target.value); setRevealed(false); }} className="mt-1 block w-48 rounded border border-slate-300 px-3 py-2" /></label>
        <button type="button" disabled={!depthGuess} onClick={() => setRevealed(true)} className="rounded bg-teal-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">Check estimate</button>
      </div>
      {revealed && <p role="status" className="border-l-4 border-teal-600 bg-teal-50 p-4 text-sm leading-6">{Math.abs(Number(depthGuess) - observedDepth) < 0.5 ? "Close. " : "Look for the baseline near 1.0 and the lowest points. "}The deepest individual measurement is about {observedDepth.toFixed(2)}% below a baseline of 1.0. A fitted transit depth would use all points and account for noise and stellar effects.</p>}
      <p className="text-xs text-slate-600">Source: <a href={transit.url} target="_blank" rel="noreferrer" className="underline">NASA Exoplanet Archive data file</a>. {transit.reference}. Times are {transit.timeFrame}; the display shifts each window to hours since its first observation.</p>
    </div> : <div className="mt-5 space-y-4">
      <div className="flex flex-wrap items-end gap-5">
        <label className="block text-sm font-medium">Exoplanet
          <select value={velocity.id} onChange={e => { const next = velocityCases.find(item => item.id === e.target.value) ?? velocityCases[0]; setVelocityId(next.id); setTrialPeriod(next.trialStart ?? next.periodDays ?? 1); setRevealed(false); }} className="mt-1 block min-w-52 rounded border border-slate-300 bg-white px-3 py-2">
            {velocityCases.map(item => <option key={item.id} value={item.id}>{item.planet}</option>)}
          </select>
        </label>
        <div role="group" aria-label="Radial velocity display" className="inline-flex flex-wrap overflow-hidden rounded-md border border-slate-200">
          {([ ["time", "Measurements over time"], ["cycle", "Align a repeating cycle"] ] as const).map(([key, label]) => <button key={key} type="button" aria-pressed={velocityView === key} onClick={() => setVelocityView(key)} className={`px-4 py-2 text-sm font-semibold text-teal-800 ${velocityView === key ? "bg-teal-50" : "bg-white hover:bg-teal-50"}`}>{label}</button>)}
        </div>
      </div>
      <div>
        <h3 className="font-semibold">Radial velocity: {velocity.planet}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">{velocity.note}</p>
        <p className="mt-2 text-sm leading-6 text-slate-700"><strong>Radial velocity</strong> measures a star’s motion toward or away from us using Doppler shifts in its spectrum. A planet’s gravity can make this motion repeat as the star and planet orbit their shared center of mass. Each dot here is a published stellar velocity measurement in meters per second; the graph subtracts this file’s average velocity to center the pattern on zero.</p>
        <p className="mt-2 text-sm leading-6 text-slate-700"><strong>What to do:</strong> {velocityView === "time" ? "Inspect measurements across different nights. Gaps and uneven sampling can make an orbital cycle hard to see. Select ‘Align a repeating cycle’ to combine those nights and investigate the period." : "Move the trial-period slider until the dots form the clearest repeating wave, then check the period. Measurements from different dates are placed at the same point in a proposed cycle; this is called folding the data. At a suitable period, they line up. This reveals a candidate orbital period; estimating the planet’s mass requires further analysis."}</p>
      </div>
      {velocityView === "cycle" && <label className="block text-sm font-medium">Trial period: {trialPeriod.toFixed((velocity.trialStep ?? 0.001) < 0.001 ? 4 : 3)} days
        <input type="range" min={velocity.trialMin} max={velocity.trialMax} step={velocity.trialStep} value={trialPeriod} onChange={e => { setTrialPeriod(Number(e.target.value)); setRevealed(false); }} className="mt-2 block w-full accent-teal-700" />
      </label>}
      <label className="flex items-center gap-2 text-sm font-medium text-teal-800"><input type="checkbox" checked={showUncertainty} onChange={event => setShowUncertainty(event.target.checked)} className="accent-teal-700" />Show measurement uncertainty</label>
      {showUncertainty ? <p className="text-xs leading-5 text-slate-600">Vertical bars show the published velocity uncertainties in m/s. Aligning a cycle changes only the horizontal positions; every measurement and its uncertainty remain the same.</p> : null}
      <div className="overflow-x-auto border-y border-slate-200 bg-white py-4">
        <svg viewBox="0 0 800 310" role="img" aria-label={`Measured ${velocity.planet} stellar velocities ${velocityView === "cycle" ? "folded by the chosen trial period" : "over time"}`} className="min-w-[560px] w-full">
          {[-velocityExtent, -velocityExtent / 2, 0, velocityExtent / 2, velocityExtent].map(value => <g key={value}>
            <line x1="92" x2="770" y1={velocityY(value)} y2={velocityY(value)} stroke="#e2e8f0" />
            <text x="80" y={velocityY(value) + 4} textAnchor="end" fontSize="11" fill="#475569">{value.toFixed(0)}</text>
          </g>)}
          {[0, 0.25, 0.5, 0.75, 1].map(value => <text key={value} x={92 + value * 678} y="280" textAnchor="middle" fontSize="11" fill="#475569">{velocityView === "cycle" ? value.toFixed(2) : (value * velocitySpan).toFixed(velocitySpan > 100 ? 0 : 1)}</text>)}
          {showUncertainty && velocityPoints.map((row, index) => <UncertaintyBar key={index} x={92 + row.x * 678} value={row.value} error={row.error} y={velocityY} />)}
          {velocityPoints.map((row, index) => <circle data-observation-point="velocity" key={index} cx={92 + row.x * 678} cy={velocityY(row.value)} r="3" fill="#0f766e" opacity="0.8" />)}
          <text x="431" y="305" textAnchor="middle" fontSize="12" fill="#334155">{velocityView === "cycle" ? "Orbital phase (0 to 1)" : "Days since first observation"}</text>
          <text transform="translate(18 150) rotate(-90)" textAnchor="middle" fontSize="12" fill="#334155">Velocity minus mean (m/s)</text>
        </svg>
      </div>
      {velocityView === "cycle" && <>
        <button type="button" onClick={() => setRevealed(true)} className="rounded bg-teal-700 px-4 py-2 text-sm font-semibold text-white">Check trial period</button>
        {revealed && <p role="status" className="border-l-4 border-teal-600 bg-teal-50 p-4 text-sm leading-6">{Math.abs(trialPeriod - (velocity.periodDays ?? 0)) <= (velocity.periodTolerance ?? 0.03) ? "Your period is close to the catalog value. " : "Try a different period and look for the clearest repeating wave. "}{velocity.planet}’s catalog period is {(velocity.periodDays ?? 0).toFixed(4)} days. A coherent velocity cycle is evidence of a companion; mass estimates also depend on the star and orbit.</p>}
      </>}
      <p className="text-xs text-slate-600">Source: <a href={velocity.url} target="_blank" rel="noreferrer" className="underline">NASA Exoplanet Archive data file</a>. {velocity.reference}. Times are {velocity.timeFrame}; velocities are shown in m/s after subtracting this file’s mean. {velocityView === "time" ? "The time axis starts at the earliest observation in this file." : "The horizontal axis shows fractional cycle position for your chosen trial period."}</p>
    </div>}
    <MethodsBackToTop />
  </section>;
}
