import Link from 'next/link';
import { getCluster, VINTAGE_NAMES, resolveNames, coverage } from '../../lib/data/us-names.js';
import { buildUsPageSchema } from '../../lib/data/us-schema.js';
import { EDITORIAL_FAQ } from '../../lib/data/editorial.js';
import UsPageShell from '../../components/UsPageShell.jsx';
import { pageMetadata } from '../../lib/seo.js';
import NameChip from '../../components/NameChip.jsx';

const SITE_URL = 'https://nameverse.site';
const cluster = getCluster('vintage-baby-names');
const PAGE_URL = `${SITE_URL}/${cluster.slug}`;

const TITLE = 'Vintage Baby Names \u2014 Old-Fashioned Names With Meanings';
const DESCRIPTION =
  'Vintage and old-fashioned baby names, from revivals like Theodore and Eleanor to rarer classics like Mabel and Percival \u2014 each with its meaning and origin.';

export const metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: `/${cluster.slug}`, type: 'article' });

const FAQS = [
  {
    q: 'What are vintage baby names?',
    a: 'Vintage names are names that were common in earlier generations, fell out of fashion, and are now being used again. The clearest examples are names that peaked in the late nineteenth or early twentieth century and had become rare by the 1990s \u2014 Eleanor, Theodore, Mabel, Walter, Hazel, Arthur.',
  },
  {
    q: 'Why are vintage names popular again?',
    a: 'Two reasons. First, they are recognisable without being crowded: a name that was common a century ago is familiar to everyone but rare in a modern classroom. Second, they carry a sense of continuity, which matters to parents choosing a name with family or cultural weight.',
  },
  {
    q: 'Are vintage names the same as classic names?',
    a: 'Not quite. A classic name has been in continuous use \u2014 Elizabeth, James, William. A vintage name went away and came back. The distinction matters because a revival can become very common: check a vintage name\u2019s latest SSA rank before assuming it is rare.',
  },
  {
    q: 'Which vintage names are already common?',
    a: 'Several revivals are now firmly mainstream. In SSA\u2019s ranking for babies born in 2025, Charlotte is No. 2 for girls, Theodore No. 4 and Henry No. 5 for boys, Evelyn No. 8 and Eleanor No. 12 for girls. Harder-edged Victorian names such as Percival and Archibald are much rarer choices in the US.',
  },
  ...EDITORIAL_FAQ.slice(0, 2),
];

const BREADCRUMB = [{ name: 'Vintage Baby Names', href: '/vintage-baby-names' }];

export default function VintageBabyNamesPage() {
  const resolved = resolveNames(VINTAGE_NAMES);
  const cov = coverage(VINTAGE_NAMES);

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
      intro="Vintage baby names that were common a century ago, went quiet, and are now being used again. Every name below links to its documented meaning, origin and pronunciation where we hold a profile — so you can check what a name actually means before you revive it."
      breadcrumb={BREADCRUMB}
      faqs={FAQS}
      schema={schema}
      sources={['ssa2025', 'ssa', 'behindthename']}
      cta={
        <>
          <h2 className="font-display text-xl font-bold text-nv-text sm:text-2xl">
            Check the meaning before you revive it
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-nv-text-secondary">
            A vintage name carries a century of association. Our profiles show the documented meaning,
            origin and cultural context behind each one.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/names-by-meaning" className="btn-primary">
              Browse by meaning
            </Link>
            <Link href="/unique-baby-names" className="btn-ghost">
              See unique names
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
          Vintage names making a comeback
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

      <section className="mt-14" aria-labelledby="why-heading">
        <h2
          id="why-heading"
          className="font-display text-2xl font-bold tracking-tight text-nv-text sm:text-3xl"
        >
          Why vintage names return
        </h2>
        <div className="prose-nv mt-4 max-w-3xl">
          <p>
            Naming fashion runs in roughly century-long cycles. A name that was everywhere in 1900
            becomes unfashionable by 1950, feels dated by 1980, and by 2020 has lost its association
            with any living generation. At that point it stops sounding old and starts sounding
            distinctive \u2014 which is exactly when it comes back.
          </p>
          <p>
            The mechanism is generational rather than aesthetic. A name is only &ldquo;old-fashioned&rdquo;
            while the people who bore it are still around to be associated with it. Once that
            association fades, what is left is the name&rsquo;s sound and its meaning, and many of these
            names have both in abundance.
          </p>
          <p>
            There is a practical consequence worth knowing. The soft, vowel-ending revivals are already
            well into the mainstream \u2014 Theodore was the No. 4 boy name for babies born in 2025 \u2014
            while the harder Victorian names, and the ones tied to a specific historical figure, remain
            rarer. Our{' '}
            <Link href="/top-baby-names-2026" className="font-semibold text-nv-accent hover:underline">
              Top Baby Names 2026
            </Link>{' '}
            page shows how far some of them have travelled.
          </p>
        </div>
      </section>

      <section className="mt-14" aria-labelledby="groups-heading">
        <h2
          id="groups-heading"
          className="font-display text-2xl font-bold tracking-tight text-nv-text sm:text-3xl"
        >
          Three kinds of vintage name
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="inset-panel">
            <h3 className="text-sm font-bold text-nv-text">The soft revival</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-nv-text-secondary">
              Eleanor, Eloise, Theodore, Hazel. Vowel-heavy, easy to say, already climbing fast. These
              are the safest vintage choices and the least rare.
            </p>
          </div>
          <div className="inset-panel">
            <h3 className="text-sm font-bold text-nv-text">The literary revival</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-nv-text-secondary">
              Matilda, Cordelia, Silas, Gideon. Names with a strong textual association that gives them
              a story without making them common.
            </p>
          </div>
          <div className="inset-panel">
            <h3 className="text-sm font-bold text-nv-text">The genuinely rare</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-nv-text-secondary">
              Percival, Archibald, Winifred, Bartholomew. Still outside the mainstream and likely to
              stay there. Choose these if rarity matters more than ease.
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
            { href: '/unique-baby-names', label: 'Unique baby names', note: 'Outside published lists' },
            { href: '/biblical-baby-names', label: 'Biblical baby names', note: 'Scripture-rooted' },
            { href: '/nature-baby-names', label: 'Nature baby names', note: 'Botanical and celestial' },
            { href: '/short-baby-names', label: 'Short baby names', note: 'One and two syllables' },
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
