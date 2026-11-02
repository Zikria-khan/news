import Link from 'next/link';
import { getManifest } from '../../lib/data/names-data.js';
import NameCard from '../../components/NameCard.jsx';
import AdSlot from '../../components/AdSlot.jsx';
import { pageMetadata } from '../../lib/seo.js';

export const metadata = pageMetadata({
  title: 'Baby Name Meanings — 100 Names Explained',
  description:
    'Discover 100 beautiful baby names and their documented meanings, origins and lucky numbers — hand-picked from 11,730 names across three traditions.',
  path: '/name-meanings',
});

export default function NameMeaningsPage() {
  const manifest = getManifest();
  const all = [];
  for (const rel of ['islamic', 'christian', 'hindu']) {
    for (const item of manifest[rel] || []) {
      if (item.indexable && item.meaning && item.slug && item.name) all.push({ ...item, religion: rel });
    }
  }
  all.sort((a, b) => a.name.localeCompare(b.name));
  const top = all.slice(0, 100);

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 text-center">
          <span className="eyebrow">Names &amp; their stories</span>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-nv-text sm:text-5xl">
            Baby Name Meanings
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-nv-text-secondary">
            100 beautiful names from Islamic, Christian and Hindu traditions — with documented meanings on every entry.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/names-by-meaning" className="btn-ghost">
              Search by Meaning Themes
            </Link>
            <Link href="/search" className="btn-primary">
              Search All Names
            </Link>
          </div>
        </header>

        <AdSlot placement="name-meanings-top" />

        <div className="grid gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {top.map((item) => (
            <NameCard key={`${item.religion}-${item.slug}`} item={item} showReligion />
          ))}
        </div>

        <section className="mx-auto mt-16 max-w-3xl border-t border-nv-border pt-10" aria-labelledby="seo-heading">
          <h2 id="seo-heading" className="font-display text-2xl font-bold tracking-tight text-nv-text sm:text-3xl">
            The Meaning Behind the Name
          </h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-nv-text-secondary sm:text-base">
            <p>
              A name is a sentence your child will carry forever — the meaning is its first word.
              Understanding what a name truly means, in its own language and tradition, helps you choose
              with confidence rather than by sound alone.
            </p>
            <p>
              The names above are just the start. Use the search tool to explore any meaning keyword, or
              browse the tradition hubs for the complete alphabetical collections.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
