"use client";

import CandidateCatalog from "./CandidateCatalog";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { getHabitableZoneSection, type HabitableZoneSection } from "@/lib/habitability";
import FollowUpInvestigation from "./FollowUpInvestigation";
import planets from "@/data/planets.json";
import type { Planet } from "@/components/PlanetScatter";

type ZoneStatus = "too-hot" | "promising" | "too-cold";
type InfoKey = "starType" | "equilibriumTemp" | null;

const SOLAR_TEMP = 5772;
const EARTH_EQ_TEMP = 255;

const STAR_PRESETS = [
  {
    key: "m",
    name: "M dwarf",
    temp: 3300,
    radius: 0.35,
    note: "Cool, small, common stars. Their habitable zones are close in, so planets may be easier to detect by transit.",
  },
  {
    key: "k",
    name: "Cool orange star (K)",
    temp: 4600,
    radius: 0.7,
    note: "Cooler than the Sun and long-lived, K stars are often considered favorable targets in habitability studies.",
  },
  {
    key: "g",
    name: "Sun-like (G)",
    temp: 5772,
    radius: 1,
    note: "Sun-like. Earth receives about 1 S⊕ at 1 AU around this kind of star.",
  },
  {
    key: "f",
    name: "Hotter star (F)",
    temp: 6600,
    radius: 1.35,
    note: "Hotter and brighter than the Sun, pushing the habitable zone farther outward.",
  },
  {
    key: "a",
    name: "Bright star (A)",
    temp: 8500,
    radius: 1.8,
    note: "Bright stars with distant habitable zones, but shorter stellar lifetimes can limit long-term habitability.",
  },
];

const STAR_TYPE_EXPLANATION =
  "Astronomers sort stars by temperature and color. Hot blue-white stars are O, B, and A. Sun-like yellow stars are G. Cooler orange and red stars are K and M. The star type changes brightness, lifetime, and where the habitable zone sits.";

function luminosity(radius: number, temp: number) {
  return radius ** 2 * (temp / SOLAR_TEMP) ** 4;
}


function distanceForFlux(lum: number, flux: number) {
  return Math.sqrt(lum / flux);
}

function fluxAtDistance(lum: number, distance: number) {
  return lum / distance ** 2;
}

function equilibriumTemperature(flux: number, albedo: number) {
  return EARTH_EQ_TEMP * ((1 - albedo) / 0.7) ** 0.25 * flux ** 0.25;
}

function format(value: number | null | undefined, digits = 2) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "Unknown";
  return value.toLocaleString(undefined, { maximumFractionDigits: digits });
}

function statusForFlux(flux: number, innerFlux: number, outerFlux: number): ZoneStatus {
  if (flux > innerFlux) return "too-hot";
  if (flux < outerFlux) return "too-cold";
  return "promising";
}

function statusCopy(status: ZoneStatus) {
  if (status === "too-hot") return "Too much starlight";
  if (status === "too-cold") return "Too little starlight";
  return "Inside the habitable zone";
}

function InfoMarker({
  id,
  label,
  children,
  openInfo,
  onToggle,
}: {
  id: Exclude<InfoKey, null>;
  label: string;
  children: React.ReactNode;
  openInfo: InfoKey;
  onToggle: (id: InfoKey) => void;
}) {
  const open = openInfo === id;

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-label={label}
        onClick={() => onToggle(open ? null : id)}
        className="ml-2 grid h-5 w-5 place-items-center rounded-full border border-slate-300 bg-white text-[11px] font-bold text-slate-700 hover:border-emerald-400 hover:text-emerald-700"
      >
        i
      </button>
      {open ? (
        <span className="absolute left-0 top-7 z-40 w-[min(320px,calc(100vw-48px))] rounded-lg border border-slate-200 bg-white p-3 text-xs font-normal leading-5 text-slate-600 shadow-xl">
          {children}
        </span>
      ) : null}
    </span>
  );
}

export default function HabitableZoneClient() {
  const searchParams = useSearchParams();
  const tab = getHabitableZoneSection(searchParams.get("section"));
  const updateLocation = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    window.history.replaceState(null, "", `/lab/hz?${params.toString()}`);
  };
  const setTab = (section: HabitableZoneSection) => updateLocation("section", section);
  const [starKey, setStarKey] = useState("g");
  const [distance, setDistance] = useState(1);
  const [innerFlux, setInnerFlux] = useState(1.7);
  const [outerFlux, setOuterFlux] = useState(0.35);
  const [albedo, setAlbedo] = useState(0.3);
  const [greenhouse, setGreenhouse] = useState(33);
  const [openInfo, setOpenInfo] = useState<InfoKey>(null);

  const selectedStar = STAR_PRESETS.find((star) => star.key === starKey) ?? STAR_PRESETS[2];
  const starLuminosity = luminosity(selectedStar.radius, selectedStar.temp);
  const innerDistance = distanceForFlux(starLuminosity, innerFlux);
  const outerDistance = distanceForFlux(starLuminosity, outerFlux);
  const planetFlux = fluxAtDistance(starLuminosity, distance);
  const eqTemp = equilibriumTemperature(planetFlux, albedo);
  const surfaceTemp = eqTemp + greenhouse;
  const status = statusForFlux(planetFlux, innerFlux, outerFlux);
  const maxDistance = Math.max(5, distance, outerDistance * 1.8);
  const diagramMax = Math.max(0.1, outerDistance * 1.6, distance * 1.15);
  const planetPosition = Math.min(100, (distance / diagramMax) * 100);
  const innerPosition = Math.min(100, (innerDistance / diagramMax) * 100);
  const outerPosition = Math.min(100, (outerDistance / diagramMax) * 100);

  const resetEarth = () => {
    setStarKey("g"); setDistance(1); setAlbedo(0.3); setGreenhouse(33);
    setInnerFlux(1.7); setOuterFlux(0.35);
  };

  return (
    <main className="site-page ">
      <header className="page-intro" style={{ borderBottom: "none", paddingBottom: 0, marginBottom: 0 }}>
        <p className="page-eyebrow">Interactive lab</p>
        <h1 className="mt-2">Habitable Zone Explorer</h1>
        <p className="mt-3 leading-7 text-slate-700" style={{ maxWidth: "none" }}>Could another world support liquid water? Find promising real planets, experiment with the factors that shape their conditions, then investigate what observations reveal and what remains unknown.</p>
      </header>
      <div role="tablist" aria-label="Habitable Zone Explorer sections" className="section-nav">
        {([ ["catalog", "Explore real planets"], ["simulator", "Experiment with the simulator"], ["investigate", "Investigating Habitability"] ] as const).map(([key, label]) => <button key={key} id={`hz-${key}-tab`} role="tab" aria-selected={tab === key} aria-controls={`hz-${key}-panel`} tabIndex={tab === key ? 0 : -1} onKeyDown={event => {
          if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
          event.preventDefault();
          const keys = ["catalog", "simulator", "investigate"] as const;
          const next = event.key === "Home" ? keys[0] : event.key === "End" ? keys[2] : keys[(keys.indexOf(key) + (event.key === "ArrowRight" ? 1 : 2)) % keys.length];
          setTab(next); document.getElementById(`hz-${next}-tab`)?.focus();
        }} onClick={() => setTab(key)} className={`min-h-12 flex-[1_1_160px] cursor-pointer border-r border-slate-200 px-4 py-3.5 text-center text-sm font-semibold text-teal-800 last:border-r-0 hover:bg-teal-50 focus-visible:bg-teal-50 ${tab === key ? "bg-teal-50" : ""}`}>{label}</button>)}
      </div>
      <div id="hz-panel" className="scroll-mt-36">
      <div id="hz-catalog-panel" role="tabpanel" aria-labelledby="hz-catalog-tab" hidden={tab !== "catalog"}>
        <section className="lab-panel p-5 sm:p-6">
          <h2 className="text-xl font-semibold">What makes a planet potentially habitable?</h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">Life as we know it needs liquid water. A star’s habitable zone is where a suitable atmosphere could sustain surface water, farther from brighter stars and closer to dimmer ones. Atmosphere, pressure, composition, stellar activity, and water retention also matter. Small size and Earth-like starlight suggest promising targets, but do not confirm rocky surfaces, water, or life. <a href="https://science.nasa.gov/exoplanets/habitable-zone/" target="_blank" rel="noreferrer" className="font-semibold text-teal-800 underline">NASA: Understanding the habitable zone ↗</a></p>
        </section>
        <CandidateCatalog planets={planets as Planet[]} initialQuery={searchParams.get("search") ?? ""} />
      </div>
      <div id="hz-simulator-panel" role="tabpanel" aria-labelledby="hz-simulator-tab" hidden={tab !== "simulator"}>
        <div className="mb-5"><h2 className="text-xl font-semibold">Simulation of starlight received and planetary temperature</h2><p className="mt-2 text-sm leading-6 text-slate-600">In this section, choose a hypothetical planet’s star type and orbital distance to explore the starlight it receives and its estimated temperature, accounting for reflectivity and atmospheric warming. Start with Earth-like settings and change one variable at a time. We use a simplified average-temperature estimation model.</p></div>
      <section id="simulator" className="mt-4 space-y-4">
        <div className="lab-panel p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-semibold">Adjust your model</h2><button type="button" onClick={resetEarth} className="rounded-md border border-teal-200 bg-teal-50 px-3 py-1.5 text-sm font-semibold text-teal-800">Reset to Earth</button></div>
          <div className="mt-3 grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div>
              <div className="flex items-center text-sm font-semibold text-slate-950">Star type<InfoMarker id="starType" label="What does each star type mean?" openInfo={openInfo} onToggle={setOpenInfo}>{STAR_TYPE_EXPLANATION}</InfoMarker></div>
              <div className="mt-2 flex flex-wrap gap-2">{STAR_PRESETS.map(star => <button key={star.key} type="button" onClick={() => setStarKey(star.key)} className={`rounded-md border px-3 py-2 text-left text-sm ${starKey === star.key ? "border-emerald-500 bg-emerald-50 text-emerald-950" : "border-slate-200 hover:border-emerald-300"}`}>{star.name}</button>)}</div>
              <p className="mt-2 text-xs leading-5 text-slate-500">{selectedStar.note}</p>
            </div>
            <div><label className="flex justify-between text-sm font-semibold text-slate-950">Orbital distance<span>{format(distance)} AU</span></label><input type="range" aria-label="Orbital distance" min={0.001} max={maxDistance} step={0.001} value={distance} onChange={event => setDistance(Number(event.target.value))} className="mt-2 w-full" /><p className="mt-1 text-xs leading-5 text-slate-600">1 AU is Earth’s distance from the Sun; 1 S⊕ is Earth’s starlight.</p></div>
          </div>

        </div>

        <div className="space-y-4">
          <section className="lab-panel p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">Your test planet</h2>
                <p className="mt-1 text-sm text-slate-600">
                  {selectedStar.name}: {starLuminosity.toLocaleString(undefined, { maximumSignificantDigits: 3 })} L☉, habitable zone from{" "}
                  {format(innerDistance)} to {format(outerDistance)} AU.
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-sm font-semibold ${
                  status === "promising"
                    ? "bg-emerald-50 text-emerald-700"
                    : status === "too-hot"
                      ? "bg-rose-50 text-rose-700"
                      : "bg-sky-50 text-sky-700"
                }`}
              >
                {statusCopy(status)}
              </span>
            </div>

            <div className="mt-6">
              <div className="relative h-20 rounded-lg" style={{ background: `linear-gradient(to right, #fecdd3 0%, #fecdd3 ${innerPosition}%, #bbf7d0 ${innerPosition}%, #bbf7d0 ${outerPosition}%, #bae6fd ${outerPosition}%, #bae6fd 100%)` }}>
                <div
                  className="absolute top-0 h-full border-l-2 border-emerald-700/60"
                  style={{ left: `${innerPosition}%` }}
                />
                <div
                  className="absolute top-0 h-full border-l-2 border-emerald-700/60"
                  style={{ left: `${outerPosition}%` }}
                />
                <div
                  className="absolute top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white bg-slate-950 shadow-lg"
                  style={{ left: `${planetPosition}%` }}
                />
                <div className="absolute left-3 top-3 h-9 w-9 rounded-full bg-yellow-300 shadow-[0_0_28px_rgba(250,204,21,0.9)]" />
              </div>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs font-medium text-slate-600"><span>Pink: too much starlight</span><span>Green: habitable-zone starlight</span><span>Blue: too little starlight</span></div>
              <div className="relative mt-4 h-8 border-t border-slate-300 text-[10px] text-slate-600"><span className="absolute left-0 top-1">0 AU</span>{diagramMax > 1.3 ? <span className="absolute top-1 -translate-x-1/2" style={{ left: `${100 / diagramMax}%` }}>1 AU reference</span> : null}<span className="absolute right-0 top-1">{format(diagramMax)} AU</span></div>
              <p className="text-xs leading-5 text-slate-600">Zone boundaries: {format(innerDistance, 3)}–{format(outerDistance, 3)} AU. Planet orbit: {format(distance, 3)} AU. The distance scale adapts to keep the zone and planet visible.</p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-teal-200 bg-teal-50 p-4">
                <div className="text-sm font-bold text-teal-900">Starlight received</div>
                <div className="mt-2 text-3xl font-bold tracking-tight text-teal-950 sm:text-4xl">{format(planetFlux)} S⊕</div><p className="mt-2 text-xs text-slate-600">Incoming energy relative to Earth = 1.</p>
              </div>
              <div className="rounded-lg border border-teal-200 bg-teal-50 p-4">
                <div className="flex items-center text-sm font-bold text-teal-900">
                  Equilibrium temperature
                  <InfoMarker
                    id="equilibriumTemp"
                    label="What is equilibrium temperature?"
                    openInfo={openInfo}
                    onToggle={setOpenInfo}
                  >
                    Equilibrium temperature is the simple no-atmosphere temperature
                    a planet would have after balancing absorbed starlight with
                    heat radiated back to space. Real surfaces can be warmer or
                    colder because of atmosphere, clouds, oceans, ice, and geology.
                  </InfoMarker>
                </div>
                <div className="mt-2 text-3xl font-bold tracking-tight text-teal-950 sm:text-4xl">{format(eqTemp - 273.15, 0)} °C <span className="text-sm font-medium text-slate-600">({format(eqTemp, 0)} K)</span></div><p className="mt-2 text-xs text-slate-600">Energy balance without atmospheric warming.</p>
              </div>
              <div className="rounded-lg border border-teal-200 bg-teal-50 p-4">
                <div className="text-sm font-bold text-teal-900">Estimated surface temperature</div>
                <div className="mt-2 text-3xl font-bold tracking-tight text-teal-950 sm:text-4xl">{format(surfaceTemp - 273.15, 0)} °C <span className="text-sm font-medium text-slate-600">({format(surfaceTemp, 0)} K)</span></div><p className="mt-2 text-xs text-slate-600">Equilibrium temperature + your warming setting.</p>
              </div>
            </div>
          </section>

          <div className="space-y-2">
            <details className="rounded-md border border-slate-200 bg-slate-50">
              <summary className="cursor-pointer px-3 py-2 text-sm font-semibold text-teal-800">Habitable-zone boundary assumptions <span className="font-normal text-slate-600">· {format(outerFlux)}–{format(innerFlux)} S⊕</span></summary>
              <div className="grid gap-4 border-t border-slate-200 p-3 sm:grid-cols-2">
                <div><label className="text-xs font-medium text-slate-600">Inner edge: {format(innerFlux)} S⊕</label><input type="range" aria-label="Simulator inner starlight boundary" min={0.9} max={2.2} step={0.05} value={innerFlux} onChange={event => setInnerFlux(Number(event.target.value))} className="mt-1 w-full" /></div>
                <div><label className="text-xs font-medium text-slate-600">Outer edge: {format(outerFlux)} S⊕</label><input type="range" aria-label="Simulator outer starlight boundary" min={0.15} max={0.8} step={0.05} value={outerFlux} onChange={event => setOuterFlux(Number(event.target.value))} className="mt-1 w-full" /></div>
                <p className="text-xs leading-5 text-slate-600">Choose the minimum and maximum starlight for the green band. Each edge is placed at <strong>d = √(L / Sₑdge)</strong>, using star luminosity L. These approximate classroom assumptions change the band and location badge, but not incoming starlight, temperature, or the physical orbit. A green-band position is a starlight check, not proof of liquid water or life.</p><button type="button" onClick={() => { setInnerFlux(1.7); setOuterFlux(0.35); }} className="text-left text-xs font-semibold text-teal-800 hover:underline">Reset standard classroom preset</button>
              </div>
            </details>
            <details className="rounded-md border border-slate-200 bg-slate-50">
              <summary className="cursor-pointer px-3 py-2 text-sm font-semibold text-teal-800">Planet reflectivity <span className="font-normal text-slate-600">· {format(albedo, 2)}</span></summary>
              <div className="grid items-center gap-4 border-t border-slate-200 p-3 sm:grid-cols-2"><input type="range" aria-label="Planet reflectivity" min={0.05} max={0.75} step={0.01} value={albedo} onChange={event => setAlbedo(Number(event.target.value))} className="w-full" /><p className="text-xs leading-5 text-slate-600">Reflectivity (albedo) is the fraction of incoming light reflected away. A higher value reduces absorbed energy, lowering both temperature estimates; incoming starlight and orbital position stay the same. The calculation assumes evenly redistributed heat and idealized thermal radiation.</p></div>
            </details>
            <details className="rounded-md border border-slate-200 bg-slate-50">
              <summary className="cursor-pointer px-3 py-2 text-sm font-semibold text-teal-800">Greenhouse effect <span className="font-normal text-slate-600">· +{format(greenhouse, 0)} K</span></summary>
              <div className="grid items-center gap-4 border-t border-slate-200 p-3 sm:grid-cols-2"><input type="range" aria-label="Greenhouse warming" min={0} max={100} step={1} value={greenhouse} onChange={event => setGreenhouse(Number(event.target.value))} className="w-full" /><p className="text-xs leading-5 text-slate-600">Adds the chosen warming in kelvin to equilibrium temperature. Only the estimated surface temperature changes; the orbit and zone boundaries stay the same. This adjustable offset is a teaching simplification, not a calculation from atmospheric composition. The model does not calculate weather, clouds, climate feedbacks, or atmospheric pressure. <a href="https://science.nasa.gov/earth/earth-observatory/climate-and-earths-energy-budget/" target="_blank" rel="noopener noreferrer" className="font-semibold text-teal-800 underline">NASA: Earth’s energy budget ↗</a></p></div>
            </details>
          </div>

          <section className="lab-panel p-4 text-sm leading-6 sm:p-5" aria-labelledby="simulation-calculations-heading">
            <h3 id="simulation-calculations-heading" className="font-semibold">How the simulator calculates these results</h3>
            <ol className="mt-2 list-decimal space-y-2 pl-5 text-slate-700">
              <li><strong>Star brightness → incoming starlight.</strong> Each star preset has a radius R (in Sun radii) and temperature T. Its relative luminosity is <span className="font-semibold">L = R² × (T / 5,772 K)⁴</span>. At orbital distance d (in AU), <span className="font-semibold">S = L / d²</span>. Moving twice as far away gives one-quarter as much starlight.</li>
              <li><strong>Absorbed starlight → equilibrium temperature.</strong> The model balances absorbed energy against emitted heat, averaged across the whole planet. With reflectivity A, <span className="font-semibold">Tₑq = 255 K × [S × (1 − A) / 0.7]<sup>¼</sup></span>. The fourth root comes from heat radiation increasing with temperature to the fourth power. Earth’s reference reflectivity is 0.30, so 70% of incoming energy is absorbed.</li>
              <li><strong>Add atmospheric warming.</strong> <span className="font-semibold">Estimated surface temperature = Tₑq + warming</span>. The default adds 33 K: at Earth’s starlight and reflectivity, 255 K becomes 288 K (about 15 °C). Calculations use kelvin; displayed Celsius values subtract 273.15.</li>
            </ol>
          </section>


        </div>
      </section>


      <section className="mt-6 lab-panel p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-950">Suggested follow-up investigations</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {[
            "Find the distance where an Earth-like planet would receive habitable-zone levels of starlight around an M dwarf. What changed?",
            "Keep the star and orbit fixed, then increase atmospheric warming. How does estimated temperature change while the starlight badge stays the same?",
            "Pick one real candidate and identify what follow-up data scientists would still need.",
          ].map((activity) => (
            <div key={activity} className="rounded-lg bg-slate-50 p-4 text-sm font-medium leading-6 text-slate-700">
              {activity}
            </div>
          ))}
        </div>
      </section>
      </div>
      <div id="hz-investigate-panel" role="tabpanel" aria-labelledby="hz-investigate-tab" hidden={tab !== "investigate"}>
        {tab === "investigate" && <FollowUpInvestigation planets={planets as Planet[]} selectedName={searchParams.get("case") ?? "TRAPPIST-1 e"} onSelect={name => updateLocation("case", name)} />}
      </div>
      </div>
    </main>
  );
}
