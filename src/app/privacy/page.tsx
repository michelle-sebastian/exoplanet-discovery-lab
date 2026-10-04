import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy | Exoplanet Explorer",
  description: "How Exoplanet Explorer uses visitor analytics and handles optional feedback.",
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
      <h2 className="text-xl font-semibold text-slate-900">Optional feedback survey</h2>
      <p>The feedback page embeds a Google Form. We ask which pages people explored, how useful and clear they found the site, and, optionally, their broad role, country or region, and comments. No question is required. We do not ask for names, email addresses, school names, exact ages, or IP addresses. Please do not include personal details in comments.</p>
      <p>Responses are stored in the site author&apos;s Google Forms so she can review feedback, analyze aggregated results, and make site improvements. Responses are also saved in a linked private spreadsheet. The site does not publish individual responses. Google processes form visits and submissions under its <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="font-semibold text-teal-800 underline underline-offset-4">Privacy Policy</a>. If you prefer, you can skip the survey entirely.</p>
    </section>
  </main>;
}
