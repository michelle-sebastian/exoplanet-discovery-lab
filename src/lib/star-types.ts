export const STAR_TYPES = [
  { key: "O", label: "O", range: ">=30000 K", min: 30000, max: Infinity },
  { key: "B", label: "B", range: "10000-30000 K", min: 10000, max: 30000 },
  { key: "A", label: "A", range: "7500-10000 K", min: 7500, max: 10000 },
  { key: "F", label: "F", range: "6000-7500 K", min: 6000, max: 7500 },
  { key: "G", label: "G", range: "5200-6000 K", min: 5200, max: 6000 },
  { key: "K", label: "K", range: "3700-5200 K", min: 3700, max: 5200 },
  { key: "M", label: "M", range: "<3700 K", min: -Infinity, max: 3700 },
] as const;

export function getStarType(teff: number | null | undefined) {
  if (typeof teff !== "number" || !Number.isFinite(teff)) return "Unknown";
  return STAR_TYPES.find(type => teff >= type.min && teff < type.max)?.key ?? "Unknown";
}
