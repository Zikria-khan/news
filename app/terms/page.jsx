import AdSlot from '../../components/AdSlot.jsx';
import { pageMetadata, NOINDEX_FOLLOW } from '../../lib/seo.js';

export const metadata = pageMetadata({
  title: 'Terms of Service',
  description:
    'NameVerse terms of service: acceptable use, accuracy disclaimer for name meanings, intellectual property and more.',
  path: '/terms',
  robots: NOINDEX_FOLLOW,
});

const sections = [
  {
    title: '1. Acceptance of terms',
    body: 'By accessing NameVerse you agree to these terms. If you do not agree, please do not use the site.',
  },
  {
    title: '2. Informational purposes only',
    body: 'Name meanings, origins, numerology and cultural notes are provided for general informational purposes. Naming traditions vary by region, school of thought and family custom — always verify with a trusted religious or cultural authority before making a final decision.',
  },
  {
    title: '3. No warranties',
    body: 'Content is provided "as is". We work hard for accuracy across 11,730 entries but cannot guarantee that every meaning, origin or pronunciation is complete or authoritative.',
  },
  {
    title: '4. Acceptable use',
    body: 'You may not scrape, bulk-download or republish our name database or content without written permission. Personal, non-commercial browsing and sharing of individual pages is welcome.',
  },
  {
    title: '5. Intellectual property',
    body: 'The NameVerse name, logo, design and original editorial content are owned by NameVerse. Name data entries are compiled from public-domain and licensed research sources.',
  },
  {
    title: '6. Third-party links & ads',
    body: 'The site contains advertising and links to third-party services. We are not responsible for their content or policies.',
  },
  {
    title: '7. Changes',
    body: 'We may update these terms at any time. Continued use after changes constitutes acceptance of the updated terms.',
  },
];

export default function TermsPage() {
  return (
    <div className="container-page py-10 sm:py-14">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8">
          <span className="eyebrow">Legal</span>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-nv-text sm:text-5xl">
            Terms of Service
          </h1>
          <p className="mt-3 text-sm text-nv-text-secondary">Last updated: August 2026</p>
        </header>

        <AdSlot placement="terms-top" />

        <div className="space-y-4">
          {sections.map((s) => (
            <section key={s.title} className="card p-6">
              <h2 className="font-display text-lg font-bold text-nv-text">{s.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-nv-text-secondary">{s.body}</p>
            </section>
          ))}
          <p className="pt-4 text-sm text-nv-text-secondary">
            Questions? Write to{' '}
            <a href="mailto:legal@nameverse.site" className="font-semibold text-nv-accent hover:underline">
              legal@nameverse.site
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
}
