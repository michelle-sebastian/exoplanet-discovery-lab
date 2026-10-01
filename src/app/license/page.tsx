import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Content License | Exoplanet Explorer",
  description: "How to reuse Exoplanet Explorer's original educational materials, and which third-party materials are excluded.",
};

export default function LicensePage() {
  return <main className="site-page">
    <header className="page-intro">
      <h1>Content license</h1>
      <p className="mt-3 text-base leading-7 text-slate-700">You are welcome to share and adapt Michelle Sebastian&apos;s original educational writing and activities from Exoplanet Explorer with credit.</p>
    </header>

    <section className="space-y-4 leading-7 text-slate-700">
      <h2 className="text-xl font-semibold text-slate-950">Creative Commons Attribution 4.0</h2>
      <p>Unless a page says otherwise, the original explanations and learning activities created by Michelle Sebastian for this site are licensed under <a href="https://creativecommons.org/licenses/by/4.0/" rel="license" className="font-semibold text-teal-800 underline underline-offset-4">Creative Commons Attribution 4.0 International (CC BY 4.0)</a>. You may copy, share, and adapt them, including for classes and other educational projects, if you give credit, link to the license, and say whether you made changes.</p>
      <p>Suggested credit: “Exoplanet Explorer by Michelle Sebastian, licensed under CC BY 4.0.” Include a link to <Link href="/" className="font-semibold text-teal-800 underline underline-offset-4">Exoplanet Explorer</Link> and note any changes you made.</p>

      <h2 className="pt-4 text-xl font-semibold text-slate-950">What this license does not cover</h2>
      <p>The CC BY license does not apply to NASA Exoplanet Archive data, third-party images and illustrations, videos, linked articles, the Sky &amp; Telescope article PDF, or the site&apos;s software code. Those materials retain their own terms. Check the <Link href="/#credits-heading" className="font-semibold text-teal-800 underline underline-offset-4">data and image credits</Link> and the original sources before reusing them.</p>
    </section>
  </main>;
}
