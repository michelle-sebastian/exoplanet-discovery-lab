import type { NumericPlanetField, Planet } from "@/components/PlanetScatter";

export function publishedRadius(planet: Planet): number | null {
  return typeof planet.pl_rade === "number" && Number.isFinite(planet.pl_rade) && planet.pl_rade_is_calculated === false
    ? planet.pl_rade : null;
}

export function estimatedRadius(planet: Planet): number | null {
  return typeof planet.pl_rade === "number" && Number.isFinite(planet.pl_rade) && planet.pl_rade_is_calculated === true
    ? planet.pl_rade : null;
}

export function catalogMass(planet: Planet): { value: number; label: string } | null {
  const value = planet.pl_bmasse;
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const provenance = planet.pl_bmassprov;
  const label = provenance === "Msini" ? "Minimum mass (M sin i)"
    : provenance === "Msin(i)/sin(i)" ? "Mass inferred using inclination"
    : provenance === "M-R relationship" ? "Model-estimated mass"
    : provenance === "Mass" ? "Mass" : "Mass provenance unknown";
  return { value, label };
}

export function plottableValue(planet: Planet, field: NumericPlanetField): number | null {
  if (field === "pl_rade") return publishedRadius(planet);
  if (field === "pl_masse" && planet.pl_bmassprov === "M-R relationship") return null;
  const value = planet[field];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function formatCatalogNumber(value: number | null | undefined, unit = "", digits = 3): string {
  if (typeof value !== "number" || !Number.isFinite(value)) return "Unknown";
  if (value === 0) return `0${unit}`;
  const decimals = Math.max(0, Math.min(6, digits - 1 - Math.floor(Math.log10(Math.abs(value)))));
  return `${value.toLocaleString("en-US", { maximumFractionDigits: decimals })}${unit}`;
}
