import Link from 'next/link';
import { getCluster, getIslamicNames, resolveNameIn, BABYCENTER_2026 } from '../../lib/data/us-names.js';
import { buildUsPageSchema } from '../../lib/data/us-schema.js';
import { EDITORIAL_FAQ } from '../../lib/data/editorial.js';
import { pageMetadata } from '../../lib/seo.js';
import UsPageShell from '../../components/UsPageShell.jsx';
import NameCard from '../../components/NameCard.jsx';

// ─────────────────────────────────────────────────────────────────────────────
// A meaning-first CULTURAL GUIDE — not a usage ranking.
//
// The previous version was titled "Muslim Baby Names Popular in America",
// claimed specific names were in the US top 100, and sorted its list by a
// popularity score that every Islamic record lacks (all zeros) while telling
// readers it was "ordered by how thoroughly documented each name is". None of
// that was supportable: US birth statistics record a name, a sex, a year and a
// state — never religion — so no dataset can rank names by Muslim-American use.
// Every list below says exactly how it was selected and ordered.
// ─────────────────────────────────────────────────────────────────────────────

const SITE_URL = 'https://nameverse.site';
const cluster = getCluster('muslim-baby-names-america');
const PAGE_URL = `${SITE_URL}/${cluster.slug}`;

const TITLE = 'Muslim Baby Names in America \u2014 Meanings, Spelling & Script';
const DESCRIPTION =
  'A meaning-first guide to Muslim baby names for US families: Arabic script, English spellings and pronunciation \u2014 and what US name data can and cannot show.';

export const metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: `/${cluster.slug}`, type: 'article' });

const bcRank = (sex, name) => {
  const i = BABYCENTER_2026[sex].indexOf(name);
  return i >= 0 ? i + 1 : null;
};
const MUHAMMAD_BC = bcRank('boys', 'Muhammad');
const LAYLA_BC = bcRank('girls', 'Layla');

const FAQS = [
  {
    q: 'Can US rankings tell me which Muslim names are popular in America?',
    a: 'No. US birth statistics from the Social Security Administration record a name, a sex, a birth year and a state \u2014 not religion. A national ranking can show how many babies received a name, but not how many Muslim families chose it, so this page does not rank names by Muslim-American usage.',
  },
  {
    q: 'Which names with Arabic roots appear in US baby-name lists?',
    a: `Some do. In BabyCenter\u2019s in-progress 2026 table (${BABYCENTER_2026.snapshot} snapshot), Muhammad is No. ${MUHAMMAD_BC} for boys and Layla No. ${LAYLA_BC} for girls. That table is self-reported by BabyCenter users, and a name such as Layla is chosen by families of many backgrounds, so neither rank measures religious use.`,
  },
  {
    q: 'What is the difference between an Arabic name and a Muslim name?',
    a: 'Arabic describes a language and a naming tradition; Muslim describes religious usage. Many Muslim names are Arabic in origin, but not all Arabic names are Muslim (Arab Christians use Arabic names too), and Muslim families also use Persian, Turkish, Urdu and other names. Our database records origin and tradition as separate fields for this reason.',
  },
  {
    q: 'How do you handle spelling variations of Arabic names?',
    a: 'Arabic names have no single correct English spelling, because Arabic script and the Latin alphabet do not map one-to-one. Muhammad, Mohammad, Mohamed and Muhammed are the same name. Our profiles list the recorded variants so you can see how much spelling variation a name carries in practice.',
  },
  {
    q: 'Do Muslim names have to be Quranic?',
    a: 'No. Muslim naming practice draws on Quranic names, the names of prophets and companions, and a wide range of Arabic, Persian and regional names with good meanings. Many widely used Muslim names \u2014 Fatima, Aisha and Khadija among them \u2014 do not appear in the Quran at all.',
  },
  ...EDITORIAL_FAQ.slice(0, 2),
];

const BREADCRUMB = [{ name: 'Muslim Baby Names in America', href: '/muslim-baby-names-america' }];

// Long-established names, chosen editorially. Alternatives are tried in order
// so a spelling difference in the database never drops a name silently.
const BOY_PICKS = [
  ['Adam'], ['Ahmad', 'Ahmed'], ['Ali'], ['Amir', 'Ameer'], ['Ayaan', 'Ayan'], ['Bilal'], ['Hamza', 'Hamzah'],
  ['Hassan', 'Hasan'], ['Hussain', 'Husain', 'Hussein'], ['Ibrahim'], ['Idris'], ['Ilyas'], ['Imran'], ['Isa'],
  ['Ismail'], ['Khalid'], ['Muhammad', 'Mohammad'], ['Musa'], ['Omar', 'Umar'], ['Rayyan', 'Rayan'],
  ['Sulaiman', 'Sulayman', 'Suleman'], ['Tariq'], ['Yahya'], ['Yunus'], ['Yusuf', 'Yousuf'], ['Zakariya', 'Zakariyya', 'Zakaria'],
  ['Zayd', 'Zaid'], ['Zayn', 'Zain'],
];
const GIRL_PICKS = [
  ['Aaliyah', 'Aliyah'], ['Aisha', 'Ayesha'], ['Amal'], ['Amina', 'Aminah'], ['Asiya', 'Asiyah', 'Aasiya'], ['Aya', 'Ayah'],
  ['Fatima', 'Fatimah'], ['Hafsa', 'Hafsah'], ['Halima', 'Halimah'], ['Hana', 'Hanaa'], ['Huda'], ['Iman', 'Eman'],
  ['Inaya', 'Inayah'], ['Jannah', 'Jannat'], ['Khadija', 'Khadijah'], ['Layla', 'Laila', 'Leila'], ['Malak'],
  ['Maryam', 'Mariam'], ['Nadia'], ['Noor', 'Nur'], ['Ruqayya', 'Ruqayyah', 'Ruqaya'], ['Safiya', 'Safiyyah', 'Safia'],
  ['Salma'], ['Sara', 'Sarah'], ['Sumaya', 'Sumayyah', 'Sumayya'], ['Yasmin', 'Yasmeen'], ['Zahra', 'Zehra'],
  ['Zainab', 'Zaynab'],
];

function pick(groups) {
  const out = [];
  const seen = new Set();
  for (const alts of groups) {
    for (const name of alts) {
      const r = resolveNameIn(name, 'islamic');
      if (r.hasProfile && r.religion === 'islamic' && !seen.has(r.href)) {
        seen.add(r.href);
        out.push({
          name: r.name,
          slug: r.href.split('/').pop(),
          religion: 'islamic',
          meaning: r.meaning,
          origin: r.origin,
          gender: r.gender,
        });
        break;
      }
    }
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

export default function MuslimBabyNamesAmericaPage() {
  const boys = pick(BOY_PICKS);
  const girls = pick(GIRL_PICKS);
  const picked = new Set([...boys, ...girls].map((n) => n.slug));
  const more = getIslamicNames(80).filter((n) => !picked.has(n.slug)).slice(0, 48);

  const schema = buildUsPageSchema({
    url: PAGE_URL,
    cluster,
    description: DESCRIPTION,
    breadcrumb: BREADCRUMB,
    items: [...boys, ...girls].map((n) => ({
      name: n.name,
      url: `/names/${n.religion}/${n.slug}`,
      description: n.meaning || undefined,
    })),
    faqs: FAQS,
    sourceKeys: ['ssa', 'babycenter', 'ons2023', 'wikiArabicName', 'quran'],
    ordered: false,
  });

  return (
    <UsPageShell
      cluster={cluster}
      intro="A practical guide for Muslim families in the United States who want a name that is right in meaning and faith and works in everyday American life. Each name below links to its profile with the Arabic script, recorded meaning, pronunciation and common English spellings. We explain what US name statistics can show \u2014 and, just as important, what they cannot."
      breadcrumb={BREADCRUMB}
      faqs={FAQS}
      schema={schema}
      sources={['ssa', 'babycenter', 'ons2023', 'wikiArabicName', 'quran']}
      cta={
        <>
          <h2 className="font-display text-xl font-bold text-nv-text sm:text-2xl">Check the script form and pronunciation</h2>
          <p className="mt-2 max-w-2xl text-sm text-nv-text-secondary">
            Profiles show the Arabic script and an English pronunciation where the record holds them, so you can see
            exactly what you are choosing. Save favourites to your shortlist as you go.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/names/islamic" className="btn-primary">Browse all Islamic names</Link>
            <Link href="/blog/islamic-baby-boy-names-with-meanings" className="btn-ghost">Boy names guide</Link>
            <Link href="/blog/islamic-baby-girl-names-with-meanings" className="btn-ghost">Girl names guide</Link>
          </div>
        </>
      }
    >
      <section aria-labelledby="data-heading">
        <h2 id="data-heading" className="font-display text-2xl font-bold tracking-tight text-nv-text sm:text-3xl">
          What US name data can and cannot tell you
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="inset-panel">
            <h3 className="text-sm font-bold text-nv-text">No religion field</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-nv-text-secondary">
              SSA statistics record a name, sex, birth year and state. They cannot say how many Muslim families chose
              a name, so this page never ranks names by Muslim-American use.
            </p>
          </div>
          <div className="inset-panel">
            <h3 className="text-sm font-bold text-nv-text">Arabic-rooted names in US lists</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-nv-text-secondary">
              BabyCenter&rsquo;s in-progress 2026 table ({BABYCENTER_2026.snapshot}) has Muhammad at No. {MUHAMMAD_BC} for
              boys and Layla at No. {LAYLA_BC} for girls &mdash; self-reported figures, and Layla is used by families of
              many backgrounds.
            </p>
          </div>
          <div className="inset-panel">
            <h3 className="text-sm font-bold text-nv-text">Outside the US</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-nv-text-secondary">
              In England and Wales, Muhammad was the most popular boys&rsquo; name in 2023, according to the Office for
              National Statistics &mdash; and it has been in the top 10 there since 2016.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-14" aria-labelledby="boys-heading">
        <h2 id="boys-heading" className="font-display text-2xl font-bold tracking-tight text-nv-text sm:text-3xl">
          Long-established Muslim boy names
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-nv-text-secondary">
          An editorial selection of names with deep roots in Muslim naming &mdash; prophets, companions and classic
          Arabic names &mdash; listed A&ndash;Z. It is not a popularity ranking. Meanings are as recorded on each profile.
        </p>
        <div className="mt-6 grid gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {boys.map((item) => (
            <NameCard key={item.slug} item={item} />
          ))}
        </div>
      </section>

      <section className="mt-14" aria-labelledby="girls-heading">
        <h2 id="girls-heading" className="font-display text-2xl font-bold tracking-tight text-nv-text sm:text-3xl">
          Long-established Muslim girl names
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-nv-text-secondary">
          Names of women honoured in Islamic history alongside classic Arabic virtue and nature names, listed A&ndash;Z.
          Maryam is the only woman named in the Quran; Fatima, Aisha and Khadija honour early Muslim women.
        </p>
        <div className="mt-6 grid gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {girls.map((item) => (
            <NameCard key={item.slug} item={item} />
          ))}
        </div>
      </section>

      <section className="mt-14" aria-labelledby="spelling-heading">
        <h2 id="spelling-heading" className="font-display text-2xl font-bold tracking-tight text-nv-text sm:text-3xl">
          Choosing a name that works in Arabic and English
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="inset-panel">
            <h3 className="text-sm font-bold text-nv-text">Sounds English does not have</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-nv-text-secondary">
              Letters such as &lsquo;ayn (&#1593;), &#7717;&#257;&rsquo; (&#1581;), q&#257;f (&#1602;) and kh&#257;&rsquo;
              (&#1582;) have no exact English equivalent, so teachers and friends will approximate them. Names built from
              shared sounds &mdash; Adam, Sara, Yusuf, Layla, Zayn &mdash; are pronounced closest to the Arabic.
            </p>
          </div>
          <div className="inset-panel">
            <h3 className="text-sm font-bold text-nv-text">Pick one spelling and keep it</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-nv-text-secondary">
              Every Arabic name has several defensible English spellings. A name with one dominant spelling (Layla, Amir)
              carries little correction burden; one with many variants will be misspelled more often. Use the same
              spelling on the birth certificate, passport and school records.
            </p>
          </div>
          <div className="inset-panel">
            <h3 className="text-sm font-bold text-nv-text">Meaning first, then sound</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-nv-text-secondary">
              Islamic tradition encourages names with good meanings. Check the meaning in Arabic, not just a one-word
              English gloss, and ask a scholar or imam if you are unsure about a name&rsquo;s connotations.
            </p>
          </div>
          <div className="inset-panel">
            <h3 className="text-sm font-bold text-nv-text">Say the full name aloud</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-nv-text-secondary">
              Try the first name with your family name and any middle name, and listen for initials or rhymes that read
              awkwardly in English. Our{' '}
              <Link href="/blog/how-to-choose-a-baby-name" className="font-semibold text-nv-accent hover:underline">
                step-by-step naming guide
              </Link>{' '}
              has a checklist.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-14" aria-labelledby="more-names-heading">
        <h2 id="more-names-heading" className="font-display text-2xl font-bold tracking-tight text-nv-text sm:text-3xl">
          More Islamic names to explore
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-nv-text-secondary">
          A spread of published Islamic profiles across the alphabet, listed A&ndash;Z. Islamic records carry no
          popularity score, so we do not pretend to rank them. Browse the full set by letter on the{' '}
          <Link href="/names/islamic" className="font-semibold text-nv-accent hover:underline">Islamic names hub</Link>.
        </p>
        <div className="mt-6 grid gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {more.map((item) => (
            <NameCard key={item.slug} item={item} />
          ))}
        </div>
      </section>

      <section className="mt-14" aria-labelledby="related-heading">
        <h2 id="related-heading" className="font-display text-2xl font-bold tracking-tight text-nv-text sm:text-3xl">
          Related pages and guides
        </h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { href: '/names/islamic', label: 'Islamic names hub', note: '4,950 published profiles' },
            { href: '/blog/quranic-baby-names', label: 'Quranic baby names', note: 'Names that appear in the Quran' },
            { href: '/blog/prophet-names-for-baby-boys-islam', label: 'Prophet names for boys', note: 'The 25 prophets named in the Quran' },
            { href: '/blog/modern-muslim-baby-names', label: 'Modern Muslim names', note: 'Short names that travel well' },
            { href: '/top-baby-names-2026', label: 'Top baby names 2026', note: 'US national ranking (SSA)' },
            { href: '/islamic-girl-names', label: 'Islamic girl names', note: 'Browse by gender' },
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
