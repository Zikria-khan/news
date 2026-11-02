import { Suspense } from 'react';
import Link from 'next/link';
import SearchClient from '../../components/SearchClient.jsx';
import PageJsonLd from '../../components/PageJsonLd.jsx';
import AdSlot from '../../components/AdSlot.jsx';
import { pageMetadata, NOINDEX_FOLLOW } from '../../lib/seo.js';

// Search is a utility page: noindex, follow — and NOT blocked in robots.txt,
// so crawlers can read the noindex and follow the result links.
export const metadata = pageMetadata({
  title: 'Search Baby Names by Name, Meaning & Origin',
  description:
    'Search 11,730 baby names by name, meaning or origin, and filter by tradition, recorded gender and origin — free and instant.',
  path: '/search',
  robots: NOINDEX_FOLLOW,
  canonical: false,
});

const searchJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Search Baby Names',
  description: 'Search 11,730 baby names by name, meaning or origin, filtered by tradition, gender and origin.',
  url: 'https://nameverse.site/search',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://nameverse.site/search?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};

export default function SearchPage() {
  return (
    <div className="container-page py-10 sm:py-14">
      <PageJsonLd data={searchJsonLd} />
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 text-center">
          <span className="eyebrow">Instant name search</span>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-nv-text sm:text-5xl">
            Search Baby Names
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-nv-text-secondary">
            Search 11,730 baby names across traditions by keyword, meaning, language or gender.
          </p>
        </header>

        <AdSlot placement="search-top" />

        <Suspense fallback={<div className="card p-12 text-center text-nv-text-secondary">Loading search…</div>}>
          <SearchClient />
        </Suspense>

        <section className="mt-16 mx-auto max-w-3xl border-t border-nv-border pt-10" aria-labelledby="search-seo-heading">
          <h2 id="search-seo-heading" className="font-display text-2xl font-bold tracking-tight text-nv-text sm:text-3xl">
            The Smartest Way to Find a Baby Name
          </h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-nv-text-secondary sm:text-base">
            <p>
              NameVerse indexes every one of its 11,730 published names so you can search the way you
              actually think &mdash; by a name you heard, a meaning you love, or a language you come from.
              The search box matches the name, its recorded meaning and its origin, so typing
              &ldquo;light&rdquo; with the Arabic origin and Girls filters selected finds Arabic girl names whose
              recorded meaning mentions light.
            </p>
            <p>
              Results are ordered by how well they match: an exact name first, then names that start with
              what you typed, then meaning and origin matches. Every result opens into a full profile with the
              recorded meaning, origin, pronunciation where available, variants and cultural context &mdash;
              and you can save any name to your{' '}
              <Link href="/my-names" className="font-semibold text-nv-accent hover:underline">shortlist</Link>.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
