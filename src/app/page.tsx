import Image from "next/image";
import Link from "next/link";
import planets from "@/data/planets.json";

const confirmedPlanetCount = planets.length.toLocaleString();

const planetTypes = [
  {
    type: "sub-earth",
    title: "Sub-Earths",
    range: "< 0.8 Earth radii",
    description: "Smaller than Earth. They are difficult to detect unless they orbit close to their stars, so the catalog contains fewer of them.",
  },
  {
    type: "earth",
    title: "Earth-size planets",
    range: "0.8-1.25 Earth radii",
    description: "Roughly Earth-sized worlds. Size makes them interesting, but it does not prove they are rocky, wet, or habitable.",
  },
  {
    type: "super-earth",
    title: "Super-Earths",
    range: "1.25-2 Earth radii",
    description: "Larger than Earth but smaller than Neptune. Some may be rocky; others may have deep oceans or thick gas envelopes.",
  },
  {
    type: "mini-neptune",
    title: "Mini-Neptunes",
    range: "2-3.9 Earth radii",
    description: "Bigger than super-Earths but smaller than Neptune. Many probably have thick atmospheres, and we do not have a close example in our Solar System.",
  },
  {
    type: "hot-neptune",
    title: "Hot Neptunes",
    range: "3.9-8 Earth radii, hot or close-in",
    description: "Neptune-sized planets that orbit close to their stars or receive intense starlight. Their atmospheres can be strongly heated or stripped away.",
  },
  {
    type: "neptune",
    title: "Neptune-like planets",
    range: "3.9-8 Earth radii",
    description: "Ice-giant-scale planets broadly similar in size to Uranus or Neptune, often with deep atmospheres and no solid surface like Earth.",
  },
  {
    type: "gas-giant",
    title: "Gas giants",
    range: ">= 8 Earth radii",
    description: "Large Jupiter- or Saturn-scale planets dominated by gas. They are easier to detect than small rocky planets because of their size and mass.",
  },
  {
    type: "hot-jupiter",
    title: "Hot Jupiters",
    range: ">= 8 Earth radii, hot or close-in",
    description: "Gas giants like Jupiter that orbit extremely close to their stars. They were among the first major surprises in exoplanet science.",
  },
];

function PlanetTypeIcon({ type }: { type: string }) {
  const styles: Record<string, string> = {
    "sub-earth": "bg-[radial-gradient(circle_at_35%_30%,#cbd5e1,#64748b_55%,#334155)]",
    earth: "bg-[radial-gradient(circle_at_35%_30%,#a7f3d0,#16a34a_42%,#0f766e_72%)]",
    "super-earth": "bg-[radial-gradient(circle_at_35%_30%,#67e8f9,#0891b2_48%,#155e75)]",
    "mini-neptune": "bg-[radial-gradient(circle_at_35%_25%,#bfdbfe,#2563eb_55%,#312e81)]",
    "hot-neptune": "bg-[radial-gradient(circle_at_35%_25%,#fed7aa,#ea580c_52%,#7c2d12)]",
    neptune: "bg-[radial-gradient(circle_at_35%_25%,#ddd6fe,#7c3aed_55%,#3730a3)]",
    "gas-giant": "bg-[radial-gradient(circle_at_35%_25%,#fde68a,#ca8a04_55%,#78350f)]",
    "hot-jupiter": "bg-[radial-gradient(circle_at_35%_25%,#fecaca,#dc2626_52%,#7f1d1d)]",
  };

  return (
    <span aria-hidden="true" className={`relative mt-1 h-14 w-14 shrink-0 overflow-hidden rounded-full shadow-sm ring-1 ring-white/70 ${styles[type]}`}>
      {type.includes("hot") ? <span className="absolute inset-[-8px] rounded-full bg-orange-300/20 blur-md" /> : null}
      {type === "gas-giant" || type === "hot-jupiter" ? (
        <>
          <span className="absolute left-0 top-4 h-1.5 w-full bg-white/35" />
          <span className="absolute left-0 top-7 h-2 w-full bg-slate-900/20" />
          <span className="absolute left-0 top-10 h-1 w-full bg-white/25" />
        </>
      ) : null}
      {type === "mini-neptune" || type === "neptune" || type === "hot-neptune" ? (
        <>
          <span className="absolute left-0 top-5 h-2 w-full bg-white/20" />
          <span className="absolute left-0 top-9 h-1.5 w-full bg-slate-950/10" />
        </>
      ) : null}
      {type === "earth" || type === "super-earth" || type === "sub-earth" ? (
        <>
          <span className="absolute left-3 top-4 h-3 w-4 rounded-full bg-white/25" />
          <span className="absolute bottom-3 right-3 h-2 w-3 rounded-full bg-slate-950/18" />
        </>
      ) : null}
      {type === "gas-giant" ? <span className="absolute left-[-8px] top-7 h-3 w-[72px] -rotate-12 rounded-full border border-white/45" /> : null}
    </span>
  );
}

const discoveryMethods = [
  {
    icon: "transit",
    title: "Transit method",
    description: "A planet passes in front of its star and blocks a tiny fraction of the starlight. Missions like Kepler and TESS watch for these repeating dips in brightness.",
    example: "Kepler-186 f",
  },
  {
    icon: "velocity",
    title: "Radial velocity",
    description: "A planet's gravity makes its star wobble. By measuring tiny shifts in the star's spectrum, astronomers can infer the planet's presence and mass.",
    example: "51 Pegasi b",
  },
  {
    icon: "imaging",
    title: "Direct imaging",
    description: "Powerful telescopes block the star's light and directly capture the faint glow of giant planets, as the James Webb Space Telescope has begun to do.",
    example: "HR 8799 c",
  },
  {
    icon: "microlensing",
    title: "Gravitational microlensing",
    description: "A foreground star and its planets act like a gravitational lens, briefly brightening a more distant star. These rare flashes can reveal planets thousands of light-years away.",
    example: "OGLE-2005-BLG-390L b",
  },
  {
    icon: "astrometry",
    title: "Astrometry",
    description: "Astronomers measure a star's tiny side-to-side motion on the sky. This can reveal wider-orbit planets around nearby stars.",
    example: "Gaia astrometric planets",
  },
  {
    icon: "pulsar",
    title: "Pulsar timing",
    description: "Tiny changes in a pulsar's clock-like radio pulses can reveal orbiting planets. This method found some of the first confirmed exoplanets.",
    example: "PSR B1257+12 planets",
  },
];

function DiscoveryMethodIcon({ icon }: { icon: string }) {
  const diagrams: Record<string, React.ReactNode> = {
    transit: <><circle cx="24" cy="24" r="11" /><circle cx="24" cy="24" r="4" fill="currentColor" stroke="none" /><path d="M4 41h10l4-4 4 4h22" /></>,
    velocity: <><path d="M4 27c6 0 6-13 12-13s6 20 12 20 6-13 12-13h4" /><path d="M7 40h34M7 37v6M41 37v6" /></>,
    imaging: <><circle cx="24" cy="24" r="16" /><circle cx="24" cy="24" r="8" /><circle cx="24" cy="24" r="2" fill="currentColor" stroke="none" /><path d="M24 4v5M24 39v5M4 24h5M39 24h5" /></>,
    microlensing: <><circle cx="24" cy="24" r="5" fill="currentColor" stroke="none" /><circle cx="24" cy="24" r="12" /><path d="M24 2v8M24 38v8M2 24h8M38 24h8M8 8l5 5M35 35l5 5" /></>,
    astrometry: <><path d="M24 10l2.5 10.5L37 23l-10.5 2.5L24 36l-2.5-10.5L11 23l10.5-2.5L24 10Z" /><path d="M6 40h36M9 37l-3 3 3 3M39 37l3 3-3 3" /></>,
    pulsar: <><circle cx="24" cy="24" r="5" fill="currentColor" stroke="none" /><path d="M20 19 13 7M28 19l7-12M20 29l-7 12M28 29l7 12M7 16c-3 5-3 11 0 16M41 16c3 5 3 11 0 16" /></>,
  };

  return (
    <span aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center text-teal-800">
      <svg viewBox="0 0 48 48" className="h-11 w-11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {diagrams[icon]}
      </svg>
    </span>
  );
}

export default function HomePage() {
  return (
    <main className="bg-white text-slate-900">
      <section className="relative flex min-h-[300px] items-end overflow-hidden bg-slate-950 sm:min-h-[365px]" aria-labelledby="home-title">
        <Image
          src="/images/hero-hot-jupiters.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-slate-950/5" />
        <div className="relative z-20 mx-auto w-full max-w-6xl px-6 pb-9 pt-6 sm:pb-12 sm:pt-28">
          <p className="text-xs font-bold uppercase text-teal-200">NASA data · real observations · guided inquiry</p>
          <h1 id="home-title" className="mt-3 max-w-4xl text-[42px] font-bold leading-none text-white sm:text-6xl lg:text-7xl">
            Exoplanet Explorer
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-slate-100 sm:text-lg">
            Exoplanet Explorer uses the NASA Exoplanet Archive and mission catalogs to turn authentic telescope data into accessible visualizations, stories, and challenges.
          </p>
        </div>
      </section>

      <section aria-label="Exoplanet statistics" className="grid grid-cols-3 border-b border-slate-200">
        <div className="min-w-0 border-r border-slate-200 px-3 py-4 sm:px-6 sm:py-5 lg:pl-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))]">
          <p className="text-[11px] font-bold uppercase leading-tight text-slate-500 sm:text-xs">Confirmed exoplanets</p>
          <p className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">{confirmedPlanetCount}</p>
        </div>
        <div className="min-w-0 border-r border-slate-200 px-3 py-4 sm:px-6 sm:py-5">
          <a href="https://exoplanetarchive.ipac.caltech.edu/docs/counts_detail.html" target="_blank" rel="noreferrer" title="NASA Exoplanet Archive TESS project candidate statistics" className="text-[11px] font-bold uppercase leading-tight text-slate-500 underline underline-offset-2 hover:text-teal-800 sm:text-xs">TESS candidates</a>
          <p className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">8,100+</p>
          <p className="mt-1 text-[11px] leading-tight text-slate-500">Not all confirmed</p>
        </div>
        <div className="min-w-0 px-3 py-4 sm:px-6 sm:py-5">
          <p className="text-[11px] font-bold uppercase leading-tight text-slate-500 sm:text-xs">Years of discoveries</p>
          <p className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">30+</p>
        </div>
      </section>

      <section aria-label="Explore the site" className="grid grid-cols-3 border-b border-slate-200">
        <Link href="/lab/playground" className="group min-w-0 border-r border-slate-200 px-3 py-4 transition-colors hover:bg-teal-50 focus-visible:bg-teal-50 sm:px-6 sm:py-5 lg:pl-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))]">
          <span className="block text-xs font-bold leading-snug text-slate-900 sm:text-lg">Planet Playground <span aria-hidden="true" className="hidden text-teal-700 sm:inline">↗</span></span>
          <span className="mt-2 hidden text-[11px] leading-snug text-slate-600 min-[360px]:block sm:text-sm">Search and compare planets</span>
        </Link>
        <Link href="/lab/methods" className="group min-w-0 border-r border-slate-200 px-3 py-4 transition-colors hover:bg-teal-50 focus-visible:bg-teal-50 sm:px-6 sm:py-5">
          <span className="block text-xs font-bold leading-snug text-slate-900 sm:text-lg">Detection Lab <span aria-hidden="true" className="hidden text-teal-700 sm:inline">↗</span></span>
          <span className="mt-2 hidden text-[11px] leading-snug text-slate-600 min-[360px]:block sm:text-sm">Examine measured signals</span>
        </Link>
        <Link href="/lab/hz" className="group min-w-0 px-3 py-4 transition-colors hover:bg-teal-50 focus-visible:bg-teal-50 sm:px-6 sm:py-5">
          <span className="block text-xs font-bold leading-snug text-slate-900 sm:text-lg">Habitable Zone <span aria-hidden="true" className="hidden text-teal-700 sm:inline">↗</span></span>
          <span className="mt-2 hidden text-[11px] leading-snug text-slate-600 min-[360px]:block sm:text-sm">Explore possible habitability</span>
        </Link>
      </section>

      <section aria-labelledby="science-heading" className="pt-6 sm:pt-10">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 pb-9 lg:grid-cols-[1.3fr_1fr] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase text-teal-700">The science behind the search</p>
            <h2 id="science-heading" className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">Find patterns. Ask better questions.</h2>
          </div>
          <p className="max-w-lg text-base leading-relaxed text-slate-600">
            Turn NASA catalog measurements and telescope signals into questions you can investigate.
          </p>
        </div>
        <div className="grid border-y border-slate-200 md:grid-cols-2">
          <article className="min-w-0 border-b border-slate-200 md:border-b-0 md:border-r">
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-950">
              <Image src="/images/trappist-system.jpg" alt="Artist's concept of the TRAPPIST-1 planetary system" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-contain" />
            </div>
            <div className="mx-auto max-w-2xl px-6 py-8 sm:py-10">
              <p className="text-xs font-bold uppercase text-teal-700">01 / Explore the worlds</p>
              <h3 className="mt-2 text-2xl font-bold">What are exoplanets?</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                Exoplanets orbit other stars, or in rare cases drift through space on their own. They range from small rocky worlds to gas giants larger than Jupiter. Some orbit in just a few days; others take far longer.
              </p>
              <ul className="mt-5 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-700 sm:text-base">
                <li>Thousands of exoplanets have been confirmed so far.</li>
                <li>Many live in multi-planet systems, like our own.</li>
                <li>Some orbit two stars; others wander as rogue planets.</li>
              </ul>
              <a href="https://science.nasa.gov/exoplanets/what-is-an-exoplanet/" target="_blank" rel="noreferrer" className="mt-5 inline-block text-sm font-bold text-teal-800 underline underline-offset-4 hover:text-teal-950">Learn more on NASA ↗</a>
            </div>
          </article>
          <article className="min-w-0">
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-950">
              <Image src="/images/55-cancri-e.jpg" alt="Artist's concept of the super-Earth 55 Cancri e" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
            </div>
            <div className="mx-auto max-w-2xl px-6 py-8 sm:py-10">
              <p className="text-xs font-bold uppercase text-teal-700">02 / Interpret the evidence</p>
              <h3 className="mt-2 text-2xl font-bold">Why study them?</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                Exoplanets show that our Solar System is only one way planets can form and arrange themselves. We have found lava worlds such as 55 Cancri e and compact systems with several Earth-sized planets, such as TRAPPIST-1.
              </p>
              <ul className="mt-5 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-700 sm:text-base">
                <li>Planets appear to outnumber stars in our galaxy.</li>
                <li>Some orbits take hours; others take centuries.</li>
                <li>Some rocky planets receive roughly Earth-like levels of starlight, though that alone does not establish habitability.</li>
              </ul>
              <a href="https://science.nasa.gov/exoplanets/big-questions/" target="_blank" rel="noreferrer" className="mt-5 inline-block text-sm font-bold text-teal-800 underline underline-offset-4 hover:text-teal-950">Explore the big questions ↗</a>
            </div>
          </article>
        </div>
      </section>

      <section id="planet-types" aria-labelledby="types-heading" className="scroll-mt-24 bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase text-teal-700">A guide to the catalog</p>
            <h2 id="types-heading" className="mt-2 text-3xl font-bold sm:text-4xl">Types of exoplanets</h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
              Astronomers group exoplanets by size, temperature, and how they compare to planets we know. The Playground uses a simple classroom classifier: radius sets the main size family, while very hot or close-in planets are flagged as hot Neptune-like or hot Jupiter-like worlds.
            </p>
          </div>
          <div className="mt-10 grid gap-x-12 md:grid-cols-2">
            {planetTypes.map((planetType) => (
              <article key={planetType.title} className="flex gap-4 border-t border-slate-300 py-5">
                <PlanetTypeIcon type={planetType.type} />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h3 className="text-lg font-bold">{planetType.title}</h3>
                    <span className="text-xs font-semibold text-slate-500">{planetType.range}</span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{planetType.description}</p>
                </div>
              </article>
            ))}
          </div>
          <a href="https://science.nasa.gov/exoplanets/planet-types/" target="_blank" rel="noreferrer" className="mt-8 inline-block text-sm font-bold text-teal-800 underline underline-offset-4 hover:text-teal-950">Learn more about planet types on NASA ↗</a>
        </div>
      </section>

      <section id="discovery-methods" aria-labelledby="methods-heading" className="scroll-mt-24 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase text-teal-700">Reading the signals</p>
            <h2 id="methods-heading" className="mt-2 text-3xl font-bold sm:text-4xl">How do we discover exoplanets?</h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
              Exoplanets are small and faint compared to their stars, so astronomers often detect them indirectly through changes in starlight or stellar motion.
            </p>
          </div>
          <div className="mt-10 grid gap-x-12 md:grid-cols-2">
            {discoveryMethods.map((method) => (
              <article key={method.title} className="grid grid-cols-[3rem_1fr] gap-4 border-t border-slate-300 py-6">
                <DiscoveryMethodIcon icon={method.icon} />
                <div>
                  <h3 className="text-lg font-bold">{method.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{method.description}</p>
                  <p className="mt-3 text-xs font-semibold text-slate-500">Example: {method.example}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link href="/lab/methods" className="button-primary">Try the Detection Methods Lab ↗</Link>
            <a href="https://science.nasa.gov/exoplanets/facts/" target="_blank" rel="noreferrer" className="text-sm font-bold text-teal-800 underline underline-offset-4 hover:text-teal-950">Read more on NASA ↗</a>
          </div>
        </div>
      </section>

      <section aria-labelledby="credits-heading" className="border-t border-slate-200 bg-slate-50 py-12">
        <div className="mx-auto max-w-6xl px-6">
          <h2 id="credits-heading" className="text-xl font-bold">Acknowledgements &amp; data credits</h2>
          <div className="mt-5 grid gap-8 text-sm leading-relaxed text-slate-600 md:grid-cols-2">
            <div>
              <h3 className="font-bold text-slate-900">Data and learning resources</h3>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                <li><a href="https://exoplanetarchive.ipac.caltech.edu/" target="_blank" rel="noreferrer" className="font-semibold text-teal-800 underline underline-offset-2">NASA Exoplanet Archive</a> (NExScI / Caltech): confirmed-planet catalog data.</li>
                <li><a href="https://science.nasa.gov/exoplanets/" target="_blank" rel="noreferrer" className="font-semibold text-teal-800 underline underline-offset-2">NASA Science</a>: educational background and mission information.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Image credits</h3>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                <li>Hero, <a href="https://science.nasa.gov/image-detail/clear-to-cloudy-hot-jupiters/" target="_blank" rel="noreferrer" className="font-semibold text-teal-800 underline underline-offset-2">Ten Clear to Cloudy Hot Jupiters</a>: ESA/Hubble &amp; NASA.</li>
                <li>TRAPPIST-1 system illustration: NASA Illustrations.</li>
                <li><a href="https://esahubble.org/images/heic1603a/" target="_blank" rel="noreferrer" className="font-semibold text-teal-800 underline underline-offset-2">55 Cancri e artist&apos;s impression</a>: ESA/Hubble, M. Kornmesser.</li>
              </ul>
            </div>
          </div>
          <p className="mt-6 text-xs text-slate-500">This is an independent educational project, not an official NASA or ESA product.</p>
        </div>
      </section>
    </main>
  );
}
