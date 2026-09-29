import Link from "next/link";

const modules = [
  {
    title: "Planet Playground",
    status: "Available",
    href: "/lab/playground",
    accent: "from-cyan-400 to-blue-700",
    description:
      "Filter real exoplanet data, compare planets on a scatter plot, and identify candidates for closer scientific discussion.",
    skills: ["Data filtering", "Graph reading", "Discovery bias"],
    prompt: "Can you find a planet that seems most similar to Earth?",
  },
  {
    title: "Habitable Zone Explorer",
    status: "Available",
    href: "/lab/hz",
    accent: "from-emerald-400 to-lime-600",
    description:
      "Explore how stars and orbits affect habitability, then use radius and starlight to choose a candidate for closer study.",
    skills: ["Star type", "Insolation", "Habitability limits"],
    prompt: "Why does habitable zone not mean inhabited?",
  },
  {
    title: "Discovery Timeline",
    status: "Available",
    href: "/lab/timeline",
    accent: "from-amber-400 to-orange-600",
    description:
      "Watch exoplanet discovery accelerate from early detections through Kepler, TESS, and beyond.",
    skills: ["Scientific progress", "Mission impact", "Time trends"],
    prompt: "What changed after Kepler launched?",
  },
  {
    title: "Detection Methods Lab",
    status: "Available",
    href: "/lab/methods",
    accent: "from-violet-400 to-fuchsia-700",
    description:
      "Measure simulated transits, examine real observations, and use evidence to choose transit and radial-velocity targets.",
    skills: ["Transit dips", "Radial velocity", "Method bias"],
    prompt: "Which method would best reveal each planet?",
  },
  {
    title: "Exoplanet Types",
    status: "Available",
    href: "/#planet-types",
    accent: "from-rose-400 to-red-600",
    description:
      "Sort worlds into rocky planets, super-Earths, mini-Neptunes, gas giants, and hot Jupiters.",
    skills: ["Classification", "Planet diversity", "Solar system comparison"],
    prompt: "Why do some common exoplanet types not exist here?",
  },

];

export default function ModulesPage() {
  return (
    <main className="site-page">
      <section
        className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-sm"
        style={{
          backgroundImage:
            "linear-gradient(135deg, rgba(15,23,42,0.92), rgba(8,47,73,0.78)), url('/images/trappist-system.jpg')",
          backgroundPosition: "center top",
          backgroundSize: "cover",
          backgroundBlendMode: "overlay",
        }}
      >
        <div className="max-w-3xl px-6 py-10 sm:px-10">
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Learning modules
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-200 sm:text-base">
            Build exoplanet understanding one investigation at a time. Each module
            turns NASA archive data into a focused student activity with visuals,
            prompts, and room to ask better questions.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-xs font-semibold text-slate-100">
            <span className="rounded-full bg-white/12 px-3 py-1 ring-1 ring-white/20">
              Real catalog data
            </span>
            <span className="rounded-full bg-white/12 px-3 py-1 ring-1 ring-white/20">
              Guided inquiry
            </span>
            <span className="rounded-full bg-white/12 px-3 py-1 ring-1 ring-white/20">
              Classroom ready
            </span>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {modules.map((module) => {
          const available = module.status === "Available";

          return (
            <article
              key={module.title}
              id={module.href.startsWith("#") ? module.href.slice(1) : undefined}
              className="lab-panel flex min-h-[300px] flex-col p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div
                  className={`h-11 w-11 shrink-0 rounded-full bg-gradient-to-br ${module.accent} shadow-sm`}
                />
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    available
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {module.status}
                </span>
              </div>

              <h2 className="mt-5 text-xl font-semibold text-slate-950">
                {module.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {module.description}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {module.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <p className="mt-5 rounded-md bg-slate-50 p-3 text-sm font-medium text-slate-700">
                {module.prompt}
              </p>

              <div className="mt-auto pt-5">
                {available ? (
                  <Link
                    href={module.href}
                    className="inline-flex rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-800"
                  >
                    Start module
                  </Link>
                ) : (
                  <span className="inline-flex rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-500">
                    Coming soon
                  </span>
                )}
              </div>
            </article>
          );
        })}
      </section>

      <section className="mt-8 lab-panel p-6">
        <h2 className="text-lg font-semibold text-slate-950">Suggested learning path</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Start by comparing planets in Planet Playground. Explore habitability in
          Habitable Zone Explorer and measured signals in Detection Methods Lab,
          then apply your evidence to the candidate-selection exercises in each lab.
        </p>
      </section>
    </main>
  );
}
