"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Planet Playground", href: "/lab/playground" },
  { label: "Habitable Zone Explorer", href: "/lab/hz" },
  { label: "Detection Methods Lab", href: "/lab/methods" },
  { label: "Discovery Timeline", href: "/lab/timeline" },
  { label: "Exoplanet Glossary", href: "/glossary" },
  { label: "About", href: "/about" },
];

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="shrink-0 text-lg font-bold text-slate-900 sm:text-xl" aria-label="Exoplanet Explorer home">
          Exoplanet <span className="text-teal-700">Explorer</span>
        </Link>

        <Link href="/feedback" aria-current={pathname === "/feedback" ? "page" : undefined} className="site-feedback-link">
          Share feedback
        </Link>

        <nav aria-label="Main navigation" className="site-desktop-nav">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} aria-current={pathname === item.href ? "page" : undefined} className={`site-nav-link ${pathname === item.href ? "text-teal-800" : ""}`}>
              {item.label}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          aria-controls="mobile-site-nav"
          onClick={() => setMenuOpen((open) => !open)}
          className="site-menu-button"
        >
          <span aria-hidden="true" className="flex w-4 flex-col gap-1">
            <span className="h-0.5 w-4 bg-current" />
            <span className="h-0.5 w-4 bg-current" />
            <span className="h-0.5 w-4 bg-current" />
          </span>
          Menu
        </button>
      </div>
      {menuOpen && (
        <nav id="mobile-site-nav" aria-label="Site" className="site-mobile-nav">
          <div className="mx-auto grid max-w-6xl gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} aria-current={pathname === item.href ? "page" : undefined} onClick={() => setMenuOpen(false)} className="site-nav-link">
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
