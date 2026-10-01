import Link from "next/link";

export default function SiteFooter() {
  return <footer className="site-footer">
    <div className="site-footer-inner">
      <div><Link href="/" className="font-semibold text-slate-900">Exoplanet Explorer</Link><p className="mt-1">An independent educational project.</p></div>
      <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-3">
        <Link href="/about">About</Link>
        <Link href="/glossary#further-reading">NASA resources</Link>
        <Link href="/#credits-heading">Data &amp; image credits</Link>
        <Link href="/license">Content license</Link>
        <Link href="/privacy">Privacy</Link>
      </nav>
    </div>
  </footer>;
}
