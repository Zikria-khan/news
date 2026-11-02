import Link from 'next/link';
import { getManifest } from '../../lib/data/names-data.js';
import AdSlot from '../../components/AdSlot.jsx';
import { pageMetadata } from '../../lib/seo.js';

export const metadata = pageMetadata({
  title: 'Baby Names by Meaning — Light, Love, Strength',
  description:
    'Browse 11,730 baby names by meaning: light, love, strength, peace, gift, beautiful and more. Find the perfect meaningful name for your baby.',
  path: '/names-by-meaning',
});

const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'of', 'to', 'in', 'on', 'for', 'with', 'who', 'that', 'this',
  'is', 'are', 'was', 'be', 'as', 'by', 'from', 'one', 'two', 'means', 'name', 'names',
  'meaning', 'someone', 'whoever', 'onewho', 'also', 'very', 'those',
]);

const featured = [
  { meaning: 'light', words: 'radiance, brightness, illumination, glow' },
  { meaning: 'love', words: 'affection, beloved, devotion, affection' },
  { meaning: 'strength', words: 'power, might, courage, bravery' },
  { meaning: 'peace', words: 'tranquility, calm, serenity, harmony' },
  { meaning: 'gift', words: 'present, blessing, boon, reward' },
  { meaning: 'beautiful', words: 'handsome, pretty, lovely, graceful' },
];

export default function NamesByMeaningPage() {
  const manifest = getManifest();
  const meanings = new Map();

  for (const rel of ['islamic', 'christian', 'hindu']) {
    for (const item of manifest[rel] || []) {
      if (item.indexable && item.meaning) {
        const words = item.meaning
          .toLowerCase()
          .split(/[^a-z]+/)
          .filter((w) => w.length > 3 && !STOPWORDS.has(w));
        for (const word of words) {
          meanings.set(word, (meanings.get(word) || 0) + 1);
        }
      }
    }
  }

  const topMeanings = Array.from(meanings.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 60)
    .map(([word, count]) => ({ word, count }));

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 text-center">
          <span className="eyebrow">Search by what it means</span>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-nv-text sm:text-5xl">
            Baby Names by Meaning
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-nv-text-secondary">
            Start from the virtue or feeling you want a name to carry — light, love, strength, peace — and let
            NameVerse find every matching name across traditions.
          </p>
        </header>

        <AdSlot placement="names-by-meaning-top" />

        {/* Featured Themes */}
        <section className="mb-12" aria-labelledby="featured-heading">
          <h2 id="featured-heading" className="text-xs font-bold uppercase tracking-wider text-nv-text-secondary mb-4 text-center">
            Popular Meaning Themes
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((f) => (
              <Link
                key={f.meaning}
                href={`/search?q=${encodeURIComponent(f.meaning)}`}
                className="card card-hover group flex flex-col gap-2 p-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-xl font-bold text-nv-text group-hover:text-nv-accent transition-colors capitalize">
                    {f.meaning}
                  </h3>
                  <span className="text-xs font-semibold text-nv-accent group-hover:translate-x-0.5 transition-transform">
                    &rarr;
                  </span>
                </div>
                <p className="text-xs text-nv-text-secondary">{f.words}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* 60 Top Meaning Keywords */}
        <section aria-labelledby="keywords-heading">
          <h2 id="keywords-heading" className="text-xs font-bold uppercase tracking-wider text-nv-text-secondary mb-4 text-center">
            Top 60 Meaning Keywords
          </h2>
          <div className="flex flex-wrap justify-center gap-2">
            {topMeanings.map((m) => (
              <Link
                key={m.word}
                href={`/search?q=${encodeURIComponent(m.word)}`}
                className="rounded-full border border-nv-border bg-nv-surface px-4 py-2 text-sm font-semibold text-nv-text hover:border-nv-accent hover:text-nv-accent transition capitalize flex items-center gap-1.5"
              >
                <span>{m.word}</span>
                <span className="text-xs text-nv-text-muted">({m.count})</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

