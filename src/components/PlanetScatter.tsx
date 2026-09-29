// src/components/PlanetScatter.tsx
"use client";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { useCallback, useEffect, useMemo, useRef, useState, type SyntheticEvent } from "react";
import { formatCatalogNumber, plottableValue } from "@/lib/catalog-values";

export interface Planet {
  pl_name: string;
  hostname?: string;
  disc_year?: number | null;
  pl_rade: number;
  pl_rade_is_calculated?: boolean;
  pl_orbper: number;
  pl_masse?: number | null;
  pl_bmasse?: number | null;
  pl_bmassprov?: string | null;
  pl_eqt?: number | null;
  pl_insol?: number | null;
  pl_orbsmax?: number | null;
  sy_dist?: number | null;
  st_teff?: number | null;
  st_rad?: number | null;
  st_mass?: number | null;
  st_met?: number | null;
  sy_pnum?: number | null;
  discoverymethod?: string;
}

interface PlanetScatterProps {
  data: Planet[];
  colorMap: Record<string, string>;
  xField: NumericPlanetField;
  yField: NumericPlanetField;
  xLabel: string;
  yLabel: string;
  xUnit?: string;
  yUnit?: string;
  xScale?: "linear" | "log";
  yScale?: "linear" | "log";
  groupBy: (planet: Planet) => string;
  getPlanetType: (planet: Planet) => string;
  onPlanetClick?: (planet: Planet) => void;
  selectionInstruction?: string;
  showProfileHint?: boolean;
}

export type NumericPlanetField =
  | "disc_year"
  | "pl_orbper"
  | "pl_rade"
  | "pl_masse"
  | "pl_eqt"
  | "pl_insol"
  | "pl_orbsmax"
  | "sy_dist"
  | "st_teff"
  | "st_rad"
  | "st_mass"
  | "st_met"
  | "sy_pnum";

function CustomTooltip({
  active,
  payload,
  xLabel,
  yLabel,
  xField,
  yField,
  xUnit = "",
  yUnit = "",
  getPlanetType,
}: {
  active?: boolean;
  payload?: Array<{ payload: Planet }>;
  xLabel: string;
  yLabel: string;
  xField: NumericPlanetField;
  yField: NumericPlanetField;
  xUnit?: string;
  yUnit?: string;
  getPlanetType: (planet: Planet) => string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const p = payload[0].payload;
  const formatValue = (field: NumericPlanetField, unit: string) => {
    const value = p[field];
    if (typeof value !== "number") return "Unknown";
    if (field === "disc_year") return `${Math.round(value)}`;
    return `${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}${unit}`;
  };

  return (
    <div className="rounded border border-gray-200 bg-white p-2 text-sm shadow-md">
      <div className="mb-1 font-semibold text-blue-700">{p.pl_name}</div>
      <div>Type: {getPlanetType(p)}</div>
      <div>
        {xLabel}: {formatValue(xField, xUnit)}
      </div>
      <div>
        {yLabel}: {formatValue(yField, yUnit)}
      </div>
      <div>Method: {p.discoverymethod || "Unknown"}</div>
      <div>Host: {p.hostname || "Unknown"}</div>
    </div>
  );
}

export default function PlanetScatter({
  data,
  colorMap,
  xField,
  yField,
  xLabel,
  yLabel,
  xUnit = "",
  yUnit = "",
  xScale = "linear",
  yScale = "linear",
  groupBy,
  getPlanetType,
  onPlanetClick,
  selectionInstruction = "Select a name to open that exact profile.",
  showProfileHint = true,
}: PlanetScatterProps) {
  const chartData = useMemo(() => {
    return data.filter((planet) => {
      const x = plottableValue(planet, xField);
      const y = plottableValue(planet, yField);
      if (x === null || y === null) return false;
      if (xScale === "log" && x <= 0) return false;
      if (yScale === "log" && y <= 0) return false;
      return true;
    });
  }, [data, xField, xScale, yField, yScale]);

  const [selection, setSelection] = useState<{ planets: Planet[]; data: Planet[]; keyboard: boolean } | null>(null);
  const planetsByName = useMemo(() => new Map(chartData.map((planet) => [planet.pl_name, planet])), [chartData]);
  const [hovered, setHovered] = useState<{ planet: Planet; data: Planet[] } | null>(null);
  const hoveredPlanet = hovered?.data === chartData ? hovered.planet : null;
  const [showHelp, setShowHelp] = useState(false);
  const clickedDot = useRef<SVGCircleElement | null>(null);
  const pickerRef = useRef<HTMLDivElement | null>(null);
  const activeSelection = selection?.data === chartData ? selection : null;

  useEffect(() => {
    const picker = pickerRef.current;
    if (!activeSelection || !picker) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const cancel = () => { if (timer) clearTimeout(timer); };
    const schedule = () => {
      cancel();
      if (picker.matches(":hover") || picker.querySelector(":focus-visible")) return;
      timer = setTimeout(() => setSelection(null), 3000);
    };
    picker.addEventListener("mouseenter", cancel);
    picker.addEventListener("mouseleave", schedule);
    picker.addEventListener("focusin", schedule);
    picker.addEventListener("focusout", schedule);
    picker.addEventListener("click", schedule);
    if (activeSelection.keyboard) picker.querySelector<HTMLButtonElement>("ul button")?.focus({ preventScroll: true });
    schedule();
    return () => {
      cancel();
      picker.removeEventListener("mouseenter", cancel);
      picker.removeEventListener("mouseleave", schedule);
      picker.removeEventListener("focusin", schedule);
      picker.removeEventListener("focusout", schedule);
      picker.removeEventListener("click", schedule);
    };
  }, [activeSelection]);

  useEffect(() => {
    if (!showHelp) return;
    const timer = setTimeout(() => setShowHelp(false), 3000);
    return () => clearTimeout(timer);
  }, [showHelp]);

  const closePicker = () => {
    setSelection(null);
    clickedDot.current?.focus();
  };
  const chooseDot = useCallback((event: SyntheticEvent<SVGCircleElement>, planetName: string) => {
    event.preventDefault();
    event.stopPropagation();
    const dot = event.currentTarget;
    clickedDot.current = dot;
    const bounds = dot.getBoundingClientRect();
    const x = bounds.left + bounds.width / 2;
    const y = bounds.top + bounds.height / 2;
    const names = new Set([planetName]);
    // Compare actual rendered positions, across every color series. A 10px
    // neighborhood includes overlapping dots and their small click targets.
    dot.ownerSVGElement?.querySelectorAll<SVGCircleElement>("circle[data-planet-name]").forEach((other) => {
      const rect = other.getBoundingClientRect();
      if (Math.hypot(rect.left + rect.width / 2 - x, rect.top + rect.height / 2 - y) <= 10) {
        const name = other.dataset.planetName;
        if (name) names.add(name);
      }
    });
    const nearby = chartData.filter((planet) => names.has(planet.pl_name));
    nearby.sort((a, b) => a.pl_name === planetName ? -1 : b.pl_name === planetName ? 1 : a.pl_name.localeCompare(b.pl_name));
    setSelection({ planets: nearby, data: chartData, keyboard: event.type === "keydown" });
    setShowHelp(false);
    setHovered(null);
  }, [chartData]);
  const renderDot = useCallback((props: unknown) => {
    const point = props as { cx?: number; cy?: number; fill?: string; payload?: Planet } & Partial<Planet>;
    if (typeof point.cx !== "number" || typeof point.cy !== "number") return <g />;
    const planetName = point.payload?.pl_name ?? point.pl_name;
    const planet = planetName ? planetsByName.get(planetName) : undefined;
    const showPlanet = () => { if (planet) setHovered((current) => current?.planet === planet && current.data === chartData ? current : { planet, data: chartData }); };
    return <circle cx={point.cx} cy={point.cy} r={4}
      fill={point.fill || (planet ? colorMap[groupBy(planet)] : undefined) || "#64748b"}
      opacity={0.82} role={onPlanetClick ? "button" : undefined}
      aria-label={planetName ? `Choose planets near ${planetName}` : undefined}
      data-planet-name={planetName} tabIndex={onPlanetClick ? 0 : undefined}
      style={{ cursor: onPlanetClick ? "pointer" : "default", pointerEvents: "all" }}
      onPointerEnter={showPlanet} onPointerLeave={() => setHovered(null)}
      onFocus={showPlanet} onBlur={() => setHovered(null)}
      onClick={(event) => { if (planetName && onPlanetClick) chooseDot(event, planetName); }}
      onKeyDown={(event) => {
        if ((event.key === "Enter" || event.key === " ") && planetName && onPlanetClick) chooseDot(event, planetName);
      }} />;
  }, [chartData, planetsByName, onPlanetClick, chooseDot, colorMap, groupBy]);

  const measurement = (planet: Planet, field: NumericPlanetField, unit: string) => {
    const value = planet[field];
    return typeof value === "number" ? `${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}${unit}` : "Unknown";
  };

  const getDomain = (field: NumericPlanetField, scale: "linear" | "log") => {
    const vals = chartData
      .map((p) => p[field])
      .filter((v): v is number => typeof v === "number" && Number.isFinite(v) && (scale !== "log" || v > 0));

    if (!vals.length) return [1, 10];
    if (scale === "log") return [10 ** Math.floor(Math.log10(Math.min(...vals))), 10 ** Math.ceil(Math.log10(Math.max(...vals)))];
    const min = Math.min(...vals), max = Math.max(...vals);
    const padding = (max - min || Math.abs(max) || 1) * 0.04;
    return [min - padding, max + padding];
  };

  const logTicks = (field: NumericPlanetField, scale: "linear" | "log") => {
    if (scale !== "log") return undefined;
    const [min, max] = getDomain(field, scale) as number[];
    return Array.from({ length: Math.round(Math.log10(max) - Math.log10(min)) + 1 }, (_, index) => min * 10 ** index);
  };

  const formatTick = (field: NumericPlanetField) => (value: number) => {
    if (field === "disc_year") return `${Math.round(value)}`;
    return formatCatalogNumber(value);
  };

  const groupedData = useMemo(() => {
    const groups = new Map<string, Planet[]>();
    for (const planet of chartData) {
      const key = groupBy(planet);
      const group = groups.get(key);
      if (group) group.push(planet);
      else groups.set(key, [planet]);
    }
    return groups;
  }, [chartData, groupBy]);
  const groupsInData = useMemo(() => Array.from(groupedData.keys()).sort(), [groupedData]);

  return (
    <div className="w-full min-w-0">
      <div className="relative h-[500px] min-w-0">
      {hoveredPlanet && !activeSelection && !showHelp ? (
        <div role="tooltip" className="pointer-events-none absolute right-2 top-14 z-20 max-w-[calc(100%-16px)]">
          <CustomTooltip active payload={[{ payload: hoveredPlanet }]} xLabel={xLabel} yLabel={yLabel} xField={xField} yField={yField} xUnit={xUnit} yUnit={yUnit} getPlanetType={getPlanetType} />
        </div>
      ) : null}
      {activeSelection ? (
        <div ref={pickerRef} role="dialog" aria-label="Choose a planet at this spot" onKeyDown={(event) => { if (event.key === "Escape") { event.stopPropagation(); closePicker(); } }} className="absolute right-2 top-14 z-30 w-[360px] max-w-[calc(100%-16px)] rounded-lg border border-teal-200 bg-white p-4 shadow-xl">
          <div className="flex items-start justify-between gap-3">
            <div><h3 className="font-semibold text-slate-950">Choose a planet</h3><p className="mt-1 text-xs leading-5 text-slate-600">{activeSelection.planets.length === 1 ? "One planet at this spot." : `${activeSelection.planets.length} planets at or near this spot.`} {selectionInstruction}</p></div>
            <button type="button" onClick={closePicker} aria-label="Close planet picker" className="rounded border border-slate-200 px-2 py-1 text-xs">Close</button>
          </div>
          <ul className="mt-3 max-h-64 overflow-y-auto divide-y divide-slate-100">
            {activeSelection.planets.map((planet) => <li key={planet.pl_name} className="py-2">
              <button type="button" onClick={() => { setSelection(null); onPlanetClick?.(planet); }} className="text-left text-sm font-semibold text-teal-800 underline underline-offset-2">{planet.pl_name}</button>
              <p className="mt-1 text-xs leading-5 text-slate-600">{xLabel}: {measurement(planet, xField, xUnit)} · {yLabel}: {measurement(planet, yField, yUnit)}</p>
              <p className="text-xs text-slate-500">{getPlanetType(planet)} · {planet.discoverymethod ?? "Unknown method"}</p>
            </li>)}
          </ul>
        </div>
      ) : null}
      <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 800, height: 500 }}>
        <ScatterChart margin={{ top: 10, left: 0, right: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey={xField}
            name={xLabel}
            type="number"
            scale={xScale}
            domain={getDomain(xField, xScale)}
            ticks={logTicks(xField, xScale)}
            tick={{ fontSize: 11 }}
            tickFormatter={formatTick(xField)}
            label={{ value: `${xLabel}${xUnit ? ` (${xUnit.trim()})` : ""}`, position: "bottom" }}
          />

          <YAxis
            dataKey={yField}
            name={yLabel}
            type="number"
            scale={yScale}
            domain={getDomain(yField, yScale)}
            ticks={logTicks(yField, yScale)}
            tick={{ fontSize: 11 }}
            tickFormatter={formatTick(yField)}
            label={{
              value: `${yLabel}${yUnit ? ` (${yUnit.trim()})` : ""}`,
              angle: -90,
              position: "insideLeft",
            }}
          />

          {groupsInData.map((group) => {
            const color = colorMap[group] || "#64748b";
            const subset = groupedData.get(group) ?? [];
            if (!subset.length) return null;

            return (
              <Scatter
                key={group}
                name={group}
                isAnimationActive={false}
                data={subset}
                fill={color}
                cursor={onPlanetClick ? "pointer" : "default"}
                shape={renderDot}
              />
            );
          })}
        </ScatterChart>
      </ResponsiveContainer>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
        <div className="min-w-0 flex-1 basis-80">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Color legend
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {groupsInData.map((group) => (
            <div key={group} className="flex items-center gap-2 text-xs font-medium text-slate-700">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: colorMap[group] || "#64748b" }}
              />
              <span>{group}</span>
            </div>
          ))}
        </div>
        </div>
      {onPlanetClick && showProfileHint ? <button type="button" onClick={() => setShowHelp((open) => !open)} aria-expanded={showHelp} className="planet-chart-hint shrink-0 rounded-full border border-teal-200 bg-teal-700 px-4 py-2 text-xs font-semibold text-white shadow-md">Click on a planet to view profile</button> : null}
      </div>
      {showProfileHint && showHelp && !activeSelection ? <div className="ml-auto mt-3 max-w-xl rounded-lg border border-teal-200 bg-white p-4 text-sm leading-6 shadow-lg">Click any dot to see the planets at that spot. In crowded areas, choose a planet by name from the list to open its profile and compare it with Earth.</div> : null}
    </div>
  );
}
