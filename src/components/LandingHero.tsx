// src/components/LandingHero.tsx
import Link from "next/link";

export default function LandingHero() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 pt-16 pb-24 md:grid-cols-2">
        {/* Left: text */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">
            Interactive exoplanet learning
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Discover worlds beyond our Solar System.
          </h1>

          <p className="mt-4 max-w-xl text-lg text-slate-600">
            Exoplanet Explorer combines clear lessons, hands-on data exploration,
            and real NASA catalogs to help students understand how astronomers find
            and study planets around other stars.
          </p>

          <p className="mt-3 text-sm text-slate-500">
            Free • NGSS-aligned • No account needed
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="#modules"
              className="rounded-lg bg-blue-700 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-800"
            >
              Start learning
            </Link>
            <Link
              href="/lab/playground"
              className="rounded-lg border border-teal-500 px-6 py-3 text-sm font-semibold text-teal-600 hover:border-teal-600 hover:text-teal-700"
            >
              Explore data
            </Link>
          </div>
        </div>

        {/* Right: orbit illustration */}
        <div className="relative flex justify-center md:justify-end">
          {/* Soft background glow */}
          <div className="pointer-events-none absolute inset-y-4 right-0 h-full w-full rounded-full bg-sky-100/40 blur-3xl" />

          <div className="relative h-80 w-80 sm:h-96 sm:w-96">
            <img
              src="/orbit-hero.svg"
              alt="Stylized exoplanet orbits"
              className="h-full w-full"
            />
          </div>
        </div>
      </section>

      {/* Learning Modules */}
      <section
        id="modules"
        className="mx-auto max-w-6xl px-6 py-16 border-t border-slate-200"
      >
        <h2 className="text-2xl font-semibold text-slate-900">
          Learning Modules
        </h2>
        <p className="mt-2 text-slate-600">
          NGSS-aligned exoplanet lessons, activities, and teacher guides will live
          here.
        </p>
      </section>

      {/* Missions */}
      <section
        id="missions"
        className="mx-auto max-w-6xl px-6 py-16 border-t border-slate-200"
      >
        <h2 className="text-2xl font-semibold text-slate-900">Missions</h2>
        <p className="mt-2 text-slate-600">
          Explore real exoplanet missions like Kepler, TESS, and JWST.
        </p>
      </section>

      {/* AstroGuide */}
      <section
        id="astroguide"
        className="mx-auto max-w-6xl px-6 py-16 border-t border-slate-200"
      >
        <h2 className="text-2xl font-semibold text-slate-900">AstroGuide</h2>
        <p className="mt-2 text-slate-600">
          A student-friendly reference for key exoplanet concepts, methods, and
          vocabulary.
        </p>
      </section>
    </main>
  );
}
