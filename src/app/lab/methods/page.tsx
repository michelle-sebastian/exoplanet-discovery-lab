import planets from "@/data/planets.json";
import type { Planet } from "@/components/PlanetScatter";
import DetectionMethodsClient from "./DetectionMethodsClient";
import { Suspense } from "react";

const examples = ["TRAPPIST-1 e", "HD 209458 b", "Kepler-10 b"];

export default function DetectionMethodsLabPage() {
  const cases = examples.map((name) =>
    (planets as Planet[]).find((planet) => planet.pl_name === name)
  ).filter((planet): planet is Planet => Boolean(planet));
  const exerciseNames = [...examples, "51 Peg b", "TOI-700 d", "Kepler-442 b"];
  const exercisePlanets = (planets as Planet[]).filter((planet) => exerciseNames.includes(planet.pl_name));
  return <Suspense fallback={<main className="site-page"><h1>Detection Methods Lab</h1><p className="mt-3" role="status">Loading detection activities…</p></main>}><DetectionMethodsClient planets={cases} exercisePlanets={exercisePlanets} /></Suspense>;
}
