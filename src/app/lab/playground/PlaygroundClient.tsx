// src/app/lab/playground/PlaygroundClient.tsx
"use client";

import { useMemo, useState } from "react";
import PlanetScatter, { Planet } from "@/components/PlanetScatter";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

interface PlaygroundClientProps {
  planets: Planet[];
}

export default function PlaygroundClient({ planets }: PlaygroundClientProps) {
  // Compute some basic ranges from the data
  const { maxRadius, maxPeriod, methods } = useMemo(() => {
    const radii: number[] = [];
    const periods: number[] = [];
    const methodSet = new Set<string>();

    for (const p of planets) {
      if (typeof p.pl_rade === "number") radii.push(p.pl_rade);
      if (typeof p.pl_orbper === "number") periods.push(p.pl_orbper);
      if (p.discoverymethod) methodSet.add(p.discoverymethod);
    }

    return {
      maxRadius: radii.length ? Math.ceil(Math.max(...radii)) : 20,
      maxPeriod: periods.length ? Math.ceil(Math.max(...periods)) : 1000,
      methods: Array.from(methodSet).sort(),
    };
  }, [planets]);

  // 🔹 Color map for methods (shared with chart + checkboxes)
  const methodColors = useMemo(() => {
    const palette = [
      "#1f77b4", // blue
      "#ff7f0e", // orange
      "#2ca02c", // green
      "#d62728", // red
      "#9467bd", // purple
      "#8c564b", // brown
      "#e377c2", // pink
      "#7f7f7f", // gray
      "#bcbd22", // yellow-green
      "#17becf", // teal
    ];

    const map: Record<string, string> = {};
    methods.forEach((m, i) => {
      map[m] = palette[i % palette.length];
    });
    return map;
  }, [methods]);

  // Filter state (raw slider values)
  const [radiusLimitRaw, setRadiusLimitRaw] = useState<number>(maxRadius);
  const [periodLimitRaw, setPeriodLimitRaw] = useState<number>(
    Math.min(maxPeriod, 1000)
  );

  // Debounced values used for filtering
  const radiusLimit = useDebouncedValue(radiusLimitRaw, 200);
  const periodLimit = useDebouncedValue(periodLimitRaw, 200);

  const [selectedMethods, setSelectedMethods] = useState<Set<string>>(
    () => new Set(methods)
  );

  const toggleMethod = (m: string) => {
    setSelectedMethods((prev) => {
      const next = new Set(prev);
      if (next.has(m)) next.delete(m);
      else next.add(m);
      return next;
    });
  };

  // Apply filters (using debounced values)
  const filtered = useMemo(() => {
    return planets.filter((p) => {
      if (
        typeof p.pl_rade !== "number" ||
        typeof p.pl_orbper !== "number" ||
        p.pl_orbper <= 0 // 🔹 ensure > 0 for log scale
      ) {
        return false;
      }

      if (p.pl_rade > radiusLimit) return false;
      if (p.pl_orbper > periodLimit) return false;

      if (selectedMethods.size > 0 && p.discoverymethod) {
        return selectedMethods.has(p.discoverymethod);
      }

      return true;
    });
  }, [planets, radiusLimit, periodLimit, selectedMethods]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px,1fr] gap-6">
      {/* Filters panel */}
      <aside className="bg-white rounded-lg shadow p-4 space-y-6 h-fit border border-gray-100">
        <h2 className="font-semibold text-lg mb-2">Filters</h2>

        {/* Radius filter */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Max radius (Earth radii):{" "}
            <span className="font-semibold">{radiusLimitRaw}</span>
          </label>
          <input
            type="range"
            min={1}
            max={maxRadius}
            value={radiusLimitRaw}
            onChange={(e) => setRadiusLimitRaw(Number(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Period filter */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Max orbital period (days):{" "}
            <span className="font-semibold">{periodLimitRaw}</span>
          </label>
          <input
            type="range"
            min={1}
            max={Math.min(maxPeriod, 5000)}
            value={periodLimitRaw}
            onChange={(e) => setPeriodLimitRaw(Number(e.target.value))}
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            (Long-period planets exist, but keeping this under{" "}
            {Math.min(maxPeriod, 5000)} days for now.)
          </p>
        </div>

        {/* Discovery methods with color dots */}
        <div>
          <p className="block text-sm font-medium mb-2">Discovery method</p>
          <div className="max-h-40 overflow-auto space-y-1 pr-1">
            {methods.map((m) => (
              <label key={m} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedMethods.has(m)}
                  onChange={() => toggleMethod(m)}
                />
                {/* 🔹 Colored dot using methodColors */}
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: methodColors[m] }}
                />
                <span>{m}</span>
              </label>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setSelectedMethods(new Set(methods))}
            className="mt-2 text-xs text-blue-600 hover:underline"
          >
            Select all
          </button>
        </div>

        <p className="text-xs text-gray-500">
          Showing <span className="font-semibold">{filtered.length}</span>{" "}
          planets out of <span className="font-semibold">{planets.length}</span>.
        </p>
      </aside>

      {/* Chart panel */}
      <section className="bg-white rounded-lg shadow p-4 border border-gray-100">
        <h2 className="font-semibold mb-2">Radius vs Orbital Period</h2>
        <p className="text-sm text-gray-600 mb-4">
          Each point is a confirmed exoplanet. Use the sliders and checkboxes to
          explore different subsets of the NASA catalog.
        </p>
        <PlanetScatter data={filtered} methodColors={methodColors} />
      </section>
    </div>
  );
}
