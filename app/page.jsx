import Link from 'next/link';
import { getManifest } from '../lib/data/names-data.js';
import { SSA_TOP_10, resolveName } from '../lib/data/us-names.js';
import { getPublishedPosts, formatDate } from '../lib/data/blog.js';
import { pageMetadata } from '../lib/seo.js';
import NameCard from '../components/NameCard.jsx';
import HomepageSearch from '../components/HomepageSearch.jsx';
import PageJsonLd from '../components/PageJsonLd.jsx';
import AdSlot from '../components/AdSlot.jsx';

// The root layout's "%s | NameVerse" template does not apply to the root
// segment itself, so the homepage sets its full title explicitly.
export const metadata = pageMetadata({
  title: 'NameVerse \u2014 Baby Names with Meanings, Origins & Cultural Context',
  absoluteTitle: true,
  description:
    'Search 11,730 baby names with meanings, origins, pronunciation guides, script forms and cultural context across Islamic, Christian and Hindu traditions.',
  path: '/',
});

const hubs = [
  {
    religion: 'islamic',
    label: 'Islamic Names',
    description: 'Quranic, Arabic and Urdu names with spiritual roots, authentic Arabic spellings, and lucky numbers.',
    href: '/names/islamic',
    boyHref: '/islamic-boy-names',
    girlHref: '/islamic-girl-names',
    accent: 'border-emerald-200/80 dark:border-emerald-800/40 hover:border-emerald-500/60',
    badge: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    tag: 'Quranic & Arabic Heritage',
  },
  {
    religion: 'christian',
    label: 'Christian Names',
    description: 'Biblical, Hebrew, Greek and Latin names honoring timeless faith, patron saints, and virtues.',
    href: '/names/christian',
    boyHref: '/christian-boy-names',
    girlHref: '/christian-girl-names',
    accent: 'border-indigo-200/80 dark:border-indigo-800/40 hover:border-indigo-500/60',
    badge: 'bg-indigo-50 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    tag: 'Biblical & Saint Tradition',
  },
  {
    religion: 'hindu',
    label: 'Hindu Names',
    description: 'Sanskrit, Vedic, and regional names carrying nakshatra roots, rashi alignments, and spiritual depth.',
    href: '/names/hindu',
    boyHref: '/hindu-boy-names',
    girlHref: '/hindu-girl-names',
    accent: 'border-rose-200/80 dark:border-rose-800/40 hover:border-rose-500/60',
    badge: 'bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    tag: 'Sanskrit & Vedic Heritage',
  },
];

// Counts are derived from the manifest at render time rather than hardcoded,
// so the homepage can never advertise a number the dataset does not contain.
const GENDER_HUB_DEFS = [
  { label: 'Islamic Boy Names', href: '/islamic-boy-names', religion: 'islamic', gender: 'boy' },
  { label: 'Islamic Girl Names', href: '/islamic-girl-names', religion: 'islamic', gender: 'girl' },
  { label: 'Christian Boy Names', href: '/christian-boy-names', religion: 'christian', gender: 'boy' },
  { label: 'Christian Girl Names', href: '/christian-girl-names', religion: 'christian', gender: 'girl' },
  { label: 'Hindu Boy Names', href: '/hindu-boy-names', religion: 'hindu', gender: 'boy' },
  { label: 'Hindu Girl Names', href: '/hindu-girl-names', religion: 'hindu', gender: 'girl' },
];

const meaningThemes = [
  { name: 'Light & Radiance', slug: 'light', desc: 'Names embodying illumination, dawn, and clarity' },
  { name: 'Love & Affection', slug: 'love', desc: 'Expressions of divine grace, belovedness, and devotion' },
  { name: 'Strength & Power', slug: 'strength', desc: 'Names of courageous guardians, warriors, and leaders' },
  { name: 'Peace & Serenity', slug: 'peace', desc: 'Calm waters, harmony, and celestial tranquility' },
  { name: 'Wisdom & Truth', slug: 'wisdom', desc: 'Scholars, intellect, discerning minds, and truth' },
  { name: 'Blessing & Grace', slug: 'blessing', desc: 'Gifts from above, fortunate destinies, and joy' },
];

const intentChips = [
  { label: 'Boy names', href: '/search?gender=boy' },
  { label: 'Girl names', href: '/search?gender=girl' },
  { label: 'Names meaning light', href: '/search?q=light' },
  { label: 'Names meaning love', href: '/search?q=love' },
  { label: 'Names meaning strength', href: '/search?q=strength' },
  { label: 'Unique names', href: '/unique-baby-names' },
  { label: 'Rising names', href: '/trending-names' },
  { label: 'Biblical names', href: '/categories/biblical' },
];

// Homepage FAQs answer the actual product and editorial questions without
// claiming that every source record has the same level of verification.
const faqs = [
  {
    question: 'How does the NameVerse instant autosearch work?',
    answer:
      'The homepage search loads compact, build-generated indexes for the published profiles. As you type, it matches the name, recorded meaning and origin in your browser, then offers a direct link to the full profile without a page reload.',
  },
  {
    question: 'How do I search for baby names by specific meaning on NameVerse?',
    answer:
      'You can use the autosearch bar at the top of the homepage to type any core virtue (such as "light", "peace", "strength", or "blessing"), or explore our dedicated Names by Meaning directory to view curated lists categorized by philosophical and spiritual themes across all traditions.',
  },
  {
    question: 'Are name origins, original scripts, and pronunciations verified?',
    answer:
      'A profile enters the published directory only when its structured record includes both a meaning and an origin. Script forms and pronunciations are shown when the record contains them, and uncertain or missing claims are labelled rather than filled with guesses. See our editorial policy for the review standard.',
  },
  {
    question: 'How are the lucky numbers, gemstones, and numerological profiles calculated?',
    answer:
      'NameVerse calculates the displayed number with a Pythagorean letter-to-number mapping. Lucky numbers, colours, stones and letter symbolism are traditional, belief-based associations; they are not linguistic, scientific or predictive facts.',
  },
  {
    question: 'Where do NameVerse popularity and trend figures come from?',
    answer:
      'Only from named, dated sources: the Social Security Administration ranking for babies born in 2025 (released May 8, 2026) and, labelled separately, BabyCenter\u2019s in-progress 2026 table. Some profiles also carry an internal score from their source record; it is not a birth count, and we never present it as popularity or a trend.',
  },
  {
    question: 'Can I compare multiple baby names side by side?',
    answer:
      'Yes. Save names to your shortlist from any profile, then compare them side by side: recorded meaning, origin, gender and spelling length, plus official US ranks where a name appears in the latest SSA data. The shortlist is stored only in your browser.',
  },
];

export default function HomePage() {
  const manifest = getManifest();
  const religions = ['islamic', 'christian', 'hindu'];
  const counts = Object.fromEntries(religions.map((r) => [r, (manifest[r] || []).length]));
  const totalNames = religions.reduce((sum, r) => sum + counts[r], 0);

  // Only traditions with published profiles are promoted in the homepage grid.
  // Verification-pending source records remain reachable only through their
  // noindex handling, so they cannot create empty navigation destinations.
  const indexableCounts = Object.fromEntries(
    religions.map((r) => [r, (manifest[r] || []).filter((i) => i.indexable).length]),
  );
  const activeReligions = religions.filter((r) => indexableCounts[r] > 0);
  // FIX — the "Indexable Pages" stat below was showing totalNames. The real
  // indexable count is lower: records that are negative-assertion stubs, and
  // duplicates consolidated onto a canonical page, are deliberately not
  // indexable. Publishing a number that does not match what the sitemap
  // actually contains is the same category of error as the 42,000 claim.
  const indexableNames = religions.reduce(
    (sum, r) => sum + (manifest[r] || []).filter((i) => i.indexable).length,
    0
  );

  const genderHubs = GENDER_HUB_DEFS.map((d) => ({
    ...d,
    count: (manifest[d.religion] || [])
      .filter((i) => i.indexable && i.gender === d.gender)
      .length.toLocaleString(),
  }));

  // Names from the latest official US top 10 (SSA, babies born in 2025) that
  // we hold a profile for. A real, dated ranking — not an internal score.
  const usTopNames = [...SSA_TOP_10.boys.slice(0, 6), ...SSA_TOP_10.girls.slice(0, 6)]
    .map((n) => resolveName(n))
    .filter((r) => r.hasProfile)
    .map((r) => ({
      name: r.name,
      slug: r.href.split('/').pop(),
      religion: r.religion,
      meaning: r.meaning,
      origin: r.origin,
      gender: r.gender,
    }));

  const latestArticles = getPublishedPosts()
    .slice(0, 3)
    .map((post) => ({
      title: post.title,
      excerpt: post.excerpt,
      href: `/blog/${post.id}`,
      date: formatDate(post.publishDate, { month: 'short', year: 'numeric' }),
      tag: post.category,
    }));
  const meaningTerms = {
    light: ['light', 'bright', 'radiance', 'dawn', 'illumination', 'glow'],
    love: ['love', 'beloved', 'affection', 'devotion', 'dear'],
    strength: ['strength', 'strong', 'power', 'courage', 'brave', 'might'],
    peace: ['peace', 'calm', 'serenity', 'harmony', 'tranquil'],
    wisdom: ['wisdom', 'wise', 'knowledge', 'truth', 'intellect'],
    blessing: ['blessing', 'blessed', 'gift', 'grace', 'fortunate', 'prosperity'],
  };
  const meaningThemeCounts = Object.fromEntries(
    meaningThemes.map((theme) => {
      const terms = meaningTerms[theme.slug] || [theme.slug];
      const count = religions.reduce(
        (sum, rel) =>
          sum +
          (manifest[rel] || []).filter((item) => {
            if (!item.indexable) return false;
            const meaning = String(item.meaning || '').toLowerCase();
            return terms.some((term) => meaning.includes(term));
          }).length,
        0,
      );
      return [theme.slug, count];
    }),
  );

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  };

  return (
    <div>
      <PageJsonLd data={faqSchema} />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-nv-border/80 bg-gradient-to-b from-nv-subtle/70 via-nv-surface to-nv-page py-16 sm:py-24">
        {/* Ambient background glows */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-[450px] w-[800px] rounded-full bg-gradient-to-tr from-nv-accent/10 via-emerald-500/10 to-amber-500/10 blur-3xl" />

        <div className="container-page relative text-center">
          <span className="eyebrow mb-4 rounded-full border border-nv-border bg-nv-surface/80 px-4 py-1.5 shadow-sm backdrop-blur-md">
            The World&apos;s Cultural Name Anthology
          </span>

          <h1 className="mx-auto max-w-4xl font-display text-4xl font-extrabold tracking-tight text-nv-text sm:text-6xl sm:leading-[1.15]">
            Find a Baby Name That Carries Meaning, Heritage &amp; Heart
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base text-nv-text-secondary sm:text-lg sm:leading-relaxed">
            Search {indexableNames.toLocaleString()} baby names across {activeReligions.length}{' '}
            traditions — each with its meaning, origin, script forms, pronunciation and cultural context.
          </p>

          {/* Interactive Instant Autosearch Component */}
          <HomepageSearch />

          {/* Quick Intent Chips */}
          <div className="mx-auto mt-6 flex max-w-2xl flex-wrap justify-center gap-2">
            {intentChips.map((chip) => (
              <Link
                key={chip.label}
                href={chip.href}
                className="rounded-full border border-nv-border bg-nv-surface/80 px-3.5 py-1 text-xs font-semibold text-nv-text-secondary shadow-sm transition hover:border-nv-accent/50 hover:bg-nv-surface hover:text-nv-accent hover:shadow"
              >
                {chip.label}
              </Link>
            ))}
          </div>

          {/* Statistics Strip */}
          <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-4 rounded-2xl border border-nv-border/80 bg-nv-surface/70 p-5 shadow-sm backdrop-blur-md sm:grid-cols-4">
            <div className="text-center">
              <span className="font-display text-2xl font-bold text-nv-text sm:text-3xl">
                {indexableNames.toLocaleString()}
              </span>
              <span className="mt-0.5 block text-xs font-semibold text-nv-text-muted">Published Profiles</span>
            </div>
            <div className="text-center">
              <span className="font-display text-2xl font-bold text-islamic sm:text-3xl">{activeReligions.length}</span>
              <span className="mt-0.5 block text-xs font-semibold text-nv-text-muted">Naming Traditions</span>
            </div>
            <div className="text-center">
              <span className="font-display text-2xl font-bold text-christian sm:text-3xl">
                {totalNames.toLocaleString()}
              </span>
              <span className="mt-0.5 block text-xs font-semibold text-nv-text-muted">Source Records</span>
            </div>
            <div className="text-center">
              <span className="font-display text-2xl font-bold text-nv-accent sm:text-3xl">2026</span>
              <span className="mt-0.5 block text-xs font-semibold text-nv-text-muted">Trend Data</span>
            </div>
          </div>
        </div>
      </section>

      {/* Ad slot — directly below the hero, so it is above the fold on desktop
          while the H1 and search box keep the first mobile viewport. */}
      <div className="container-page">
        <AdSlot placement="homepage-top" />
      </div>

      <div className="container-page space-y-20 py-16 sm:py-20">
        {/* Tradition Showcase Hubs */}
        <section aria-labelledby="traditions-heading">
          <div className="text-center mb-12">
            <span className="eyebrow">Explore Heritage</span>
            <h2 id="traditions-heading" className="mt-2 font-display text-3xl font-bold tracking-tight text-nv-text sm:text-4xl">
              Sacred &amp; Cultural Naming Traditions
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-nv-text-secondary sm:text-base">
              Each tradition preserves profound historical lineages, spiritual archetypes, and linguistic beauty.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {hubs
              .filter((hub) => indexableCounts[hub.religion] > 0)
              .map((hub) => (
              <div
                key={hub.religion}
                className={`card group relative flex flex-col p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover border ${hub.accent}`}
              >
                <div className="flex items-center justify-between">
                  <span className={`badge border text-[11px] font-bold ${hub.badge}`}>
                    {(indexableCounts[hub.religion] || 0).toLocaleString()} names
                  </span>
                  <span className="text-xs font-semibold text-nv-accent group-hover:translate-x-1 transition-transform">
                    &rarr;
                  </span>
                </div>

                <h3 className="mt-5 font-display text-2xl font-bold text-nv-text transition-colors group-hover:text-nv-accent">
                  <Link href={hub.href}>{hub.label}</Link>
                </h3>

                <span className="mt-1 text-[11px] font-bold uppercase tracking-wider text-nv-text-muted">
                  {hub.tag}
                </span>

                <p className="mt-3 text-xs leading-relaxed text-nv-text-secondary">
                  {hub.description}
                </p>

                <div className="mt-6 flex flex-col gap-2 border-t border-nv-border/60 pt-4 text-xs font-semibold">
                  <div className="flex items-center justify-between text-nv-text-muted">
                    <Link href={hub.boyHref} className="hover:text-nv-accent hover:underline">
                      Boy Names &rarr;
                    </Link>
                    <span>&bull;</span>
                    <Link href={hub.girlHref} className="hover:text-nv-accent hover:underline">
                      Girl Names &rarr;
                    </Link>
                  </div>
                  <Link
                    href={hub.href}
                    className="mt-2 inline-flex items-center justify-center rounded-xl bg-nv-subtle/80 py-2 text-xs font-bold text-nv-text transition hover:bg-nv-accent hover:text-white"
                  >
                    Browse All {hub.label}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Gender Fast Collections */}
        <section className="rounded-3xl border border-nv-border bg-gradient-to-br from-nv-subtle/70 to-nv-surface p-8 sm:p-10 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <span className="eyebrow">Curated Collections</span>
              <h3 className="font-display text-2xl font-bold text-nv-text mt-1">
                Popular Boy &amp; Girl Name Hubs
              </h3>
              <p className="text-xs text-nv-text-secondary mt-1">
                Explore hand-curated collections categorized by tradition and gender with instant alphabet filters.
              </p>
            </div>
            <Link href="/names" className="btn-ghost !min-h-[40px] !px-4 !text-xs self-start md:self-auto">
              View Master Directory &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {genderHubs.map((link) => {
              const isBoy = link.gender === 'boy';
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="card group p-4 text-center transition-all duration-200 hover:-translate-y-1 hover:border-nv-accent/50 hover:shadow-md"
                >
                  <div className={`mx-auto mb-2.5 flex h-8 w-8 items-center justify-center rounded-full ${
                    isBoy ? 'bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-300' : 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300'
                  }`}>
                    {isBoy ? '♂' : '♀'}
                  </div>
                  <span className="font-display text-xs font-bold text-nv-text group-hover:text-nv-accent transition-colors block">
                    {link.label}
                  </span>
                  <span className="mt-1 text-[11px] text-nv-text-muted block">
                    {link.count} names
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* US top-10 rail — a dated, sourced ranking */}
        <section aria-labelledby="us-top-heading">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="eyebrow">SSA &middot; babies born in 2025</span>
              <h2 id="us-top-heading" className="mt-1 font-display text-2xl font-bold tracking-tight text-nv-text sm:text-3xl">
                Names From the Latest US Top 10
              </h2>
              <p className="mt-1 text-xs text-nv-text-secondary">
                From the Social Security Administration ranking released May 8, 2026 &mdash; the newest official
                US data.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 self-start sm:self-auto">
              <Link href="/top-baby-names-2026" className="btn-ghost !min-h-[40px] !px-4 !text-xs">
                Full ranking &rarr;
              </Link>
              <Link href="/trending-names" className="btn-ghost !min-h-[40px] !px-4 !text-xs">
                Rising names &rarr;
              </Link>
            </div>
          </div>

          <div className="grid gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {usTopNames.map((name) => (
              <NameCard key={`${name.religion}-${name.slug}`} item={name} showReligion />
            ))}
          </div>
        </section>

        {/* Meaning Themes Grid */}
        <section aria-labelledby="meaning-themes-heading">
          <div className="text-center mb-10">
            <span className="eyebrow">Thematic Exploration</span>
            <h2 id="meaning-themes-heading" className="mt-1 font-display text-2xl font-bold tracking-tight text-nv-text sm:text-3xl">
              Browse Names by Core Meaning
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-xs text-nv-text-secondary">
              Find names that reflect the qualities and blessings you wish to bestow upon your child.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {meaningThemes.map((theme) => (
              <Link
                key={theme.slug}
                href={`/search?q=${theme.slug}`}
                className="card group p-6 transition-all duration-300 hover:-translate-y-1 hover:border-nv-accent/40 hover:shadow-card-hover"
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-lg font-bold text-nv-text group-hover:text-nv-accent transition-colors">
                    {theme.name}
                  </span>
                  <span className="badge border border-nv-border bg-nv-subtle text-[11px] text-nv-text-secondary">
                    {meaningThemeCounts[theme.slug].toLocaleString()} profiles
                  </span>
                </div>
                <p className="mt-2 text-xs text-nv-text-secondary leading-relaxed">
                  {theme.desc}
                </p>
                <span className="mt-4 block text-xs font-semibold text-nv-accent">
                  Explore {theme.name} &rarr;
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* SEO Editorial Deep Dive Section for GSC Ranking */}
        <section className="rounded-3xl border border-nv-border bg-nv-surface p-8 sm:p-12 shadow-sm space-y-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="eyebrow">Comprehensive Etymological Guide</span>
            <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-nv-text">
              The Complete Guide to Choosing a Meaningful Baby Name
            </h2>
            <p className="mt-2 text-sm text-nv-text-secondary leading-relaxed">
              Choosing a baby name is one of the most profound milestones in parenthood. A name is a lifelong gift carrying identity, lineage, spiritual aspirations, and linguistic harmony.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 pt-4 border-t border-nv-border/60">
            <div className="space-y-3">
              <h3 className="font-display text-lg font-bold text-nv-text flex items-center gap-2">
                <span className="text-nv-accent">01.</span> Cultural &amp; Spiritual Roots
              </h3>
              <p className="text-xs sm:text-sm text-nv-text-secondary leading-relaxed">
                Whether selecting an authentic Quranic name from the Islamic tradition, a timeless biblical virtue name from Christian heritage, or a sacred Sanskrit name from Vedic lineage, cultural roots anchor your child in a legacy of enduring virtue and pride.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-display text-lg font-bold text-nv-text flex items-center gap-2">
                <span className="text-nv-accent">02.</span> Sound, Rhythm &amp; Phonetics
              </h3>
              <p className="text-xs sm:text-sm text-nv-text-secondary leading-relaxed">
                A great baby name rolls smoothly off the tongue. NameVerse records syllable breakdowns, pronunciation notes, and available original script forms so families can test how a name sounds in the languages they use.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-display text-lg font-bold text-nv-text flex items-center gap-2">
                <span className="text-nv-accent">03.</span> Numerological Harmony
              </h3>
              <p className="text-xs sm:text-sm text-nv-text-secondary leading-relaxed">
                NameVerse also displays traditional numerology and lucky-number associations where the source record includes them. These are belief-based cultural interpretations, not scientific predictions; meaning, origin and pronunciation are the fields to use for factual comparison.
              </p>
            </div>
          </div>
        </section>

        {/* Why NameVerse Bento Grid */}
        <section className="rounded-3xl border border-nv-border bg-nv-surface p-8 sm:p-12 shadow-sm">
          <div className="text-center mb-10">
            <span className="eyebrow">Academic Rigor &amp; Heritage</span>
            <h2 className="mt-1 font-display text-2xl font-bold text-nv-text sm:text-3xl">
              Why Parents Trust NameVerse
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-xs text-nv-text-secondary">
              We combine structured source records, transparent editorial notes and cultural context.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-nv-border/60 bg-nv-subtle/50 p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-nv-accent text-white font-bold">
                ع
              </div>
              <h4 className="font-display text-base font-bold text-nv-text">Original Scripts</h4>
              <p className="mt-1.5 text-xs text-nv-text-secondary leading-relaxed">
                Available Arabic, Urdu, Devanagari and Latin script forms, shown alongside transliteration where the record supplies them.
              </p>
            </div>

            <div className="rounded-2xl border border-nv-border/60 bg-nv-subtle/50 p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white font-bold">
                ★
              </div>
              <h4 className="font-display text-base font-bold text-nv-text">Lucky Numerology</h4>
              <p className="mt-1.5 text-xs text-nv-text-secondary leading-relaxed">
                Traditional numerology, lucky numbers and related associations are labelled as belief-based context rather than fact.
              </p>
            </div>

            <div className="rounded-2xl border border-nv-border/60 bg-nv-subtle/50 p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white font-bold">
                ✓
              </div>
              <h4 className="font-display text-base font-bold text-nv-text">Documented Meaning</h4>
              <p className="mt-1.5 text-xs text-nv-text-secondary leading-relaxed">
                Published profiles carry a documented meaning and origin; uncertain claims are labelled and verification-pending records stay out of the index.
              </p>
            </div>

            <div className="rounded-2xl border border-nv-border/60 bg-nv-subtle/50 p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 text-white font-bold">
                ⚡
              </div>
              <h4 className="font-display text-base font-bold text-nv-text">Stable, Crawlable URLs</h4>
              <p className="mt-1.5 text-xs text-nv-text-secondary leading-relaxed">
                Every name page is prerendered at build time, self-canonicalised and linked from
                a sitemap that lists only URLs that actually exist.
              </p>
            </div>
          </div>
        </section>

        {/* Editorial Articles Rail */}
        <section aria-labelledby="articles-heading">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="eyebrow">Editorial Guides</span>
              <h2 id="articles-heading" className="mt-1 font-display text-2xl font-bold tracking-tight text-nv-text sm:text-3xl">
                Editorial Naming Guides &amp; Insights
              </h2>
              <p className="mt-1 text-xs text-nv-text-secondary">
                Cultural context, traditional naming ceremonies, and baby naming etiquette.
              </p>
            </div>
            <Link href="/blog" className="btn-ghost !min-h-[40px] !px-4 !text-xs self-start sm:self-auto">
              Read All Articles &rarr;
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {latestArticles.map((article) => (
              <Link
                key={article.href}
                href={article.href}
                className="card group flex flex-col p-6 transition-all duration-300 hover:-translate-y-1 hover:border-nv-accent/40 hover:shadow-card-hover"
              >
                <div className="flex items-center justify-between text-xs text-nv-text-muted">
                  <span className="badge border border-nv-border bg-nv-subtle text-nv-accent font-bold">
                    {article.tag}
                  </span>
                  <span>{article.date}</span>
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-nv-text group-hover:text-nv-accent transition-colors">
                  {article.title}
                </h3>
                <p className="mt-2 text-xs text-nv-text-secondary leading-relaxed">
                  {article.excerpt}
                </p>
                <span className="mt-auto pt-5 text-xs font-semibold text-nv-accent">
                  Read Guide &rarr;
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Real Structured FAQ Section */}
        <section aria-labelledby="faq-heading" className="rounded-3xl border border-nv-border bg-nv-surface/80 p-8 sm:p-12 shadow-sm">
          <div className="text-center mb-10">
            <span className="eyebrow">Common Questions</span>
            <h2 id="faq-heading" className="mt-1 font-display text-2xl font-bold tracking-tight text-nv-text sm:text-3xl">
              Frequently Asked Questions About Baby Names
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-xs text-nv-text-secondary">
              Everything you need to know about searching, etymology, and naming conventions on NameVerse.
            </p>
          </div>

          <div className="mx-auto max-w-3xl space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-2xl border border-nv-border/80 bg-nv-subtle/40 p-5 sm:p-6 transition hover:border-nv-accent/30">
                <h3 className="font-display text-base font-bold text-nv-text sm:text-lg">
                  {faq.question}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-nv-text-secondary sm:text-sm">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
