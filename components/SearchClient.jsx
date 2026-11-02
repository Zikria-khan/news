'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { normalizeGender, religionLabel } from '../lib/data/name-utils.js';

const RELIGIONS = ['islamic', 'christian', 'hindu'];
const RELIGION_LABELS = { christian: 'Christian', hindu: 'Hindu', islamic: 'Islamic' };
const GENDER_OPTIONS = [
  { key: '', label: 'All Genders' },
  { key: 'boy', label: 'Boys' },
  { key: 'girl', label: 'Girls' },
  { key: 'unisex', label: 'Unisex' },
];

// Origin filter options are DERIVED FROM THE DATA that was loaded, not from a
// hard-coded list. The old list offered origins that matched almost nothing
// (exact string equality against values such as "(Sanskrit, Hindi, etc.)").
function originLabel(raw) {
  return String(raw || '')
    .replace(/[()]/g, '')
    .split(/[,;/]/)[0]
    .trim();
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Transparent relevance: exact name > name prefix > name contains > a word in
// the meaning starts with the query > meaning contains > origin contains.
// Ties are broken alphabetically. The undocumented popularity score is no
// longer a ranking factor.
function relevance(item, q, wordStart) {
  const name = String(item.n || '').toLowerCase();
  if (name === q) return 100;
  if (name.startsWith(q)) return 80;
  if (name.includes(q)) return 60;
  const meaning = String(item.m || '').toLowerCase();
  if (wordStart.test(meaning)) return 40;
  if (meaning.includes(q)) return 30;
  if (String(item.o || '').toLowerCase().includes(q)) return 20;
  return 0;
}

const PAGE_SIZE = 200;

export default function SearchClient({ initialQuery = '', initialReligion = '', initialGender = '' }) {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery || searchParams.get('q') || '');
  const [religion, setReligion] = useState(initialReligion || searchParams.get('religion') || '');
  const [gender, setGender] = useState(initialGender || searchParams.get('gender') || '');
  const [origin, setOrigin] = useState(String(searchParams.get('origin') || '').toLowerCase());
  // `sort=popularity` links from older pages fall back to relevance.
  const [sort, setSort] = useState(searchParams.get('sort') === 'name' ? 'name' : 'relevance');
  const [limit, setLimit] = useState(PAGE_SIZE);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    Promise.all(
      RELIGIONS.map((r) =>
        fetch(`/names/${r}/_search-index.json`)
          .then((res) => (res.ok ? res.json() : []))
          .then((items) => items.map((item) => ({ ...item, religion: r })))
          .catch(() => [])
      )
    ).then((arrays) => {
      if (isMounted) {
        setData(arrays.flat());
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // New filters start again from the first page of results.
  useEffect(() => {
    setLimit(PAGE_SIZE);
  }, [query, religion, gender, origin, sort]);

  const originOptions = useMemo(() => {
    const counts = new Map();
    for (const item of data) {
      if (religion && item.religion !== religion) continue;
      const label = originLabel(item.o);
      if (!label) continue;
      const key = label.toLowerCase();
      const cur = counts.get(key) || { label, count: 0 };
      cur.count += 1;
      counts.set(key, cur);
    }
    return [...counts.entries()]
      .filter(([, v]) => v.count >= 5)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 24)
      .map(([key, v]) => ({ key, label: v.label, count: v.count }));
  }, [data, religion]);

  const allResults = useMemo(() => {
    if (!data || data.length === 0) return [];
    const q = query.trim().toLowerCase();
    const wordStart = q ? new RegExp(`(^|[^a-z])${escapeRegExp(q)}`) : null;

    const scored = [];
    for (const item of data) {
      if (religion && item.religion !== religion) continue;
      if (gender && normalizeGender(item.g) !== gender) continue;
      if (origin && originLabel(item.o).toLowerCase() !== origin) continue;
      const score = q ? relevance(item, q, wordStart) : 0;
      if (q && score === 0) continue;
      scored.push({ item, score });
    }

    if (sort === 'name' || !q) {
      scored.sort((a, b) => String(a.item.n || '').localeCompare(String(b.item.n || '')));
    } else {
      scored.sort((a, b) => b.score - a.score || String(a.item.n || '').localeCompare(String(b.item.n || '')));
    }
    return scored.map((x) => x.item);
  }, [data, query, religion, gender, origin, sort]);

  const results = allResults.slice(0, limit);

  return (
    <div>
      {/* Search & Filter Capsule */}
      <div className="rounded-2xl border border-nv-border bg-nv-surface/90 p-5 sm:p-7 shadow-lg backdrop-blur-xl mb-8">
        {/* Main Search Input */}
        <div className="relative flex items-center">
          <svg className="absolute left-4 h-5 w-5 text-nv-text-muted pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, meaning or origin… (e.g. light, Aarav, peace, Persian)"
            aria-label="Search baby names by name, meaning or origin"
            className="w-full rounded-xl border border-nv-border bg-nv-subtle/50 py-3.5 pl-12 pr-10 text-base text-nv-text placeholder-nv-text-muted transition focus:border-nv-accent focus:bg-nv-surface focus:outline-none focus:ring-2 focus:ring-nv-accent/20"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-3 grid h-7 w-7 place-items-center rounded-lg text-nv-text-muted hover:bg-nv-subtle hover:text-nv-text"
              aria-label="Clear search"
            >
              &times;
            </button>
          )}
        </div>

        {/* Tradition Segmented Buttons */}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-nv-text-muted mr-1">Tradition:</span>
          <button
            type="button"
            onClick={() => setReligion('')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              religion === ''
                ? 'bg-nv-primary text-white shadow-sm'
                : 'border border-nv-border bg-nv-subtle/60 text-nv-text-secondary hover:border-nv-accent hover:text-nv-text'
            }`}
          >
            All Traditions
          </button>
          {RELIGIONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setReligion(religion === r ? '' : r)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                religion === r
                  ? 'bg-nv-accent text-white shadow-sm'
                  : 'border border-nv-border bg-nv-subtle/60 text-nv-text-secondary hover:border-nv-accent hover:text-nv-text'
              }`}
            >
              {RELIGION_LABELS[r]}
            </button>
          ))}
        </div>

        {/* Gender Pills */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-nv-text-muted mr-1">Gender:</span>
          {GENDER_OPTIONS.map((g) => (
            <button
              key={g.key}
              type="button"
              onClick={() => setGender(g.key)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                gender === g.key
                  ? 'bg-nv-text text-nv-page shadow-sm'
                  : 'border border-nv-border bg-nv-subtle/60 text-nv-text-secondary hover:border-nv-accent hover:text-nv-text'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>

        {/* Origin & Sort Controls */}
        <div className="mt-4 grid grid-cols-1 gap-3 pt-3 border-t border-nv-border/60 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-nv-text-muted">Origin</span>
            <select
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="input !py-2 text-xs"
              aria-label="Filter by origin"
            >
              <option value="">Any origin</option>
              {originOptions.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.label} ({o.count.toLocaleString()})
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-nv-text-muted">Sort by</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="input !py-2 text-xs"
              aria-label="Sort order"
            >
              <option value="relevance">Best match</option>
              <option value="name">Alphabetical (A–Z)</option>
            </select>
          </label>
        </div>
      </div>

      {/* Results Meta Bar */}
      <div className="mb-4 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-nv-text" role="status" aria-live="polite">
            {loading
              ? 'Loading 11,730 names…'
              : `${allResults.length.toLocaleString()} ${allResults.length === 1 ? 'match' : 'matches'}`}
          </span>
          {allResults.length > results.length && (
            <span className="badge border border-nv-border bg-nv-subtle text-nv-text-secondary text-[11px]">
              Showing {results.length.toLocaleString()}
            </span>
          )}
        </div>
        {(query || religion || gender || origin) && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setReligion('');
              setGender('');
              setOrigin('');
            }}
            className="text-xs font-semibold text-nv-accent hover:underline"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Results Grid */}
      <div className="grid gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {results.map((item) => {
          const g = normalizeGender(item.g);
          const isBoy = g === 'boy';
          const isGirl = g === 'girl';
          const luckyNumber = item.l;

          return (
            <Link
              key={`${item.religion}-${item.s}`}
              href={`/names/${item.religion}/${item.s}`}
              className="card group relative flex flex-col overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1 hover:border-nv-accent/40 hover:shadow-card-hover"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-display text-lg font-bold text-nv-text group-hover:text-nv-accent transition-colors">
                  {item.n}
                </span>
                {g && (
                  <span
                    className={`badge shrink-0 border text-[11px] ${
                      isBoy
                        ? 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800/50 dark:bg-sky-950/50 dark:text-sky-300'
                        : isGirl
                        ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800/50 dark:bg-rose-950/50 dark:text-rose-300'
                        : 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800/50 dark:bg-purple-950/50 dark:text-purple-300'
                    }`}
                  >
                    {isBoy ? 'Boy' : isGirl ? 'Girl' : 'Unisex'}
                  </span>
                )}
              </div>

              {item.m && (
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-nv-text-secondary">{item.m}</p>
              )}

              <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-4">
                <span className="badge border border-nv-border bg-nv-subtle/80 text-[10px] uppercase font-bold text-nv-text">
                  {religionLabel(item.religion)}
                </span>
                {item.o && (
                  <span className="badge border border-nv-border bg-nv-surface text-[11px] text-nv-text-secondary">
                    {item.o}
                  </span>
                )}
                {luckyNumber && (
                  <span className="badge border border-amber-200 bg-amber-50 text-[11px] font-semibold text-amber-800 dark:border-amber-800/40 dark:bg-amber-950/40 dark:text-amber-300">
                    ★ {luckyNumber}
                  </span>
                )}
                <span className="ml-auto text-xs font-semibold text-nv-accent opacity-0 transition-opacity group-hover:opacity-100">
                  &rarr;
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {allResults.length > results.length && (
        <div className="mt-8 text-center">
          <button type="button" onClick={() => setLimit((n) => n + PAGE_SIZE)} className="btn-ghost">
            Show more results ({(allResults.length - results.length).toLocaleString()} more)
          </button>
        </div>
      )}

      {!loading && results.length === 0 && (
        <div className="rounded-2xl border border-nv-border bg-nv-surface p-12 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-nv-subtle text-xl">
            🔍
          </div>
          <p className="text-base font-bold text-nv-text">No names matched your filters.</p>
          <p className="mt-1 text-xs text-nv-text-secondary">Try a shorter query, select &quot;All Traditions&quot;, or explore our curated lists.</p>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setReligion('');
              setGender('');
              setOrigin('');
            }}
            className="btn-primary mt-5 !text-xs !py-2"
          >
            Reset all filters
          </button>
        </div>
      )}
    </div>
  );
}
