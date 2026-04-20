// src/app/lab/playground/page.tsx
import planets from "@/data/planets.json";
import PlaygroundClient from "./PlaygroundClient";
import type { Planet } from "@/components/PlanetScatter";

export default function PlaygroundPage() {
  const planetData = planets as Planet[];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-6 py-12 space-y-4">
        <header>
          <h1 className="mb-2 text-2xl font-bold">Planet Playground</h1>
          <p className="text-gray-600">
            Explore confirmed exoplanets from the NASA Exoplanet Archive. Use filters
            to see how planet radius and orbital period vary across different
            discovery methods.
          </p>
        </header>

        <PlaygroundClient planets={planetData} />
      </div>
    </main>
  );
}
