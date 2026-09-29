import type { Planet } from "@/components/PlanetScatter";

export interface CandidateFilters {
  minRadius: number; maxRadius: number; minFlux: number; maxFlux: number;
  maxDistance: number | null; method: string; query: string;
}
export function catalogFlux(planet: Planet) {
  if (typeof planet.pl_insol === "number" && Number.isFinite(planet.pl_insol) && planet.pl_insol > 0)
    return { value: planet.pl_insol, estimated: false };
  if (typeof planet.pl_eqt === "number" && Number.isFinite(planet.pl_eqt) && planet.pl_eqt > 0)
    return { value: (planet.pl_eqt / 255) ** 4, estimated: true };
  return null;
}
export function filterCandidates(planets: Planet[], filters: CandidateFilters) {
  const query = filters.query.trim().toLowerCase();
  return planets.flatMap((planet) => {
    const flux = catalogFlux(planet);
    if (!flux || !Number.isFinite(planet.pl_rade) || planet.pl_rade < filters.minRadius || planet.pl_rade > filters.maxRadius || flux.value < filters.minFlux || flux.value > filters.maxFlux) return [];
    if (filters.maxDistance !== null && (typeof planet.sy_dist !== "number" || !Number.isFinite(planet.sy_dist) || planet.sy_dist > filters.maxDistance)) return [];
    if (filters.method !== "all" && planet.discoverymethod !== filters.method) return [];
    if (query && !`${planet.pl_name} ${planet.hostname ?? ""}`.toLowerCase().includes(query)) return [];
    return [{ planet, flux }];
  });
}

export type HabitableZoneSection = "catalog" | "simulator" | "investigate";

export function getHabitableZoneSection(value: string | null | undefined): HabitableZoneSection {
  return value === "simulator" || value === "investigate" ? value : "catalog";
}

export function planetHabitabilityUrl(name: string, context?: { section?: HabitableZoneSection; search?: string }) {
  const params = new URLSearchParams();
  if (context?.section) params.set("section", context.section);
  if (context?.search) params.set("search", context.search);
  const query = params.toString();
  return `/lab/hz/planet/${encodeURIComponent(name)}${query ? `?${query}` : ""}`;
}

export function assessHabitability(planet: Planet) {
  const flux = catalogFlux(planet);
  const zone = !flux ? "unknown" : flux.value > 1.7 ? "inside-orbit" : flux.value < 0.35 ? "outside-orbit" : "in-zone";
  const orbit = typeof planet.pl_orbsmax === "number" && Number.isFinite(planet.pl_orbsmax) && planet.pl_orbsmax > 0 ? planet.pl_orbsmax : null;
  const brightness = flux && orbit ? flux.value * orbit ** 2 : null;
  return { flux, zone, orbit, inner: brightness ? Math.sqrt(brightness / 1.7) : null, outer: brightness ? Math.sqrt(brightness / 0.35) : null };
}
