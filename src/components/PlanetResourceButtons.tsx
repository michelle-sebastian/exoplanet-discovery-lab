import { nasaPlanetResources } from "@/lib/planet-resources";

export default function PlanetResourceButtons({ name, className = "" }: { name: string; className?: string }) {
  const links = nasaPlanetResources(name);
  return <div className={`flex flex-wrap gap-3 ${className}`}>
    <a href={links.science} target="_blank" rel="noopener noreferrer" aria-label={`NASA Science: ${name} (opens in a new tab)`} className="inline-flex min-h-11 items-center gap-2 rounded-md border border-teal-700 bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700">NASA Science: {name} <span aria-hidden="true">↗</span></a>
    <a href={links.archive} target="_blank" rel="noopener noreferrer" aria-label={`NASA Archive: ${name} (opens in a new tab)`} className="inline-flex min-h-11 items-center gap-2 rounded-md border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-800 hover:bg-teal-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700">NASA Archive: {name} <span aria-hidden="true">↗</span></a>
  </div>;
}
