import Link from 'next/link';
import { getManifest } from '../../lib/data/names-data.js';
import { getCluster, GENDER_NEUTRAL_NAMES, resolveNames, spreadByInitial } from '../../lib/data/us-names.js';
import { buildUsPageSchema } from '../../lib/data/us-schema.js';
import { EDITORIAL_FAQ } from '../../lib/data/editorial.js';
import { pageMetadata } from '../../lib/seo.js';
import UsPageShell from '../../components/UsPageShell.jsx';
import NameChip from '../../components/NameChip.jsx';
import NameCard from '../../components/NameCard.jsx';

const SITE_URL = 'https://nameverse.site';
const cluster = getCluster('gender-neutral-names');
const PAGE_URL = `${SITE_URL}/${cluster.slug}`;

const TITLE = 'Gender-Neutral Baby Names \u2014 Unisex Names With Meanings';
const DESCRIPTION =
  'Gender-neutral baby names with meanings and origins: names used for boys and girls, unisex names from our database, and how to check current usage.';
const SOURCE_KEYS = ['ssa', 'wikiUnisex', 'behindthename'];

export const metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: `/${cluster.slug}`, type: 'article' });

// Names our own records classify as unisex. There is no meaningful ranking
// for these (the old comment said "ranked by documentation depth" while the
// code sorted by an undocumented popularity score), so take a spread across
// the alphabet and list it A–Z.
function selectUnisex(limit = 24) {
  const manifest = getManifest();
  const out = [];
  for (const rel of Object.keys(manifest)) {
    for (const item of manifest[rel] || []) {
      if (!item.slug || !item.indexable || item.canonicalSlug || !item.meaning) continue;
      if (String(item.gender || '').toLowerCase() !== 'unisex') continue;
      out.push({ ...item, religion: rel });
    }
  }
  return spreadByInitial(out, limit);
}

const FAQS = [
  {
    q: 'What is a gender-neutral baby name?',
    a: 'A gender-neutral name is one that is given to boys and girls in meaningful numbers, rather than being strongly associated with one. Some names are neutral by origin, others become neutral over time as usage shifts \u2014 which is why neutrality is a moving property rather than a fixed category.',
  },
  {
    q: 'Do gender-neutral names stay neutral?',
    a: 'Not always. A name that is balanced today can become strongly associated with one gender later, as usage shifts. SSA publishes US counts by sex for every name given to at least five babies a year, so you can check a name\u2019s current balance rather than relying on its reputation.',
  },
  {
    q: 'Are unisex names a modern invention?',
    a: 'No. Many names now treated as neutral have centuries of use behind them, and in several traditions names were never gender-marked in the first place. What is modern is the deliberate choice of a neutral name, not the names themselves.',
  },
  {
    q: 'How many gender-neutral names does NameVerse list?',
    a: 'About 1,000 published profiles are classified as unisex in their source records across the three traditions we cover. That is the record\u2019s classification, not a measurement of how often each name is given to boys and girls. This page shows a spread of them across the alphabet; the search page can filter the full set.',
  },
  ...EDITORIAL_FAQ.slice(0, 2),
];

const BREADCRUMB = [{ name: 'Gender-Neutral Names', href: '/gender-neutral-names' }];

export default function GenderNeutralNamesPage() {
  const curated = resolveNames(GENDER_NEUTRAL_NAMES);
  const unisex = selectUnisex(24);

  const schema = buildUsPageSchema({
    url: PAGE_URL,
    cluster,
    description: DESCRIPTION,
    breadcrumb: BREADCRUMB,
    items: unisex.map((u) => ({
      name: u.name,
      url: `/names/${u.religion}/${u.slug}`,
      description: u.meaning || undefined,
    })),
    faqs: FAQS,
    sourceKeys: SOURCE_KEYS,
    ordered: false,
  });

  return (
    <UsPageShell
      cluster={cluster}
      intro="Gender-neutral baby names with recorded meanings and origins. This page combines an editorial list of names commonly given to both boys and girls with the names our own records classify as unisex \u2014 and explains how to check how a name is actually used today."
      breadcrumb={BREADCRUMB}
      faqs={FAQS}
      schema={schema}
      sources={SOURCE_KEYS}
      cta={
        <>
          <h2 className="font-display text-xl font-bold text-nv-text sm:text-2xl">
            Check how a name is actually used
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-nv-text-secondary">
            Neutrality shifts over time. Profiles show the gender recorded in the source record; for current US
            usage by sex, check the name in SSA&rsquo;s data.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/search?gender=unisex" className="btn-primary">
              Search unisex names
            </Link>
            <Link href="/names" className="btn-ghost">
              Browse the directory
            </Link>
          </div>
        </>
      }
    >
      <section aria-labelledby="curated-heading">
        <h2
          id="curated-heading"
          className="font-display text-2xl font-bold tracking-tight text-nv-text sm:text-3xl"
        >
          Widely-used gender-neutral names
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-nv-text-secondary">
          An editorial list of names commonly used for both boys and girls in English-speaking countries. The
          balance between boys and girls differs from name to name and changes over time. Solid chips link to a
          full profile; dashed chips are names we list but do not yet hold a published profile for.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {curated.map((item) => (
            <NameChip key={item.name} item={item} />
          ))}
        </div>
      </section>

      <section className="mt-14" aria-labelledby="documented-heading">
        <h2
          id="documented-heading"
          className="font-display text-2xl font-bold tracking-tight text-nv-text sm:text-3xl"
        >
          Unisex names in our database
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-nv-text-secondary">
          Names our source records classify as unisex &mdash; a spread across the alphabet, listed A&ndash;Z. Each
          has a recorded meaning and origin. &ldquo;Unisex&rdquo; here is the record&rsquo;s classification, not a
          measurement of how often the name is given to boys and girls.
        </p>
        <div className="mt-6 grid gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {unisex.map((item) => (
            <NameCard key={`${item.religion}-${item.slug}`} item={item} showReligion />
          ))}
        </div>
      </section>

      <section className="mt-14" aria-labelledby="shifts-heading">
        <h2
          id="shifts-heading"
          className="font-display text-2xl font-bold tracking-tight text-nv-text sm:text-3xl"
        >
          How names drift between genders
        </h2>
        <div className="prose-nv mt-4 max-w-3xl">
          <p>
            Gender association is not a property a name has; it is a pattern in how people use it, and
            patterns move. A name can be evenly split for a generation and then tip decisively one way
            once it becomes fashionable for that gender.
          </p>
          <p>
            This matters practically. If you choose a neutral name because you want it to stay neutral,
            the useful question is not &ldquo;is this name unisex?&rdquo; but &ldquo;which direction is
            its usage moving?&rdquo; A name that is 60/40 today and drifting is a different choice from
            one that has held near 50/50 for decades. In the US you can answer that from SSA&rsquo;s published
            counts by sex and year.
          </p>
          <p>
            The second thing worth knowing is that neutrality is cultural, not universal. A name that is
            firmly one gender in one language can be neutral in another, and families naming across two
            traditions often find that the same name reads differently in each. Our{' '}
            <Link href="/names-by-origin" className="font-semibold text-nv-accent hover:underline">
              names by origin
            </Link>{' '}
            pages are the fastest way to check that.
          </p>
        </div>
      </section>

      <section className="mt-14" aria-labelledby="more-heading">
        <h2
          id="more-heading"
          className="font-display text-2xl font-bold tracking-tight text-nv-text sm:text-3xl"
        >
          Related lists
        </h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { href: '/short-baby-names', label: 'Short baby names', note: 'One and two syllables' },
            { href: '/unique-baby-names', label: 'Unique baby names', note: 'Outside published lists' },
            { href: '/nature-baby-names', label: 'Nature baby names', note: 'Botanical and celestial' },
            { href: '/top-baby-names-2026', label: 'Top names 2026', note: 'Current rankings' },
            { href: '/names-by-meaning', label: 'Names by meaning', note: 'Search by what it means' },
            { href: '/names', label: 'All 11,730 names', note: 'Full directory' },
          ].map((l) => (
            <Link key={l.href} href={l.href} className="card card-hover p-4">
              <span className="block text-sm font-bold text-nv-text">{l.label}</span>
              <span className="mt-0.5 block text-xs text-nv-text-muted">{l.note}</span>
            </Link>
          ))}
        </div>
      </section>
    </UsPageShell>
  );
}
