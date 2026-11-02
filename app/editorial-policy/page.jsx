import Link from 'next/link';
import {
  AUTHOR,
  REVIEWER,
  METHODOLOGY,
  SOURCES,
  LAST_UPDATED,
  LAST_UPDATED_LABEL,
  PUBLISHER,
  FOUNDER,
  RANKING_DATA,
} from '../../lib/data/editorial.js';
import { buildBreadcrumb, buildArticle } from '../../lib/data/us-schema.js';
import { pageMetadata } from '../../lib/seo.js';
import JsonLd from '../../components/JsonLd.jsx';
import AdSlot from '../../components/AdSlot.jsx';

const SITE_URL = 'https://nameverse.site';
const PAGE_URL = `${SITE_URL}/editorial-policy`;

const TITLE = 'Editorial Policy \u2014 How We Research, Check and Correct Names';
const DESCRIPTION =
  'How NameVerse compiles and corrects its name data: who runs the site, our sources, what \u201cverified\u201d means here, our automated checks and corrections log.';

export const metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: '/editorial-policy', type: 'article' });

const BREADCRUMB = [{ name: 'Editorial Policy', href: '/editorial-policy' }];

const SECTIONS = [
  {
    id: 'who',
    h2: 'Who runs NameVerse',
    body: [
      `NameVerse was founded and is run by ${FOUNDER.name}, a full-stack developer who builds and maintains the site, its name database and its editorial pages. Pages are bylined \u201c${AUTHOR.name}\u201d: they are compiled from our structured name database and from the dated sources listed below.`,
      'We are a data and reference publisher, not a medical, legal or religious authority. Where a name has a religious or cultural meaning, we report what the sources record rather than issuing rulings; for religious questions about a name, ask a scholar or teacher you trust.',
    ],
  },
  {
    id: 'sources',
    h2: 'Our sources',
    body: [
      `Ranking figures are traceable to named, dated sources. National and state rankings come from the Social Security Administration, compiled from Social Security card applications for babies born in a given year \u2014 the most recent cohort is babies born in ${RANKING_DATA.ssa.dataYear}, released ${RANKING_DATA.ssa.releasedLabel}. BabyCenter\u2019s in-progress 2026 table is shown separately and labelled as self-reported. National statistics do not record religion, so we never present a ranking as a measure of use within a faith community.`,
      'Individual name profiles are built from our own structured database. A profile is published only when its record carries a meaning and an origin; script forms and pronunciation are shown when the record contains them. Per-record source citations are being added; until a profile shows them, it reflects its record rather than an individual external check.',
    ],
  },
  {
    id: 'verification',
    h2: 'What \u201cverified\u201d means here \u2014 and what it does not',
    body: [
      'We do not claim that each of the 11,730 published profiles has been individually checked against an external reference. What we do: publish a profile only when its record has a meaning and an origin; label uncertain or missing fields instead of filling them with guesses (an unrecorded gender is shown as \u201cnot recorded\u201d, never as \u201cunisex\u201d); and check every statistic in our ranking pages and guides against the cited source when it is written.',
      'Our build runs two automated content checks before every production deployment. One samples 1,500 published records and fails the build if meaning and origin coverage falls below threshold; the other samples 1,200 records and fails the build if composed text is too similar between profiles. They catch thin and duplicated pages at scale; they do not prove that a particular meaning is correct, which is why reader corrections matter.',
    ],
  },
  {
    id: 'belief',
    h2: 'Belief-based content',
    body: [
      'Numerology, lucky numbers, lucky days, lucky stones and letter symbolism are traditional belief-based associations. We label them as such throughout the site and never present them as linguistic or scientific fact. Syllable counts are estimated from the spelling and are labelled as estimates.',
      'Meaning, origin, recorded gender and pronunciation are the fields we treat as factual. If you see an unlabelled claim on this site, it is one we are prepared to source \u2014 and to correct if a better source shows it is wrong.',
    ],
  },
  {
    id: 'corrections',
    h2: 'Corrections',
    body: [
      `Errors are corrected at the source record, which updates every page that draws on it. Send corrections on WhatsApp (${FOUNDER.whatsappDisplay}) or by email to ${FOUNDER.email}, with the name and what looks wrong \u2014 a source helps.`,
      'Substantive corrections are listed in the corrections log below. We do not silently rewrite published claims.',
    ],
  },
  {
    id: 'ai',
    h2: 'Use of automation and AI',
    body: [
      'We use automation to compose profile prose from structured records and to check content quality at build time. We do not use automation to invent facts, and we do not publish generated profile text that is not grounded in a record we hold.',
      'Some guides are drafted with the help of AI writing tools. Drafts are checked against their cited sources before publication; statistics appear only with a named, dated source, and etymologies that scholars dispute are labelled as disputed.',
    ],
  },
];

// Substantive, reader-visible corrections. Newest first.
const CORRECTIONS_LOG = [
  {
    date: '2026-10-17',
    label: 'October 17, 2026',
    items: [
      'Ranking pages now state that the newest official US data covers babies born in 2025 (SSA, released May 8, 2026), separately from BabyCenter\u2019s in-progress 2026 table. The two overlapping 2026 ranking pages were merged.',
      'The \u201ctrending\u201d page was rebuilt on measured change between the 2024 and 2025 SSA cohorts; it previously sorted an undated internal score.',
      'The Muslim baby names guide no longer implies Muslim-American usage rankings, which no national dataset can provide.',
      'Profiles with no recorded gender are no longer labelled \u201cUnisex\u201d, and Sikh, Punjabi and Marathi origins are no longer filed under Hindu or Hindi origin pages.',
      'Name profiles no longer show a site-wide date as a per-profile \u201clast reviewed\u201d date.',
      'Three short blog posts that repeated our evergreen gender-neutral, nature and short-name pages, and an older naming-framework page that duplicated our step-by-step naming guide, were consolidated into those fuller pages (old links redirect). Twenty new sourced guides were published.',
    ],
  },
];

export default function EditorialPolicyPage() {
  const schema = [
    buildBreadcrumb([{ name: 'Home', href: '/' }, ...BREADCRUMB]),
    buildArticle({
      url: PAGE_URL,
      headline: TITLE,
      description: DESCRIPTION,
      sourceKeys: ['ssa2025', 'ssa', 'ssaState2025', 'ssaLimits', 'babycenter', 'behindthename'],
    }),
  ];

  return (
    <div className="container-page py-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <JsonLd blocks={schema} />

        <nav aria-label="Breadcrumb" className="mb-5">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs text-nv-text-muted">
            <li>
              <Link href="/" className="transition hover:text-nv-accent">
                Home
              </Link>
            </li>
            <li className="flex items-center gap-1.5">
              <span aria-hidden="true">/</span>
              <span aria-current="page" className="font-semibold text-nv-text-secondary">
                Editorial Policy
              </span>
            </li>
          </ol>
        </nav>

        <header className="mb-10">
          <span className="eyebrow">Trust &amp; transparency</span>
          <h1 className="mt-2 text-balance font-display text-3xl font-bold tracking-tight text-nv-text sm:text-5xl">
            Editorial Policy
          </h1>
          <p className="mt-4 text-pretty text-sm leading-relaxed text-nv-text-secondary sm:text-base">
            How we compile, verify and correct the name data published on NameVerse \u2014 and where the
            limits of that data are.
          </p>
          <p className="mt-4 text-xs text-nv-text-muted">
            Last updated <time dateTime={LAST_UPDATED}>{LAST_UPDATED_LABEL}</time>
          </p>
        </header>

        <AdSlot placement="editorial-policy-top" />

        <div className="space-y-10">
          {SECTIONS.map((s) => (
            <section key={s.id} aria-labelledby={`${s.id}-heading`}>
              <h2
                id={`${s.id}-heading`}
                className="font-display text-xl font-bold tracking-tight text-nv-text sm:text-2xl"
              >
                {s.h2}
              </h2>
              <div className="prose-nv mt-3">
                {s.body.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </section>
          ))}

          <section aria-labelledby="method-heading">
            <h2
              id="method-heading"
              className="font-display text-xl font-bold tracking-tight text-nv-text sm:text-2xl"
            >
              {METHODOLOGY.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-nv-text-secondary">{METHODOLOGY.intro}</p>
            <div className="mt-5 space-y-4">
              {METHODOLOGY.steps.map((step) => (
                <div key={step.title} className="inset-panel">
                  <h3 className="text-sm font-bold text-nv-text">{step.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-nv-text-secondary">{step.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section aria-labelledby="log-heading">
            <h2 id="log-heading" className="font-display text-xl font-bold tracking-tight text-nv-text sm:text-2xl">
              Corrections log
            </h2>
            <div className="mt-4 space-y-4">
              {CORRECTIONS_LOG.map((entry) => (
                <div key={entry.date} className="inset-panel">
                  <h3 className="text-sm font-bold text-nv-text">
                    <time dateTime={entry.date}>{entry.label}</time>
                  </h3>
                  <ul className="mt-2 list-disc space-y-1.5 pl-5 text-xs leading-relaxed text-nv-text-secondary">
                    {entry.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section aria-labelledby="sources-heading">
            <h2
              id="sources-heading"
              className="font-display text-xl font-bold tracking-tight text-nv-text sm:text-2xl"
            >
              Sources we cite
            </h2>
            <ul className="mt-4 space-y-3">
              {Object.values(SOURCES).map((s) => (
                <li key={s.url} className="text-sm leading-relaxed">
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-nv-accent hover:underline"
                  >
                    {s.name}
                  </a>
                  <span className="text-nv-text-muted">
                    {' '}
                    &mdash; {s.publisher}. {s.note}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="contact-heading">
            <h2
              id="contact-heading"
              className="font-display text-xl font-bold tracking-tight text-nv-text sm:text-2xl"
            >
              Contact
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-nv-text-secondary">
              Corrections and questions go to {FOUNDER.name} on{' '}
              <a href={FOUNDER.whatsappUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-nv-accent hover:underline">
                WhatsApp ({FOUNDER.whatsappDisplay})
              </a>{' '}
              or by email to{' '}
              <a href={`mailto:${FOUNDER.email}`} className="font-semibold text-nv-accent hover:underline">
                {FOUNDER.email}
              </a>
              . General enquiries can also go to{' '}
              <a href={`mailto:${PUBLISHER.email}`} className="font-semibold text-nv-accent hover:underline">
                {PUBLISHER.email}
              </a>
              . We aim to respond to data corrections within five working days.
            </p>
            {REVIEWER.name && (
              <p className="mt-3 text-sm leading-relaxed text-nv-text-secondary">
                Content on this site is reviewed by {REVIEWER.name}. {REVIEWER.credentials}
              </p>
            )}
          </section>
        </div>

        <div className="mt-12 rounded-bento border border-nv-accent/30 bg-nv-accent-subtle/50 p-6">
          <h2 className="font-display text-lg font-bold text-nv-text">Start exploring</h2>
          <p className="mt-2 text-sm text-nv-text-secondary">
            Browse the full directory, or start from a curated list.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/names" className="btn-primary">
              All 11,730 names
            </Link>
            <Link href="/top-baby-names-2026" className="btn-ghost">
              Top baby names 2026
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
