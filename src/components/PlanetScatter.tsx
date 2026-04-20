// src/components/PlanetScatter.tsx
"use client";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { useState, useMemo } from "react";

export interface Planet {
  pl_name: string;
  pl_rade: number;
  pl_orbper: number;
  discoverymethod?: string;
}

interface PlanetScatterProps {
  data: Planet[];
  methodColors: Record<string, string>; // 🔹 new prop for color coding
}

export default function PlanetScatter({ data, methodColors }: PlanetScatterProps) {
  // 🔹 Log-scale toggle
  const [logScale, setLogScale] = useState<boolean>(true);

  // 🔹 Compute a log-safe domain (min > 0)
  const xDomain = useMemo<[number, number]>(() => {
    const vals = data
      .map((p) => p.pl_orbper)
      .filter((v): v is number => typeof v === "number" && v > 0);

    if (!vals.length) return [1, 10]; // fallback

    const min = Math.min(...vals);
    const max = Math.max(...vals);
    return [min, max];
  }, [data]);

  // 🔹 Methods actually present in this dataset
  const methodsInData = useMemo(
    () => Array.from(new Set(data.map((p) => p.discoverymethod || "Unknown"))),
    [data]
  );

  // 🔹 Custom tooltip with planet name
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || payload.length === 0) return null;

    const p = payload[0].payload;

    return (
      <div className="bg-white shadow-md border border-gray-200 p-2 rounded text-sm">
        <div className="font-semibold text-blue-700 mb-1">{p.pl_name}</div>
        <div>Radius: {p.pl_rade} Earth radii</div>
        <div>Period: {p.pl_orbper} days</div>
        <div>Method: {p.discoverymethod || "Unknown"}</div>
      </div>
    );
  };

  return (
    <div className="w-full h-[500px]">
      {/* Log-scale toggle */}
      <div className="flex items-center gap-2 mb-2">
        <label className="text-sm font-medium">Orbital period scale:</label>
        <button
          className={`px-2 py-1 text-xs rounded border ${
            logScale ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setLogScale(true)}
        >
          Log
        </button>
        <button
          className={`px-2 py-1 text-xs rounded border ${
            !logScale ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setLogScale(false)}
        >
          Linear
        </button>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 10, left: 0, right: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="pl_orbper"
            name="Orbital Period"
            unit=" days"
            type="number"
            scale={logScale ? "log" : "linear"}        // 🔹 log toggle
            domain={xDomain}                           // 🔹 safe numeric domain
            tick={{ fontSize: 11 }}
            label={{ value: "Orbital period (days)", position: "bottom" }}
          />

          <YAxis
            dataKey="pl_rade"
            name="Planet Radius"
            unit=" R⊕"
            type="number"
            domain={["auto", "auto"]}
            tick={{ fontSize: 11 }}
            label={{
              value: "Radius (Earth radii)",
              angle: -90,
              position: "insideLeft",
            }}
          />

          <Tooltip content={<CustomTooltip />} />

          {/* 🔹 One scatter per method, using passed-in colors */}
          {methodsInData.map((method) => {
            const color = methodColors[method] || "#8884d8";
            const subset = data.filter(
              (p) => (p.discoverymethod || "Unknown") === method
            );
            if (!subset.length) return null;

            return (
              <Scatter
                key={method}
                name={method}
                data={subset}
                fill={color}
              />
            );
          })}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
