// ─────────────────────────────────────────────────────────────────────────────
// Editorial identity, sourcing and methodology.
//
// E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) is the
// single biggest lever on a reference site like this one. Google's quality
// raters look for four concrete things on a page, and this module supplies all
// four in one place so every US page renders them identically:
//
//   1. WHO wrote it        → AUTHOR / REVIEWER (a named entity, not "admin")
//   2. WHEN it changed     → LAST_UPDATED (a real date, not a build timestamp)
//   3. HOW the data is made→ METHODOLOGY (the actual pipeline, stated plainly)
//   4. WHERE facts come from→ SOURCES (named, linked, dated)
//
// FOUNDER holds the real, owner-supplied identity of the person who runs the
// site. Do not add credentials, qualifications or review claims to it unless
// the owner supplies them — an honest, short identity beats an invented one.
// ─────────────────────────────────────────────────────────────────────────────

export const SITE_URL = 'https://nameverse.site';

// ── 1. Authorship ────────────────────────────────────────────────────────────
// The publishing entity. This is the organisation that stands behind the data.
export const PUBLISHER = {
  name: 'NameVerse',
  url: SITE_URL,
  logo: `${SITE_URL}/nameverse_logo_emblem.webp`,
  email: 'hello@nameverse.site',
};

// The person who founded and runs NameVerse. Supplied by the site owner — keep
// these values exactly as given. Rendered on /about, /contact and in the
// Organization JSON-LD (`founder`).
export const FOUNDER = {
  name: 'Zakriya Khan',
  role: 'Founder & site owner',
  // Grounded in the owner's public developer identity; no other credentials
  // are claimed on his behalf.
  description:
    'Zakriya Khan is a full-stack developer who founded NameVerse and runs the site — its name database, editorial pages and blog.',
  email: 'coding4443@gmail.com',
  // Pakistan mobile number as supplied (0349 7174815). wa.me needs the
  // international form without "+" or the leading trunk 0.
  whatsappDisplay: '0349 7174815',
  whatsappInternational: '+92 349 7174815',
  telephone: '+923497174815',
  whatsappUrl: 'https://wa.me/923497174815',
};

// The byline shown on every editorial page. The editorial team is the honest
// byline: pages are compiled from the structured database and the dated
// sources below. The accountable person behind the team is FOUNDER (shown on
// /about and /editorial-policy). Switch `isOrganisation` to false and use a
// person's name here only for pages that person actually researched.
export const AUTHOR = {
  name: 'NameVerse Editorial Team',
  role: 'Naming research and data editorial',
  // A short, factual statement of what qualifies this byline to write about
  // names. Keep it concrete: what data is used, what the process is.
  credentials:
    'Compiles given-name data from a structured name database and checks ranking claims against dated national statistics releases.',
  bioUrl: `${SITE_URL}/editorial-policy`,
  // Set to a real person's name once one is appointed. Until then the
  // organisation is the author, which is weaker but honest.
  isOrganisation: true,
};

// Optional expert reviewer. Leave `name` null to omit the reviewer line
// entirely — an empty reviewer slot is better than a fabricated one.
export const REVIEWER = {
  name: null, // e.g. 'Dr. A. Rahman, PhD Linguistics'
  credentials: null,
  bioUrl: null,
};

// ── 2. Freshness ─────────────────────────────────────────────────────────────
// A fixed, human-set date. Deliberately NOT `new Date()`: a build timestamp
// that changes on every deploy is a freshness signal Google learns to ignore,
// and it makes the "last updated" claim meaningless to a reader.
export const LAST_UPDATED = '2026-10-17';
export const LAST_UPDATED_LABEL = 'October 17, 2026';

// ── 2b. Dated ranking datasets ───────────────────────────────────────────────
// Every ranking shown on the site must name the population it measures and the
// period it covers. These constants are the single place those facts live.
export const RANKING_DATA = {
  ssa: {
    dataYear: 2025, // babies born in calendar year 2025
    previousYear: 2024,
    releasedOn: '2026-05-08',
    releasedLabel: 'May 8, 2026',
    population: 'US Social Security card applications for babies born in 2025',
  },
  babycenter: {
    snapshotLabel: 'August 2026',
    population:
      'names that parents volunteered to BabyCenter during 2026 (an in-progress, self-reported table, not birth records)',
  },
};

// ── 3. Methodology ───────────────────────────────────────────────────────────
// Stated plainly, in the order the work actually happens. This is what
// separates a reference page from an aggregator.
export const METHODOLOGY = {
  title: 'How we compile and verify name data',
  intro:
    'Every ranking figure on this page is traceable to a named, dated source. We do not estimate, interpolate or round popularity data, and we do not publish a name profile until its structured record carries a meaning and an origin.',
  steps: [
    {
      title: 'National ranking data',
      body: 'National rankings come from the Social Security Administration dataset for babies born in 2025 (released May 8, 2026), which is compiled from Social Security card applications. BabyCenter\u2019s in-progress 2026 table (August 2026 snapshot) is shown separately as a self-reported signal. Where the two disagree we show both and say so.',
    },
    {
      title: 'Name profiles',
      body: 'Each of the 11,730 published name profiles is built from a structured record containing meaning, origin, recorded gender, script forms and pronunciation where available. Records missing a meaning or an origin are excluded from the index and from our sitemaps rather than published as thin pages. Per-record source citations are still being added, so profiles label what the record contains rather than claiming individual verification.',
    },
    {
      title: 'Editorial review',
      body: 'Profile prose is composed from each record\u2019s own fields, and automated checks test samples of the published profiles for missing meanings and near-duplicate text. Belief-based associations \u2014 numerology, lucky numbers, letter symbolism \u2014 are labelled as traditional throughout and are never presented as linguistic fact.',
    },
    {
      title: 'Corrections',
      body: 'Errors are corrected at the source record, which updates every page that draws on it. Send corrections by email or WhatsApp (details on the About page); substantive corrections are noted on the editorial policy page.',
    },
  ],
};

// ── 4. Sources ───────────────────────────────────────────────────────────────
// Named, linked, dated. Rendered as a visible list AND as schema.org `citation`
// on the Article node, so the sourcing is machine-readable too.
export const SOURCES = {
  // ── National statistics (dated) ──────────────────────────────────────────
  ssa2025: {
    name: 'SSA \u2014 Most popular baby names for births in 2025 (released May 8, 2026)',
    publisher: 'US Social Security Administration',
    url: 'https://www.ssa.gov/news/en/press/releases/2026-05-08.html',
    note: 'Official national top 10 and the five fastest-rising names for each sex, babies born in 2025.',
  },
  ssa: {
    name: 'Social Security Administration \u2014 Popular Baby Names',
    publisher: 'US Social Security Administration',
    url: 'https://www.ssa.gov/oact/babynames/',
    note: 'National name rankings by birth year back to 1880, compiled from Social Security card applications.',
  },
  ssaTop: {
    name: 'SSA \u2014 Top names by birth year',
    publisher: 'US Social Security Administration',
    url: 'https://www.ssa.gov/oact/babynames/index.html',
    note: 'Top-1,000 tables with counts for each birth year, most recent cohort: 2025.',
  },
  ssaState2025: {
    name: 'SSA \u2014 Top 5 names in each state, births in 2025',
    publisher: 'US Social Security Administration',
    url: 'https://www.ssa.gov/oact/babynames/state/top5_2025.html',
    note: 'State-level ranking for 2025 births; earlier years are available from the same SSA page.',
  },
  ssaLimits: {
    name: 'SSA \u2014 Beyond the top 1000 names',
    publisher: 'US Social Security Administration',
    url: 'https://www.ssa.gov/oact/babynames/limits.html',
    note: 'Explains the 5-occurrence privacy threshold and the share of births covered by the top 1,000 names.',
  },
  babycenter: {
    name: 'BabyCenter \u2014 Most popular baby names of 2026 (in progress)',
    publisher: 'BabyCenter',
    url: 'https://www.babycenter.com/baby-names/most-popular/top-baby-names-2026',
    note: 'Self-reported by BabyCenter users during 2026 (August 2026 snapshot); a signal, not birth records.',
  },
  babycenterTrends2026: {
    name: 'BabyCenter \u2014 The biggest baby name trends of 2026 so far',
    publisher: 'BabyCenter',
    url: 'https://www.babycenter.com/baby-names/most-popular/baby-name-trends-2026-so-far_41003866',
    note: 'BabyCenter\u2019s mid-year commentary on movement in its own 2026 table.',
  },
  ons2023: {
    name: 'ONS \u2014 Baby names in England and Wales: 2023',
    publisher: 'Office for National Statistics (UK)',
    url: 'https://www.ons.gov.uk/peoplepopulationandcommunity/birthsdeathsandmarriages/livebirths/bulletins/babynamesenglandandwales/latest',
    note: 'Birth-registration ranking for England and Wales, 2023 (the final bulletin in that series).',
  },
  wikipedia: {
    name: 'Most popular given names by state in the United States',
    publisher: 'Wikipedia',
    url: 'https://en.wikipedia.org/wiki/List_of_most_popular_given_names_by_state_in_the_United_States',
    note: 'Secondary tabulation of the SSA state dataset, used only as a cross-check.',
  },
  nameberry: {
    name: 'Nameberry',
    publisher: 'Nameberry',
    url: 'https://nameberry.com',
    note: 'Editorial name-style commentary; never used for rankings or statistics.',
  },
  // ── Etymology and scripture references ───────────────────────────────────
  behindthename: {
    name: 'Behind the Name \u2014 the etymology and history of first names',
    publisher: 'Behind the Name',
    url: 'https://www.behindthename.com/',
    note: 'Name-by-name etymology reference used to check meanings and language of origin.',
  },
  quran: {
    name: 'Quran.com',
    publisher: 'Quran.com',
    url: 'https://quran.com/',
    note: 'Arabic text with translations; used to check whether a word or name actually occurs in the Quran.',
  },
  bibleGateway: {
    name: 'Bible Gateway',
    publisher: 'Bible Gateway',
    url: 'https://www.biblegateway.com/',
    note: 'Searchable Bible translations; used to check where a biblical name occurs.',
  },
  sefaria: {
    name: 'Sefaria \u2014 a living library of Jewish texts',
    publisher: 'Sefaria',
    url: 'https://www.sefaria.org/',
    note: 'Hebrew Bible and rabbinic texts with translations.',
  },
  searchGurbani: {
    name: 'SearchGurbani \u2014 Sri Guru Granth Sahib',
    publisher: 'SearchGurbani',
    url: 'https://www.searchgurbani.com/',
    note: 'Gurmukhi text with transliteration and translation.',
  },
  suttaCentral: {
    name: 'SuttaCentral \u2014 early Buddhist texts',
    publisher: 'SuttaCentral',
    url: 'https://suttacentral.net/',
    note: 'Pali canon texts and translations.',
  },
  sanskritLexicon: {
    name: 'Cologne Digital Sanskrit Dictionaries (incl. Monier-Williams)',
    publisher: 'University of Cologne',
    url: 'https://www.sanskrit-lexicon.uni-koeln.de/',
    note: 'Standard Sanskrit\u2013English dictionaries for checking Sanskrit roots and meanings.',
  },
  // ── Background articles ──────────────────────────────────────────────────
  wikiArabicName: {
    name: 'Arabic name',
    publisher: 'Wikipedia',
    url: 'https://en.wikipedia.org/wiki/Arabic_name',
    note: 'Overview of Arabic naming structure (ism, nasab, kunya, laqab).',
  },
  wikiNamesOfGod: {
    name: 'Names of God in Islam',
    publisher: 'Wikipedia',
    url: 'https://en.wikipedia.org/wiki/Names_of_God_in_Islam',
    note: 'Background on the divine names used in \u2018Abd al-\u2019 compound names.',
  },
  wikiProphetsIslam: {
    name: 'Prophets and messengers in Islam',
    publisher: 'Wikipedia',
    url: 'https://en.wikipedia.org/wiki/Prophets_and_messengers_in_Islam',
    note: 'Overview of the prophets named in the Quran and their biblical equivalents.',
  },
  wikiAqiqah: {
    name: 'Aqiqah',
    publisher: 'Wikipedia',
    url: 'https://en.wikipedia.org/wiki/Aqiqah',
    note: 'Background on the Islamic birth and naming custom.',
  },
  wikiNamakarana: {
    name: 'N\u0101makara\u1e47a (Hindu naming ceremony)',
    publisher: 'Wikipedia',
    url: 'https://en.wikipedia.org/wiki/Namakarana',
    note: 'The Hindu naming samskara and classical guidance on choosing names.',
  },
  wikiNakshatra: {
    name: 'Nakshatra',
    publisher: 'Wikipedia',
    url: 'https://en.wikipedia.org/wiki/Nakshatra',
    note: 'Background on the lunar mansions used for birth-star naming syllables.',
  },
  wikiKrishnaNames: {
    name: 'List of titles and names of Krishna',
    publisher: 'Wikipedia',
    url: 'https://en.wikipedia.org/wiki/List_of_titles_and_names_of_Krishna',
    note: 'Sanskrit epithets of Krishna with transliterations and translations.',
  },
  wikiHebrewName: {
    name: 'Hebrew name',
    publisher: 'Wikipedia',
    url: 'https://en.wikipedia.org/wiki/Hebrew_name',
    note: 'Background on Hebrew naming and theophoric name elements.',
  },
  wikiTheophoric: {
    name: 'Theophoric name',
    publisher: 'Wikipedia',
    url: 'https://en.wikipedia.org/wiki/Theophoric_name',
    note: 'How names embed a divine name (El-, -iah, Abd-, Dev-).',
  },
  wikiUnisex: {
    name: 'Unisex name',
    publisher: 'Wikipedia',
    url: 'https://en.wikipedia.org/wiki/Unisex_name',
    note: 'Background on gender-neutral names and how their usage varies by country.',
  },
  wikiVirtueName: {
    name: 'Virtue name',
    publisher: 'Wikipedia',
    url: 'https://en.wikipedia.org/wiki/Virtue_name',
    note: 'Background on names taken from virtues such as Grace, Hope and Faith.',
  },
  wikiNaamKaran: {
    name: 'Naam Karan (Sikh naming ceremony)',
    publisher: 'Wikipedia',
    url: 'https://en.wikipedia.org/wiki/Naam_Karan',
    note: 'Background on the Sikh naming ceremony.',
  },
  wikiDharmaName: {
    name: 'Dharma name',
    publisher: 'Wikipedia',
    url: 'https://en.wikipedia.org/wiki/Dharma_name',
    note: 'Background on names given in Buddhist ordination and refuge ceremonies.',
  },
  wikiRomanCalendar: {
    name: 'General Roman Calendar',
    publisher: 'Wikipedia',
    url: 'https://en.wikipedia.org/wiki/General_Roman_Calendar',
    note: 'The universal Catholic calendar of saints\u2019 feast days.',
  },
  wikiNameDay: {
    name: 'Name day',
    publisher: 'Wikipedia',
    url: 'https://en.wikipedia.org/wiki/Name_day',
    note: 'Background on celebrating the feast of one\u2019s patron saint.',
  },
};

// Convenience: the sources most US pages cite.
export const DEFAULT_SOURCE_KEYS = ['ssa2025', 'ssa', 'babycenter'];

// Curated (non-ranking) editorial lists cite the references actually used to
// check them, not ranking datasets they do not draw on.
export const CURATED_SOURCE_KEYS = ['behindthename', 'ssa', 'ssaLimits'];

export function resolveSources(keys = DEFAULT_SOURCE_KEYS) {
  return keys.map((k) => SOURCES[k]).filter(Boolean);
}

// ── Shared FAQ copy ──────────────────────────────────────────────────────────
// Reused across US pages so the answers stay consistent and citable.
export const EDITORIAL_FAQ = [
  {
    q: 'Where does NameVerse get its baby name data?',
    a: 'National rankings come from the Social Security Administration dataset for babies born in 2025 (released May 8, 2026), which is compiled from Social Security card applications. BabyCenter\u2019s in-progress 2026 table is shown separately as a self-reported signal. Individual name profiles are built from NameVerse\u2019s own structured database of 11,730 published records covering meaning, origin, recorded gender, script forms and pronunciation.',
  },
  {
    q: 'How often is this page updated?',
    a: `Ranking pages are updated when SSA publishes a new birth-year cohort (each May) and when a cited table changes. The date shown at the top of the page is the date of the last substantive editorial change, not the date the site was last rebuilt.`,
  },
  {
    q: 'Are the lucky numbers and numerology on NameVerse factual?',
    a: 'No, and we label them clearly. Numerology, lucky numbers, lucky days and letter symbolism are traditional belief-based associations. They are presented as cultural context, never as linguistic or scientific fact. Meaning, origin and pronunciation are the fields we treat as factual, and we correct them when a reader shows us a better source.',
  },
  {
    q: 'Why do some popular names not have a NameVerse profile?',
    a: 'We only publish a name profile when we hold a documented meaning and origin for it. Names that appear in national rankings but are not yet in our documented database are listed on our ranking pages without a profile link, rather than published as an empty page.',
  },
];

const moduleApi = {
  PUBLISHER,
  AUTHOR,
  REVIEWER,
  LAST_UPDATED,
  LAST_UPDATED_LABEL,
  METHODOLOGY,
  SOURCES,
  DEFAULT_SOURCE_KEYS,
  CURATED_SOURCE_KEYS,
  FOUNDER,
  RANKING_DATA,
  resolveSources,
  EDITORIAL_FAQ,
};

export default moduleApi;
