import Link from 'next/link';
import { getCluster, STATE_TOP_NAMES, STATE_DATA_YEARS, SSA_TOP_10, resolveName } from '../../lib/data/us-names.js';
import { buildUsPageSchema } from '../../lib/data/us-schema.js';
import { EDITORIAL_FAQ, RANKING_DATA } from '../../lib/data/editorial.js';
import { pageMetadata } from '../../lib/seo.js';
import UsPageShell from '../../components/UsPageShell.jsx';
import StateTable from '../../components/StateTable.jsx';

const SITE_URL = 'https://nameverse.site';
const cluster = getCluster('baby-names-by-state');
const PAGE_URL = `${SITE_URL}/${cluster.slug}`;

const { current: YEAR, previous: PREV } = STATE_DATA_YEARS;
const SOURCE_KEYS = ['ssaState2025', 'ssa', 'wikipedia'];

const TITLE = `Most Popular Baby Names by State (${YEAR} Births)`;
const DESCRIPTION = `The top boy and girl name in every US state and DC for babies born in ${YEAR} (SSA, released May 2026), and how each changed from ${PREV}.`;

export const metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: `/${cluster.slug}`, type: 'article' });

// Derived from the real table rather than asserted, so the numbers on the page
// and the numbers in the prose can never drift apart.
function analyseStates() {
  const boyCounts = new Map();
  const girlCounts = new Map();
  let boyChanges = 0;
  let girlChanges = 0;

  for (const row of STATE_TOP_NAMES) {
    boyCounts.set(row.boy, (boyCounts.get(row.boy) || 0) + 1);
    girlCounts.set(row.girl, (girlCounts.get(row.girl) || 0) + 1);
    if (row.prevBoy && row.prevBoy !== row.boy) boyChanges += 1;
    if (row.prevGirl && row.prevGirl !== row.girl) girlChanges += 1;
  }

  const top = (map) =>
    [...map.entries()].sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }));

  const national = new Set([...SSA_TOP_10.boys, ...SSA_TOP_10.girls]);
  const outliers = STATE_TOP_NAMES.flatMap((row) =>
    [row.boy, row.girl].filter((n) => !national.has(n)).map((n) => ({ state: row.state, name: n })),
  );

  return {
    total: STATE_TOP_NAMES.length,
    boyChanges,
    girlChanges,
    topBoys: top(boyCounts),
    topGirls: top(girlCounts),
    outliers,
  };
}

const STATS = analyseStates();
const [B1, B2, B3] = STATS.topBoys;
const [G1] = STATS.topGirls;

const FAQS = [
  {
    q: 'What is the most popular baby name in each state?',
    a: `It depends on the state. For babies born in ${YEAR}, ${B1.name} was the top boy name in ${B1.count} of the 51 states and DC, ${B2.name} in ${B2.count} and ${B3.name} in ${B3.count}; ${G1.name} was the top girl name in ${G1.count}. The table on this page lists the top boy and girl name for every state and DC.`,
  },
  {
    q: 'Do the most popular names differ by state?',
    a: `Yes. ${STATS.outliers.length} state top names for ${YEAR} births are not in the national top 10 at all \u2014 for example ${STATS.outliers.slice(0, 3).map((o) => `${o.name} in ${o.state}`).join(', ')}.`,
  },
  {
    q: 'Where does state-level baby name data come from?',
    a: `The Social Security Administration publishes state-level tables from the same Social Security card application data as its national ranking, for each state and DC. This page uses the tables for babies born in ${YEAR} (released ${RANKING_DATA.ssa.releasedLabel}) and ${PREV}.`,
  },
  {
    q: 'Why do some states share the same top name?',
    a: `Because the same few names lead almost everywhere: ${B1.name}, ${B2.name} and ${B3.name} were together the top boy name in ${B1.count + B2.count + B3.count} of 51 states and DC. The interesting variation is in the states that break away from that pattern.`,
  },
  ...EDITORIAL_FAQ.slice(0, 2),
];

const BREADCRUMB = [{ name: 'Baby Names by State', href: '/baby-names-by-state' }];

export default function BabyNamesByStatePage() {
  const stats = STATS;

  const schema = buildUsPageSchema({
    url: PAGE_URL,
    cluster,
    description: DESCRIPTION,
    breadcrumb: BREADCRUMB,
    items: STATE_TOP_NAMES.map((r) => ({
      name: `${r.state}: ${r.boy} and ${r.girl}`,
      description: `Top boy name ${r.boy}, top girl name ${r.girl}.`,
    })),
    faqs: FAQS,
    sourceKeys: SOURCE_KEYS,
  });

  return (
    <UsPageShell
      cluster={cluster}
      intro={`The top boy and girl name in every US state and the District of Columbia for babies born in ${YEAR}, from Social Security Administration data released ${RANKING_DATA.ssa.releasedLabel} \u2014 with each state\u2019s ${PREV} leader for comparison. National rankings hide most of this variation; the state view is where the real differences show up.`}
      breadcrumb={BREADCRUMB}
      faqs={FAQS}
      schema={schema}
      sources={SOURCE_KEYS}
      cta={
        <>
          <h2 className="font-display text-xl font-bold text-nv-text sm:text-2xl">
            Found a name you like?
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-nv-text-secondary">
            Every name in the table links to its full profile where we hold one — meaning, origin,
            pronunciation and cultural context.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/search" className="btn-primary">
              Search all names
            </Link>
            <Link href="/top-baby-names-2026" className="btn-ghost">
              See the national ranking
            </Link>
          </div>
        </>
      }
    >
      <section aria-labelledby="table-heading">
        <h2
          id="table-heading"
          className="font-display text-2xl font-bold tracking-tight text-nv-text sm:text-3xl"
        >
          Top names in all 50 states and DC ({YEAR} births)
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-nv-text-secondary">
          The change column compares each state&rsquo;s top name for babies born in {YEAR} with its top name for
          babies born in {PREV}. &ldquo;Held&rdquo; means the state&rsquo;s top name did not change.
        </p>
        <div className="mt-6">
          <StateTable rows={STATE_TOP_NAMES} resolve={resolveName} year={YEAR} previousYear={PREV} />
        </div>
      </section>

      <section className="mt-14" aria-labelledby="patterns-heading">
        <h2
          id="patterns-heading"
          className="font-display text-2xl font-bold tracking-tight text-nv-text sm:text-3xl"
        >
          What the state data shows
        </h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="inset-panel">
            <h3 className="text-sm font-bold text-nv-text">A few names dominate</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-nv-text-secondary">
              Across {stats.total} states and DC, only a handful of names take the top spot. The most
              common top boy name is <strong>{stats.topBoys[0]?.name}</strong> ({stats.topBoys[0]?.count}{' '}
              states) and the most common top girl name is{' '}
              <strong>{stats.topGirls[0]?.name}</strong> ({stats.topGirls[0]?.count} states).
            </p>
          </div>
          <div className="inset-panel">
            <h3 className="text-sm font-bold text-nv-text">
              {stats.girlChanges >= stats.boyChanges ? 'Girls\u2019 leaders changed more often' : 'Boys\u2019 leaders changed more often'}
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-nv-text-secondary">
              Between {PREV} and {YEAR} births, {stats.girlChanges} of {stats.total} states changed their top girl
              name and {stats.boyChanges} changed their top boy name. One year is a snapshot, not a long-run rule.
            </p>
          </div>
          <div className="inset-panel">
            <h3 className="text-sm font-bold text-nv-text">Regional character survives</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-nv-text-secondary">
              {stats.outliers.length} state leaders are not in the national top 10 at all:{' '}
              {stats.outliers.map((o) => `${o.name} (${o.state})`).join(', ')}. These outliers show where local
              naming culture is still distinct from the national picture.
            </p>
          </div>
          <div className="inset-panel">
            <h3 className="text-sm font-bold text-nv-text">Who held their leader</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-nv-text-secondary">
              {stats.total - stats.boyChanges} of {stats.total} states kept the same top boy name and{' '}
              {stats.total - stats.girlChanges} kept the same top girl name from {PREV} to {YEAR}. Close races at the
              top mean a small shift in births can change the leader.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-14" aria-labelledby="read-heading">
        <h2
          id="read-heading"
          className="font-display text-2xl font-bold tracking-tight text-nv-text sm:text-3xl"
        >
          How to use state data when choosing a name
        </h2>
        <div className="prose-nv mt-4 max-w-3xl">
          <p>
            State data answers a question the national ranking cannot: how common will this name be
            where my child actually grows up? A name sitting at rank 40 nationally can be rank 5 in one
            state, and the difference is large enough to change the experience of having that name.
          </p>
          <p>
            The practical approach is to check the state you expect to raise your child in, then look at
            the wider top 100 for that state rather than only the number-one name. The top name tells
            you what is most common; the shape of the list tells you what is coming.
          </p>
          <p>
            One caveat worth stating plainly: state data is published with a lag \u2014 the newest tables
            cover babies born in {YEAR}. If you are naming a child now, the state list shows the cohort just
            ahead of yours, not this month&rsquo;s choices. For an early, self-reported look at 2026, see
            BabyCenter&rsquo;s in-progress table on our{' '}
            <Link href="/top-baby-names-2026" className="font-semibold text-nv-accent hover:underline">
              Top Baby Names 2026
            </Link>{' '}
            page, and the measured risers on{' '}
            <Link href="/trending-names" className="font-semibold text-nv-accent hover:underline">
              Trending Baby Names
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="mt-14" aria-labelledby="more-heading">
        <h2
          id="more-heading"
          className="font-display text-2xl font-bold tracking-tight text-nv-text sm:text-3xl"
        >
          Related pages
        </h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { href: '/top-baby-names-2026', label: 'Top baby names 2026', note: 'National ranking (SSA)' },
            { href: '/trending-names', label: 'Fastest-rising names', note: 'Measured SSA risers' },
            { href: '/unique-baby-names', label: 'Unique baby names', note: 'Outside published lists' },
            { href: '/vintage-baby-names', label: 'Vintage baby names', note: 'Classics returning' },
            { href: '/names', label: 'All 11,730 names', note: 'Full directory' },
            { href: '/names-by-origin', label: 'Names by origin', note: 'Browse by language' },
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
