import Link from 'next/link';
import PageJsonLd from '../../components/PageJsonLd.jsx';
import AdSlot from '../../components/AdSlot.jsx';
import { FOUNDER, PUBLISHER, LAST_UPDATED, LAST_UPDATED_LABEL } from '../../lib/data/editorial.js';
import { pageMetadata, SITE_URL } from '../../lib/seo.js';

export const metadata = pageMetadata({
  title: 'About NameVerse \u2014 Founder, Mission & Editorial Standards',
  description:
    'NameVerse is a baby-name reference founded and run by Zakriya Khan. Meet the founder, see how the name data is compiled, and contact us by email or WhatsApp.',
  path: '/about',
});

// AboutPage whose subject is the organisation, with the founder as a real,
// owner-supplied Person. Only facts the owner provided are asserted — no
// invented credentials.
const aboutJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'AboutPage',
      '@id': `${SITE_URL}/about#webpage`,
      name: 'About NameVerse',
      url: `${SITE_URL}/about`,
      description:
        'NameVerse is a baby-name reference covering Islamic, Christian and Hindu traditions, founded and run by Zakriya Khan.',
      dateModified: LAST_UPDATED,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      about: { '@id': `${SITE_URL}/#organization` },
      mainEntity: { '@id': `${SITE_URL}/about#founder` },
    },
    {
      '@type': 'Person',
      '@id': `${SITE_URL}/about#founder`,
      name: FOUNDER.name,
      jobTitle: FOUNDER.role,
      description: FOUNDER.description,
      email: `mailto:${FOUNDER.email}`,
      telephone: FOUNDER.telephone,
      url: `${SITE_URL}/about`,
      worksFor: { '@id': `${SITE_URL}/#organization` },
    },
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: PUBLISHER.name,
      url: SITE_URL,
      logo: PUBLISHER.logo,
      founder: { '@id': `${SITE_URL}/about#founder` },
      contactPoint: [
        {
          '@type': 'ContactPoint',
          contactType: 'customer support',
          email: FOUNDER.email,
          telephone: FOUNDER.telephone,
        },
      ],
    },
  ],
};

export default function AboutPage() {
  return (
    <div className="container-page py-10 sm:py-14">
      <PageJsonLd data={aboutJsonLd} />
      <div className="mx-auto max-w-3xl">
        <header className="mb-8">
          <span className="eyebrow">About us</span>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-nv-text sm:text-5xl">About NameVerse</h1>
          <p className="mt-4 text-lg leading-relaxed text-nv-text-secondary">
            NameVerse exists to make one of life&apos;s most personal decisions &mdash; naming a child &mdash; easier,
            better informed and more respectful of culture and faith.
          </p>
        </header>

        <AdSlot placement="about-top" />

        <div className="space-y-6">
          {/* ── Founder ─────────────────────────────────────────────────── */}
          <section className="card p-6 sm:p-8" aria-labelledby="founder-heading">
            <span className="eyebrow">Who runs NameVerse</span>
            <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-start">
              <span
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-nv-accent-subtle font-display text-xl font-bold text-nv-accent"
                aria-hidden="true"
              >
                ZK
              </span>
              <div className="min-w-0">
                <h2 id="founder-heading" className="font-display text-2xl font-bold text-nv-text">
                  {FOUNDER.name}
                </h2>
                <p className="text-sm font-semibold text-nv-text-muted">{FOUNDER.role}</p>
                <p className="mt-3 text-sm leading-relaxed text-nv-text-secondary sm:text-base">
                  I&apos;m {FOUNDER.name}, a full-stack developer and the founder of NameVerse. I build and run the
                  site &mdash; the name database, the search tools, the editorial pages and the blog. If something on
                  NameVerse is wrong, unclear or missing, please get in touch using the details below.
                </p>
              </div>
            </div>

            <dl className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="inset-panel">
                <dt className="stat-label">WhatsApp</dt>
                <dd className="mt-1">
                  <a
                    href={FOUNDER.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base font-bold text-nv-accent hover:underline"
                    aria-label={`Message ${FOUNDER.name} on WhatsApp at ${FOUNDER.whatsappDisplay}`}
                  >
                    {FOUNDER.whatsappDisplay}
                  </a>
                  <span className="mt-0.5 block text-xs text-nv-text-muted">
                    International: {FOUNDER.whatsappInternational}
                  </span>
                </dd>
              </div>
              <div className="inset-panel">
                <dt className="stat-label">Email (Gmail)</dt>
                <dd className="mt-1">
                  <a href={`mailto:${FOUNDER.email}`} className="break-all text-base font-bold text-nv-accent hover:underline">
                    {FOUNDER.email}
                  </a>
                  <span className="mt-0.5 block text-xs text-nv-text-muted">Corrections, feedback and partnerships</span>
                </dd>
              </div>
            </dl>
          </section>

          <section className="card p-6 sm:p-8">
            <h2 className="font-display text-xl font-bold text-nv-text">Our mission</h2>
            <p className="mt-3 text-sm leading-relaxed text-nv-text-secondary sm:text-base">
              A name carries meaning, heritage and identity. NameVerse lets parents search 11,730 published name
              profiles across Islamic, Christian and Hindu traditions &mdash; each with a recorded meaning and origin,
              plus pronunciation and script forms where the record holds them &mdash; in one fast, free,
              mobile-friendly place.
            </p>
          </section>

          <section className="card p-6 sm:p-8">
            <h2 className="font-display text-xl font-bold text-nv-text">What we do differently</h2>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-nv-text-secondary sm:text-base">
              <li className="flex gap-3">
                <span className="font-bold text-nv-success" aria-hidden="true">&#10003;</span>
                <span>Meanings with linguistic and cultural context, and debated etymologies labelled as debated.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-nv-success" aria-hidden="true">&#10003;</span>
                <span>Rankings only from named, dated sources &mdash; for example SSA data for babies born in 2025.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-nv-success" aria-hidden="true">&#10003;</span>
                <span>Belief-based extras such as lucky numbers are labelled as traditional, never as fact.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-nv-success" aria-hidden="true">&#10003;</span>
                <span>No paywalls or accounts &mdash; your saved shortlist stays in your own browser.</span>
              </li>
            </ul>
          </section>

          <section className="card p-6 sm:p-8">
            <h2 className="font-display text-xl font-bold text-nv-text">How the content is made</h2>
            <p className="mt-3 text-sm leading-relaxed text-nv-text-secondary sm:text-base">
              Name profiles are built from a structured database: a profile is published only when its record has a
              meaning and an origin, and automated checks test samples of the published pages for missing meanings
              and near-duplicate text. Per-profile source citations are still being added, so profiles say what the
              record contains rather than claiming each one was individually verified. Guides and ranking pages name
              their sources. When traditions differ on a meaning or pronunciation, we note the variation rather than
              pick a side. The full process is in our{' '}
              <Link href="/editorial-policy" className="font-semibold text-nv-accent hover:underline">
                editorial policy
              </Link>
              .
            </p>
          </section>

          <section className="card p-6 sm:p-8">
            <h2 className="font-display text-xl font-bold text-nv-text">Corrections</h2>
            <p className="mt-3 text-sm leading-relaxed text-nv-text-secondary sm:text-base">
              Found a wrong meaning, origin or spelling? Send the name and what looks wrong &mdash; a source helps
              &mdash; on{' '}
              <a href={FOUNDER.whatsappUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-nv-accent hover:underline">
                WhatsApp ({FOUNDER.whatsappDisplay})
              </a>{' '}
              or by email to{' '}
              <a href={`mailto:${FOUNDER.email}`} className="font-semibold text-nv-accent hover:underline">
                {FOUNDER.email}
              </a>
              . More options are on the{' '}
              <Link href="/contact" className="font-semibold text-nv-accent hover:underline">
                contact page
              </Link>
              .
            </p>
          </section>

          <p className="text-xs text-nv-text-muted">
            Page updated <time dateTime={LAST_UPDATED}>{LAST_UPDATED_LABEL}</time>.
          </p>
        </div>
      </div>
    </div>
  );
}
