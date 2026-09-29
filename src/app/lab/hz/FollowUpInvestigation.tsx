"use client";

import { useState } from "react";
import Link from "next/link";
import type { Planet } from "@/components/PlanetScatter";
import { catalogFlux, planetHabitabilityUrl } from "@/lib/habitability";
import { nasaPlanetResources } from "@/lib/planet-resources";
import datasetMeta from "@/data/dataset-meta.json";

type Source = { label: string; url: string };
type Evidence = { observed: string; inference: string; unknown: string; sources: Source[] };
type CaseStudy = {
  name: string;
  focus: string;
  atmosphere: Evidence;
  water: Evidence;
  star: Evidence;
  nextStep: string;
};

const cases: CaseStudy[] = [
  {
    name: "TRAPPIST-1 e",
    focus: "Webb has observed this Earth-sized world, yet the existence and composition of a thinner atmosphere remain open questions.",
    atmosphere: {
      observed: "Webb/NIRSpec measured a transmission spectrum. The reported data do not support a thick, hydrogen-rich atmosphere.",
      inference: "Models with and without other kinds of atmosphere still overlap the measured spectrum.",
      unknown: "Whether it has a thinner atmosphere, and what gases it might contain.",
      sources: [{ label: "NASA: TRAPPIST-1 e spectrum", url: "https://science.nasa.gov/asset/webb/trappist-1-e-transmission-spectrum-nirspec/" }],
    },
    water: {
      observed: "Its catalog starlight places it in our initial habitable-zone screen.",
      inference: "A suitable atmosphere and pressure could make liquid surface water possible.",
      unknown: "No surface ocean or liquid water has been established by these observations.",
      sources: [{ label: "NASA: TRAPPIST-1 system", url: "https://science.nasa.gov/mission/webb/science-overview/science-explainers/what-is-webb-revealing-about-the-trappist-1-system/" }],
    },
    star: {
      observed: "TRAPPIST-1 shows flares and star spots. Its variable light complicates Webb's transit measurements.",
      inference: "Some apparent spectral features may come from the star rather than the planet.",
      unknown: "How its long-term activity has affected the planet's atmosphere.",
      sources: [{ label: "NASA: Webb and the host star", url: "https://science.nasa.gov/mission/webb/science-overview/science-explainers/what-is-webb-revealing-about-the-trappist-1-system/" }],
    },
    nextStep: "More transits and careful monitoring of the star could help separate planetary signals from stellar contamination.",
  },
  {
    name: "LHS 1140 b",
    focus: "Its mass, radius, and Webb spectra make it a valuable case for testing competing interior and atmosphere models.",
    atmosphere: {
      observed: "Published Webb/NIRISS transit spectra show stellar faculae and strongly disfavor several thick hydrogen-atmosphere models.",
      inference: "A nitrogen-rich atmosphere is one possible fit, but the reported signal is tentative, not a confirmed detection.",
      unknown: "Whether an atmosphere exists, and its composition if it does.",
      sources: [{ label: "Published JWST/NIRISS study", url: "https://arxiv.org/abs/2406.15136" }],
    },
    water: {
      observed: "Catalog mass and radius constrain its bulk density; Webb data add atmospheric constraints.",
      inference: "Published models consider a water-rich interior, but that is an interpretation of indirect data.",
      unknown: "Whether any liquid water exists at its surface.",
      sources: [{ label: "Published JWST/NIRSpec study", url: "https://arxiv.org/abs/2403.13265" }],
    },
    star: {
      observed: "Stellar faculae leave a measurable imprint on its transit spectrum. Public XMM-Newton observations also target the star's high-energy environment.",
      inference: "Accounting for the star's own spectrum is necessary before assigning features to the planet.",
      unknown: "How stellar radiation has shaped the planet's atmosphere over time.",
      sources: [{ label: "JWST/NIRISS stellar analysis", url: "https://arxiv.org/abs/2406.15136" }, { label: "ESA: XMM-Newton observation", url: "https://esdcdoi.esac.esa.int/doi/html/data/astronomy/xmm-newton/082260.html" }],
    },
    nextStep: "Additional spectra across wavelengths could test the tentative atmospheric interpretation and separate stellar effects.",
  },
  {
    name: "TOI-700 d",
    focus: "This nearby-in-astronomical-terms TESS planet shows the difference between plausible climate models and measured conditions.",
    atmosphere: {
      observed: "TESS and Spitzer observations established the transiting planet and its orbit. The sources linked here do not provide a measured atmospheric spectrum.",
      inference: "Published studies simulate possible atmospheres and spectra; those simulations are not detections.",
      unknown: "Whether it has an atmosphere or what that atmosphere contains.",
      sources: [{ label: "NASA-hosted validation study", url: "https://ntrs.nasa.gov/api/citations/20210012798/downloads/Schlieder_The%20First%20Habitable-zone%20Earth-sized%20Planet%20from%20TESS.%20I..pdf" }, { label: "Published climate-model study", url: "https://arxiv.org/abs/2001.00955" }],
    },
    water: {
      observed: "Its measured size and catalog starlight meet this site's initial screen.",
      inference: "Climate models explore conditions under which water might persist; they use assumed atmospheres and surfaces.",
      unknown: "Its real surface, pressure, and water inventory are not measured.",
      sources: [{ label: "Published climate-model study", url: "https://arxiv.org/abs/2001.00955" }],
    },
    star: {
      observed: "The planet transits a cool M-type star; the site's catalog snapshot includes basic host-star properties.",
      inference: "Stellar light and activity would affect any atmosphere, but star type alone cannot establish those effects.",
      unknown: "The high-energy environment and the planet's long-term atmospheric history are not characterized here.",
      sources: [{ label: "NASA: TOI-700 d", url: "https://science.nasa.gov/exoplanet-catalog/toi-700-d/" }],
    },
    nextStep: "A precise mass and stronger atmospheric observations would narrow its interior and climate possibilities; published work explains why atmospheric spectroscopy is challenging.",
  },
];

function number(value: number | null | undefined, digits = 2) {
  return typeof value === "number" && Number.isFinite(value) ? value.toLocaleString(undefined, { maximumFractionDigits: digits }) : "Unavailable";
}

function SourceLinks({ sources }: { sources: Source[] }) {
  return <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-teal-800">{sources.map(source => <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-teal-950">{source.label} ↗</a>)}</div>;
}

function EvidenceCard({ title, question, evidence }: { title: string; question: string; evidence: Evidence }) {
  return <article className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
    <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
    <p className="mt-1 text-sm text-slate-600">{question}</p>
    <dl className="mt-4 space-y-3 text-sm leading-6">
      <div><dt className="font-semibold text-teal-800">Observed or cataloged</dt><dd className="text-slate-700">{evidence.observed}</dd></div>
      <div><dt className="font-semibold text-indigo-800">Model interpretation</dt><dd className="text-slate-700">{evidence.inference}</dd></div>
      <div><dt className="font-semibold text-amber-800">Still unknown</dt><dd className="text-slate-700">{evidence.unknown}</dd></div>
    </dl>
    <SourceLinks sources={evidence.sources} />
  </article>;
}

export default function FollowUpInvestigation({ planets, selectedName, onSelect }: { planets: Planet[]; selectedName: string; onSelect: (name: string) => void }) {
  const [bonusOpen, setBonusOpen] = useState(false);
  const [spectrumClaim, setSpectrumClaim] = useState<"hydrogen" | "ocean" | "airless" | null>(null);
  const study = cases.find(item => item.name === selectedName) ?? cases[0];
  const name = study.name;
  const planet = planets.find(item => item.pl_name === study.name);
  const flux = planet ? catalogFlux(planet) : null;
  const density = planet && planet.pl_masse && planet.pl_rade ? planet.pl_masse / planet.pl_rade ** 3 : null;
  const resources = nasaPlanetResources(study.name);

  return <div className="space-y-5">
    <header><p className="page-eyebrow">After the first habitable-zone screen</p><h2 className="mt-2 text-2xl font-semibold">How do we investigate a promising planet?</h2><p className="mt-2 text-sm leading-6 text-slate-700">Size and starlight identify worlds worth studying; they cannot reveal their surfaces. Astronomers then measure mass, search for atmospheric signatures, and study the host star. Follow the evidence for three real planets and see what observations have yet to resolve.</p></header>

    <section className="lab-panel p-4 sm:p-5" aria-label="Choose a case study">
      <h3 className="font-semibold">Choose a real planet</h3>
      <div className="mt-3 flex flex-wrap gap-2">{cases.map(item => <button key={item.name} type="button" aria-pressed={name === item.name} onClick={() => onSelect(item.name)} className={`rounded-md border px-4 py-2 text-sm font-semibold ${name === item.name ? "border-teal-700 bg-teal-700 text-white" : "border-teal-200 bg-white text-teal-800 hover:bg-teal-50"}`}>{item.name}</button>)}</div>
    </section>

    <section className="lab-panel p-4 sm:p-6" aria-labelledby="followup-planet-heading">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="page-eyebrow">Real-world evidence file</p><h3 id="followup-planet-heading" className="mt-1 text-2xl font-semibold">{study.name}</h3><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">{study.focus}</p></div><Link href={planetHabitabilityUrl(study.name, { section: "investigate" })} className="rounded-md border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-800 hover:bg-teal-100">View habitability profile →</Link></div>
      <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{[
        ["Radius", `${number(planet?.pl_rade)} × Earth`], ["Mass", `${number(planet?.pl_masse)}${typeof planet?.pl_masse === "number" ? " × Earth" : ""}`],
        ["Starlight", `${number(flux?.value)}${flux ? ` × Earth${flux.estimated ? " (estimated)" : ""}` : ""}`], ["Host star", planet?.hostname || "Unavailable"],
      ].map(([label, value]) => <div key={label} className="rounded-md bg-slate-50 px-3 py-2"><div className="text-xs font-semibold text-slate-500">{label}</div><div className="mt-1 text-sm font-bold text-slate-950">{value}</div></div>)}</div>
      <p className="mt-3 text-xs leading-5 text-slate-600">NASA Exoplanet Archive composite snapshot: {datasetMeta.fetched_at}. {density ? `Mass ÷ radius³ gives an approximate bulk density of ${number(density)} × Earth’s; composition still requires models.` : "This snapshot lacks a mass value, so it cannot give a bulk-density comparison."} Measurements and published interpretations may be revised.</p>
      <a href={resources.archive} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs font-semibold text-teal-800 underline">Check the current NASA Archive record ↗</a>
    </section>

    <div className="grid gap-4 lg:grid-cols-2">
      <EvidenceCard title="1. Interior and composition" question="Does size and mass suggest a rocky world?" evidence={{
        observed: density ? `This catalog snapshot lists a radius of ${number(planet?.pl_rade)} Earth radii and mass of ${number(planet?.pl_masse)} Earth masses.` : "The catalog snapshot has a radius but no mass value for this planet.",
        inference: density ? "Together they give bulk density, which can test broad interior models; different mixtures can still fit." : "A precise mass would make density-based comparisons possible.",
        unknown: "Density alone cannot tell us whether the surface has air, liquid water, or life.",
        sources: [{ label: "NASA Archive: planet parameters", url: resources.archive }, { label: "NASA: why mass and radius matter", url: "https://science.nasa.gov/resource/kepler-78b/" }],
      }} />
      <EvidenceCard title="2. Atmosphere" question="What does light tell us about gases?" evidence={study.atmosphere} />
      <EvidenceCard title="3. Water and climate" question="Could liquid water actually persist?" evidence={study.water} />
      <EvidenceCard title="4. Host-star environment" question="Can stellar activity change the picture?" evidence={study.star} />
    </div>

    <section className="lab-panel p-4 sm:p-5" aria-labelledby="next-observation-heading"><h3 id="next-observation-heading" className="text-lg font-semibold">What observation would help next?</h3><p className="mt-1 text-sm leading-6 text-slate-700">{study.nextStep}</p></section>

    <div className="border-t-2 border-teal-200 pt-6"><button type="button" aria-expanded={bonusOpen} aria-controls="spectrum-bonus-activity" onClick={() => setBonusOpen(open => !open)} className="flex w-full items-center justify-between rounded-lg border border-teal-200 bg-teal-50 px-5 py-3 text-left text-sm font-semibold text-teal-900 hover:bg-teal-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"><span>{bonusOpen ? <strong className="font-bold">Hide Bonus Activity</strong> : <><strong className="font-extrabold">Unlock Bonus Activity</strong><span className="font-medium">: read a real spectrum</span></>}</span><span aria-hidden="true">{bonusOpen ? "▴" : "▾"}</span></button><section id="spectrum-bonus-activity" hidden={!bonusOpen} className="mt-3 rounded-lg border border-teal-200 bg-teal-50 p-4 text-sm leading-6 text-slate-700 sm:p-6" aria-labelledby="spectrum-exercise-heading"><h3 id="spectrum-exercise-heading" className="mt-1 text-xl font-semibold text-slate-950">Read a real spectrum: what can we conclude?</h3><p className="mt-1">Now that you’ve examined the four evidence cards on composition, atmosphere, water and climate, and the host star, try interpreting a real measurement.</p><p className="mt-3">Open NASA’s <a href="https://science.nasa.gov/asset/webb/trappist-1-e-transmission-spectrum-nirspec/" target="_blank" rel="noopener noreferrer" className="font-semibold text-teal-800 underline">TRAPPIST-1 e Webb spectrum ↗</a>. The points are measurements; the curves are models. They overlap in places. Which statement does NASA say the current evidence supports?</p><div className="mt-3 flex flex-wrap gap-2">{([
      ["hydrogen", "A thick hydrogen-rich atmosphere is unlikely"], ["ocean", "A surface ocean has been found"], ["airless", "The planet definitely has no atmosphere"],
    ] as const).map(([key, label]) => <button key={key} type="button" aria-pressed={spectrumClaim === key} onClick={() => setSpectrumClaim(key)} className={`rounded-md border px-3 py-2 text-left text-sm font-semibold ${spectrumClaim === key ? "border-teal-700 bg-teal-700 text-white" : "border-slate-300 bg-white text-teal-800 hover:bg-teal-50"}`}>{label}</button>)}</div>{spectrumClaim && <p role="status" className="mt-3 rounded-md border-l-4 border-teal-600 bg-white p-3">{spectrumClaim === "hydrogen" ? "Yes. The reported data rule out a thick hydrogen-rich atmosphere, while other atmospheric possibilities remain unresolved." : spectrumClaim === "ocean" ? "Not yet. A transmission spectrum probes light passing near the planet's limb; it has not established surface liquid water." : "That is stronger than the evidence. The data do not yet rule out every possible atmosphere."}</p>}<p className="mt-3">For contrast, NASA’s <a href="https://science.nasa.gov/asset/webb/exoplanet-wasp-96-b-niriss-transmission-spectrum/" target="_blank" rel="noopener noreferrer" className="font-semibold text-teal-800 underline">WASP-96 b spectrum ↗</a> shows a clearer atmospheric signal from a hot gas giant, not a habitable-zone rocky world. A water-vapor feature is not evidence of a surface ocean. Explore published measurements in the <a href="https://exoplanetarchive.ipac.caltech.edu/cgi-bin/atmospheres/nph-firefly?atmospheres" target="_blank" rel="noopener noreferrer" className="font-semibold text-teal-800 underline">NASA Atmospheric Spectroscopy Table ↗</a>.</p></section></div>
  </div>;
}
