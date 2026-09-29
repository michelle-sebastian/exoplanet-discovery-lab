import type { Metadata } from "next";
import planets from "@/data/planets.json";
import type { Planet } from "@/components/PlanetScatter";
import ExoplanetGlossaryClient from "./ExoplanetGlossaryClient";

export const metadata: Metadata = { title: "Exoplanet Glossary | Exoplanet Explorer", description: "Exoplanet terms, units, detection methods, and habitability concepts, with real catalog examples and NASA resources." };

const names = ["TRAPPIST-1 e", "HD 209458 b", "Kepler-10 b", "TOI-700 d"];

export default function ExoplanetGlossaryPage() {
  const examples = names.map((name) => (planets as Planet[]).find((planet) => planet.pl_name === name))
    .filter((planet): planet is Planet => Boolean(planet));
  return <ExoplanetGlossaryClient planets={examples} />;
}
