export function nasaPlanetResources(name: string) {
  const scienceSlug = name.toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const archiveAnchor = name.trim().replace(/\s+/g, "-");
  return {
    archive: `https://exoplanetarchive.ipac.caltech.edu/overview/${encodeURIComponent(name)}#planet_${encodeURIComponent(archiveAnchor)}_collapsible`,
    science: `https://science.nasa.gov/exoplanet-catalog/${scienceSlug}/`,
  };
}
