import type { Metadata } from "next";

const formUrl = "https://docs.google.com/forms/d/e/1FAIpQLSdauP9hg02Y4bw0tLifU25_oVTlZjjK0Qew0tBAV_s7jQBWRw/viewform";

export const metadata: Metadata = {
  title: "Share feedback | Exoplanet Explorer",
  description: "Tell us what helped you learn about exoplanets and what we could improve.",
};

export default function FeedbackPage() {
  return <main className="site-page">
    <header className="page-intro page-intro-wide">
      <p className="page-eyebrow">Help improve this educational resource</p>
      <h1>Share feedback</h1>
      <p className="mt-3 text-base leading-7 text-slate-700">Explore the site, then tell us what helped and what could be clearer. This optional survey takes about two minutes.</p>
    </header>

    <section className="lab-panel overflow-hidden" aria-label="Exoplanet Explorer feedback survey">
      <div className="border-b border-slate-200 bg-teal-50 px-5 py-4 text-sm leading-6 text-slate-700">
        You can skip any question, and no Google account is required. If Google shows your signed-in email address, it is not collected or included in your response. Please leave out names, email addresses, school names, and other personal details. Responses go to a Google Form reviewed by the site creator. <a href="/privacy" className="font-semibold text-teal-800 underline underline-offset-4">Privacy details</a>
      </div>
      <iframe
        title="Exoplanet Explorer feedback form"
        src={`${formUrl}?embedded=true`}
        className="block h-[1750px] w-full border-0 sm:h-[1500px]"
        loading="lazy"
      />
    </section>
    <p className="mt-4 text-sm text-slate-600">If the embedded form does not load, <a href={formUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-teal-800 underline underline-offset-4">open it in a new tab</a>.</p>
  </main>;
}
