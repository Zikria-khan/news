import Link from 'next/link';
import { getManifest } from '../../lib/data/names-data.js';
import {
  getCluster,
  SSA_2025_TOP_20,
  SSA_TOP_1000_SHARE_2025,
  BABYCENTER_2026,
  sampleEvenly,
} from '../../lib/data/us-names.js';
import { buildUsPageSchema } from '../../lib/data/us-schema.js';
import { EDITORIAL_FAQ } from '../../lib/data/editorial.js';
import { pageMetadata } from '../../lib/seo.js';
import UsPageShell from '../../components/UsPageShell.jsx';
import NameCard from '../../components/NameCard.jsx';

const SITE_URL = 'https://nameverse.site';
const cluster = getCluster('unique-baby-names');
const PAGE_URL = `${SITE_URL}/${cluster.slug}`;

const TITLE = 'Unique Baby Names \u2014 Rare Picks With Real Meaning';
const DESCRIPTION =
  '120 unique baby names outside the latest US rankings, each with a recorded meaning and origin \u2014 plus how to check how rare a name really is.';

const SOURCE_KEYS = ['ssa2025', 'ssaLimits', 'ssa', 'babycenter'];

export const metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: `/${cluster.slug}`, type: 'article' });

// The mainstream set we exclude. A name is only "unique" relative to what is
// visible in the published national and independent lists used by this page,
// rather than to a subjective sense of rarity.
const MAINSTREAM = new Set(
  [
    ...SSA_2025_TOP_20.boys.map((r) => r.name),
    ...SSA_2025_TOP_20.girls.map((r) => r.name),
    ...BABYCENTER_2026.boys,
    ...BABYCENTER_2026.girls,
  ].map((n) => n.toLowerCase())
);

function selectUnique(limit = 120) {
  const manifest = getManifest();
  const pool = [];
  for (const rel of Object.keys(manifest)) {
    for (const item of manifest[rel] || []) {
      if (!item.slug || !item.indexable || !item.meaning || !item.origin || item.canonicalSlug) continue;
      if (String(item.origin) === 'Unknown') continue;
      if (MAINSTREAM.has(String(item.name).toLowerCase())) continue;
      pool.push({ ...item, religion: rel });
    }
  }
  // An even A–Z sample. (This used to sort by popularity_score and call the
  // result "the best-documented records" — the score measures no such thing.)
  return sampleEvenly(pool, limit);
}

const FAQS = [
  {
    q: 'What counts as a unique baby name?',
    a: 'On this page, a unique name is one that carries a documented meaning and origin in our database but does not appear in the national and independent ranking lists used by this guide. That is a deliberately practical definition: it excludes names that are merely unfamiliar to one reader but common in the published lists we compare.',
  },
  {
    q: 'Will a unique name cause problems for my child?',
    a: 'The practical risks are spelling and pronunciation, not the name itself. Profiles show a pronunciation guide and recorded spelling variants where the record holds them, so you can check both before committing. Names with a clear phonetic structure travel better than names that require an explanation every time.',
  },
  {
    q: 'How can I check how rare a name really is?',
    a: `Look it up in the Social Security Administration data for the latest birth year. SSA publishes the top 1,000 names with counts, and those covered about ${Math.round(SSA_TOP_1000_SHARE_2025.total)}% of babies born in 2025 \u2014 so a name outside the top 1,000 is genuinely uncommon nationally. Names given to fewer than five babies in a year are not published at all, for privacy.`,
  },
  {
    q: 'Are rare names harder to research?',
    a: 'They can be, which is why we only list names we hold a documented meaning and origin for. A rare name with no documented meaning is a name you cannot explain to your child later, and we do not publish those.',
  },
  ...EDITORIAL_FAQ.slice(0, 2),
];

const BREADCRUMB = [{ name: 'Unique Baby Names', href: '/unique-baby-names' }];

export default function UniqueBabyNamesPage() {
  const unique = selectUnique(120);

  const schema = buildUsPageSchema({
    url: PAGE_URL,
    cluster,
    description: DESCRIPTION,
    breadcrumb: BREADCRUMB,
    items: unique.slice(0, 60).map((u) => ({
      name: u.name,
      url: `/names/${u.religion}/${u.slug}`,
      description: u.meaning || undefined,
    })),
    faqs: FAQS,
    sourceKeys: SOURCE_KEYS,
  });

  return (
    <UsPageShell
      cluster={cluster}
      intro="Unique baby names that sit outside the latest national rankings (SSA\u2019s top 20 for 2025 births and BabyCenter\u2019s 2026 top 40) while still carrying a recorded meaning and origin. Every pick is drawn from our 11,730 published profiles and listed A\u2013Z, so rarity never costs you the cultural depth behind the name."
      breadcrumb={BREADCRUMB}
      faqs={FAQS}
      schema={schema}
      sources={SOURCE_KEYS}
      cta={
        <>
          <h2 className="font-display text-xl font-bold text-nv-text sm:text-2xl">
            Build a shortlist you can live with
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-nv-text-secondary">
            Save the names you like, compare them side by side, and check pronunciation before you
            commit.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/my-names" className="btn-primary">
              Start a shortlist
            </Link>
            <Link href="/names-by-meaning" className="btn-ghost">
              Browse by meaning
            </Link>
          </div>
        </>
      }
    >
      <section aria-labelledby="picks-heading">
        <h2
          id="picks-heading"
          className="font-display text-2xl font-bold tracking-tight text-nv-text sm:text-3xl"
        >
          120 unique baby names
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-nv-text-secondary">
          An even sample across the alphabet, listed A&ndash;Z &mdash; not a ranking. Every card links to the
          full profile: recorded meaning and origin, plus pronunciation, script forms and cultural context where
          the record holds them.
        </p>

        <div className="mt-6 grid gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {unique.map((item) => (
            <NameCard key={`${item.religion}-${item.slug}`} item={item} showReligion />
          ))}
        </div>
      </section>

      <section className="mt-14" aria-labelledby="definition-heading">
        <h2
          id="definition-heading"
          className="font-display text-2xl font-bold tracking-tight text-nv-text sm:text-3xl"
        >
          How we define &ldquo;unique&rdquo;
        </h2>
        <div className="prose-nv mt-4 max-w-3xl">
          <p>
            &ldquo;Unique&rdquo; is a word that means very little on its own. A name can be unique to
            one family and common in another country, or rare nationally and ordinary in one state. So
            we anchor the definition to something checkable: a name qualifies for this page if it has a
            documented meaning and origin in our database and does <strong>not</strong> appear in the
            national or independent ranking lists used by this guide.
          </p>
          <p>
            That is a practical test rather than a strict one: a name outside these short lists can still be
            fairly common, so check a favourite against SSA&rsquo;s full top 1,000 before you call it rare. The
            list also changes as the rankings move \u2014 when a name enters one of those lists, it leaves this
            page, so the definition stays consistent over time.
          </p>
          <p>
            The second filter is documentation. We only list names we can explain. A rare name with no
            documented meaning is a name you cannot tell your child about later, and publishing those
            would make this page longer without making it more useful.
          </p>
        </div>
      </section>

      <section className="mt-14" aria-labelledby="check-heading">
        <h2
          id="check-heading"
          className="font-display text-2xl font-bold tracking-tight text-nv-text sm:text-3xl"
        >
          Three checks before you commit
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="inset-panel">
            <h3 className="text-sm font-bold text-nv-text">Say it out loud, twice</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-nv-text-secondary">
              Read the full name with your surname, then imagine a teacher calling it across a
              classroom. Names that need repeating are the ones that get shortened by other people.
            </p>
          </div>
          <div className="inset-panel">
            <h3 className="text-sm font-bold text-nv-text">Check the spelling burden</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-nv-text-secondary">
              Every profile lists recorded spelling variants. If a name has six common transliterations,
              your child will spend a lifetime correcting the seventh.
            </p>
          </div>
          <div className="inset-panel">
            <h3 className="text-sm font-bold text-nv-text">Know the meaning</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-nv-text-secondary">
              A name is the first thing you give a child and the last thing they will explain about
              themselves. Knowing what it means is the whole point of choosing a rare one.
            </p>
          </div>
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
            { href: '/vintage-baby-names', label: 'Vintage baby names', note: 'Classics returning' },
            { href: '/gender-neutral-names', label: 'Gender-neutral names', note: 'Used across genders' },
            { href: '/nature-baby-names', label: 'Nature baby names', note: 'Botanical and celestial' },
            { href: '/short-baby-names', label: 'Short baby names', note: 'One and two syllables' },
            { href: '/top-baby-names-2026', label: 'Top baby names 2026', note: 'What to avoid if you want rare' },
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
