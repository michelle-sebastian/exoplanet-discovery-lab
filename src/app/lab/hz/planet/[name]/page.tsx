import Link from "next/link";
import PlanetResourceButtons from "@/components/PlanetResourceButtons";
import { notFound } from "next/navigation";
import planets from "@/data/planets.json";
import type { Planet } from "@/components/PlanetScatter";
import { assessHabitability, getHabitableZoneSection } from "@/lib/habitability";
import { getStarType } from "@/lib/star-types";
import { catalogMass, estimatedRadius, formatCatalogNumber, publishedRadius } from "@/lib/catalog-values";
import type { Metadata } from "next";

const format = formatCatalogNumber;

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }): Promise<Metadata> {
  const { name } = await params;
  let decoded = name;
  try { decoded = decodeURIComponent(name); } catch { /* The page will return notFound. */ }
  return { title: `${decoded} Habitability Profile | Exoplanet Explorer` };
}

export default async function RealPlanetHabitability({ params, searchParams }: { params: Promise<{ name: string }>; searchParams: Promise<{ section?: string | string[]; search?: string | string[] }> }) {
  const { name } = await params;
  const query = await searchParams;
  let decodedName: string;
  try { decodedName = decodeURIComponent(name); } catch { notFound(); }
  const planet = (planets as Planet[]).find(p => p.pl_name.toLowerCase() === decodedName.toLowerCase());
  if (!planet) notFound();
  const section = getHabitableZoneSection(typeof query.section === "string" ? query.section : null);
  const returnParams = new URLSearchParams();
  if (section !== "catalog") returnParams.set("section", section);
  if (section === "investigate") returnParams.set("case", planet.pl_name);
  if (section === "catalog" && typeof query.search === "string" && query.search.trim()) returnParams.set("search", query.search);
  const returnQuery = returnParams.toString();
  const returnHref = `/lab/hz${returnQuery ? `?${returnQuery}` : ""}`;
  const starType = getStarType(planet.st_teff);
  const starTypeLabel = starType === "Unknown" ? "type unknown" : `${starType}-type star`;
  const { flux, zone, orbit, inner, outer } = assessHabitability(planet);
  const radius = publishedRadius(planet);
  const radiusEstimate = estimatedRadius(planet);
  const mass = catalogMass(planet);
  const radiusKnown = radius !== null;
  const smallWorld = radius !== null && radius >= 0.5 && radius <= 1.8;
  const verdict = zone === "inside-orbit" ? "Too much starlight" : zone === "outside-orbit" ? "Too little starlight" : zone === "unknown" ? "Not enough data" : smallWorld ? "Potentially habitable" : radiusKnown ? "In the zone, outside our size criteria" : "In the zone, size unknown";
  const verdictNote = zone === "in-zone" && smallWorld ? "Meets our starting size and starlight criteria. Water, atmosphere, and life are not confirmed." : zone === "in-zone" && !radiusKnown ? "Starlight is within the reference range, but a published radius is unavailable for the small-world screen." : zone === "in-zone" ? "Starlight is within the reference range, but the small-world starting screen is not satisfied." : zone === "unknown" ? "Starlight information is missing, so we cannot place this planet relative to the reference zone." : "Based on the reference starlight range of 0.35–1.7 times Earth’s.";
  const verdictStyle = zone === "in-zone" && smallWorld ? "border-teal-200 bg-teal-50 text-teal-900" : zone === "inside-orbit" ? "border-rose-200 bg-rose-50 text-rose-900" : zone === "outside-orbit" ? "border-sky-200 bg-sky-50 text-sky-900" : "border-slate-200 bg-slate-50 text-slate-800";
  const title = zone === "in-zone" ? "Within the reference habitable zone" : zone === "inside-orbit" ? "Closer than the reference habitable zone" : zone === "outside-orbit" ? "Beyond the reference habitable zone" : "Habitable-zone position unknown";
  const explanation = zone === "in-zone" ? "Its starlight falls within our reference range. With a suitable atmosphere and pressure, surface liquid water could be possible; this does not confirm water or life." : zone === "inside-orbit" ? "It receives more starlight than our reference range, placing it on the hotter, starward side of the zone." : zone === "outside-orbit" ? "It receives less starlight than our reference range, placing it on the colder, outward side of the zone." : "The catalog lacks the starlight and temperature information needed for this assessment. Unknown does not mean uninhabitable.";
  const scale = outer && orbit ? Math.max(outer * 1.5, orbit * 1.15) : null;
  const position = (value: number) => scale ? value / scale * 100 : 0;
  const measurements = [
    ["Radius", radius !== null ? format(radius, " × Earth") : radiusEstimate !== null ? `Unknown; NASA model estimate: ${format(radiusEstimate, " × Earth")}` : "Unknown"], [mass?.label ?? "Mass", format(mass?.value, " × Earth")],
    ["Starlight", flux ? `${format(flux.value, " × Earth")}${flux.estimated ? " (estimated)" : ""}` : "Unknown"],
    ["Orbital distance", format(orbit, " AU")], ["Year length", format(planet.pl_orbper, " days")],
    ["Equilibrium temperature", typeof planet.pl_eqt === "number" ? `${format(Math.round(planet.pl_eqt - 273.15), " °C")} (${format(planet.pl_eqt, " K")})` : "Unknown"],
  ];
  return <main className="site-page">
    <Link href={returnHref} className="text-sm font-semibold text-teal-800 underline">← Back to Habitable Zone Explorer</Link>
    <header className="mt-5"><p className="page-eyebrow">Real planet · Catalog assessment</p><h1 className="mt-2">{planet.pl_name}</h1><p className="mt-2 text-slate-600">Host star: {planet.hostname || "Unknown"} ({starTypeLabel}). Explore the evidence for this world’s possible conditions.</p></header>
    <PlanetResourceButtons name={planet.pl_name} className="mt-4" />
    <section aria-label="Habitability verdict" className={`mt-4 rounded-lg border px-5 py-4 ${verdictStyle}`}><p className="text-xs font-semibold uppercase tracking-wide">Habitability verdict · Starting criteria</p><h2 className="mt-1 text-2xl font-semibold">{verdict}</h2><p className="mt-1 text-sm leading-6">{verdictNote}{flux?.estimated ? " This assessment uses estimated starlight." : ""}</p></section>
    <div className="mt-6 grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="lab-panel p-5"><h2 className="font-semibold">Catalog values</h2><dl className="mt-4 space-y-3">{measurements.map(([label, value]) => <div key={label}><dt className="text-xs text-slate-500">{label}</dt><dd className="mt-1 text-sm font-semibold">{value}</dd></div>)}</dl><h3 className="mt-5 border-t border-slate-200 pt-4 font-semibold">Host star: {planet.hostname || "Unknown"}</h3><dl className="mt-3 space-y-3">{[["Type", starType === "Unknown" ? "Unknown" : `${starType}-type (estimated from temperature)`], ["Temperature", format(planet.st_teff, " K")], ["Radius", format(planet.st_rad, " × Sun")], ["Mass", format(planet.st_mass, " × Sun")], ["Distance from Earth", format(planet.sy_dist, " pc")]].map(([label,value]) => <div key={label}><dt className="text-xs text-slate-500">{label}</dt><dd className="text-sm font-semibold">{value}</dd></div>)}</dl></aside>
      <div className="space-y-5"><section className="lab-panel p-5 sm:p-6"><p className="page-eyebrow">Habitable-zone position</p><h2 className="mt-2 text-xl font-semibold">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{explanation}</p>
        {scale && inner && outer && orbit ? <figure className="mt-6"><div className="relative mx-3 h-24 rounded-lg" style={{background:`linear-gradient(to right, #fecdd3 0%, #fecdd3 ${position(inner)}%, #bbf7d0 ${position(inner)}%, #bbf7d0 ${position(outer)}%, #bae6fd ${position(outer)}%, #bae6fd 100%)`}}><span className="absolute left-0 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-300 shadow-sm" /><span className="absolute top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white bg-slate-950 shadow-lg" style={{left:`${position(orbit)}%`}} /><span className="absolute top-0 h-full border-l-2 border-emerald-700/60" style={{left:`${position(inner)}%`}} /><span className="absolute top-0 h-full border-l-2 border-emerald-700/60" style={{left:`${position(outer)}%`}} /></div><div className="mt-2 flex justify-between text-xs text-slate-500"><span>Host star · 0 AU</span><span>{format(scale, " AU")}</span></div><figcaption className="mt-3 text-xs leading-5 text-slate-600">Pink: more starlight · Green: reference habitable zone · Blue: less starlight.<br />{planet.pl_name} orbits at {format(orbit, " AU")}; reference zone: {format(inner)}–{format(outer, " AU")}. Diagram uses the listed orbit and starlight with the inverse-square relationship; sizes are symbolic.</figcaption></figure> : <p className="mt-4 rounded-md bg-slate-50 p-3 text-sm">An orbital diagram requires both starlight and orbital distance. Missing measurements are not replaced with a hypothetical planet.</p>}
      </section>
      <div className="flex flex-wrap gap-5 text-sm font-semibold text-teal-800"><a href="https://science.nasa.gov/exoplanets/habitable-zone/" target="_blank" rel="noreferrer" className="underline">NASA: Understanding the habitable zone ↗</a></div></div>
    </div>
  </main>;
}
