import planets from "@/data/planets.json";
import type { Planet } from "@/components/PlanetScatter";
import TimelineClient from "./TimelineClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Discovery Timeline | Exoplanet Explorer" };

export default function DiscoveryTimelinePage() {
  return <TimelineClient planets={planets as Planet[]} />;
}
