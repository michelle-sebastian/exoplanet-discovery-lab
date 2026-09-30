import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About | Exoplanet Explorer",
  description: "An educational astronomy project by Michelle Sebastian, a senior at Simi Valley High School. Explore her story, star-cluster research, and Wonder And Why videos.",
};

const linkStyle = "font-semibold text-teal-800 underline underline-offset-4 hover:text-teal-950";

export default function AboutPage() {
  return (
    <main className="site-page ">
      <header className="page-intro page-intro-wide">
        <p className="text-xs font-semibold uppercase tracking-widest text-teal-700">Curiosity, discovery, and sharing what we learn</p>
        <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">About Exoplanet Explorer</h1>
        <p className="mt-3 text-base leading-7 text-slate-700">An educational project created by Michelle Sebastian to help students explore worlds beyond our solar system. Using real NASA Exoplanet Archive data, it turns astronomical measurements into questions you can investigate for yourself.</p>
      </header>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_1fr] lg:gap-12">
        <section aria-labelledby="michelle-heading">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-700">Meet the creator</p>
          <h2 id="michelle-heading" className="mt-2 text-2xl font-semibold">Hi, I&apos;m Michelle Sebastian.</h2>
          <p className="mt-4 leading-7 text-slate-700">I developed Exoplanet Explorer to make NASA’s exoplanet data easier to explore and understand for high school students and amateur astronomy enthusiasts. Through interactive tools and plain-language explanations, the site helps visitors compare distant worlds, investigate how they were discovered, and understand what the measurements tell us. My goal is to make astronomy more approachable and encourage others to ask their own questions.</p>
          <p className="mt-4 leading-7 text-slate-700">I&apos;m a senior at Simi Valley High School, and I&apos;ve been fascinated by astronomy since third grade. My teacher, Mrs. Bartholomew, sparked a curiosity about the stars that has stayed with me ever since. She would dismiss class by saying, “Keep looking up.” So I did.</p>
          <p className="mt-4 leading-7 text-slate-700">That curiosity has led me to astronomy courses, communities like the Ventura County Astronomical Society (VCAS) and the Astronomical League, and research on star clusters. I enjoy asking questions, working with data, and finding ways to share what I learn.</p>
          <a href="#research" className={`mt-5 inline-block text-sm ${linkStyle}`}>Explore my research ↓</a>
        </section>

        <section aria-labelledby="video-heading" className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          <div className="px-5 pb-4 pt-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-teal-700">Wonder And Why · My educational channel</p>
            <h2 id="video-heading" className="mt-2 text-2xl font-semibold">We Are All Stardust</h2>
          </div>
          <div className="aspect-video w-full bg-slate-950">
            <iframe className="h-full w-full" src="https://www.youtube-nocookie.com/embed/Sq_ZbPTi1Ec" title="We Are All Stardust — Wonder And Why" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
          </div>
          <div className="p-5">
            <p className="text-sm leading-6 text-slate-700">On Wonder And Why, I explore the questions that make science exciting—from the cosmic origins of elements such as gold and platinum to our own connection with the stars.</p>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-3 text-sm">
              <a href="https://www.youtube.com/watch?v=Sq_ZbPTi1Ec" target="_blank" rel="noopener noreferrer" className={linkStyle}>Watch on YouTube ↗</a>
              <a href="https://www.youtube.com/@WonderAndWhy" target="_blank" rel="noopener noreferrer" className={linkStyle}>Explore the channel ↗</a>
            </div>
          </div>
        </section>
      </div>

      <section id="research" aria-labelledby="research-heading" className="mt-12 scroll-mt-24 border-t border-slate-200 pt-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-teal-700">From questions to evidence</p>
        <h2 id="research-heading" className="mt-2 text-2xl font-semibold">My research on star clusters</h2>
        <p className="mt-3 leading-7 text-slate-700">What determines the size of a star cluster? My research examines how cluster mass, age, and the star-forming activity of the host galaxy relate to cluster radius. It has been an opportunity to test ideas against observations and learn from results that challenge an initial hypothesis.</p>
        <div className="mt-6 grid gap-6 md:grid-cols-[1.5fr_1fr]">
          <article className="lab-panel p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">Research preprint · arXiv</p>
            <h3 className="mt-3 text-lg font-semibold leading-7">Influence of star cluster mass, age, and galaxy star formation rate on star cluster radii</h3>
            <p className="mt-3 text-sm leading-6 text-slate-700">Using 5,105 star clusters from the LEGUS survey, I compared predictions based on cluster mass alone with predictions that also considered a cluster&apos;s age and how actively its galaxy forms stars. Adding those factors did not make the size predictions more accurate, and much of the variation in cluster size remained unexplained.</p>
            <a href="https://arxiv.org/abs/2602.00445" target="_blank" rel="noopener noreferrer" className={`mt-4 inline-block text-sm ${linkStyle}`}>Read the preprint on arXiv ↗</a>
          </article>
          <article className="lab-panel p-6" style={{ backgroundColor: "#f7fbf8", border: "1.5px solid #9fb9ad" }}>
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">Recognition</p>
            <h3 className="mt-3 text-lg font-semibold leading-7">2026 National Young Astronomer Award finalist</h3>
            <p className="mt-3 text-sm leading-6 text-slate-700">I was named a finalist for the Astronomical League&apos;s National Young Astronomer Award (NYAA).</p>
            <a href="https://skyandtelescope.org/astronomy-news/california-teen-wins-2026-national-young-astronomer-award/" target="_blank" rel="noopener noreferrer" className={`mt-4 inline-block text-sm ${linkStyle}`}>Read the award coverage ↗</a>
            <a href="/awards/sky-and-telescope-2026-nyaa-article.pdf" target="_blank" rel="noopener noreferrer" className={`mt-2 block text-xs ${linkStyle}`}>View PDF version of the article ↗</a>
          </article>
        </div>
      </section>

      <section aria-labelledby="explore-heading" className="reference-panel mt-10 sm:p-8">
        <h2 id="explore-heading" className="text-xl font-semibold">Start with a question. Follow the evidence.</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Compare planets, investigate possible habitability, or examine the signals astronomers use to find distant worlds.</p>
        <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold">
          <Link href="/lab/playground" className="button-primary">Compare planets →</Link>
          <Link href="/lab/hz" className="rounded-md border border-slate-300 bg-white px-4 py-3 text-teal-800 hover:bg-teal-50">Explore habitability →</Link>
          <Link href="/lab/methods" className="rounded-md border border-slate-300 bg-white px-4 py-3 text-teal-800 hover:bg-teal-50">Investigate detection methods →</Link>
        </div>
      </section>
    </main>
  );
}
