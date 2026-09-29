"use client";

import Link from "next/link";

const sources = {
  basics: { title: "NASA exoplanet glossary", url: "https://science.nasa.gov/exoplanets/glossary/", detail: "Start here for approachable definitions of common exoplanet vocabulary." },
  types: { title: "NASA: types of exoplanets", url: "https://science.nasa.gov/exoplanets/planet-types/", detail: "Explore rocky worlds, super-Earths, Neptune-like planets, and gas giants." },
  methods: { title: "NASA: finding and studying planets", url: "https://science.nasa.gov/exoplanets/how-we-find-and-characterize/", detail: "Learn how observations reveal planets and help characterize their atmospheres." },
  climate: { title: "NASA: the habitable zone", url: "https://science.nasa.gov/exoplanets/habitable-zone/", detail: "Go deeper into liquid water, host stars, and the limits of habitability estimates." },
  units: { title: "NASA universe glossary", url: "https://science.nasa.gov/universe/glossary/", detail: "A broader reference for astronomical distances, stars, orbits, and physics." },
  data: { title: "Exoplanet Archive: calculated values", url: "https://exoplanetarchive.ipac.caltech.edu/docs/pscp_calc.html", detail: "Technical reading: understand derived values and assumptions in the composite catalog." },
};

type Topic = "Worlds & stars" | "Orbits & units" | "Detection & evidence" | "Habitability" | "Reading the data";
export type GlossaryTopic = Topic | "All topics";
type Term = { title: string; topic: Topic; definition: string; note: string; source: keyof typeof sources; aliases?: string };
const terms: Term[] = [
  { title: "Exoplanet", topic: "Worlds & stars", definition: "A planet outside our solar system, usually discussed as a world orbiting another star.", note: "The prefix exo means outside.", source: "basics" },
  { title: "Terrestrial planet", aliases: "rocky", topic: "Worlds & stars", definition: "A world made mostly of rock and metal.", note: "Earth, Venus, Mars, and Mercury are nearby examples; rocky does not mean habitable.", source: "types" },
  { title: "Super-Earth", topic: "Worlds & stars", definition: "A planet more massive than Earth but less massive than Neptune; usage and boundaries vary.", note: "The name does not promise an Earth-like surface, atmosphere, or climate.", source: "types" },
  { title: "Sub-Neptune / mini-Neptune", topic: "Worlds & stars", definition: "Terms often used for planets smaller than Neptune, many with substantial gaseous envelopes.", note: "Size categories overlap; radius alone cannot establish composition.", source: "types" },
  { title: "Gas giant / hot Jupiter", topic: "Worlds & stars", definition: "Gas giants are large, gas-rich planets. A hot Jupiter is a giant orbiting very close to its star.", note: "A short orbit can expose a giant planet to intense heating.", source: "types" },
  { title: "Host star", topic: "Worlds & stars", definition: "The star that a planet orbits.", note: "A planet's properties depend on what we know about its star.", source: "basics" },
  { title: "Stellar spectral type", aliases: "O B A F G K M dwarf star temperature", topic: "Worlds & stars", definition: "A classification tied to a star's spectrum and temperature: O, B, A, F, G, K, M run from hotter to cooler.", note: "The Sun is a G star. An M dwarf is a cool, small main-sequence star.", source: "units" },
  { title: "Astronomical unit (AU)", topic: "Orbits & units", definition: "A distance unit of about 150 million kilometres, close to Earth's average distance from the Sun.", note: "Use AU for distances within a planetary system.", source: "units" },
  { title: "Light-year / parsec (pc)", topic: "Orbits & units", definition: "A light-year is the distance light travels in one year. One parsec is about 3.26 light-years.", note: "Both measure distance, not time; our catalog's system distances use parsecs.", source: "units" },
  { title: "Orbital period", topic: "Orbits & units", definition: "The time required for one complete orbit: the planet's year.", note: "A planet's day describes rotation and can differ greatly from its year.", source: "basics" },
  { title: "Semi-major axis / eccentricity", topic: "Orbits & units", definition: "The semi-major axis sets an orbit's size. Eccentricity describes how stretched it is; zero is circular.", note: "On an eccentric orbit, the planet's distance from its star changes.", source: "units" },
  { title: "Earth and Sun units", aliases: "radius mass R⊕ M⊕ R☉ S⊕ insolation flux", topic: "Orbits & units", definition: "R⊕ and M⊕ compare radius and mass with Earth. R☉ compares radius with the Sun; S⊕ compares incoming starlight with Earth's.", note: "2 R⊕ means twice Earth's radius, not twice its mass.", source: "basics" },
  { title: "Transit / light curve", topic: "Detection & evidence", definition: "A transit occurs when a planet crosses its star from our viewpoint. A light curve plots brightness over time.", note: "Repeated dips can reveal the orbital period; not every dip is planetary.", source: "methods" },
  { title: "Transit depth", topic: "Detection & evidence", definition: "The fractional drop in starlight, approximately (planet radius / star radius)² for a simple transit.", note: "Use matching radius units. A smaller star makes the same planet's dip deeper.", source: "methods" },
  { title: "Radial velocity (RV)", aliases: "Doppler wobble", topic: "Detection & evidence", definition: "Motion toward or away from us, measured through shifts in a star's spectrum.", note: "A planet's gravity can cause a repeating signal; orbital inclination affects the inferred mass.", source: "methods" },
  { title: "Direct imaging", topic: "Detection & evidence", definition: "Separating light from a planet from its much brighter star.", note: "Young, bright planets far from their stars are generally easier imaging targets.", source: "methods" },
  { title: "Gravitational microlensing", topic: "Detection & evidence", definition: "Gravity from a foreground object magnifies a background star; a planet can alter the brightening pattern.", note: "This relies on a chance alignment rather than repeated transits.", source: "methods" },
  { title: "Astrometry", topic: "Detection & evidence", definition: "Precise measurements of positions on the sky, including a star's tiny planet-induced motion.", note: "It measures position changes rather than the spectral shifts used in radial velocity.", source: "units" },
  { title: "Habitable zone", aliases: "Goldilocks liquid water", topic: "Habitability", definition: "A range of distances where a suitable atmosphere could allow liquid water on a rocky planet's surface.", note: "Being in this zone is not evidence of life or a guarantee of human-friendly conditions.", source: "climate" },
  { title: "Insolation / stellar flux", aliases: "starlight S⊕", topic: "Habitability", definition: "The stellar energy received per unit area. Our lab compares it with the sunlight arriving at Earth.", note: "Equal incoming energy does not guarantee equal surface temperatures.", source: "climate" },
  { title: "Equilibrium temperature", aliases: "Kelvin K", topic: "Habitability", definition: "An energy-balance temperature estimate based on absorbed starlight and emitted heat.", note: "Assumptions about reflection and heat redistribution matter; it is not a measured surface temperature.", source: "data" },
  { title: "Albedo / greenhouse warming", topic: "Habitability", definition: "Albedo describes reflected light. Greenhouse gases absorb and emit infrared radiation, affecting surface warming.", note: "Our HZ lab varies these separately to explore how climate assumptions change an estimate.", source: "climate" },
  { title: "Tidal locking", topic: "Habitability", definition: "In synchronous rotation, a planet turns once per orbit, keeping the same side toward its star.", note: "Permanent day and night can influence climate; this alone does not settle habitability.", source: "basics" },
  { title: "Measured vs. derived", topic: "Reading the data", definition: "Some catalog values come from observations; others are calculated from other properties and models.", note: "A filled-in radius or mass is not necessarily a direct measurement. Check the parameter's reference.", source: "data" },
  { title: "Missing value", aliases: "unknown null unavailable", topic: "Reading the data", definition: "The catalog has no usable value for that property in the selected record.", note: "Unknown mass does not mean zero mass. Filtering can exclude planets with incomplete records.", source: "data" },
  { title: "Composite catalog", topic: "Reading the data", definition: "A table combining chosen properties from different studies to provide more complete planet records.", note: "Values may use different assumptions or references and may not form one consistent model.", source: "data" },
];
const topicOrder: Topic[] = ["Worlds & stars", "Orbits & units", "Detection & evidence", "Habitability", "Reading the data"];
const topics: GlossaryTopic[] = ["All topics", ...topicOrder];
const labs: Record<Topic, { href: string; title: string }> = {
  "Worlds & stars": { href: "/lab/playground", title: "Compare planets" },
  "Orbits & units": { href: "/lab/playground", title: "Explore catalog values" },
  "Detection & evidence": { href: "/lab/methods", title: "Try Detection Methods Lab" },
  Habitability: { href: "/lab/hz", title: "Try Habitable Zone Explorer" },
  "Reading the data": { href: "/lab/playground", title: "Explore the dataset" },
};

const relatedTerms: Record<string, string[]> = {
  pl_rade: ["Earth and Sun units", "Terrestrial planet", "Super-Earth"],
  pl_masse: ["Earth and Sun units", "Radial velocity (RV)", "Measured vs. derived"],
  pl_orbper: ["Orbital period", "Semi-major axis / eccentricity", "Tidal locking"],
  pl_insol: ["Insolation / stellar flux", "Habitable zone", "Albedo / greenhouse warming"],
  pl_eqt: ["Equilibrium temperature", "Albedo / greenhouse warming", "Habitable zone"],
  sy_dist: ["Light-year / parsec (pc)", "Astronomical unit (AU)", "Host star"],
  st_teff: ["Stellar spectral type", "Host star", "Habitable zone"],
  discoverymethod: ["Transit / light curve", "Radial velocity (RV)", "Direct imaging"],
};

export function GlossaryPreview({ property, onSelectTerm }: { property: string; onSelectTerm: (title: string) => void }) {
  const related = (relatedTerms[property] ?? []).map((title) => terms.find((term) => term.title === title)).filter((term): term is Term => Boolean(term));
  return <aside aria-labelledby="glossary-preview-heading" className="reference-panel lg:sticky lg:top-36">
    <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">Your reference shelf</p>
    <h2 id="glossary-preview-heading" className="mt-2 text-xl font-semibold">Related terms</h2>
    <p className="mt-2 text-sm leading-6 text-slate-600">Choose a term to find its full definition below. These suggestions change with the selected property.</p>
    <ul key={property} className="mt-4 divide-y divide-slate-200 border-y border-slate-200">
      {related.map((term) => <li key={term.title}>
        <a href="#glossary" onClick={() => onSelectTerm(term.title)} className="flex items-center justify-between gap-3 py-3 text-sm font-semibold text-teal-800 hover:underline">
          {term.title}<span aria-hidden="true">↓</span>
        </a>
      </li>)}
    </ul>
    <a href="#glossary" onClick={() => onSelectTerm("")} className="mt-5 block text-sm font-semibold text-teal-800 underline">Browse all {terms.length} glossary entries →</a>
  </aside>;
}

export default function TerminologyGlossary({ query, onQueryChange, topic, onTopicChange }: { query: string; onQueryChange: (value: string) => void; topic: GlossaryTopic; onTopicChange: (value: GlossaryTopic) => void }) {
  const normalized = query.trim().toLocaleLowerCase();
  const matches = terms.filter((term) => (topic === "All topics" || topic === term.topic) && `${term.title} ${term.aliases ?? ""} ${term.definition} ${term.note}`.toLocaleLowerCase().includes(normalized));
  const groups = topicOrder.map((name) => ({ name, entries: matches.filter((term) => term.topic === name) })).filter((group) => group.entries.length > 0);
  return <>
    <section id="glossary" aria-labelledby="glossary-heading" className="lab-panel space-y-6 p-5 sm:p-8">
      <nav aria-label="Glossary section navigation" className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
        <a href="#page-top" className="inline-flex items-center rounded-lg border border-teal-800 bg-teal-800 px-4 py-2.5 font-semibold text-white hover:bg-teal-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700">↑ Back to top</a>
      </nav>
      <div><h2 id="glossary-heading" className="text-2xl font-semibold">Find the words behind the science</h2><p className="mt-2 text-sm leading-6 text-slate-600">Browse {terms.length} entries across five topics. Each includes a plain-language definition, a useful distinction, and a source for deeper reading.</p></div>
      <div className="grid gap-4 sm:grid-cols-[1fr_240px]">
        <label className="text-sm font-semibold">Search terms<input type="search" value={query} onChange={(e) => onQueryChange(e.target.value)} placeholder="Try wobble, rocky, starlight, or AU" className="mt-2 block w-full rounded border border-slate-300 bg-white px-3 py-3 font-normal" /></label>
        <label className="text-sm font-semibold">Topic<select value={topic} onChange={(e) => onTopicChange(e.target.value as GlossaryTopic)} className="mt-2 block w-full rounded border border-slate-300 bg-white px-3 py-3 font-normal">{topics.map((item) => <option key={item}>{item}</option>)}</select></label>
      </div>
      <p role="status" className="text-sm text-slate-600">{matches.length} of {terms.length} entries{topic !== "All topics" ? ` · ${topic}` : ""}</p>
      {matches.length === 0 && <div className="rounded border border-slate-200 p-6"><p>No matching terms. Try another word or broaden the topic.</p><button type="button" onClick={() => { onQueryChange(""); onTopicChange("All topics"); }} className="mt-3 font-semibold text-teal-800 underline">Clear filters</button></div>}
      <div className="space-y-10">
        {groups.map((group) => <section key={group.name} className="border-t border-slate-300 pt-5">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
            <h3 className="text-lg font-semibold">{group.name} <span className="text-sm font-normal text-slate-500">({group.entries.length})</span></h3>
            <Link href={labs[group.name].href} className="text-sm font-semibold text-teal-800 underline">{labs[group.name].title} →</Link>
          </div>
          <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">
            {group.entries.map((term) => <article key={term.title} className="border-t border-slate-200 pt-5">
              <h4 className="text-lg font-semibold">{term.title}</h4>
              <p className="mt-2 text-sm leading-6 text-slate-700">{term.definition}</p>
              <p className="mt-3 border-l-2 border-amber-500 pl-3 text-sm leading-6 text-slate-600">{term.note}</p>
              <a href={sources[term.source].url} target="_blank" rel="noreferrer" className="mt-4 inline-block text-sm font-semibold text-teal-800 underline">{sources[term.source].title} ↗</a>
            </article>)}
          </div>
        </section>)}
      </div>
    </section>
    <section id="further-reading" aria-labelledby="resources-heading" className="reference-panel p-6 sm:p-8">
      <a href="#page-top" className="mb-4 inline-flex items-center rounded-lg border border-teal-800 bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white  hover:bg-teal-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700">↑ Back to top</a>
      <h2 id="resources-heading" className="text-2xl font-semibold">Keep exploring with NASA</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">These resources offer fuller explanations, illustrations, and technical detail. External links open in a new tab.</p>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{Object.values(sources).map((source) => <article key={source.url}><h3 className="font-semibold"><a href={source.url} target="_blank" rel="noreferrer" className="text-teal-800 underline">{source.title} ↗</a></h3><p className="mt-2 text-sm leading-6 text-slate-600">{source.detail}</p></article>)}</div>
    </section>
  </>;
}
