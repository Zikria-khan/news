import Link from 'next/link';
import { getCluster, SHORT_NAMES, resolveNames, coverage } from '../../lib/data/us-names.js';
import { buildUsPageSchema } from '../../lib/data/us-schema.js';
import { EDITORIAL_FAQ } from '../../lib/data/editorial.js';
import UsPageShell from '../../components/UsPageShell.jsx';
import { pageMetadata } from '../../lib/seo.js';
import NameChip from '../../components/NameChip.jsx';

const SITE_URL = 'https://nameverse.site';
const cluster = getCluster('short-baby-names');
const PAGE_URL = `${SITE_URL}/${cluster.slug}`;

const TITLE = 'Short Baby Names \u2014 One and Two Syllable Picks';
const DESCRIPTION =
  'Short baby names of one and two syllables with meanings and origins \u2014 three-letter names, minimalist picks and names that work across languages.';

export const metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: `/${cluster.slug}`, type: 'article' });

const FAQS = [
  {
    q: 'What are the shortest baby names?',
    a: 'The shortest common names are three letters \u2014 Kai, Leo, Max, Eli, Ivy, Ava, Mia, Zoe. Two-letter names such as Bo and Jo exist but are rare as full names in English-speaking countries.',
  },
  {
    q: 'Why are short baby names so popular?',
    a: 'They are easy to spell, easy to pronounce across languages, and they fit well with long surnames. Several sit near the top of the US ranking: for babies born in 2025, Mia was No. 6 and Ava No. 11 for girls, and Jack No. 15 and Leo No. 19 for boys (SSA).',
  },
  {
    q: 'Do short names have less meaning?',
    a: 'No. Length and meaning are unrelated. Many short names carry substantial meanings, and several double as short forms of longer names \u2014 Eli is a biblical name in its own right that also shortens Elijah, Mia began as a diminutive of Maria, and Leo is Latin for \u201clion\u201d as well as a short form of Leonard. Our profiles record the meaning we hold for each.',
  },
  {
    q: 'Are short names good for bilingual families?',
    a: 'Often, yes. Short names with simple phonetics tend to survive translation better than long ones, because there is less to adapt. Names built from sounds that exist in both languages \u2014 Kai, Leo, Mia, Zoe \u2014 usually need no adjustment at all.',
  },
  ...EDITORIAL_FAQ.slice(0, 2),
];

const BREADCRUMB = [{ name: 'Short Baby Names', href: '/short-baby-names' }];

export default function ShortBabyNamesPage() {
  const resolved = resolveNames(SHORT_NAMES);
  const cov = coverage(SHORT_NAMES);
  const threeLetter = resolved.filter((r) => r.name.replace(/[^a-zA-Z]/g, '').length <= 3);

  const schema = buildUsPageSchema({
    url: PAGE_URL,
    cluster,
    description: DESCRIPTION,
    breadcrumb: BREADCRUMB,
    items: resolved.map((r) => ({ name: r.name, url: r.href, description: r.meaning || undefined })),
    faqs: FAQS,
    sourceKeys: ['ssa2025', 'ssa', 'behindthename'],
  });

  return (
    <UsPageShell
      cluster={cluster}
      intro="Short baby names of one and two syllables, with documented meanings and origins. Short names are the dominant style in current US rankings — they are easy to spell, easy to say across languages, and they pair well with long surnames."
      breadcrumb={BREADCRUMB}
      faqs={FAQS}
      schema={schema}
      sources={['ssa2025', 'ssa', 'behindthename']}
      cta={
        <>
          <h2 className="font-display text-xl font-bold text-nv-text sm:text-2xl">
            Check how a short name is used
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-nv-text-secondary">
            Short names are often unisex, and usage shifts over time. Every profile shows recorded
            gender usage alongside the meaning and origin.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/gender-neutral-names" className="btn-primary">
              Gender-neutral names
            </Link>
            <Link href="/search" className="btn-ghost">
              Search all names
            </Link>
          </div>
        </>
      }
    >
      <section aria-labelledby="list-heading">
        <h2
          id="list-heading"
          className="font-display text-2xl font-bold tracking-tight text-nv-text sm:text-3xl"
        >
          Short names, one and two syllables
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-nv-text-secondary">
          {cov.linked} of these {cov.total} names have a full profile in our database. Solid chips link
          to the profile; dashed chips are names we list but do not yet hold a documented profile for.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {resolved.map((item) => (
            <NameChip key={item.name} item={item} />
          ))}
        </div>
      </section>

      <section className="mt-14" aria-labelledby="three-heading">
        <h2
          id="three-heading"
          className="font-display text-2xl font-bold tracking-tight text-nv-text sm:text-3xl"
        >
          Three-letter names
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-nv-text-secondary">
          The shortest names in the list. Three letters is the practical floor for a name that will not
          be constantly corrected.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {threeLetter.map((item) => (
            <NameChip key={item.name} item={item} />
          ))}
        </div>
      </section>

      <section className="mt-14" aria-labelledby="why-heading">
        <h2
          id="why-heading"
          className="font-display text-2xl font-bold tracking-tight text-nv-text sm:text-3xl"
        >
          Why short names are winning
        </h2>
        <div className="prose-nv mt-4 max-w-3xl">
          <p>
            The current US top 10 is almost entirely one and two syllable names, and the reason is
            practical rather than aesthetic. A short name is faster to say, easier to spell, and less
            likely to be shortened by other people into something you did not choose. It also survives
            translation better, which matters in a country where a large share of families name across
            two languages.
          </p>
          <p>
            There is a second effect worth knowing about. Short names are more likely to be unisex,
            because a name with fewer phonetic markers carries less gender information. That makes the
            short-name list a productive place to look if you want a neutral name \u2014 Kai, Ari, Noa,
            Remi, Wren and Sage all sit in both categories.
          </p>
          <p>
            The trade-off is crowding. Because short names are popular, the best-known ones are common.
            If you want a short name that is not already everywhere, the productive zone is the less
            familiar three-letter names and the short forms of longer traditional names \u2014 Cleo, Juno,
            Rhea, Zora, Ira, Gus. Our{' '}
            <Link href="/unique-baby-names" className="font-semibold text-nv-accent hover:underline">
              unique names page
            </Link>{' '}
            filters for exactly that.
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
            { href: '/gender-neutral-names', label: 'Gender-neutral names', note: 'Used across genders' },
            { href: '/unique-baby-names', label: 'Unique baby names', note: 'Outside published lists' },
            { href: '/nature-baby-names', label: 'Nature baby names', note: 'Botanical and celestial' },
            { href: '/vintage-baby-names', label: 'Vintage baby names', note: 'Classics returning' },
            { href: '/top-baby-names-2026', label: 'Top names 2026', note: 'Current rankings' },
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
