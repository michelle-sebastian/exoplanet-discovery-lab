"use client";

import { useState } from "react";
import Link from "next/link";
import SectionNav from "@/components/SectionNav";
import TerminologyGlossary, { GlossaryPreview, type GlossaryTopic } from "./TerminologyGlossary";
import type { Planet } from "@/components/PlanetScatter";
import { catalogMass, publishedRadius } from "@/lib/catalog-values";

type Field = "pl_rade" | "pl_masse" | "pl_orbper" | "pl_insol" | "pl_eqt" | "sy_dist" | "st_teff" | "discoverymethod";
const concepts: { field: Field; title: string; unit: string; meaning: string; use: string; limit: string; correct: string; incorrect: string }[] = [
  { field: "pl_rade", title: "Planet radius", unit: "Earth radii", meaning: "The planet's size, using Earth's radius as one unit.", use: "Helps compare worlds by size. A transit can constrain the planet-to-star radius ratio.", limit: "Radius alone does not tell us whether a planet has a solid surface or an atmosphere.", correct: "This planet's size can be compared with Earth's.", incorrect: "This value proves the planet is rocky." },
  { field: "pl_masse", title: "Planet mass", unit: "Earth masses", meaning: "The amount of matter in the planet, using Earth's mass as one unit.", use: "Combined with radius, mass helps estimate bulk density and possible composition.", limit: "Mass measurements have uncertainties; radial velocity alone often yields a minimum mass unless orbital inclination is known.", correct: "Together with radius, mass can help estimate density.", incorrect: "Mass alone identifies every material inside the planet." },
  { field: "pl_orbper", title: "Orbital period", unit: "days", meaning: "The time the planet takes to complete one orbit around its star.", use: "Repeating transit dips or stellar velocity changes can reveal an orbital period.", limit: "A short year does not by itself specify the surface temperature; the host star matters.", correct: "This is the length of one orbit.", incorrect: "This is the planet's rotation period." },
  { field: "pl_insol", title: "Starlight received", unit: "Earth flux", meaning: "The stellar energy arriving at the planet relative to the amount Earth receives from the Sun.", use: "Provides a first comparison of the energy available to warm a planet.", limit: "Atmosphere, reflectivity, heat redistribution, and the star's spectrum also affect conditions.", correct: "This compares incoming stellar energy with Earth's.", incorrect: "This is a direct measurement of surface temperature." },
  { field: "pl_eqt", title: "Equilibrium temperature", unit: "K", meaning: "An estimated temperature from the balance between absorbed starlight and radiated heat under stated assumptions.", use: "A quick first screen for planets that may be extremely hot or cold.", limit: "It does not include the full effect of an atmosphere, greenhouse warming, clouds, or local climate.", correct: "This is a model estimate based mainly on incoming energy.", incorrect: "This is a measured surface temperature." },
  { field: "sy_dist", title: "System distance", unit: "parsecs", meaning: "The distance from Earth to the host star's planetary system. One parsec is about 3.26 light-years.", use: "Nearby systems can be favorable for some kinds of follow-up observation.", limit: "Distance from Earth is not the planet's distance from its own star.", correct: "This tells us how far the system is from Earth.", incorrect: "This tells us the planet's orbital radius." },
  { field: "st_teff", title: "Host-star temperature", unit: "K", meaning: "The effective temperature of the star's light-emitting surface.", use: "Helps characterize the star that illuminates the planet.", limit: "This is not the planet's temperature and does not alone determine habitability.", correct: "This describes the host star, not the planet.", incorrect: "This is the planet's atmospheric temperature." },
  { field: "discoverymethod", title: "Discovery method", unit: "", meaning: "The technique credited with detecting or confirming the planet in the catalog.", use: "Helps reveal how observation methods favor different kinds of planets.", limit: "The discovery label does not list every method later used to study the planet.", correct: "This identifies the catalog's discovery technique.", incorrect: "This lists every observation ever made of the planet." },
];

export default function ExoplanetGlossaryClient({ planets }: { planets: Planet[] }) {
  const [planetName, setPlanetName] = useState(planets[0]?.pl_name ?? "");
  const [field, setField] = useState<Field>("pl_rade");
  const [choice, setChoice] = useState<"correct" | "incorrect" | null>(null);
  const [checked, setChecked] = useState(false);
  const [glossaryQuery, setGlossaryQuery] = useState("");
  const [glossaryTopic, setGlossaryTopic] = useState<GlossaryTopic>("All topics");
  const planet = planets.find((item) => item.pl_name === planetName) ?? planets[0];
  const concept = concepts.find((item) => item.field === field) ?? concepts[0];
  if (!planet) return null;
  const mass = catalogMass(planet);
  const value = field === "pl_rade" ? publishedRadius(planet) : field === "pl_masse" ? mass?.value : planet[field];
  const display = typeof value === "number" ? value.toLocaleString(undefined, { maximumFractionDigits: value < 1 ? 3 : 2 }) : value || "Not available";

  return <main id="page-top" className="site-page space-y-8">
    <header className="page-intro">
      <p className="text-sm font-semibold uppercase text-teal-700">Reference and interpretation</p>
      <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Exoplanet Glossary</h1>
      <p className="mt-3 leading-7 text-slate-700">Learn exoplanet vocabulary through real planet data, then use the glossary and NASA sources to explore further.</p>
    </header>
    <SectionNav items={[
      { href: "#catalog-examples", label: "Interpret real planet data" },
      { href: "#glossary", label: "Browse the glossary" },
      { href: "#further-reading", label: "Explore NASA resources" },
    ]} />
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
    <section id="catalog-examples" aria-labelledby="catalog-heading" className="lab-panel min-w-0 space-y-6 p-5 sm:p-6">
      <h2 id="catalog-heading" className="text-2xl font-semibold">Interpret real planet data</h2>
      <p className="mt-3 max-w-3xl leading-7 text-slate-700">Pick a planet and a property to see what the number means, why astronomers use it, and what it cannot establish on its own. Values marked unavailable are missing, not zero.</p>
    <div className="flex flex-wrap items-end gap-4 rounded-xl border border-teal-100 bg-teal-50 p-5">
      <label className="text-sm font-semibold">Example planet
        <select value={planet.pl_name} onChange={(e) => { setPlanetName(e.target.value); setChoice(null); setChecked(false); }} className="mt-1 block min-w-48 rounded border border-slate-300 bg-white px-3 py-2">{planets.map((item) => <option key={item.pl_name}>{item.pl_name}</option>)}</select>
      </label>
      <Link href="/lab/playground" className="py-2 text-sm font-semibold text-teal-800 underline">Explore the full catalog</Link>
    </div>
    <section aria-labelledby="property-heading" className="space-y-6">
      <nav aria-label="Planet property" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {concepts.map((item) => <button key={item.field} type="button" aria-current={field === item.field ? "true" : undefined} onClick={() => { setField(item.field); setChoice(null); setChecked(false); }} className={`rounded border px-3 py-2 text-left text-sm font-medium ${field === item.field ? "border-teal-700 bg-teal-50 text-teal-900" : "border-slate-200 bg-white hover:border-slate-400"}`}>{item.title}</button>)}
      </nav>
      <div className="min-w-0">
        <h3 id="property-heading" className="text-2xl font-semibold">{concept.title}</h3>
        <p className="mt-2 text-sm text-slate-500">{planet.pl_name}</p>
        <p className="mt-3 text-3xl font-semibold text-teal-800">{display} <span className="text-base font-medium text-slate-600">{concept.unit}</span></p>
        {field === "pl_masse" && mass ? <p className="mt-1 text-sm font-semibold text-slate-600">{mass.label}</p> : null}
        {field === "pl_rade" && publishedRadius(planet) === null ? <p className="mt-1 text-sm text-slate-600">A published radius is unavailable; NASA-calculated radius estimates are not shown as measurements.</p> : null}
        <dl className="mt-8 grid gap-6 sm:grid-cols-3">
          <div className="border-t-2 border-teal-600 pt-3"><dt className="text-sm font-semibold">Meaning</dt><dd className="mt-2 text-sm leading-6 text-slate-700">{concept.meaning}</dd></div>
          <div className="border-t-2 border-slate-300 pt-3"><dt className="text-sm font-semibold">Why it matters</dt><dd className="mt-2 text-sm leading-6 text-slate-700">{concept.use}</dd></div>
          <div className="border-t-2 border-amber-600 pt-3"><dt className="text-sm font-semibold">Limit</dt><dd className="mt-2 text-sm leading-6 text-slate-700">{concept.limit}</dd></div>
        </dl>
        <div className="mt-10 border-t border-slate-200 pt-6">
          <h3 className="font-semibold">Check your interpretation</h3>
          <p className="mt-1 text-sm text-slate-600">Which statement is supported by this property?</p>
          <div className="mt-4 space-y-2">
            {(["incorrect", "correct"] as const).map((option) => <label key={option} className={`flex cursor-pointer items-start gap-3 rounded border p-3 text-sm ${choice === option ? "border-teal-700 bg-teal-50" : "border-slate-200"}`}><input type="radio" name="interpretation" checked={choice === option} onChange={() => { setChoice(option); setChecked(false); }} className="mt-0.5 accent-teal-700" />{concept[option]}</label>)}
          </div>
          <button type="button" disabled={!choice} onClick={() => setChecked(true)} className="mt-4 rounded bg-teal-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">Check answer</button>
          {checked && <p role="status" className="mt-4 border-l-4 border-teal-600 bg-teal-50 p-4 text-sm leading-6">{choice === "correct" ? "Correct. " : "That goes beyond what this property alone can show. "}{concept.limit}</p>}
        </div>
      </div>
    </section>
    </section>
    <GlossaryPreview property={field} onSelectTerm={(title) => { setGlossaryQuery(title); setGlossaryTopic("All topics"); }} />
    </div>
    <p className="text-sm text-slate-600">For parameter definitions, units, and measurement references, see the <a href="https://exoplanetarchive.ipac.caltech.edu/docs/API_PS_columns.html" target="_blank" rel="noreferrer" className="font-semibold text-teal-800 underline">NASA Exoplanet Archive column guide ↗</a>.</p>
    <p className="border-t border-slate-200 pt-5 text-xs text-slate-600">Displayed values come from the same NASA Exoplanet Archive snapshot used in Planet Playground. They may be revised as observations improve.</p>
    <TerminologyGlossary query={glossaryQuery} onQueryChange={setGlossaryQuery} topic={glossaryTopic} onTopicChange={setGlossaryTopic} />
  </main>;
}
