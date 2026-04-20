// src/components/SiteHeader.tsx
import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Logo + label -> Home */}
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-sky-400 to-blue-700" />
          <span className="text-lg font-semibold text-slate-800">
            Exoplanet Explorer
          </span>
        </Link>

        {/* Top nav */}
        <nav className="hidden gap-8 text-sm font-medium text-slate-700 md:flex">
          <Link href="/" className="hover:text-blue-700">
            Home
          </Link>
          <Link href="/modules" className="hover:text-blue-700">
            Modules
          </Link>
          <Link href="/lab/playground" className="hover:text-blue-700">
            Explore Data
          </Link>
          <Link href="/#missions" className="hover:text-blue-700">
            Missions
          </Link>
          <Link href="/#astroguide" className="hover:text-blue-700">
            AstroGuide
          </Link>
        </nav>
      </div>
    </header>
  );
}
