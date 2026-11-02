'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HeaderLogo } from './Logo.jsx';

// Counts are the REAL published manifest counts (11,730 total). Verification-
// pending records stay out of the navigation, so these figures match the
// indexable hubs and sitemaps rather than the raw source folders.
const TRADITIONS = [
  {
    name: 'Islamic Names',
    href: '/names/islamic',
    count: '4,950',
    desc: 'Quranic, Arabic & Urdu names',
    boyHref: '/islamic-boy-names',
    girlHref: '/islamic-girl-names',
    tone: 'islamic',
  },
  {
    name: 'Christian Names',
    href: '/names/christian',
    count: '3,449',
    desc: 'Biblical, Hebrew & Greek names',
    boyHref: '/christian-boy-names',
    girlHref: '/christian-girl-names',
    tone: 'christian',
  },
  {
    name: 'Hindu Names',
    href: '/names/hindu',
    count: '3,331',
    desc: 'Sanskrit & Vedic names',
    boyHref: '/hindu-boy-names',
    girlHref: '/hindu-girl-names',
    tone: 'hindu',
  },
];

const EXPLORE = [
  { name: 'Top Baby Names 2026', href: '/top-baby-names-2026', desc: 'Latest SSA ranking + BabyCenter 2026' },
  { name: 'Rising Names', href: '/trending-names', desc: 'Measured SSA risers, 2024 \u2192 2025' },
  { name: 'Names by State', href: '/baby-names-by-state', desc: 'All 50 states and DC' },
  { name: 'Unique & Rare Names', href: '/unique-baby-names', desc: 'Outside published lists' },
  { name: 'Gender-Neutral Names', href: '/gender-neutral-names', desc: 'Used across genders' },
  { name: 'Vintage Names', href: '/vintage-baby-names', desc: 'Classics making a comeback' },
  { name: 'Biblical Names', href: '/biblical-baby-names', desc: 'Scripture-rooted picks' },
  { name: 'Nature Names', href: '/nature-baby-names', desc: 'Botanical and celestial' },
  { name: 'Short Names', href: '/short-baby-names', desc: 'One and two syllables' },
  { name: 'Names by Meaning', href: '/names-by-meaning', desc: 'Light, strength, peace & grace' },
  { name: 'Names by Origin', href: '/origins', desc: 'Arabic, Hebrew, Sanskrit, Latin' },
  { name: 'Compare Names', href: '/popularity', desc: 'Weigh your finalists side by side' },
  { name: 'My Saved Names', href: '/my-names', desc: 'Your shortlist, kept on this device' },
];

const TONE_CLASS = {
  islamic: 'bg-islamic-soft text-islamic border-islamic-border',
  christian: 'bg-christian-soft text-christian border-christian-border',
  hindu: 'bg-hindu-soft text-hindu border-hindu-border',
  italian: 'bg-italian-soft text-italian border-italian-border',
};

// Sticky bottom tab bar — mobile only. Keeps the four highest-intent
// destinations one thumb-tap away on every page.
const TABS = [
  {
    label: 'Home',
    href: '/',
    match: (p) => p === '/',
    icon: 'M3 10.5 12 3l9 7.5M5.25 9.75V20.25h13.5V9.75',
  },
  {
    label: 'Names',
    href: '/names',
    match: (p) => p.startsWith('/names') || p.endsWith('-names'),
    icon: 'M4 6h16M4 12h16M4 18h10',
  },
  {
    label: 'Search',
    href: '/search',
    match: (p) => p.startsWith('/search'),
    icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  },
  {
    // The shortlist is now real (on-device persistence), so it earns the
    // fourth tab. Rising names remain one tap away in the Explore menu.
    label: 'Saved',
    href: '/my-names',
    match: (p) => p.startsWith('/my-names') || p.startsWith('/popularity'),
    icon: 'M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z',
  },
];

export default function Navbar() {
  const [theme, setTheme] = useState('light');
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (saved === 'dark' || (!saved && prefersDark)) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    setOpenDropdown(null);
    setMobileMenuOpen(false);
  }, [pathname]);

  const toggleTheme = () => {
    if (theme === 'dark') {
      setTheme('light');
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      setTheme('dark');
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-nv-border/80 bg-nv-surface/90 backdrop-blur-xl transition-colors">
        <div className="container-page flex h-16 items-center justify-between gap-3">
          {/* Brand — the real NameVerse mark. It used to be a bare letter "N"
              in a coloured square; the logo file existed but was rendered
              nowhere on the site. */}
          <HeaderLogo />

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
            <Link
              href="/names"
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                pathname.startsWith('/names')
                  ? 'bg-nv-accent-subtle text-nv-accent'
                  : 'text-nv-text-secondary hover:bg-nv-subtle hover:text-nv-text'
              }`}
            >
              All Names
            </Link>

            <div
              className="relative"
              onMouseEnter={() => setOpenDropdown('traditions')}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'traditions' ? null : 'traditions')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  openDropdown === 'traditions'
                    ? 'bg-nv-accent-subtle text-nv-accent'
                    : 'text-nv-text-secondary hover:bg-nv-subtle hover:text-nv-text'
                }`}
                aria-expanded={openDropdown === 'traditions'}
              >
                Traditions
                <svg className={`h-4 w-4 transition-transform ${openDropdown === 'traditions' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {openDropdown === 'traditions' && (
                <div className="absolute left-0 top-full w-[460px] rounded-2xl border border-nv-border bg-nv-surface p-4 shadow-2xl">
                  <div className="mb-2 flex items-center justify-between border-b border-nv-border/60 px-2 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-nv-text-muted">
                      Naming Traditions
                    </span>
                    <Link href="/names" className="text-xs font-semibold text-nv-accent hover:underline">
                      All 11,730 &rarr;
                    </Link>
                  </div>
                  <div className="grid gap-2">
                    {TRADITIONS.map((t) => (
                      <div key={t.name} className="group rounded-xl border border-transparent p-2.5 transition hover:border-nv-border hover:bg-nv-subtle/70">
                        <div className="flex items-center justify-between">
                          <Link href={t.href} className="font-display text-sm font-bold text-nv-text group-hover:text-nv-accent">
                            {t.name}
                          </Link>
                          <span className={`badge border text-[11px] ${TONE_CLASS[t.tone]}`}>{t.count}</span>
                        </div>
                        <p className="mt-0.5 text-xs text-nv-text-secondary">{t.desc}</p>
                        <div className="mt-1.5 flex items-center gap-3 text-[11px] font-medium text-nv-text-muted">
                          <Link href={t.boyHref} className="hover:text-nv-accent hover:underline">Boy names &rarr;</Link>
                          <span>&bull;</span>
                          <Link href={t.girlHref} className="hover:text-nv-accent hover:underline">Girl names &rarr;</Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div
              className="relative"
              onMouseEnter={() => setOpenDropdown('explore')}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'explore' ? null : 'explore')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  openDropdown === 'explore'
                    ? 'bg-nv-accent-subtle text-nv-accent'
                    : 'text-nv-text-secondary hover:bg-nv-subtle hover:text-nv-text'
                }`}
                aria-expanded={openDropdown === 'explore'}
              >
                Explore
                <svg className={`h-4 w-4 transition-transform ${openDropdown === 'explore' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {openDropdown === 'explore' && (
                <div className="absolute -left-24 top-full w-[520px] rounded-2xl border border-nv-border bg-nv-surface p-4 shadow-2xl">
                  <div className="mb-2 border-b border-nv-border/60 px-2 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-nv-text-muted">
                      Discovery &amp; Tools
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {EXPLORE.map((item) => (
                      <Link key={item.href} href={item.href} className="group rounded-xl p-2.5 transition hover:bg-nv-subtle/80">
                        <span className="block text-sm font-bold text-nv-text transition-colors group-hover:text-nv-accent">
                          {item.name}
                        </span>
                        <span className="block text-xs text-nv-text-secondary">{item.desc}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/blog"
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                pathname.startsWith('/blog')
                  ? 'bg-nv-accent-subtle text-nv-accent'
                  : 'text-nv-text-secondary hover:bg-nv-subtle hover:text-nv-text'
              }`}
            >
              Guides
            </Link>
          </nav>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <Link
              href="/search"
              className="hidden items-center gap-2 rounded-xl border border-nv-border bg-nv-subtle/60 px-3 py-2 text-xs text-nv-text-secondary transition hover:border-nv-accent/40 hover:text-nv-text sm:flex"
              aria-label="Search baby names"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="font-medium">Search names</span>
            </Link>

            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-nv-border bg-nv-surface text-nv-text-secondary transition hover:border-nv-accent hover:text-nv-accent"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <svg className="h-4 w-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-nv-border bg-nv-surface text-nv-text lg:hidden"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileMenuOpen && (
          <div className="max-h-[80vh] overflow-y-auto border-b border-nv-border bg-nv-surface px-4 py-5 shadow-2xl lg:hidden">
            <div className="space-y-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-nv-text-muted">Traditions</span>
                <div className="mt-2 space-y-2">
                  {TRADITIONS.map((t) => (
                    <div key={t.name} className="rounded-xl border border-nv-border p-3">
                      <div className="flex items-center justify-between">
                        <Link href={t.href} className="font-bold text-nv-text">{t.name}</Link>
                        <span className={`badge border text-[10px] ${TONE_CLASS[t.tone]}`}>{t.count}</span>
                      </div>
                      <div className="mt-2 flex gap-3 text-xs text-nv-accent">
                        <Link href={t.boyHref} className="underline">Boy names</Link>
                        <span>&bull;</span>
                        <Link href={t.girlHref} className="underline">Girl names</Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-nv-text-muted">Explore</span>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {EXPLORE.map((item) => (
                    <Link key={item.href} href={item.href} className="rounded-xl bg-nv-subtle p-3 text-xs font-semibold text-nv-text">
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>

              <Link href="/search" className="btn-primary w-full">
                Search all 11,730 names
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Sticky mobile tab bar */}
      <nav
        className="mobile-cta-bar justify-around"
        aria-label="Mobile quick navigation"
      >
        {TABS.map((tab) => {
          const active = tab.match(pathname);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex min-h-[44px] flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-1 text-[10px] font-semibold transition ${
                active ? 'text-nv-accent' : 'text-nv-text-muted'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
              </svg>
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
