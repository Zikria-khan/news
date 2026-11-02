import Link from 'next/link';
import { getCluster, getBiblicalNames } from '../../lib/data/us-names.js';
import { buildUsPageSchema } from '../../lib/data/us-schema.js';
import { EDITORIAL_FAQ } from '../../lib/data/editorial.js';
import UsPageShell from '../../components/UsPageShell.jsx';
import { pageMetadata } from '../../lib/seo.js';
import NameCard from '../../components/NameCard.jsx';

const SITE_URL = 'https://nameverse.site';
const cluster = getCluster('biblical-baby-names');
const PAGE_URL = `${SITE_URL}/${cluster.slug}`;

const TITLE = 'Biblical Baby Names for Boys & Girls';
const DESCRIPTION =
  'Biblical baby names for boys and girls with meanings and origins \u2014 Hebrew, Greek and Latin forms, plus which biblical names lead the latest US ranking.';

export const metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: `/${cluster.slug}`, type: 'article' });

const FAQS = [
  {
    q: 'What are the most popular biblical baby names?',
    a: 'In SSA\u2019s ranking for babies born in 2025, the boys\u2019 top 20 includes Noah (No. 2), James (No. 6), Elijah (No. 7), Benjamin (No. 11), Levi (No. 12), Samuel (No. 18) and Ezra (No. 20); for girls, Elizabeth is No. 17. BabyCenter\u2019s in-progress 2026 table shows the same pattern, with Josiah, Gabriel and Isaiah in its boys\u2019 top 40 and Delilah in its girls\u2019 top 40.',
  },
  {
    q: 'Are biblical names Hebrew in origin?',
    a: 'Most of the names in the Hebrew Bible are, but not all. The biblical corpus also includes Aramaic, Greek and Latin names, and many biblical names reached English through Greek and Latin transliteration rather than directly from Hebrew. That is why the same name can have several distinct recorded forms.',
  },
  {
    q: 'What is the difference between a biblical name and a Christian name?',
    a: 'A biblical name appears in scripture. A Christian name is one used within Christian tradition, which includes biblical names but also the names of saints and later devotional names that do not appear in the Bible at all. Our database records both, and marks which is which.',
  },
  {
    q: 'Do biblical names have to be traditional?',
    a: 'No. Many biblical names are short, modern-sounding and easy to spell \u2014 Levi, Asher, Ezra, Noah, Eli. The perception that biblical names are heavy or old-fashioned does not match how they are actually used today.',
  },
  ...EDITORIAL_FAQ.slice(0, 2),
];

const BREADCRUMB = [{ name: 'Biblical Baby Names', href: '/biblical-baby-names' }];

export default function BiblicalBabyNamesPage() {
  const names = getBiblicalNames(120);

  const schema = buildUsPageSchema({
    url: PAGE_URL,
    cluster,
    description: DESCRIPTION,
    breadcrumb: BREADCRUMB,
    items: names.slice(0, 60).map((n) => ({
      name: n.name,
      url: `/names/${n.religion}/${n.slug}`,
      description: n.meaning || undefined,
    })),
    faqs: FAQS,
    sourceKeys: ['ssa2025', 'bibleGateway', 'behindthename', 'wikiHebrewName'],
  });

  return (
    <UsPageShell
      cluster={cluster}
      intro="Biblical baby names for boys and girls, drawn from our documented database of scripture-rooted names. Every entry carries a documented meaning and origin, and each card links to the full profile with pronunciation, script forms and cultural context."
      breadcrumb={BREADCRUMB}
      faqs={FAQS}
      schema={schema}
      sources={['ssa2025', 'bibleGateway', 'behindthename', 'wikiHebrewName']}
      cta={
        <>
          <h2 className="font-display text-xl font-bold text-nv-text sm:text-2xl">
            Find the passage behind the name
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-nv-text-secondary">
            Each profile records the name&rsquo;s scriptural context where we hold it, alongside the
            meaning and its recorded forms in Hebrew, Greek and Latin.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/names/christian" className="btn-primary">
              Browse Christian names
            </Link>
            <Link href="/categories/biblical" className="btn-ghost">
              Biblical category hub
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
          Biblical names with documented meanings
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-nv-text-secondary">
          An even sample of names our records file in the Biblical category, listed A&ndash;Z &mdash; not a
          ranking. Every one has a recorded meaning; check the profile for where the name occurs in scripture.
        </p>
        <div className="mt-6 grid gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {names.map((item) => (
            <NameCard key={`${item.religion}-${item.slug}`} item={item} showReligion />
          ))}
        </div>
      </section>

      <section className="mt-14" aria-labelledby="choosing-heading">
        <h2
          id="choosing-heading"
          className="font-display text-2xl font-bold tracking-tight text-nv-text sm:text-3xl"
        >
          Choosing a biblical name
        </h2>
        <div className="prose-nv mt-4 max-w-3xl">
          <p>
            The biblical corpus is unusually deep, which is both its appeal and its difficulty. It
            contains names that are now thoroughly mainstream \u2014 Noah, Elijah, Hannah, Abigail
            \u2014 and names that have barely been used in English for centuries. The range means you can
            choose a biblical name that is common, or one that almost nobody shares, without leaving the
            tradition.
          </p>
          <p>
            The most useful distinction when choosing is between a name&rsquo;s scriptural weight and
            its everyday usability. A name like <strong>Malachi</strong> or <strong>Josiah</strong>{' '}
            carries a clear scriptural identity and is still straightforward to say and spell. A name
            like <strong>Nebuchadnezzar</strong> carries more weight than most families want to place on
            a child. Both are biblical; only one is practical.
          </p>
          <p>
            It is also worth checking the name&rsquo;s recorded forms. Many biblical names reached
            English through Greek and Latin rather than directly from Hebrew, which is why the same name
            can appear as several distinct spellings. Our profiles list the variants we hold, so you can
            see how much spelling variation you would be taking on. For the wider tradition, our{' '}
            <Link href="/names/christian" className="font-semibold text-nv-accent hover:underline">
              Christian names hub
            </Link>{' '}
            covers saint names and devotional names as well as scriptural ones.
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
            { href: '/vintage-baby-names', label: 'Vintage baby names', note: 'Classics returning' },
            { href: '/muslim-baby-names-america', label: 'Muslim names in America', note: 'Arabic and Quranic' },
            { href: '/unique-baby-names', label: 'Unique baby names', note: 'Outside published lists' },
            { href: '/top-baby-names-2026', label: 'Top names 2026', note: 'Current rankings' },
            { href: '/categories/biblical', label: 'Biblical category', note: 'Full category hub' },
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
