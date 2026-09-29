import planets from "@/data/planets.json";
import type { Planet } from "@/components/PlanetScatter";
import TimelineClient from "./TimelineClient";

export default function DiscoveryTimelinePage() {
  return <TimelineClient planets={planets as Planet[]} />;
}
