import { FooterLogo } from './Logo.jsx';
import Link from 'next/link';

const TRADITIONS = [
  { name: 'Islamic Baby Names', href: '/names/islamic' },
  { name: 'Islamic Boy Names', href: '/islamic-boy-names' },
  { name: 'Islamic Girl Names', href: '/islamic-girl-names' },
  { name: 'Christian Baby Names', href: '/names/christian' },
  { name: 'Christian Boy Names', href: '/christian-boy-names' },
  { name: 'Christian Girl Names', href: '/christian-girl-names' },
  { name: 'Hindu Baby Names', href: '/names/hindu' },
  { name: 'Hindu Boy Names', href: '/hindu-boy-names' },
  { name: 'Hindu Girl Names', href: '/hindu-girl-names' },
];

const DISCOVERY = [
  { name: 'Browse All Names', href: '/names' },
  { name: 'Top Baby Names 2026', href: '/top-baby-names-2026' },
  { name: 'Names by State', href: '/baby-names-by-state' },
  { name: 'Names by Origin', href: '/origins' },
  { name: 'Names by Meaning', href: '/names-by-meaning' },
  { name: 'Curated Categories', href: '/categories' },
  { name: 'Fastest-Rising Names', href: '/trending-names' },
  { name: 'Unique & Rare Names', href: '/unique-baby-names' },
  { name: 'Gender-Neutral Names', href: '/gender-neutral-names' },
  { name: 'Vintage Baby Names', href: '/vintage-baby-names' },
  { name: 'Biblical Baby Names', href: '/biblical-baby-names' },
  { name: 'Muslim Names in America', href: '/muslim-baby-names-america' },
  { name: 'Nature Baby Names', href: '/nature-baby-names' },
  { name: 'Short Baby Names', href: '/short-baby-names' },
  { name: 'A–Z Letter Browser', href: '/names/islamic/letter/a' },
];

const TOOLS = [
  { name: 'Compare Names Side by Side', href: '/popularity' },
  { name: 'My Saved Names', href: '/my-names' },
  { name: 'Instant Name Search', href: '/search' },
  { name: 'How to Choose a Baby Name', href: '/blog/how-to-choose-a-baby-name' },
  { name: 'Baby Naming Articles', href: '/blog' },
  { name: 'XML Sitemap', href: '/sitemap.xml' },
];

const COMPANY = [
  { name: 'About NameVerse', href: '/about' },
  { name: 'Editorial Policy', href: '/editorial-policy' },
  { name: 'Contact Us', href: '/contact' },
  { name: 'Privacy Policy', href: '/privacy' },
  { name: 'Terms of Service', href: '/terms' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-nv-border/80 bg-nv-surface transition-colors">
      <div className="border-b border-nv-border/60 bg-nv-subtle/40 py-8">
        <div className="container-page flex flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
          <div className="max-w-xl">
            <span className="eyebrow">Documented &amp; Sourced</span>
            <h2 className="mt-1 font-display text-lg font-bold text-nv-text">
              A Cultural Name Anthology, Not a Name Generator
            </h2>
            <p className="mt-1 text-xs text-nv-text-secondary">
              11,730 baby names with recorded meanings and origins &mdash; plus script forms, pronunciation and
              cultural context where the record holds them &mdash; across three traditions.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/names" className="btn-primary !min-h-[42px] !px-5 !text-xs">
              Browse the directory &rarr;
            </Link>
            <Link href="/popularity" className="btn-ghost !min-h-[42px] !px-4 !text-xs">
              Compare names
            </Link>
          </div>
        </div>
      </div>

      <div className="container-page py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="flex flex-col gap-4 pr-0 lg:col-span-2 lg:pr-8">
            <FooterLogo />
            <p className="text-sm leading-relaxed text-nv-text-secondary">
              NameVerse helps parents worldwide find baby names of genuine cultural and
              spiritual significance across Islamic, Christian and Hindu traditions.
              Every published entry has a recorded meaning and origin. Founded and run by{' '}
              <Link href="/about" className="font-semibold text-nv-accent hover:underline">Zakriya Khan</Link>.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-nv-success">
              <span className="flex h-2 w-2 rounded-full bg-nv-success" />
              <span>11,730 published name profiles</span>
            </div>
          </div>

          <nav aria-label="Traditions and gender collections">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-nv-text">Traditions</h3>
            <ul className="space-y-2 text-xs">
              {TRADITIONS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="font-medium text-nv-text-secondary transition hover:text-nv-accent">
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Discovery and meaning">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-nv-text">Discovery</h3>
            <ul className="space-y-2 text-xs">
              {DISCOVERY.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="font-medium text-nv-text-secondary transition hover:text-nv-accent">
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Tools and company">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-nv-text">Tools &amp; Guides</h3>
            <ul className="space-y-2 text-xs">
              {TOOLS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="font-medium text-nv-text-secondary transition hover:text-nv-accent">
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>

            <h3 className="mb-3 mt-6 text-xs font-bold uppercase tracking-wider text-nv-text">Company</h3>
            <ul className="space-y-2 text-xs">
              {COMPANY.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="font-medium text-nv-text-secondary transition hover:text-nv-accent">
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-nv-border/80 pt-6 text-xs text-nv-text-muted sm:flex-row">
          <p>&copy; {year} NameVerse. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="transition hover:text-nv-accent">Privacy</Link>
            <Link href="/terms" className="transition hover:text-nv-accent">Terms</Link>
            <Link href="/contact" className="transition hover:text-nv-accent">Contact</Link>
            <Link href="/sitemap.xml" className="transition hover:text-nv-accent">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
