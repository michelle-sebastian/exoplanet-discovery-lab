import MethodsBackToTop from "@/components/MethodsBackToTop";

export default function MethodOverview({ method }: { method: "transit" | "velocity" }) {
  const transit = method === "transit";
  const facts = transit ? [
    ["What we measure", "A small, repeating decrease in the star’s brightness."],
    ["What we learn", "The time between dips gives the orbital period; depth and star size give the planet’s radius."],
    ["What limits detection", "The orbit must cross our line of sight. Small dips, noise, and long periods make signals harder to find."],
  ] : [
    ["What we measure", "Doppler shifts in the star’s spectrum as it moves toward and away from us."],
    ["What we learn", "The repeating motion reveals an orbital period and constrains mass, usually a minimum mass if inclination is unknown."],
    ["What limits detection", "Signal strength depends on planet and star mass, period, and viewing angle. Stellar activity can imitate or hide it."],
  ];
  return <section id={`${method}-overview`} className="lab-panel p-5 sm:p-6" aria-labelledby={`${method}-overview-heading`}>
    <p className="page-eyebrow">How the method works</p>
    <h2 id={`${method}-overview-heading`} className="mt-2 text-xl font-semibold">{transit ? "Find a planet through a dip in starlight" : "Find a planet through its star’s motion"}</h2>
    <p className="mt-2 text-sm leading-6 text-slate-700">{transit ? "When a planet passes between us and its star, it blocks a little starlight. Repeated dips help astronomers identify an orbiting companion; additional checks distinguish planets from stellar variability or eclipsing stars." : "A planet and its star orbit their shared center of mass. The star’s motion shifts its spectral lines toward shorter wavelengths when approaching us and longer wavelengths when receding. Astronomers measure those shifts as radial velocity."}</p>
    <div className="mt-4 grid items-center gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
      <figure className="mx-auto w-full max-w-[300px]">
        {transit ? <svg viewBox="0 0 300 130" role="img" aria-label="A planet in front of its star blocks some light traveling toward an observer">
          <ellipse cx="80" cy="54" rx="58" ry="22" fill="none" stroke="#94a3b8" strokeDasharray="4 4" />
          <circle cx="80" cy="54" r="34" fill="#fbbf24" />
          <circle cx="97" cy="58" r="9" fill="#334155" stroke="white" strokeWidth="2" />
          <path d="M126 38 H224 M126 68 H224 M218 32 L226 38 L218 44 M218 62 L226 68 L218 74" fill="none" stroke="#0f766e" strokeWidth="2" />
          <circle cx="252" cy="54" r="15" fill="#f0fdfa" stroke="#0f766e" strokeWidth="2" />
          <circle cx="252" cy="54" r="5" fill="#0f766e" />
          <text x="80" y="105" textAnchor="middle" fontSize="12" fill="#334155">Planet blocks some light</text>
          <text x="252" y="105" textAnchor="middle" fontSize="12" fill="#334155">Observer</text>
        </svg> : <svg viewBox="0 0 300 130" role="img" aria-label="Two moments in a star’s orbit: approaching an observer causes a blueshift, while receding causes a redshift">
          <circle cx="38" cy="28" r="14" fill="#fbbf24" /><circle cx="38" cy="84" r="14" fill="#fbbf24" />
          <path d="M61 28 H119 L111 22 M119 28 L111 34 M119 84 H61 L69 78 M61 84 L69 90" strokeWidth="2" fill="none" stroke="#64748b" />
          <text x="164" y="32" fontSize="11" fill="#0369a1">Toward us: blueshift</text>
          <text x="164" y="88" fontSize="11" fill="#be123c">Away: redshift</text>
          <path d="M137 19 V37 M141 19 V37 M150 19 V37" stroke="#0369a1" strokeWidth="2" />
          <path d="M141 75 V93 M145 75 V93 M154 75 V93" stroke="#be123c" strokeWidth="2" />
        </svg>}
        <figcaption className="text-center text-xs text-slate-500">Schematic illustration; sizes and motion are exaggerated.</figcaption>
      </figure>
      <dl className="grid gap-3 sm:grid-cols-3">{facts.map(([label, text]) => <div key={label}><dt className="text-sm font-semibold text-teal-800">{label}</dt><dd className="mt-1 text-sm leading-6 text-slate-700">{text}</dd></div>)}</dl>
    </div>
    <p className="mt-3 text-xs leading-5 text-slate-600">Together, transit and radial-velocity measurements can constrain a planet’s radius, mass, and bulk density. <a href="https://science.nasa.gov/exoplanets/how-we-find-and-characterize/" target="_blank" rel="noreferrer" className="font-semibold text-teal-800 underline">NASA: How we find and characterize planets ↗</a></p>
    <MethodsBackToTop />
  </section>;
}
