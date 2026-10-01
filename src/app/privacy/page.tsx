import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy | Exoplanet Explorer",
  description: "How Exoplanet Explorer uses visitor analytics.",
};

export default function PrivacyPage() {
  return <main className="site-page">
    <header className="page-intro">
      <h1>Privacy</h1>
      <p className="mt-3 text-base leading-7 text-slate-700">Exoplanet Explorer uses Vercel Web Analytics to understand which pages visitors use and improve this educational resource.</p>
    </header>

    <section className="space-y-4 leading-7 text-slate-700">
      <p>Web Analytics records anonymous page-view statistics, such as the page visited, approximate location, device and browser type, and referring site. It does not use analytics cookies or give us a way to identify individual visitors. Read <a href="https://vercel.com/docs/analytics/privacy-policy" className="font-semibold text-teal-800 underline underline-offset-4">Vercel&apos;s analytics privacy information</a> for details.</p>
      <p>The site does not ask students to create accounts. Visitor statistics cannot tell us whether someone is a student or whether a classroom used the site.</p>
    </section>
  </main>;
}
