"use client";

import { useRouter } from "next/navigation";
import { planetHabitabilityUrl } from "@/lib/habitability";
import { getStarType } from "@/lib/star-types";
import { useState } from "react";
import PlanetScatter, { type Planet, type NumericPlanetField } from "@/components/PlanetScatter";
import { AXIS_OPTIONS, TYPE_COLORS, STAR_TYPE_COLORS, getPlanetType } from "../playground/PlaygroundClient";
import { plottableValue } from "@/lib/catalog-values";

const axes = [...AXIS_OPTIONS,
  { field: "pl_masse" as const, label: "Planet mass", unit: " M⊕", scale: "log" as const },
  { field: "st_rad" as const, label: "Host star radius", unit: " R☉", scale: "linear" as const },
  { field: "st_mass" as const, label: "Host star mass", unit: " M☉", scale: "linear" as const },
  { field: "st_met" as const, label: "Host star metallicity", unit: " dex", scale: "linear" as const },
  { field: "sy_pnum" as const, label: "Planets in system", unit: "", scale: "linear" as const },
];
const palette = ["#2563eb", "#ea580c", "#16a34a", "#7c3aed", "#0891b2", "#dc2626", "#ca8a04", "#64748b"];

export default function CandidateChart({ planets }: { planets: Planet[] }) {
  const [xField, setXField] = useState<NumericPlanetField>("st_teff");
  const [yField, setYField] = useState<NumericPlanetField>("pl_orbsmax");
  const [color, setColor] = useState("star");
  const router = useRouter();
  const x = axes.find(a => a.field === xField)!;
  const y = axes.find(a => a.field === yField)!;
  const plotted = planets.filter(p => [x, y].every(axis => { const value = plottableValue(p, axis.field); return value !== null && (axis.scale !== "log" || value > 0); }));
  const methods = [...new Set(planets.map(p => p.discoverymethod || "Unknown"))].sort();
  const colors = color === "star" ? STAR_TYPE_COLORS : color === "type" ? TYPE_COLORS : Object.fromEntries(methods.map((m, i) => [m, palette[i % palette.length]]));
  const groupBy = color === "star" ? (p: Planet) => getStarType(p.st_teff) : color === "type" ? getPlanetType : (p: Planet) => p.discoverymethod || "Unknown";
  return <div className="mt-4">
    <div className="my-3 flex flex-wrap gap-3">
      {[["Horizontal axis", xField, setXField], ["Vertical axis", yField, setYField]] .map(([label, value, setter]) => <label key={label as string} className="text-xs font-semibold text-slate-700">{label as string}<select className="mt-1 block border px-3 py-2 text-sm font-normal" value={value as string} onChange={e => (setter as typeof setXField)(e.target.value as NumericPlanetField)}>{axes.map(a => <option key={a.field} value={a.field}>{a.label}{a.unit}</option>)}</select></label>)}
      <label className="text-xs font-semibold text-slate-700">Color by<select className="mt-1 block border px-3 py-2 text-sm font-normal" value={color} onChange={e => setColor(e.target.value)}><option value="star">Host star type</option><option value="type">Planet type</option><option value="method">Discovery method</option></select></label>
    </div>
    <PlanetScatter data={plotted} colorMap={colors} xField={xField} yField={yField} xLabel={x.label} yLabel={y.label} xUnit={x.unit} yUnit={y.unit} xScale={x.scale} yScale={y.scale} groupBy={groupBy} getPlanetType={getPlanetType} showProfileHint={false} selectionInstruction="Select the planet to open its habitability zone profile." onPlanetClick={planet => router.push(planetHabitabilityUrl(planet.pl_name))} />
    <p className="mt-3 text-xs leading-5 text-slate-600">{plotted.length} of {planets.length} matching planets have catalog values for both axes. Missing measurements are omitted; starlight inferred from temperature is used for filtering only. {x.scale === "log" || y.scale === "log" ? "Logarithmic axes use equal spacing for multiplication (1 → 10 → 100)." : ""} Star types are approximate temperature groups, using the same categories as Planet Playground.</p>
  </div>;
}
