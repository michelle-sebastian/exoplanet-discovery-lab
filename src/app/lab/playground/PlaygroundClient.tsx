// src/app/lab/playground/PlaygroundClient.tsx
"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import PlanetResourceButtons from "@/components/PlanetResourceButtons";
import { discoveryColors } from "@/lib/discovery-colors";
import { STAR_TYPES, getStarType } from "@/lib/star-types";
import PlanetScatter, {
  Planet,
  type NumericPlanetField,
} from "@/components/PlanetScatter";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

interface PlaygroundClientProps {
  planets: Planet[];
  chartReadyCount: number;
  datasetRefreshedAt: string;
}

type RangeValue = [number, number];
type FilterKey =
  | "radius"
  | "eqTemp"
  | "insolation"
  | "distance"
  | "period"
  | "starType"
  | "method"
  | "planetType";
type InfoKey = FilterKey | null;
type ColorMode = "planetType" | "method" | "starType";

interface AxisOption {
  field: NumericPlanetField;
  label: string;
  unit: string;
  scale: "linear" | "log";
}

const RADIUS_RANGE: RangeValue = [0, 78];
const EQ_TEMP_RANGE: RangeValue = [0, 3000];
const INSOLATION_RANGE: RangeValue = [0, 10000];
const DISTANCE_RANGE: RangeValue = [0, 3000];

const EARTH = {
  pl_rade: 1,
  pl_masse: 1,
  pl_eqt: 255,
  pl_insol: 1,
  pl_orbper: 365.25,
  sy_dist: 0,
  st_teff: 5772,
  st_rad: 1,
  st_mass: 1,
};

const PLANET_TYPES = [
  "Sub-Earth",
  "Earth-size",
  "Super-Earth",
  "Mini-Neptune",
  "Hot Neptune",
  "Neptune-like",
  "Gas giant",
  "Hot Jupiter",
  "Unclassified",
] as const;

export const TYPE_COLORS: Record<string, string> = {
  "Sub-Earth": "#64748b",
  "Earth-size": "#16a34a",
  "Super-Earth": "#0891b2",
  "Mini-Neptune": "#2563eb",
  "Hot Neptune": "#ea580c",
  "Neptune-like": "#7c3aed",
  "Gas giant": "#ca8a04",
  "Hot Jupiter": "#dc2626",
  Unclassified: "#94a3b8",
};

const PLANET_TYPE_DETAILS: Record<string, { range: string; description: string }> = {
  "Sub-Earth": {
    range: "< 0.8 R⊕",
    description: "Smaller than Earth. Often hard to detect unless they orbit close to their stars.",
  },
  "Earth-size": {
    range: "0.8-1.25 R⊕",
    description: "Roughly Earth-sized worlds. Size alone does not prove they are rocky or habitable.",
  },
  "Super-Earth": {
    range: "1.25-2 R⊕",
    description: "Larger than Earth but smaller than Neptune. They may be rocky, ocean-rich, or gas-covered.",
  },
  "Mini-Neptune": {
    range: "2-3.9 R⊕",
    description: "Between super-Earths and Neptune, often interpreted as planets with thick atmospheres.",
  },
  "Hot Neptune": {
    range: "3.9-8 R⊕, hot/close-in",
    description: "Neptune-sized planets receiving intense starlight or orbiting very close to their stars.",
  },
  "Neptune-like": {
    range: "3.9-8 R⊕",
    description: "Ice-giant-scale planets broadly comparable to Uranus or Neptune in size.",
  },
  "Gas giant": {
    range: ">= 8 R⊕",
    description: "Large Jupiter- or Saturn-scale worlds dominated by gas rather than solid surface.",
  },
  "Hot Jupiter": {
    range: ">= 8 R⊕, hot/close-in",
    description: "Gas giants orbiting very close to their stars, usually with extremely hot atmospheres.",
  },
  Unclassified: {
    range: "radius unknown",
    description: "Rows without enough radius information for this simple size-based classroom classifier.",
  },
};

export const STAR_TYPE_COLORS: Record<string, string> = {
  O: "#2563eb",
  B: "#38bdf8",
  A: "#93c5fd",
  F: "#fde68a",
  G: "#facc15",
  K: "#fb923c",
  M: "#ef4444",
  Unknown: "#64748b",
};

export const AXIS_OPTIONS: AxisOption[] = [
  { field: "pl_rade", label: "Planet radius", unit: " R⊕", scale: "linear" },
  { field: "pl_orbper", label: "Orbital period", unit: " days", scale: "log" },
  { field: "pl_eqt", label: "Equilibrium temperature", unit: " K", scale: "linear" },
  { field: "pl_insol", label: "Starlight received", unit: " S⊕", scale: "log" },
  { field: "pl_orbsmax", label: "Orbital distance", unit: " AU", scale: "log" },
  { field: "sy_dist", label: "Distance from Earth", unit: " pc", scale: "log" },
  { field: "st_teff", label: "Host star temperature", unit: " K", scale: "linear" },
  { field: "disc_year", label: "Discovery year", unit: "", scale: "linear" },
];

const CHART_PRESETS = [
  {
    label: "Compare planet sizes and years",
    x: "pl_orbper" as NumericPlanetField,
    y: "pl_rade" as NumericPlanetField,
    color: "method" as ColorMode,
    description:
      "Compares the length of a planet's year with its size. This view is good for seeing why short-period planets and large planets are easier to find.",
  },
  {
    label: "Explore different planet types",
    x: "pl_orbper" as NumericPlanetField,
    y: "pl_rade" as NumericPlanetField,
    color: "planetType" as ColorMode,
    description:
      "Uses orbital period on the x-axis and radius on the y-axis, colored by planet type. It helps students see how size categories cluster across short and long orbits.",
  },
  {
    label: "Compare size and temperature",
    x: "pl_rade" as NumericPlanetField,
    y: "pl_eqt" as NumericPlanetField,
    color: "planetType" as ColorMode,
    description:
      "Compares planet size with estimated no-atmosphere temperature. It separates small cool candidates from very hot close-in worlds.",
  },
  {
    label: "Explore stars and orbits",
    x: "st_teff" as NumericPlanetField,
    y: "pl_orbsmax" as NumericPlanetField,
    color: "starType" as ColorMode,
    description:
      "Compares host star temperature with orbital distance. This shows how planets around cooler and hotter stars occupy different orbital neighborhoods.",
  },
  {
    label: "How have discoveries changed?",
    x: "disc_year" as NumericPlanetField,
    y: "pl_rade" as NumericPlanetField,
    color: "method" as ColorMode,
    description:
      "Shows discovery year on the x-axis and planet radius on the y-axis. It highlights how new missions changed the kinds of planets astronomers found.",
  },
] as const;

const FILTER_INFO: Record<FilterKey, { title: string; body: ReactNode }> = {
  radius: {
    title: "Planet radius",
    body: (
      <>
        Radius tells how wide a planet is compared with Earth. It is one of the
        quickest ways to separate Earth-size worlds, super-Earths, Neptune-like
        planets, and giant planets.
      </>
    ),
  },
  eqTemp: {
    title: "Equilibrium temperature",
    body: (
      <>
        This is a simple no-atmosphere temperature estimate based on absorbed
        starlight. It helps screen for planets that are likely too hot, likely
        too cold, or worth a closer look, but it does not include atmosphere,
        clouds, oceans, greenhouse warming, or seasons. For small distant
        planets, detecting an atmosphere is still very difficult.
      </>
    ),
  },
  insolation: {
    title: "Insolation flux",
    body: (
      <>
        Insolation is how much starlight a planet receives compared with Earth.
        Earth is 1 S⊕. This is one of the most useful habitability clues because
        too much starlight can overheat a planet and too little can freeze it.
      </>
    ),
  },
  distance: {
    title: "Distance from Earth",
    body: (
      <>
        This is how far the planetary system is from us, measured in parsecs.
        Nearby systems are easier to follow up with powerful telescopes, while
        distant systems can be much harder to study in detail.
      </>
    ),
  },
  period: {
    title: "Orbital period",
    body: (
      <>
        Orbital period is the length of a planet&apos;s year. Short-period planets
        orbit close to their stars and are easier to detect by repeated transits,
        which is one reason catalogs contain many close-in worlds.
      </>
    ),
  },
  starType: {
    title: "Host star type",
    body: (
      <>
        Star type is based mainly on star temperature. Hot stars push their
        habitable zones farther out; cool red stars have closer-in habitable
        zones. The star also affects radiation, lifetime, and how easy planets
        are to detect.
      </>
    ),
  },
  method: {
    title: "Discovery method",
    body: (
      <>
        Discovery method tells which observational technique found the planet.
        Different methods favor different planets, so this filter helps students
        see how scientific tools shape the catalog.
      </>
    ),
  },
  planetType: {
    title: "Planet type",
    body: (
      <>
        These categories are classroom-friendly labels estimated from radius,
        orbital period, and temperature. They are useful for pattern finding, but
        real classification can require mass, density, atmosphere, and better
        follow-up observations. Every planet with a known radius is assigned to
        exactly one category; rows without radius are marked unclassified.{" "}
        <Link href="/#planet-types" className="font-semibold text-teal-700 hover:underline">
          See the full type guide
        </Link>
        .
      </>
    ),
  },
};

function clampRange([low, high]: RangeValue, min: number, max: number): RangeValue {
  return [Math.max(min, Math.min(low, max)), Math.max(min, Math.min(high, max))];
}

function isFullRange(value: RangeValue, full: RangeValue) {
  return value[0] === full[0] && value[1] === full[1];
}

function formatNumber(value: number | null | undefined, suffix = "") {
  if (typeof value !== "number" || Number.isNaN(value)) return "Unknown";
  return `${Number.isInteger(value) ? value : value.toLocaleString(undefined, { maximumFractionDigits: 2 })}${suffix}`;
}

function formatYear(value: number | null | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) return "Unknown";
  return `${Math.round(value)}`;
}

function formatRange(value: RangeValue, unit: string) {
  return `${value[0].toLocaleString()}-${value[1].toLocaleString()} ${unit}`;
}

function getInsolation(planet: Planet) {
  if (typeof planet.pl_insol === "number") return planet.pl_insol;
  if (typeof planet.pl_eqt !== "number" || planet.pl_eqt <= 0) return null;
  return (planet.pl_eqt / EARTH.pl_eqt) ** 4;
}

function formatInsolation(planet: Planet) {
  const value = getInsolation(planet);
  if (value === null) return "Unknown";
  return `${value.toLocaleString(undefined, { maximumFractionDigits: 2 })} S⊕${
    typeof planet.pl_insol === "number" ? "" : " est."
  }`;
}

export function getPlanetType(planet: Planet) {
  const radius = planet.pl_rade;
  const hot =
    (typeof planet.pl_eqt === "number" && planet.pl_eqt >= 700) ||
    (typeof planet.pl_orbper === "number" && planet.pl_orbper <= 10);

  if (typeof radius !== "number") return "Unclassified";
  if (radius < 0.8) return "Sub-Earth";
  if (radius < 1.25) return "Earth-size";
  if (radius < 2) return "Super-Earth";
  if (radius < 3.9) return "Mini-Neptune";
  if (radius < 8) return hot ? "Hot Neptune" : "Neptune-like";
  return hot ? "Hot Jupiter" : "Gas giant";
}

function axisOption(field: NumericPlanetField) {
  return AXIS_OPTIONS.find((option) => option.field === field) ?? AXIS_OPTIONS[0];
}

function RangeSlider({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  logScale = false,
  onChange,
}: {
  label: string;
  value: RangeValue;
  min: number;
  max: number;
  step?: number;
  unit: string;
  logScale?: boolean;
  onChange: (value: RangeValue) => void;
}) {
  const valueToPercent = (next: number) => {
    if (!logScale) return ((next - min) / (max - min)) * 100;
    if (next <= 0) return 0;

    const logMin = Math.log10(0.01);
    const logMax = Math.log10(max);
    return ((Math.log10(Math.max(next, 0.01)) - logMin) / (logMax - logMin)) * 100;
  };

  const percentToValue = (percent: number) => {
    if (!logScale) return min + ((max - min) * percent) / 100;
    if (percent <= 0) return 0;

    const logMin = Math.log10(0.01);
    const logMax = Math.log10(max);
    const next = 10 ** (logMin + ((logMax - logMin) * percent) / 100);
    return Math.round(next * 100) / 100;
  };

  const minPercent = valueToPercent(value[0]);
  const maxPercent = valueToPercent(value[1]);
  const inputMin = logScale ? 0 : min;
  const inputMax = logScale ? 1000 : max;
  const inputStep = logScale ? 1 : step;
  const lowInputValue = logScale ? minPercent * 10 : value[0];
  const highInputValue = logScale ? maxPercent * 10 : value[1];

  const updateLow = (nextLow: number) => {
    const actualLow = logScale ? percentToValue(nextLow / 10) : nextLow;
    onChange(clampRange([Math.min(actualLow, value[1]), value[1]], min, max));
  };

  const updateHigh = (nextHigh: number) => {
    const actualHigh = logScale ? percentToValue(nextHigh / 10) : nextHigh;
    onChange(clampRange([value[0], Math.max(actualHigh, value[0])], min, max));
  };

  return (
    <div>
      <div className="mb-2 flex items-start justify-between gap-3">
        <label className="text-sm font-medium">{label}</label>
        <span className="shrink-0 text-sm font-semibold text-slate-800">
          {value[0].toLocaleString()}-{value[1].toLocaleString()} {unit}
        </span>
      </div>
      <div className="relative h-8">
        <div className="absolute left-0 right-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-slate-200" />
        <div
          className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-teal-600"
          style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
        />
        <input
          type="range"
          min={inputMin}
          max={inputMax}
          step={inputStep}
          value={lowInputValue}
          onChange={(e) => updateLow(Number(e.target.value))}
          className="range-thumb absolute inset-x-0 top-0 h-8 w-full appearance-none bg-transparent"
          aria-label={`${label} minimum`}
        />
        <input
          type="range"
          min={inputMin}
          max={inputMax}
          step={inputStep}
          value={highInputValue}
          onChange={(e) => updateHigh(Number(e.target.value))}
          className="range-thumb absolute inset-x-0 top-0 h-8 w-full appearance-none bg-transparent"
          aria-label={`${label} maximum`}
        />
      </div>
      <p className="mt-1 text-xs text-gray-500">
        {min.toLocaleString()}-{max.toLocaleString()} {unit}
        {logScale ? " filters a logarithmic insolation scale." : ""}
      </p>
    </div>
  );
}

function FilterButton({
  title,
  summary,
  active,
  infoOpen,
  infoTitle,
  infoBody,
  children,
  onClick,
  onInfoClick,
  onApply,
}: {
  title: string;
  summary: string;
  active: boolean;
  infoOpen: boolean;
  infoTitle: string;
  infoBody: ReactNode;
  children: ReactNode;
  onClick: () => void;
  onInfoClick: () => void;
  onApply: () => void;
}) {
  return (
    <div className="relative">
      <div
        className={`flex h-16 w-full min-w-0 items-center justify-between gap-3 rounded-md border bg-white px-4 text-left  transition ${
          active
            ? "border-teal-500 bg-teal-50"
            : "border-slate-200 bg-white hover:border-teal-300"
        }`}
      >
        <button type="button" onClick={onClick} className="min-w-0 flex-1 text-left">
          <span className="block text-sm font-semibold text-slate-950">{title}</span>
          <span className="block truncate text-xs text-slate-500">{summary}</span>
        </button>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            aria-label={`Learn about ${title}`}
            onClick={onInfoClick}
            className={`grid h-6 w-6 place-items-center rounded-full border text-xs font-bold ${
              infoOpen
                ? "border-teal-500 bg-teal-50 text-teal-800"
                : "border-slate-300 bg-white text-slate-600 hover:border-teal-400"
            }`}
          >
            i
          </button>
          <button
            type="button"
            aria-label={`Open ${title} filter`}
            onClick={onClick}
            className="text-lg leading-none text-slate-400"
          >
            {active ? "×" : "⌄"}
          </button>
        </div>
      </div>

      {infoOpen ? (
        <div className="absolute left-0 top-[calc(100%+8px)] z-40 w-[min(380px,calc(100vw-48px))] rounded-lg border border-slate-200 bg-white p-4 text-sm shadow-xl">
          <div className="font-semibold text-slate-950">{infoTitle}</div>
          <p className="mt-2 leading-6 text-slate-600">{infoBody}</p>
        </div>
      ) : null}

      {active ? (
        <div className="absolute left-0 top-[calc(100%+8px)] z-30 w-[min(360px,calc(100vw-48px))] rounded-lg border border-slate-200 bg-white p-4 shadow-xl">
          {children}
          <div className="mt-2 flex justify-end border-t border-slate-100 pt-2">
            <button
              type="button"
              onClick={onApply}
              className="rounded bg-teal-700 px-2 py-0.5 text-xs font-semibold text-white  hover:bg-teal-800"
            >
              Apply
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function DetailRow({
  label,
  planet,
  earth,
}: {
  label: string;
  planet: string;
  earth: string;
}) {
  return (
    <div className="grid grid-cols-[1.2fr_1fr_1fr] gap-3 border-b border-slate-100 py-2 text-sm">
      <div className="font-medium text-slate-600">{label}</div>
      <div className="text-center text-slate-950">{planet}</div>
      <div className="text-center text-slate-500">{earth}</div>
    </div>
  );
}

export function PlanetDetailsPanel({
  planet,
  onClose,
}: {
  planet: Planet | null;
  onClose: () => void;
}) {
  if (!planet) return null;

  const starType = getStarType(planet.st_teff);
  const planetType = getPlanetType(planet);
  const typeDetails = PLANET_TYPE_DETAILS[planetType];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/30" onClick={onClose}>
      <aside
        className="ml-auto flex h-full w-full max-w-4xl flex-col overflow-y-auto bg-white p-5 sm:p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto w-full max-w-3xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
              Planet profile
            </p>
            <h3 className="mt-1 text-2xl font-bold text-slate-950">{planet.pl_name}</h3>
            <p className="text-sm text-slate-600">
              Host Star: {planet.hostname ?? "Unknown"} · Discovery Method:{" "}
              {planet.discoverymethod ?? "Unknown"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-slate-200 px-3 py-1 text-sm font-medium hover:bg-slate-50"
          >
            Close
          </button>
        </div>

        <PlanetResourceButtons name={planet.pl_name} className="mb-6" />

        <div className="mb-6 grid gap-3 text-center sm:grid-cols-3">
          <div className="rounded-lg bg-teal-50 p-3">
            <div className="text-xs font-semibold text-teal-800">Planet type</div>
            <div className="mt-1 text-sm font-semibold text-teal-950">{planetType}</div>
            <div className="mt-1 text-xs text-teal-900">{typeDetails.range}</div>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <div className="text-xs font-semibold text-slate-500">Discovery year</div>
            <div className="mt-1 text-sm font-semibold text-slate-950">
              {formatYear(planet.disc_year)}
            </div>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <div className="text-xs font-semibold text-slate-500">Host star type</div>
            <div className="mt-1 text-sm font-semibold text-slate-950">{starType}</div>
          </div>
        </div>

        <p className="mb-6 rounded-lg border border-teal-100 bg-white p-3 text-sm leading-6 text-slate-600">
          {typeDetails.description}
        </p>

        <div className="mb-6">
          <h4 className="font-semibold text-slate-950">How does {planet.pl_name} compare with Earth?</h4>
          <p className="mb-4 mt-2 text-sm leading-6 text-slate-600">Earth provides a familiar reference for this planet’s size, mass, orbit, and temperature. Compare the measurements side by side; “Unknown” means the catalog does not yet provide that value.</p>
          <div className="grid grid-cols-[1.2fr_1fr_1fr] gap-3 border-b border-slate-300 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <div>Property</div>
            <div className="text-center">{planet.pl_name}</div>
            <div className="text-center">Earth</div>
          </div>
          <DetailRow label="Radius" planet={formatNumber(planet.pl_rade, " R⊕")} earth={`${EARTH.pl_rade} R⊕`} />
          <DetailRow label="Mass" planet={formatNumber(planet.pl_masse, " M⊕")} earth={`${EARTH.pl_masse} M⊕`} />
          <DetailRow label="Orbital period" planet={formatNumber(planet.pl_orbper, " days")} earth={`${EARTH.pl_orbper} days`} />
          <DetailRow label="Orbital distance" planet={formatNumber(planet.pl_orbsmax, " AU")} earth="1 AU" />
          <DetailRow label="Equilibrium temp." planet={formatNumber(planet.pl_eqt, " K")} earth={`${EARTH.pl_eqt} K`} />
          <DetailRow label="Insolation" planet={formatInsolation(planet)} earth={`${EARTH.pl_insol} S⊕`} />
          <DetailRow label="Distance from Earth" planet={formatNumber(planet.sy_dist, " pc")} earth={`${EARTH.sy_dist} pc`} />
          <DetailRow label="Discovery year" planet={formatYear(planet.disc_year)} earth="-" />
          <DetailRow label="Discovery method" planet={planet.discoverymethod ?? "Unknown"} earth="-" />
        </div>

        <div className="mb-6 grid gap-3 rounded-lg bg-slate-50 p-4 text-sm">
          <h4 className="font-semibold text-slate-950">Host star: {planet.hostname || "Name unknown"}</h4>
          <p className="text-sm leading-6 text-slate-600">The star this planet orbits. Its temperature and size help determine how much energy the planet receives.</p>
          <div className="grid grid-cols-2 gap-2 [&>span:nth-child(even)]:text-center">
            <span className="text-slate-500">Type</span>
            <span>{starType}</span>
            <span className="text-slate-500">Temperature</span>
            <span>{formatNumber(planet.st_teff, " K")}</span>
            <span className="text-slate-500">Radius</span>
            <span>{formatNumber(planet.st_rad, " R☉")}</span>
            <span className="text-slate-500">Mass</span>
            <span>{formatNumber(planet.st_mass, " M☉")}</span>
            <span className="text-slate-500">Metallicity</span>
            <span>{formatNumber(planet.st_met)}</span>
            <span className="text-slate-500">Known planets</span>
            <span>{formatNumber(planet.sy_pnum)}</span>
          </div>
        </div>

        <div className="rounded-lg border border-teal-100 bg-teal-50 p-4 text-sm leading-6">
          <h4 className="font-semibold">What does this comparison tell you?</h4>
          <p className="mt-2">Compare size and length of year with Earth. Which differences stand out? Measurements marked “Unknown” are gaps in our evidence; equilibrium temperature is not a measured surface temperature.</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link className="button-primary px-4 py-3 text-sm" href={`/lab/hz?planet=${encodeURIComponent(planet.pl_name)}`}>Explore {planet.pl_name} in the Habitable Zone Explorer →</Link>
          <Link className="rounded-md border border-slate-200 px-4 py-3 text-sm font-semibold text-teal-800" href="/lab/methods">How do we detect planets? Visit the Detection Methods Lab →</Link>
        </div>
        </div>
      </aside>
    </div>
  );
}

export default function PlaygroundClient({
  planets,
  chartReadyCount,
  datasetRefreshedAt,
}: PlaygroundClientProps) {
  const { maxPeriod, methods, starTypesInData, planetTypesInData } = useMemo(() => {
    const periods: number[] = [];
    const methodSet = new Set<string>();
    const starTypeSet = new Set<string>();
    const planetTypeSet = new Set<string>();

    for (const p of planets) {
      if (typeof p.pl_orbper === "number") periods.push(p.pl_orbper);
      if (p.discoverymethod) methodSet.add(p.discoverymethod);
      const starType = getStarType(p.st_teff);
      if (starType !== "Unknown") starTypeSet.add(starType);
      planetTypeSet.add(getPlanetType(p));
    }

    return {
      maxPeriod: periods.length ? Math.ceil(Math.max(...periods)) : 1000,
      methods: Array.from(methodSet).sort(),
      starTypesInData: starTypeSet,
      planetTypesInData: planetTypeSet,
    };
  }, [planets]);

  const methodColors = discoveryColors;

  const [radiusRangeRaw, setRadiusRangeRaw] = useState<RangeValue>(RADIUS_RANGE);
  const [eqTempRangeRaw, setEqTempRangeRaw] = useState<RangeValue>(EQ_TEMP_RANGE);
  const [insolationRangeRaw, setInsolationRangeRaw] = useState<RangeValue>(INSOLATION_RANGE);
  const [distanceRangeRaw, setDistanceRangeRaw] = useState<RangeValue>(DISTANCE_RANGE);
  const [periodLimitRaw, setPeriodLimitRaw] = useState<number>(maxPeriod);
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterKey | null>(null);
  const [openInfo, setOpenInfo] = useState<InfoKey>(null);
  const [xField, setXField] = useState<NumericPlanetField>("pl_orbper");
  const [yField, setYField] = useState<NumericPlanetField>("pl_rade");
  const [colorMode, setColorMode] = useState<ColorMode>("method");
  const [planetSearch, setPlanetSearch] = useState("");
  const [searchMessage, setSearchMessage] = useState<string | null>(null);
  const [searchSuggestionsOpen, setSearchSuggestionsOpen] = useState(false);

  const radiusRange = useDebouncedValue(radiusRangeRaw, 200);
  const eqTempRange = useDebouncedValue(eqTempRangeRaw, 200);
  const insolationRange = useDebouncedValue(insolationRangeRaw, 200);
  const distanceRange = useDebouncedValue(distanceRangeRaw, 200);
  const periodLimit = useDebouncedValue(periodLimitRaw, 200);

  const [selectedMethods, setSelectedMethods] = useState<Set<string>>(
    () => new Set(methods)
  );
  const [selectedStarTypes, setSelectedStarTypes] = useState<Set<string>>(
    () => new Set(STAR_TYPES.map((type) => type.key))
  );
  const [selectedPlanetTypes, setSelectedPlanetTypes] = useState<Set<string>>(
    () => new Set(PLANET_TYPES)
  );

  const toggleMethod = (method: string) => {
    setSelectedMethods((prev) => {
      const next = new Set(prev);
      if (next.has(method)) next.delete(method);
      else next.add(method);
      return next;
    });
  };

  const toggleStarType = (type: string) => {
    setSelectedStarTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const togglePlanetType = (type: string) => {
    setSelectedPlanetTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const resetFilters = () => {
    setRadiusRangeRaw(RADIUS_RANGE);
    setEqTempRangeRaw(EQ_TEMP_RANGE);
    setInsolationRangeRaw(INSOLATION_RANGE);
    setDistanceRangeRaw(DISTANCE_RANGE);
    setPeriodLimitRaw(maxPeriod);
    setSelectedMethods(new Set(methods));
    setSelectedStarTypes(new Set(STAR_TYPES.map((type) => type.key)));
    setSelectedPlanetTypes(new Set(PLANET_TYPES));
    setActiveFilter(null);
    setOpenInfo(null);
  };

  const filtered = useMemo(() => {
    return planets.filter((p) => {
      const x = p[xField];
      const y = p[yField];
      if (typeof x !== "number" || !Number.isFinite(x) ||
          typeof y !== "number" || !Number.isFinite(y) ||
          (axisOption(xField).scale === "log" && x <= 0) ||
          (axisOption(yField).scale === "log" && y <= 0)) return false;
      if (!isFullRange(radiusRange, RADIUS_RANGE) &&
          (typeof p.pl_rade !== "number" || p.pl_rade < radiusRange[0] || p.pl_rade > radiusRange[1])) return false;
      if (periodLimit < maxPeriod &&
          (typeof p.pl_orbper !== "number" || p.pl_orbper <= 0 || p.pl_orbper > periodLimit)) return false;

      if (!isFullRange(eqTempRange, EQ_TEMP_RANGE)) {
        if (typeof p.pl_eqt !== "number" || p.pl_eqt < eqTempRange[0] || p.pl_eqt > eqTempRange[1]) {
          return false;
        }
      }

      if (!isFullRange(insolationRange, INSOLATION_RANGE)) {
        const insolation = getInsolation(p);
        if (
          insolation === null ||
          insolation < insolationRange[0] ||
          insolation > insolationRange[1]
        ) {
          return false;
        }
      }

      if (!isFullRange(distanceRange, DISTANCE_RANGE)) {
        if (
          typeof p.sy_dist !== "number" ||
          p.sy_dist < distanceRange[0] ||
          p.sy_dist > distanceRange[1]
        ) {
          return false;
        }
      }

      if (selectedMethods.size !== methods.length &&
          (!p.discoverymethod || !selectedMethods.has(p.discoverymethod))) return false;
      const starType = getStarType(p.st_teff);
      if (selectedStarTypes.size !== STAR_TYPES.length && !selectedStarTypes.has(starType)) return false;
      if (selectedPlanetTypes.size !== PLANET_TYPES.length && !selectedPlanetTypes.has(getPlanetType(p))) return false;

      return true;
    });
  }, [
    planets,
    xField,
    yField,
    maxPeriod,
    methods.length,
    radiusRange,
    periodLimit,
    eqTempRange,
    insolationRange,
    distanceRange,
    selectedMethods,
    selectedStarTypes,
    selectedPlanetTypes,
  ]);

  const selectedStarTypeList = STAR_TYPES.filter((type) =>
    selectedStarTypes.has(type.key)
  ).map((type) => type.key);
  const starTypeSummary =
    selectedStarTypeList.length === STAR_TYPES.length
      ? "All star types"
      : selectedStarTypeList.length
        ? selectedStarTypeList.join(", ")
        : "None selected";
  const methodSummary =
    selectedMethods.size === methods.length
      ? "All methods"
      : selectedMethods.size > 0
        ? `${selectedMethods.size} selected`
        : "None selected";
  const selectedPlanetTypeList = PLANET_TYPES.filter((type) =>
    selectedPlanetTypes.has(type)
  );
  const planetTypeSummary =
    selectedPlanetTypeList.length === PLANET_TYPES.length
      ? "All planet types"
      : selectedPlanetTypeList.length
        ? `${selectedPlanetTypeList.length} selected`
        : "None selected";
  const xOption = axisOption(xField);
  const yOption = axisOption(yField);
  const colorMap =
    colorMode === "planetType"
      ? TYPE_COLORS
      : colorMode === "starType"
        ? STAR_TYPE_COLORS
        : methodColors;
  const groupBy =
    colorMode === "planetType"
      ? getPlanetType
      : colorMode === "starType"
        ? (planet: Planet) => getStarType(planet.st_teff)
        : (planet: Planet) => planet.discoverymethod || "Unknown";
  const toggleActiveFilter = (filter: FilterKey) => {
    setOpenInfo(null);
    setActiveFilter((current) => (current === filter ? null : filter));
  };
  const toggleInfo = (filter: FilterKey) => {
    setActiveFilter(null);
    setOpenInfo((current) => (current === filter ? null : filter));
  };
  const applyChartPreset = (preset: (typeof CHART_PRESETS)[number]) => {
    setXField(preset.x);
    setYField(preset.y);
    setColorMode(preset.color);
  };
  const activePreset = CHART_PRESETS.find(
    (preset) => preset.x === xField && preset.y === yField && preset.color === colorMode
  );
  const chartDescription =
    activePreset?.description ??
    `Custom view: ${xOption.label} on the x-axis, ${yOption.label} on the y-axis, colored by ${
      colorMode === "planetType"
        ? "planet type"
        : colorMode === "starType"
          ? "host star type"
          : "discovery method"
    }.`;
  const planetSuggestions = useMemo(() => {
    const query = planetSearch.trim().toLowerCase();
    if (query.length < 2) return [];

    const startsWith: Planet[] = [];
    const includes: Planet[] = [];

    for (const planet of planets) {
      const name = planet.pl_name.toLowerCase();
      if (name.startsWith(query)) startsWith.push(planet);
      else if (name.includes(query)) includes.push(planet);
    }

    const byClosestName = (a: Planet, b: Planet) =>
      a.pl_name.length - b.pl_name.length || a.pl_name.localeCompare(b.pl_name);

    return [...startsWith.sort(byClosestName), ...includes.sort(byClosestName)].slice(0, 8);
  }, [planetSearch, planets]);
  const openPlanetSearch = (rawQuery = planetSearch) => {
    const query = rawQuery.trim().toLowerCase();
    if (!query) {
      setSearchMessage("Type a planet name, for example Kepler-186 f.");
      setSearchSuggestionsOpen(false);
      return;
    }

    const exact = planets.find((planet) => planet.pl_name.toLowerCase() === query);
    const partial = planets.find((planet) => planet.pl_name.toLowerCase().includes(query));
    const match = exact ?? partial;

    if (!match) {
      setSearchMessage(`No planet named "${rawQuery.trim()}" was found in this dataset.`);
      setSearchSuggestionsOpen(false);
      return;
    }

    setPlanetSearch(match.pl_name);
    setSelectedPlanet(match);
    setSearchMessage(null);
    setSearchSuggestionsOpen(false);
  };
  const selectPlanetSuggestion = (planet: Planet) => {
    setPlanetSearch(planet.pl_name);
    setSearchMessage(null);
    setSearchSuggestionsOpen(false);
    setSelectedPlanet(planet);
  };

  return (
    <>
      <div className="space-y-6">
        <header className="page-intro" style={{ borderBottom: "none", paddingBottom: 0, marginBottom: 28 }}>
          <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
            <div>
              <p className="page-eyebrow">Explore the NASA Exoplanet Archive</p>
              <h1 className="mt-2">Planet Playground</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Some worlds race around their stars in hours; others take centuries.
                Some are smaller than Earth, while others dwarf Jupiter. Explore
                NASA’s confirmed exoplanets to discover this variety and see how
                individual worlds measure up against our own.
              </p>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                openPlanetSearch(String(formData.get("planetSearch") ?? ""));
              }}
              className="rounded-md border border-slate-200 bg-slate-50 p-3"
            >
              <label className="text-sm font-semibold text-slate-950" htmlFor="planet-search">
                Search planet profile
              </label>
              <div className="mt-2 flex gap-2">
                <div className="relative min-w-0 flex-1">
                  <input
                    id="planet-search"
                    name="planetSearch"
                    type="search"
                    value={planetSearch}
                    onChange={(event) => {
                      setPlanetSearch(event.target.value);
                      setSearchMessage(null);
                      setSearchSuggestionsOpen(true);
                    }}
                    onFocus={() => setSearchSuggestionsOpen(true)}
                    placeholder="Try Kepler-186 f"
                    autoComplete="off"
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                  />
                  {searchSuggestionsOpen && planetSuggestions.length > 0 ? (
                    <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-64 overflow-auto rounded-md border border-slate-200 bg-white py-1 shadow-xl">
                      {planetSuggestions.map((planet) => (
                        <button
                          key={planet.pl_name}
                          type="button"
                          onClick={() => selectPlanetSuggestion(planet)}
                          className="block w-full px-3 py-2 text-left text-sm hover:bg-teal-50"
                        >
                          <span className="block font-semibold text-slate-950">
                            {planet.pl_name}
                          </span>
                          <span className="block truncate text-xs text-slate-500">
                            {planet.hostname ?? "Unknown host"} ·{" "}
                            {planet.discoverymethod ?? "Unknown method"} ·{" "}
                            {formatYear(planet.disc_year)}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
                <button
                  type="submit"
                  className="rounded-md bg-teal-700 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-800"
                >
                  Search
                </button>
              </div>
              {searchMessage ? (
                <p className="mt-2 text-xs text-slate-500">{searchMessage}</p>
              ) : (
                <p className="mt-2 text-xs text-slate-500">
                  Type a planet name and open its profile directly.
                </p>
              )}
            </form>
          </div>
        </header>

        <section className="lab-panel p-5 sm:p-6">
          <div className="mb-4 flex flex-col gap-4">
            <div className="w-full">
              <h2 className="font-semibold">Choose a question to explore</h2>
              <p className="mt-1 text-sm text-gray-600">
                Are giant planets always far from their stars? Can small worlds be scorching hot? Which kinds of planets do different detection methods reveal? Explore these patterns, and remember that what we find also reflects what our instruments can detect.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {CHART_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => applyChartPreset(preset)}
                  className={`rounded-md border px-3 py-2 text-xs font-semibold ${
                    xField === preset.x &&
                    yField === preset.y &&
                    colorMode === preset.color
                      ? "border-teal-700 bg-teal-700 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-teal-300"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <p className="rounded-md bg-teal-50 p-3 text-sm leading-6 text-teal-950">
              {chartDescription}
            </p>
          </div>

          <div className="mb-4 grid gap-3 md:grid-cols-3">
            <label className="text-sm font-medium text-slate-700">
              X-axis
              <select
                value={xField}
                onChange={(event) => setXField(event.target.value as NumericPlanetField)}
                className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                {AXIS_OPTIONS.map((option) => (
                  <option key={option.field} value={option.field}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium text-slate-700">
              Y-axis
              <select
                value={yField}
                onChange={(event) => setYField(event.target.value as NumericPlanetField)}
                className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                {AXIS_OPTIONS.map((option) => (
                  <option key={option.field} value={option.field}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium text-slate-700">
              Color by
              <select
                value={colorMode}
                onChange={(event) => setColorMode(event.target.value as ColorMode)}
                className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                <option value="planetType">Planet type</option>
                <option value="method">Discovery method</option>
                <option value="starType">Host star type</option>
              </select>
            </label>
          </div>

        <details className="group mb-4 rounded-lg border border-teal-200 bg-teal-50/60 px-3 py-2">
          <summary className="flex cursor-pointer list-none items-center gap-3 text-sm text-teal-950 [&::-webkit-details-marker]:hidden">
            <span aria-hidden="true" className="shrink-0 transition-transform group-open:rotate-90">▸</span>
            <span className="shrink-0 font-semibold">Filter chart below using planet properties</span>
            <span className="min-w-0 flex-1 truncate text-xs text-teal-900">Radius: {formatRange(radiusRangeRaw, "R⊕")} · {planetTypeSummary} · {methodSummary} · temperature, starlight &amp; more</span>
            <span className="shrink-0 rounded-md bg-teal-700 px-3 py-1 text-xs font-semibold text-white"><span className="group-open:hidden">Expand filters ↓</span><span className="hidden group-open:inline">Collapse filters ↑</span></span>
          </summary>
          <div className="my-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-600">Combine filters to investigate your question. Information icons explain each property.</p>
            <button type="button" onClick={resetFilters} className="rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-800">Reset filters</button>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <FilterButton
              title="Radius"
              summary={formatRange(radiusRangeRaw, "R⊕")}
              active={activeFilter === "radius"}
              infoOpen={openInfo === "radius"}
              infoTitle={FILTER_INFO.radius.title}
              infoBody={FILTER_INFO.radius.body}
              onClick={() => toggleActiveFilter("radius")}
              onInfoClick={() => toggleInfo("radius")}
              onApply={() => setActiveFilter(null)}
            >
              <RangeSlider
                label="Radius"
                min={RADIUS_RANGE[0]}
                max={RADIUS_RANGE[1]}
                step={0.1}
                unit="R⊕"
                value={radiusRangeRaw}
                onChange={(value) => {
                  setRadiusRangeRaw(value);
                }}
              />
            </FilterButton>

            <FilterButton
              title="Equilibrium temp."
              summary={formatRange(eqTempRangeRaw, "K")}
              active={activeFilter === "eqTemp"}
              infoOpen={openInfo === "eqTemp"}
              infoTitle={FILTER_INFO.eqTemp.title}
              infoBody={FILTER_INFO.eqTemp.body}
              onClick={() => toggleActiveFilter("eqTemp")}
              onInfoClick={() => toggleInfo("eqTemp")}
              onApply={() => setActiveFilter(null)}
            >
              <RangeSlider
                label="Equilibrium temperature"
                min={EQ_TEMP_RANGE[0]}
                max={EQ_TEMP_RANGE[1]}
                unit="K"
                value={eqTempRangeRaw}
                onChange={(value) => {
                  setEqTempRangeRaw(value);
                }}
              />
            </FilterButton>

            <FilterButton
              title="Insolation flux"
              summary={formatRange(insolationRangeRaw, "S⊕")}
              active={activeFilter === "insolation"}
              infoOpen={openInfo === "insolation"}
              infoTitle={FILTER_INFO.insolation.title}
              infoBody={FILTER_INFO.insolation.body}
              onClick={() => toggleActiveFilter("insolation")}
              onInfoClick={() => toggleInfo("insolation")}
              onApply={() => setActiveFilter(null)}
            >
              <RangeSlider
                label="Insolation flux"
                min={INSOLATION_RANGE[0]}
                max={INSOLATION_RANGE[1]}
                step={0.01}
                unit="S⊕"
                logScale
                value={insolationRangeRaw}
                onChange={(value) => {
                  setInsolationRangeRaw(value);
                }}
              />
            </FilterButton>

            <FilterButton
              title="Distance"
              summary={formatRange(distanceRangeRaw, "pc")}
              active={activeFilter === "distance"}
              infoOpen={openInfo === "distance"}
              infoTitle={FILTER_INFO.distance.title}
              infoBody={FILTER_INFO.distance.body}
              onClick={() => toggleActiveFilter("distance")}
              onInfoClick={() => toggleInfo("distance")}
              onApply={() => setActiveFilter(null)}
            >
              <RangeSlider
                label="Distance from Earth"
                min={DISTANCE_RANGE[0]}
                max={DISTANCE_RANGE[1]}
                unit="pc"
                value={distanceRangeRaw}
                onChange={(value) => {
                  setDistanceRangeRaw(value);
                }}
              />
            </FilterButton>

            <FilterButton
              title="Orbital period"
              summary={`≤ ${periodLimitRaw.toLocaleString()} days`}
              active={activeFilter === "period"}
              infoOpen={openInfo === "period"}
              infoTitle={FILTER_INFO.period.title}
              infoBody={FILTER_INFO.period.body}
              onClick={() => toggleActiveFilter("period")}
              onInfoClick={() => toggleInfo("period")}
              onApply={() => setActiveFilter(null)}
            >
              <label className="mb-2 block text-sm font-medium">
                Max orbital period:{" "}
                <span className="font-semibold">{periodLimitRaw.toLocaleString()} days</span>
              </label>
              <input
                type="range"
                min={1}
                max={maxPeriod}
                value={periodLimitRaw}
                onChange={(e) => {
                  setPeriodLimitRaw(Number(e.target.value));
                }}
                className="w-full"
              />
              <p className="mt-1 text-xs text-gray-500">
                1-{maxPeriod.toLocaleString()} days
              </p>
            </FilterButton>

            <FilterButton
              title="Host star type"
              summary={starTypeSummary}
              active={activeFilter === "starType"}
              infoOpen={openInfo === "starType"}
              infoTitle={FILTER_INFO.starType.title}
              infoBody={FILTER_INFO.starType.body}
              onClick={() => toggleActiveFilter("starType")}
              onInfoClick={() => toggleInfo("starType")}
              onApply={() => setActiveFilter(null)}
            >
              <div className="grid grid-cols-2 gap-2 [&>span:nth-child(even)]:text-center">
                {STAR_TYPES.map((type) => (
                  <label
                    key={type.key}
                    className={`flex items-center gap-2 rounded border p-2 text-sm ${
                      starTypesInData.has(type.key)
                        ? "border-slate-200"
                        : "border-slate-100 text-slate-400"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedStarTypes.has(type.key)}
                      onChange={() => toggleStarType(type.key)}
                    />
                    <span className="font-semibold">{type.label}</span>
                    <span className="text-xs">{type.range}</span>
                  </label>
                ))}
              </div>
            </FilterButton>

            <FilterButton
              title="Planet type"
              summary={planetTypeSummary}
              active={activeFilter === "planetType"}
              infoOpen={openInfo === "planetType"}
              infoTitle={FILTER_INFO.planetType.title}
              infoBody={FILTER_INFO.planetType.body}
              onClick={() => toggleActiveFilter("planetType")}
              onInfoClick={() => toggleInfo("planetType")}
              onApply={() => setActiveFilter(null)}
            >
              <div className="space-y-2">
                {PLANET_TYPES.map((type) => (
                  <label
                    key={type}
                    className={`flex items-center gap-2 rounded border p-2 text-sm ${
                      planetTypesInData.has(type)
                        ? "border-slate-200"
                        : "border-slate-100 text-slate-400"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedPlanetTypes.has(type)}
                      onChange={() => togglePlanetType(type)}
                    />
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: TYPE_COLORS[type] }}
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedPlanetTypes(new Set(PLANET_TYPES));
                }}
                className="mt-3 text-xs font-semibold text-teal-600 hover:underline"
              >
                Select all
              </button>
            </FilterButton>

            <FilterButton
              title="Discovery method"
              summary={methodSummary}
              active={activeFilter === "method"}
              infoOpen={openInfo === "method"}
              infoTitle={FILTER_INFO.method.title}
              infoBody={FILTER_INFO.method.body}
              onClick={() => toggleActiveFilter("method")}
              onInfoClick={() => toggleInfo("method")}
              onApply={() => setActiveFilter(null)}
            >
              <div className="max-h-56 space-y-1 overflow-auto pr-1">
                {methods.map((method) => (
                  <label key={method} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedMethods.has(method)}
                      onChange={() => toggleMethod(method)}
                    />
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: methodColors[method] }}
                    />
                    <span>{method}</span>
                  </label>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedMethods(new Set(methods));
                }}
                className="mt-3 text-xs font-semibold text-teal-600 hover:underline"
              >
                Select all
              </button>
              <button type="button" onClick={() => setSelectedMethods(new Set())} className="ml-4 mt-3 text-xs font-semibold text-teal-700 hover:underline">Clear all</button>
            </FilterButton>
          </div>
        </details>

          <p className="mb-2 text-sm font-semibold text-slate-800" aria-live="polite">Displaying {filtered.length.toLocaleString()} planets</p>

          <PlanetScatter
            data={filtered}
            colorMap={colorMap}
            xField={xField}
            yField={yField}
            xLabel={xOption.label}
            yLabel={yOption.label}
            xUnit={xOption.unit}
            yUnit={yOption.unit}
            xScale={xOption.scale}
            yScale={yOption.scale}
            groupBy={groupBy}
            getPlanetType={getPlanetType}
            onPlanetClick={setSelectedPlanet}
          />
          <div className="mt-5 border-t border-slate-100 pt-4">
          <details className="mb-4 text-xs leading-5 text-slate-600">
            <summary className="cursor-pointer">About the data and missing measurements</summary>
            <p className="mt-2">This NASA Exoplanet Archive snapshot was refreshed on {datasetRefreshedAt}. It contains {planets.length.toLocaleString()} planets; {chartReadyCount.toLocaleString()} have radius and orbital-period measurements. This chart shows only planets with usable measurements for both selected axes and matching your filters. A missing value means unknown, not zero.</p>
          </details>
          {xOption.scale === "log" || yOption.scale === "log" ? <p className="mb-3 text-xs leading-5 text-slate-600">Logarithmic axes: {[xOption.scale === "log" ? `X (${xOption.label})` : null, yOption.scale === "log" ? `Y (${yOption.label})` : null].filter(Boolean).join(" and ")}. Equal spacing represents multiplication, such as 1 → 10 → 100, rather than equal amounts.</p> : null}
          </div>
        </section>

        <section className="reference-panel p-5 sm:p-6">
          <h2 className="font-semibold">Curious about a planet’s habitability?</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Could a planet have liquid water? Its star, orbit, and atmosphere all help shape the answer.</p>
          <Link href="/lab/hz" className="mt-3 inline-block text-sm font-semibold text-teal-800 underline">Explore the Habitable Zone Explorer →</Link>
        </section>
      </div>

      <PlanetDetailsPanel planet={selectedPlanet} onClose={() => setSelectedPlanet(null)} />
    </>
  );
}
