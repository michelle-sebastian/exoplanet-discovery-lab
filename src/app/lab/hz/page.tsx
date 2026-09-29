import { redirect } from "next/navigation";
import { planetHabitabilityUrl } from "@/lib/habitability";
import HabitableZoneClient from "./HabitableZoneClient";
import planets from "@/data/planets.json";
import type { Planet } from "@/components/PlanetScatter";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Habitable Zone Explorer | Exoplanet Explorer" };

export default async function HabitableZonePage({ searchParams }: {
  searchParams: Promise<{ planet?: string | string[] }>;
}) {
  const query = await searchParams;
  const requestedName = typeof query.planet === "string" ? query.planet : null;
  if (requestedName) {
    const selectedPlanet = (planets as Planet[]).find(p => p.pl_name.toLowerCase() === requestedName.toLowerCase());
    if (selectedPlanet) redirect(planetHabitabilityUrl(selectedPlanet.pl_name));
    redirect(planetHabitabilityUrl(requestedName));
  }
  return <HabitableZoneClient />;
}
