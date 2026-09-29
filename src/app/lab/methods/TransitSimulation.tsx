"use client";

import { useMemo, useState, type PointerEvent } from "react";
import type { Planet } from "@/components/PlanetScatter";
import MethodsBackToTop from "@/components/MethodsBackToTop";

const simulationDays = 14;
const simulationSamples = 2001;

function signal(period: number, depth: number, noise: number) {
  return Array.from({ length: simulationSamples }, (_, i) => {
    const time = i * simulationDays / (simulationSamples - 1);
    const phase = (((time / period - 0.37 + 0.5) % 1) + 1) % 1 - 0.5;
    const distance = Math.abs(phase);
    const dip = Math.max(0, Math.min(1, (0.035 - distance) / 0.014));
    const variation = Math.sin(time * 17.13) * Math.cos(time * 3.71) + 0.35 * Math.sin(time * 53.2);
    return { time, flux: 1 - depth * dip + variation * noise * depth };
  });
}

export default function TransitSimulation({ planets }: { planets: Planet[] }) {
  const [name, setName] = useState(planets.find(item => item.pl_name === "HD 209458 b")?.pl_name ?? planets[0]?.pl_name ?? "");
  const [noise, setNoise] = useState(0.2);
  const [marker, setMarker] = useState(0);
  const [marks, setMarks] = useState<number[]>([]);
  const [periodGuess, setPeriodGuess] = useState("");
  const [depthGuess, setDepthGuess] = useState("");
  const [checked, setChecked] = useState(false);
  const planet = planets.find((item) => item.pl_name === name) ?? planets[0];
  const period = planet?.pl_orbper ?? 1;
  const depth = planet ? (planet.pl_rade / ((planet.st_rad ?? 1) * 109.1)) ** 2 : 0;
  const total = simulationDays;
  const data = useMemo(() => signal(period, depth, noise), [period, depth, noise]);
  if (!planet) return null;
  const selectedPoint = data[Math.round(marker / total * (data.length - 1))];
  const selectedDepthPercent = (1 - selectedPoint.flux) * 100;
  const low = 1 - depth * (1.2 + noise);
  const high = 1 + depth * (0.2 + noise);
  const x = (time: number) => 94 + time / total * 676;
  const y = (flux: number) => 260 - (flux - low) / (high - low) * 220;
  const path = data.map((point, i) => `${i ? "L" : "M"}${x(point.time).toFixed(1)},${y(point.flux).toFixed(1)}`).join(" ");

  function inspectCurve(event: PointerEvent<SVGSVGElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const chartX = (event.clientX - bounds.left) / bounds.width * 800;
    const index = Math.max(0, Math.min(data.length - 1, Math.round((chartX - 94) / 676 * (data.length - 1))));
    setMarker(data[index].time);
  }

  function selectPlanet(value: string) {
    setName(value);
    setMarker(0);
    setMarks([]);
    setPeriodGuess("");
    setDepthGuess("");
    setChecked(false);
  }

  return (
    <section id="simulated-transit" aria-labelledby="signal-heading" className="lab-panel space-y-5 p-5 sm:p-6">
      <div className="space-y-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">Simulated data</p>
          <h2 id="signal-heading" className="mt-2 text-xl font-semibold text-slate-900">Measure a simulated transit</h2>
          <p className="mt-3 text-sm leading-6 text-slate-700">A <strong>transit</strong> occurs when a planet passes in front of its star from our viewpoint, causing a dip in the star’s brightness. Here, explore a simulated transit light curve: a plot of brightness over time. Mark two consecutive dips with the orange line to estimate the orbital period, then measure a dip’s depth to estimate how much light the planet blocks.</p>
          <p className="mt-3 text-sm leading-6 text-slate-600">This curve is <strong>simulated, not a telescope observation</strong>. Below, compare it with published measurements. Both activities start with HD 209458 b.</p>
        </div>
        <details className="rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-sm">
          <summary className="cursor-pointer font-semibold text-teal-800">How to measure &amp; model assumptions</summary>
          <div className="mt-3 space-y-3 leading-6 text-slate-700">
            <p><strong>Period (days)</strong> ≈ time between consecutive dips.</p>
            <p><strong>Depth (%)</strong> ≈ (planet radius / star radius)<sup>2</sup> × 100, with both radii in the same units.</p>
            <p>Catalog planet radii use Earth units; stellar radii use Sun units. <strong>1 Sun radius ≈ 109.1 Earth radii</strong>, so <strong>depth (%) ≈ [planet radius ÷ (109.1 × star radius)]<sup>2</sup> × 100</strong>.</p>
            <p>Choose a planet and mark two consecutive dips. Move the line to the bottom of a dip, or point at the graph, to read its brightness. Use the calculation below, enter both estimates, and check them.</p>
            <p>The model uses catalog planet radius, stellar radius, and orbital period. Every planet is shown over 14 days. The brightness axis adjusts to keep small dips visible; compare axis values to judge depth. The noise slider adds artificial variation. The dip shape and duration are schematic, rather than a fitted model of the real planet.</p>
          </div>
        </details>
      </div>
      <div className="flex flex-wrap items-end gap-5">
        <label className="text-sm font-medium">Example planet
          <select value={planet.pl_name} onChange={(e) => selectPlanet(e.target.value)} className="mt-1 block min-w-48 rounded border border-slate-300 bg-white px-3 py-2">
            {planets.map((item) => <option key={item.pl_name}>{item.pl_name}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium">Noise relative to dip: {Math.round(noise * 100)}%
          <input type="range" min="0" max="0.6" step="0.1" value={noise} onChange={(e) => setNoise(Number(e.target.value))} className="mt-3 block w-40 accent-teal-700" />
        </label>
      </div>
      <p className="text-xs leading-5 text-slate-600"><strong>Reading the scale:</strong> the brightness axis rescales for each planet to keep small dips visible. Compare the axis numbers and percentage depths, rather than the apparent height of the dips.</p>
      <div className="overflow-x-auto border-y border-slate-200 bg-white py-4">
        <svg viewBox="0 0 800 310" role="img" aria-label={`Simulated brightness for ${planet.pl_name}; point at or click the graph to inspect a value`} onPointerMove={inspectCurve} onPointerDown={inspectCurve} className="min-w-[560px] w-full cursor-crosshair touch-pan-x">
          {[0, 1, 2, 3, 4].map((tick) => <g key={tick}>
            <line x1="94" x2="770" y1={40 + tick * 55} y2={40 + tick * 55} stroke="#e2e8f0" />
            <text x="82" y={44 + tick * 55} textAnchor="end" fontSize="11" fill="#475569">{(high - tick * (high - low) / 4).toFixed(depth < 0.001 ? 5 : 4)}</text>
            <line x1={94 + tick * 169} x2={94 + tick * 169} y1="40" y2="260" stroke="#f1f5f9" />
            <text x={94 + tick * 169} y="280" textAnchor="middle" fontSize="11" fill="#475569">{(tick * total / 4).toFixed(1)}</text>
          </g>)}
          <path d={path} fill="none" stroke="#0369a1" strokeWidth="1.8" />
          {marks.map((time, i) => <line key={i} x1={x(time)} x2={x(time)} y1="40" y2="260" stroke="#dc2626" strokeDasharray="5 4" strokeWidth="2" />)}
          <line x1={x(marker)} x2={x(marker)} y1="40" y2="260" stroke="#d97706" strokeWidth="2" />
          <circle cx={x(selectedPoint.time)} cy={y(selectedPoint.flux)} r="5" fill="#d97706" stroke="white" strokeWidth="1.5" />
          <text x="432" y="305" textAnchor="middle" fontSize="12" fill="#334155">Time (days)</text>
          <text transform="translate(18 150) rotate(-90)" textAnchor="middle" fontSize="12" fill="#334155">Relative brightness</text>
        </svg>
      </div>
      <output className="block border-l-4 border-amber-600 bg-amber-50 px-4 py-3 text-sm leading-6 text-slate-800">
        At {selectedPoint.time.toFixed(2)} days, relative brightness is <strong>{selectedPoint.flux.toFixed(5)}</strong>. {selectedDepthPercent >= 0 ? <>Dimming: <strong>{selectedDepthPercent.toFixed(4)}%</strong>.</> : <>Brightening above baseline: <strong>{Math.abs(selectedDepthPercent).toFixed(4)}%</strong> (not a transit dip).</>} Using normal brightness 1.0, the change is (1 − {selectedPoint.flux.toFixed(5)}) × 100. Inspect the center of a dip for your transit-depth estimate.
      </output>
      <div className="flex flex-wrap items-end gap-4">
        <label className="min-w-52 flex-1 text-sm font-medium">Move the orange line to a dip: {marker.toFixed(2)} days
          <input type="range" min="0" max={total} step={Math.max(total / 400, 0.001)} value={marker} onChange={(e) => setMarker(Number(e.target.value))} className="mt-2 block w-full accent-amber-600" />
        </label>
        <button type="button" onClick={() => setMarks((current) => [...current.slice(-1), marker])} className="rounded bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800">Mark this dip</button>
        <button type="button" onClick={() => setMarks([])} className="rounded border border-slate-300 px-4 py-2 text-sm font-semibold">Clear marks</button>
      </div>
      <p className="text-sm text-slate-600">{marks.length ? `Marked: ${marks.map((time) => time.toFixed(2)).join(", ")} days.` : "Move the orange line to the center of a dip, then select Mark this dip. Repeat for the next dip."}{marks.length === 2 ? ` Separation: ${Math.abs(marks[1] - marks[0]).toFixed(2)} days, so your estimated orbital period is ${Math.abs(marks[1] - marks[0]).toFixed(2)} days.` : ""}</p>
      <div className="flex flex-wrap items-end gap-4 border-t border-slate-200 pt-5">
        <label className="text-sm font-medium">Estimated period (days)<input type="number" min="0" step="any" value={periodGuess} onChange={(e) => { setPeriodGuess(e.target.value); setChecked(false); }} className="mt-1 block w-44 rounded border border-slate-300 px-3 py-2" /></label>
        <label className="text-sm font-medium">Estimated dip depth (%)<input type="number" min="0" step="any" value={depthGuess} onChange={(e) => { setDepthGuess(e.target.value); setChecked(false); }} className="mt-1 block w-44 rounded border border-slate-300 px-3 py-2" /></label>
        <button type="button" disabled={!periodGuess || !depthGuess} onClick={() => setChecked(true)} className="rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">Check estimates</button>
      </div>
      {checked && <div role="status" className="border-l-4 border-teal-600 bg-teal-50 p-4 text-sm leading-6">
        <p>{Math.abs(Number(periodGuess) / period - 1) <= 0.15 ? "Period: close." : "Period: measure between consecutive dips."} {Math.abs(Number(depthGuess) / (depth * 100) - 1) <= 0.3 ? "Depth: close." : "Depth: compare the baseline near 1.0 with the bottom of a dip."}</p>
        <p className="mt-1">Model values: {period.toFixed(3)} days and {(depth * 100).toFixed(3)}% depth. A dip alone is not proof of a planet; stellar variability and instrumental effects can resemble transits.</p>
      </div>}
      <MethodsBackToTop />
    </section>
  );
}
