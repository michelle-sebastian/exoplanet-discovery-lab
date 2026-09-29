import type { Planet } from "@/components/PlanetScatter";

export const ALL_METHODS = "All methods";
export const STACK_METHODS = ["Transit", "Radial Velocity", "Microlensing", "Imaging", "Pulsar Timing", "Other methods"];
export const PIE_METHODS = ["Transit", "Radial Velocity", "Microlensing", "Imaging"];
export const PAGE_SIZE = 12;
export type DiscoverySegment = { name: string; count: number };
export type DiscoveryBar = { year: number; annual: number; cumulative: number; segments: DiscoverySegment[] };

export function discoveryMethod(planet: Planet) {
  return planet.discoverymethod || "Unknown";
}

export function countMethods(planets: Planet[]): DiscoverySegment[] {
  const counts = new Map<string, number>();
  for (const planet of planets) {
    const method = discoveryMethod(planet);
    counts.set(method, (counts.get(method) ?? 0) + 1);
  }
  return Array.from(counts, ([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function groupMethodShares(planets: Planet[]) {
  const counts = countMethods(planets);
  const otherMethods = counts.filter(item => !PIE_METHODS.includes(item.name));
  const shares = PIE_METHODS.map(name => ({ name, count: counts.find(item => item.name === name)?.count ?? 0 }));
  shares.push({ name: "Other methods", count: otherMethods.reduce((sum, item) => sum + item.count, 0) });
  return { shares: shares.filter(item => item.count > 0), otherMethods };
}

export function discoveryYears(planets: Planet[]) {
  const years = planets.map(planet => planet.disc_year).filter((year): year is number => typeof year === "number" && Number.isInteger(year) && year > 0);
  if (!years.length) return [];
  const first = Math.min(...years);
  const last = Math.max(...years);
  return Array.from({ length: last - first + 1 }, (_, index) => first + index);
}

export function buildDiscoveryBars(planets: Planet[], years: number[], method: string, view: "annual" | "cumulative"): DiscoveryBar[] {
  const categories = method === ALL_METHODS ? STACK_METHODS : [method];
  const annual = new Map<number, Map<string, number>>();
  for (const planet of planets) {
    const name = discoveryMethod(planet);
    if (method !== ALL_METHODS && name !== method) continue;
    if (typeof planet.disc_year !== "number") continue;
    const category = categories.includes(name) ? name : "Other methods";
    const counts = annual.get(planet.disc_year) ?? new Map<string, number>();
    counts.set(category, (counts.get(category) ?? 0) + 1);
    annual.set(planet.disc_year, counts);
  }
  const running = new Map<string, number>();
  let cumulative = 0;
  return years.map(year => {
    const counts = annual.get(year);
    let discoveries = 0;
    for (const category of categories) {
      const count = counts?.get(category) ?? 0;
      discoveries += count;
      running.set(category, (running.get(category) ?? 0) + count);
    }
    cumulative += discoveries;
    return { year, annual: discoveries, cumulative, segments: categories.map(name => ({ name, count: view === "annual" ? counts?.get(name) ?? 0 : running.get(name) ?? 0 })).filter(item => item.count > 0) };
  });
}

export function selectYearForMethod(planets: Planet[], method: string, selectedYear: number) {
  const matches = planets.filter(planet => method === ALL_METHODS || discoveryMethod(planet) === method);
  if (matches.some(planet => planet.disc_year === selectedYear)) return selectedYear;
  const available = discoveryYears(matches);
  return available.at(-1) ?? selectedYear;
}
