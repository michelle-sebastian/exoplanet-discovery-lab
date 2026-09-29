"use client";

import { useState } from "react";
import Link from "next/link";
import type { Planet } from "@/components/PlanetScatter";
import MethodsBackToTop from "@/components/MethodsBackToTop";
import { catalogMass, publishedRadius } from "@/lib/catalog-values";

const exercises = [
  {
    title: "A candidate for closer study",
    prompt: "Which planet is the strongest starting point for a discussion of modest size and Earth-like starlight?",
    options: ["TRAPPIST-1 e", "Kepler-10 b", "WASP-12 b"],
    answer: "TRAPPIST-1 e",
    evidence: ["Radius", "Starlight"],
    explanation: "TRAPPIST-1 e is close to Earth in radius and receives less than Earth's starlight. That makes it useful for further study, but these values alone do not establish surface conditions or life.",
  },
  {
    title: "A conspicuous transit",
    prompt: "Which planet should make the largest repeating dip in its host star's light? Use both planet and star size.",
    options: ["HD 209458 b", "Kepler-10 b", "TRAPPIST-1 e"],
    answer: "HD 209458 b",
    evidence: ["Radius", "Host-star radius"],
    explanation: "HD 209458 b blocks a much larger share of its host star's disk. Transit depth is approximately the squared ratio of planet radius to stellar radius. A large planet is not enough by itself: the star's size matters too.",
  },
  {
    title: "A strong stellar wobble",
    prompt: "Which known system has the clearest supporting catalog evidence for a strong, short-period radial-velocity signal?",
    options: ["51 Peg b", "TOI-700 d", "Kepler-442 b"],
    answer: "51 Peg b",
    evidence: ["Mass", "Orbital period", "Host-star mass"],
    explanation: "51 Peg b has a large published mass and an orbit of about 4.23 days, supporting a comparatively strong, quickly repeating signal. For the same planet mass and period, a lower-mass star has a larger velocity response. The other two planets lack independently reported masses in this snapshot; model estimates are not radial-velocity measurements. We cannot infer that their signals are weak. Inclination, eccentricity, stellar activity, brightness, and observing precision also matter. Historically, 51 Peg b was discovered by radial velocity.",
  },
];
const evidenceOptions = ["Radius", "Mass", "Starlight", "Orbital period", "Host-star radius", "Host-star mass"];

const properties = [
  { label: "Radius", unit: "Earth = 1", field: "pl_rade" },
  { label: "Mass", unit: "Earth = 1", field: "pl_masse" },
  { label: "Starlight", unit: "Earth = 1", field: "pl_insol" },
  { label: "Period", unit: "days", field: "pl_orbper" },
  { label: "Star radius", unit: "Sun = 1", field: "st_rad" },
  { label: "Star mass", unit: "Sun = 1", field: "st_mass" },
] as const;

function format(value: number | null | undefined, digits = 2) {
  return typeof value === "number" && Number.isFinite(value) ? value.toLocaleString(undefined, { maximumFractionDigits: digits }) : "Unknown";
}

function evidenceValue(planet: Planet, field: typeof properties[number]["field"]) {
  if (field === "pl_rade") return publishedRadius(planet);
  if (field === "pl_masse") {
    const mass = catalogMass(planet);
    return mass?.label === "Model-estimated mass" ? null : mass?.value;
  }
  return planet[field];
}

export default function PlanetEvidenceExercise({ planets, exercise }: { planets: Planet[]; exercise: "habitability" | "transit" | "radial-velocity" }) {
  const [selected, setSelected] = useState("");
  const [evidence, setEvidence] = useState<string[]>([]);
  const [reason, setReason] = useState("");
  const [checked, setChecked] = useState(false);
  const mission = exercises[exercise === "habitability" ? 0 : exercise === "transit" ? 1 : 2];
  const candidates = mission.options.map((name) => planets.find((planet) => planet.pl_name === name)).filter((planet): planet is Planet => Boolean(planet));
  const fields = exercise === "transit" ? ["pl_rade", "st_rad", "pl_orbper"] : exercise === "radial-velocity" ? ["pl_masse", "st_mass", "pl_orbper"] : ["pl_rade", "pl_insol", "pl_orbper"];
  const columns = properties.filter(property => fields.includes(property.field));
  const hasRelevantEvidence = mission.evidence.every(item => evidence.includes(item));

  return <section id={`${exercise}-evidence`} aria-labelledby={`${exercise}-evidence-title`} className="space-y-4 rounded-lg border border-slate-200 p-4 sm:p-5">
      <h3 id={`${exercise}-evidence-title`} className="text-xl font-semibold text-slate-900">{mission.title}</h3>
      <p className="mt-3 text-sm leading-6">{mission.prompt}</p>
      <div className="mt-6 overflow-x-auto border-y border-slate-200 bg-white">
        <table className="w-full min-w-[540px] text-left text-sm">
          <caption className="sr-only">Known planet systems and the properties relevant to {exercise === "radial-velocity" ? "radial velocity" : exercise}</caption>
          <thead className="bg-slate-100 text-slate-700"><tr>
            <th scope="col" className="px-3 py-3">Choose</th><th scope="col" className="px-3 py-3">Planet</th>{columns.map(property => <th key={property.field} scope="col" className="px-3 py-3">{property.label}<br /><span className="font-normal">{property.unit}</span></th>)}
          </tr></thead>
          <tbody>{candidates.map((planet) => <tr key={planet.pl_name} className={selected === planet.pl_name ? "bg-emerald-50" : "border-t border-slate-100"}>
            <td className="px-3 py-3"><input type="radio" name={`${exercise}-planet`} value={planet.pl_name} checked={selected === planet.pl_name} onChange={() => { setSelected(planet.pl_name); setChecked(false); }} aria-label={`Choose ${planet.pl_name}`} className="accent-emerald-700" /></td>
            <th scope="row" className="px-3 py-3 font-semibold"><button type="button" onClick={() => { setSelected(planet.pl_name); setChecked(false); }} className="text-left hover:underline">{planet.pl_name}</button></th>
            {columns.map(property => <td key={property.field} className="px-3 py-3">{format(evidenceValue(planet, property.field), property.field === "st_rad" ? 3 : 2)}{property.field === "pl_masse" && catalogMass(planet)?.label === "Minimum mass (M sin i)" ? " (minimum)" : ""}</td>)}
          </tr>)}</tbody>
        </table>
      </div>
      {exercise === "transit" && <p className="text-sm leading-6 text-slate-600"><strong>Compare radii in the same units:</strong> 1 Sun radius ≈ 109.1 Earth radii. With the table’s units, <strong>depth (%) ≈ [planet radius ÷ (109.1 × star radius)]<sup>2</sup> × 100</strong>.</p>}
      <fieldset className="mt-7">
        <legend className="text-sm font-semibold">Which properties support your choice?</legend>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-3">{evidenceOptions.map((option) => <label key={option} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={evidence.includes(option)} onChange={(event) => { setEvidence((current) => event.target.checked ? [...current, option] : current.filter((item) => item !== option)); setChecked(false); }} className="accent-emerald-700" />{option}</label>)}</div>
      </fieldset>
      <label className="mt-6 block text-sm font-semibold">Your reasoning (optional)
        <textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={3} placeholder="What makes this planet a useful choice, and what do you still need to know?" className="mt-2 block w-full rounded border border-slate-300 p-3 font-normal" />
      </label>
      <button type="button" disabled={!selected || evidence.length === 0} onClick={() => setChecked(true)} className="mt-5 rounded-md bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40">Review choice</button>
      {checked && <div role="status" className="mt-6 border-l-4 border-emerald-600 bg-emerald-50 p-5 text-sm leading-6">
        <p className="font-semibold">{selected !== mission.answer ? `A stronger choice here is ${mission.answer}.` : hasRelevantEvidence ? "A well-supported choice." : "Correct planet; reconsider your supporting properties."}</p>
        <p className="mt-2">{mission.explanation}</p>
        <p className="mt-2">Most relevant properties: {mission.evidence.join(", ")}. {hasRelevantEvidence ? "You included each of them." : `Add these to your evidence: ${mission.evidence.filter(item => !evidence.includes(item)).join(", ")}.`}</p>
        <p className="mt-2 text-slate-600">This self-check evaluates the selected planet and evidence fields, not your written explanation.</p>
      </div>}
      {checked && <details className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm"><summary className="cursor-pointer font-semibold text-teal-800">Explore the full catalog properties after your review</summary><div className="mt-3 space-y-4">{candidates.map(planet => <article key={planet.pl_name}><h4 className="font-semibold">{planet.pl_name}</h4><dl className="mt-2 flex flex-wrap gap-x-6 gap-y-2">{properties.map(property => <div key={property.field}><dt className="text-xs text-slate-500">{property.field === "pl_masse" ? catalogMass(planet)?.label ?? property.label : property.label} ({property.unit})</dt><dd>{format(evidenceValue(planet, property.field), property.field === "st_rad" ? 3 : 2)}</dd></div>)}<div><dt className="text-xs text-slate-500">Discovery method</dt><dd>{planet.discoverymethod ?? "Unknown"}</dd></div></dl><a href={`https://exoplanetarchive.ipac.caltech.edu/overview/${encodeURIComponent(planet.pl_name)}`} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs font-semibold text-teal-800 underline">NASA Archive: {planet.pl_name} ↗</a></article>)}<p className="text-xs leading-5 text-slate-600">Unknown means no independently reported value is available for this exercise. NASA-calculated radii and model-estimated masses are omitted. Check the archive for measurement uncertainties and provenance.</p></div></details>}
    <p className="border-t border-slate-200 pt-6 text-sm text-slate-600">Values come from this site&apos;s NASA Exoplanet Archive snapshot. <Link href="/lab/playground" className="font-semibold text-teal-800 underline">Open Planet Playground</Link> to compare more planets. These are instructional selections, not official target rankings.</p>
    <MethodsBackToTop />
  </section>;
}
