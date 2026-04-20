// src/app/page.tsx
// Homepage for Exoplanet Explorer

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-6 space-y-16 pb-20">
      {/* HERO: NASA metrics + dramatic background */}
      <section
        className="overflow-hidden rounded-3xl shadow-sm ring-1 ring-slate-200/70"
        style={{
          backgroundImage:
            "linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,64,175,0.80)), url('/images/hero-hot-jupiters.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundBlendMode: "overlay",
        }}
      >
        <div className="px-6 py-6 sm:px-10 sm:py-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-sky-300">
            Built on real NASA data
          </p>

          <h1 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
            Explore thousands of worlds beyond our Solar System.
          </h1>

          <p className="mt-3 max-w-2xl text-sm sm:text-base text-slate-200">
            Exoplanet Explorer uses the NASA Exoplanet Archive and mission catalogs
            to turn authentic telescope data into student-friendly visualizations,
            stories, and challenges.
          </p>

          {/* Metrics row */}
          <dl className="mt-5 grid gap-4 text-sm text-slate-100 sm:grid-cols-3">
            <div>
              <dt className="text-sky-200">Confirmed exoplanets</dt>
              <dd className="mt-1 text-lg font-semibold">6,000+</dd>
            </div>
            <div>
              <dt className="text-sky-200">TESS planet candidates</dt>
              <dd className="mt-1 text-lg font-semibold">7,700+</dd>
            </div>
            <div>
              <dt className="text-sky-200">Years of discoveries</dt>
              <dd className="mt-1 text-lg font-semibold">30+</dd>
            </div>
          </dl>

          {/* CTAs */}
          <div className="mt-6 flex flex-wrap gap-4">
            <a
              href="/modules"
              className="rounded-lg bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-600"
            >
              Browse learning modules
            </a>
            <a
              href="/lab/playground"
              className="rounded-lg border border-sky-300/80 bg-slate-950/20 px-5 py-2.5 text-sm font-semibold text-sky-100 hover:border-sky-100 hover:bg-slate-900/60"
            >
              Explore NASA planet data
            </a>
          </div>
        </div>
      </section>

      {/* WHAT / WHY sections */}
      <section className="grid gap-10 lg:grid-cols-2">
        {/* What are exoplanets? */}
        <article className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="h-48 overflow-hidden">
            <img
              src="/images/trappist-system.jpg"
              alt="Artist’s concept of the TRAPPIST-1 planetary system"
              className="h-full w-full object-cover object-top"
            />
          </div>
          <div className="p-6 sm:p-7">
            <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
              What are exoplanets?
            </h2>
            <p className="mt-3 text-sm text-slate-700">
              Exoplanets are planets that orbit other stars, or in rare cases drift through
              space on their own. They range from gas giants larger than Jupiter to small,
              rocky worlds about the size of Earth and Mars. Some bake in a few-day “year”
              close to their stars; others orbit far out in deep freeze.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              <li>• Thousands of exoplanets have been confirmed so far.</li>
              <li>• Many live in multi-planet systems, like our own.</li>
              <li>• Some orbit two stars at once or wander as “rogue” planets.</li>
            </ul>
            <a
              href="https://science.nasa.gov/exoplanets/what-is-an-exoplanet/"
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex text-sm font-semibold text-sky-700 hover:text-sky-900"
            >
              Learn more on NASA &rarr;
            </a>
          </div>
        </article>

        {/* What’s cool about exoplanets? */}
        <article className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="h-48 overflow-hidden">
            <img
              src="/images/55-cancri-e.jpg"
              alt="Artist’s concept of the super-Earth exoplanet 55 Cancri e"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="p-6 sm:p-7">
            <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
              What&apos;s cool about exoplanets?
            </h2>
            <p className="mt-3 text-sm text-slate-700">
              Exoplanets show us that our Solar System is just one example of how planets
              can arrange themselves. We&apos;ve found lava worlds like 55 Cancri e, puffy
              gas giants bigger than Jupiter, and compact systems where seven Earth-sized
              planets huddle close to a red dwarf star.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              <li>• There are more planets than stars in our galaxy.</li>
              <li>• Some orbits take only hours; others take centuries.</li>
              <li>• Estimates suggest hundreds of millions of potentially habitable worlds.</li>
            </ul>
            <a
              href="https://science.nasa.gov/exoplanets/big-questions/"
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex text-sm font-semibold text-indigo-700 hover:text-indigo-900"
            >
              Learn more on NASA &rarr;
            </a>
          </div>
        </article>
      </section>

      {/* TYPES OF EXOPLANETS */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-amber-900 sm:text-3xl">
            Types of exoplanets
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-700">
            Astronomers group exoplanets by size, temperature, and how they compare
            to planets we know. Here are a few of the most common types you&apos;ll meet
            in the data.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {/* Hot Jupiters */}
          <div className="flex gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="mt-1 h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 shadow-sm shadow-orange-300" />
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Hot Jupiters</h3>
              <p className="mt-1 text-sm text-slate-700">
                Gas giants like Jupiter, but &ldquo;parked&rdquo; extremely close to their
                stars. Their atmospheres can reach thousands of degrees, with exotic winds
                and clouds made of metals or glass.
              </p>
            </div>
          </div>

          {/* Super-Earths */}
          <div className="flex gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="mt-1 h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-sm shadow-emerald-300" />
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Super-Earths</h3>
              <p className="mt-1 text-sm text-slate-700">
                Rocky planets larger than Earth but smaller than Neptune. Some may be
                scaled-up Earths; others could be lava-ocean worlds like 55 Cancri e.
              </p>
            </div>
          </div>

          {/* Mini-Neptunes */}
          <div className="flex gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="mt-1 h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-sky-400 via-indigo-500 to-violet-500 shadow-sm shadow-sky-300" />
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Mini-Neptunes</h3>
              <p className="mt-1 text-sm text-slate-700">
                Planets a bit larger than Earth with thick atmospheres. We don&apos;t
                have any in our Solar System, so they&apos;re a key clue to how other
                planetary systems form.
              </p>
            </div>
          </div>

          {/* Habitable-zone Earths */}
          <div className="flex gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="mt-1 h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-lime-400 to-emerald-500 shadow-sm shadow-lime-300" />
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Habitable-zone Earth-size planets
              </h3>
              <p className="mt-1 text-sm text-slate-700">
                Worlds similar in size to Earth that orbit in the &ldquo;just right&rdquo;
                temperature zone around their stars, like several of the TRAPPIST-1 planets.
              </p>
            </div>
          </div>
        </div>

        <a
          href="https://science.nasa.gov/exoplanets/planet-types/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex text-sm font-semibold text-amber-700 hover:text-amber-900"
        >
          Learn more planet types on NASA &rarr;
        </a>
      </section>

      {/* HOW DO WE DISCOVER THEM? */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-emerald-900 sm:text-3xl">
            How do we discover exoplanets?
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-700">
            Exoplanets are tiny and faint compared to their stars, so astronomers rely on
            clever indirect methods to find them.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {/* Transit */}
          <div className="flex gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-700 shadow-sm shadow-sky-300">
              <div className="h-5 w-5 rounded-full bg-slate-50/10 ring-2 ring-sky-200" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Transit method</h3>
              <p className="mt-1 text-sm text-slate-700">
                A planet passes in front of its star and blocks a tiny fraction of the
                starlight. Missions like Kepler and TESS watch for these repeating dips
                in brightness.
              </p>
            </div>
          </div>

          {/* Radial velocity */}
          <div className="flex gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 shadow-sm shadow-emerald-300">
              <div className="h-4 w-4 rounded-full border-2 border-slate-50" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Radial-velocity</h3>
              <p className="mt-1 text-sm text-slate-700">
                A planet&apos;s gravity makes its star wobble. By measuring tiny shifts
                in the star&apos;s spectrum, astronomers can infer the planet&apos;s
                presence and mass.
              </p>
            </div>
          </div>

          {/* Direct imaging */}
          <div className="flex gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-violet-600 shadow-sm shadow-fuchsia-300">
              <div className="h-4 w-4 rounded-full bg-slate-900/80" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Direct imaging</h3>
              <p className="mt-1 text-sm text-slate-700">
                Powerful telescopes block the star&apos;s light and directly capture
                the faint glow of giant planets, as the James Webb Space Telescope has
                begun to do.
              </p>
            </div>
          </div>

          {/* Microlensing */}
          <div className="flex gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-rose-500 shadow-sm shadow-amber-300">
              <div className="h-4 w-4 rounded-full bg-slate-50/20" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Gravitational microlensing
              </h3>
              <p className="mt-1 text-sm text-slate-700">
                A foreground star–and its planets–act like a magnifying glass, briefly
                brightening a more distant star. These rare flashes can reveal planets
                thousands of light-years away.
              </p>
            </div>
          </div>
        </div>

        <a
          href="https://science.nasa.gov/exoplanets/facts/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex text-sm font-semibold text-emerald-700 hover:text-emerald-900"
        >
          Learn more detection methods on NASA &rarr;
        </a>
      </section>

      {/* ACKNOWLEDGEMENTS */}
      <section className="space-y-3 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-lg font-semibold text-slate-900">
          Acknowledgements & data credits
        </h2>
        <p className="text-sm text-slate-700">
          Exoplanet Explorer is inspired by and built on public data and resources from:
        </p>
        <ul className="mt-2 space-y-2 text-sm text-slate-700">
          <li>
            •{" "}
            <a
              href="https://exoplanetarchive.ipac.caltech.edu/"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-sky-700 hover:text-sky-900"
            >
              NASA Exoplanet Archive
            </a>{" "}
            (NExScI / Caltech) for confirmed planet catalogs and mission data.
          </li>
          <li>
            •{" "}
            <a
              href="https://science.nasa.gov/exoplanets/"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-sky-700 hover:text-sky-900"
            >
              NASA Exoplanet Exploration Program
            </a>{" "}
            for educational articles, graphics, and mission overviews.
          </li>
          <li>
            • Artist&apos;s concepts from NASA/JPL-Caltech, ESA, and partner missions,
            used here for educational, non-commercial purposes.
          </li>
        </ul>
        <p className="mt-3 text-xs text-slate-500">
          This site is an independent educational project and is not an official NASA product.
        </p>
      </section>
    </main>
  );
}
