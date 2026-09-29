// src/app/lab/playground/page.tsx
import planets from "@/data/planets.json";
import datasetMeta from "@/data/dataset-meta.json";
import PlaygroundClient from "./PlaygroundClient";
import type { Planet } from "@/components/PlanetScatter";
import { publishedRadius } from "@/lib/catalog-values";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Planet Playground | Exoplanet Explorer" };

export default function PlaygroundPage() {
  const planetData = planets as Planet[];
  const chartReadyCount = planetData.filter(
    (planet) =>
      publishedRadius(planet) !== null &&
      typeof planet.pl_orbper === "number" &&
      planet.pl_orbper > 0
  ).length;

  return (
    <main className="site-page">
      <div className="space-y-8">
        <PlaygroundClient
          planets={planetData}
          chartReadyCount={chartReadyCount}
          datasetRefreshedAt={new Date(`${datasetMeta.fetched_at}T00:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" })}
        />
      </div>
    </main>
  );
}
